-- Fix existing avatar URLs from SVG to PNG
UPDATE public.profiles
SET avatar_url = REPLACE(avatar_url, '/svg?', '/png?')
WHERE avatar_url IS NOT NULL AND avatar_url LIKE '%/svg?%';
