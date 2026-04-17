-- 1. Add unique username to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (LOWER(username)) WHERE username IS NOT NULL;

-- 2. Add friction_id to orders (unique booking ID)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS friction_id TEXT UNIQUE;

-- 3. Function to generate unique friction ID like "FR" + 8 digits
CREATE OR REPLACE FUNCTION public.generate_friction_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  exists_check INTEGER;
BEGIN
  IF NEW.friction_id IS NULL THEN
    LOOP
      new_id := 'FR' || LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');
      SELECT COUNT(*) INTO exists_check FROM public.orders WHERE friction_id = new_id;
      EXIT WHEN exists_check = 0;
    END LOOP;
    NEW.friction_id := new_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_friction_id ON public.orders;
CREATE TRIGGER set_friction_id
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_friction_id();

-- Backfill existing orders missing friction_id
UPDATE public.orders SET friction_id = 'FR' || LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0') WHERE friction_id IS NULL;

-- 4. Update notify_on_game_join trigger to use username when available
CREATE OR REPLACE FUNCTION public.notify_on_game_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _game RECORD;
  _joiner_name TEXT;
BEGIN
  SELECT * INTO _game FROM public.games WHERE id = NEW.game_id;
  SELECT COALESCE('@' || username, name, 'Someone') INTO _joiner_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  
  IF _game.host_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
      _game.host_id,
      _joiner_name || ' joined your game 💪',
      _joiner_name || ' has joined "' || _game.title || '"',
      '/activity'
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. Allow authenticated users to view minimal profile info of other users (name + username) for game details
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON public.profiles;
CREATE POLICY "Anyone can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);