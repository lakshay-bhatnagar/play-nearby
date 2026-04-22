-- 1. Extend venue_slots with lifecycle fields
ALTER TABLE public.venue_slots
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS locked_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS lock_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS booked_by_game_id uuid;

-- Backfill: any slot that was already marked unavailable becomes 'booked'
UPDATE public.venue_slots
  SET status = 'booked'
  WHERE is_available = false AND status = 'available';

-- Validation trigger to keep status values constrained (avoid CHECK on time-based logic later)
CREATE OR REPLACE FUNCTION public.validate_venue_slot_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('available','locked','booked','cancelled') THEN
    RAISE EXCEPTION 'Invalid slot status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_venue_slot_status ON public.venue_slots;
CREATE TRIGGER trg_validate_venue_slot_status
  BEFORE INSERT OR UPDATE ON public.venue_slots
  FOR EACH ROW EXECUTE FUNCTION public.validate_venue_slot_status();

-- Prevent duplicate slots
CREATE UNIQUE INDEX IF NOT EXISTS venue_slots_unique_window
  ON public.venue_slots (venue_id, slot_date, start_time, end_time);

CREATE INDEX IF NOT EXISTS venue_slots_status_idx ON public.venue_slots (venue_id, slot_date, status);
CREATE INDEX IF NOT EXISTS venue_slots_lock_expiry_idx ON public.venue_slots (lock_expires_at)
  WHERE status = 'locked';

-- 2. Recurring templates table
CREATE TABLE IF NOT EXISTS public.venue_slot_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  price_per_hour numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT venue_slot_templates_dow_range CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT venue_slot_templates_time_order CHECK (end_time > start_time),
  UNIQUE (venue_id, day_of_week, start_time, end_time)
);

ALTER TABLE public.venue_slot_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view venue slot templates" ON public.venue_slot_templates;
CREATE POLICY "Anyone can view venue slot templates"
  ON public.venue_slot_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Auto-release expired locks
CREATE OR REPLACE FUNCTION public.release_expired_slot_locks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.venue_slots
    SET status = 'available',
        locked_by_user_id = NULL,
        lock_expires_at = NULL,
        is_available = true
    WHERE status = 'locked'
      AND lock_expires_at IS NOT NULL
      AND lock_expires_at < now();
END;
$$;

-- 4. Atomic lock for a list of slot ids (5 minute window)
CREATE OR REPLACE FUNCTION public.lock_venue_slots(_slot_ids uuid[], _user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _conflict int;
  _expires timestamptz := now() + interval '5 minutes';
BEGIN
  PERFORM public.release_expired_slot_locks();

  -- Lock rows for update to avoid races
  PERFORM 1 FROM public.venue_slots
    WHERE id = ANY(_slot_ids)
    FOR UPDATE;

  SELECT count(*) INTO _conflict
    FROM public.venue_slots
    WHERE id = ANY(_slot_ids)
      AND status <> 'available'
      AND NOT (status = 'locked' AND locked_by_user_id = _user_id);

  IF _conflict > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Slot already taken');
  END IF;

  UPDATE public.venue_slots
    SET status = 'locked',
        locked_by_user_id = _user_id,
        lock_expires_at = _expires,
        is_available = false
    WHERE id = ANY(_slot_ids);

  RETURN jsonb_build_object('success', true, 'expires_at', _expires);
END;
$$;

-- 5. Confirm booking on successful payment
CREATE OR REPLACE FUNCTION public.confirm_venue_slot_booking(_slot_ids uuid[], _user_id uuid, _game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _bad int;
BEGIN
  SELECT count(*) INTO _bad
    FROM public.venue_slots
    WHERE id = ANY(_slot_ids)
      AND NOT (status = 'locked' AND locked_by_user_id = _user_id AND lock_expires_at > now());

  IF _bad > 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lock expired or invalid');
  END IF;

  UPDATE public.venue_slots
    SET status = 'booked',
        booked_by_game_id = _game_id,
        locked_by_user_id = NULL,
        lock_expires_at = NULL,
        is_available = false
    WHERE id = ANY(_slot_ids);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. Release locks (cancel / timeout)
CREATE OR REPLACE FUNCTION public.release_venue_slot_locks(_slot_ids uuid[], _user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.venue_slots
    SET status = 'available',
        locked_by_user_id = NULL,
        lock_expires_at = NULL,
        is_available = true
    WHERE id = ANY(_slot_ids)
      AND status = 'locked'
      AND locked_by_user_id = _user_id;
END;
$$;

-- 7. Generate dated slots from weekly templates for the next N days
CREATE OR REPLACE FUNCTION public.generate_slots_from_templates(_days int DEFAULT 14)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inserted int := 0;
BEGIN
  WITH dates AS (
    SELECT (current_date + i) AS d
    FROM generate_series(0, GREATEST(_days - 1, 0)) AS i
  ),
  candidates AS (
    SELECT t.venue_id, d.d AS slot_date, t.start_time, t.end_time, t.price_per_hour
      FROM public.venue_slot_templates t
      JOIN dates d ON EXTRACT(DOW FROM d.d)::int = t.day_of_week
  ),
  ins AS (
    INSERT INTO public.venue_slots (venue_id, slot_date, start_time, end_time, price_per_hour, status, is_available)
    SELECT venue_id, slot_date, start_time, end_time, price_per_hour, 'available', true
      FROM candidates
    ON CONFLICT (venue_id, slot_date, start_time, end_time) DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO _inserted FROM ins;
  RETURN _inserted;
END;
$$;