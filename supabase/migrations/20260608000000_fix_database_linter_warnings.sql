-- =========================================================
-- Fix Supabase database linter warnings
-- =========================================================
--
-- Warnings addressed:
--   0011 - function_search_path_mutable
--   0028 - anon_security_definer_function_executable
--   0029 - authenticated_security_definer_function_executable

-- =========================================================
-- 1. Fix mutable search_path on avatar-related functions
--    (lint 0011: function_search_path_mutable)
-- =========================================================

-- generate_avatar_url is IMMUTABLE and does not access tables
ALTER FUNCTION public.generate_avatar_url(p_username TEXT, p_display_name TEXT)
  SET search_path = '';

-- on_profile_update_set_avatar_url is a trigger that accesses profiles
-- and calls public.generate_avatar_url (fully qualified)
ALTER FUNCTION public.on_profile_update_set_avatar_url()
  SET search_path = 'public';

-- =========================================================
-- 2. Harden SECURITY DEFINER functions with search_path
--    (defense in depth for lints 0028 & 0029)
-- =========================================================

-- handle_new_user: auth trigger, not meant for direct REST calls
ALTER FUNCTION public.handle_new_user()
  SET search_path = '';

-- rls_auto_enable: admin utility
ALTER FUNCTION public.rls_auto_enable()
  SET search_path = '';

-- delete_my_account: superseded by Edge Function
ALTER FUNCTION public.delete_my_account()
  SET search_path = '';
