-- Add avatar_url column to profiles table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create function to generate avatar URL from username and display_name
CREATE OR REPLACE FUNCTION public.generate_avatar_url(
  p_username TEXT,
  p_display_name TEXT
)
RETURNS TEXT AS $$
DECLARE
  seed TEXT;
BEGIN
  -- Use username if available, fallback to display_name, then to 'user'
  seed := COALESCE(p_username, p_display_name, 'user');
  -- URL encode: for simplicity, just use the seed as-is (DiceBear handles spaces)
  RETURN 'https://api.dicebear.com/9.x/pixel-art/png?seed=' ||
         REPLACE(REPLACE(REPLACE(seed, ' ', '+'), '&', '%26'), '#', '%23');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to set avatar_url on insert/update
CREATE OR REPLACE FUNCTION public.on_profile_update_set_avatar_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Set avatar_url if username or display_name changed, or if it's NULL
  NEW.avatar_url := public.generate_avatar_url(NEW.username, NEW.display_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (safe idempotent operation)
DROP TRIGGER IF EXISTS on_profile_update_set_avatar_url ON public.profiles;

-- Create trigger to run on insert and update
CREATE TRIGGER on_profile_update_set_avatar_url
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.on_profile_update_set_avatar_url();

-- Backfill existing profiles with avatar_url
UPDATE public.profiles
SET avatar_url = public.generate_avatar_url(username, display_name)
WHERE avatar_url IS NULL;
