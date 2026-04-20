
-- 1. Add address column to venues (full street address)
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS address text;

-- Backfill address from location for existing rows so UI shows something
UPDATE public.venues SET address = location WHERE address IS NULL;

-- 2. Case-insensitive unique username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_ci
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;
