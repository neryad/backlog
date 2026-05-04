-- handle_new_user is an auth trigger — it should never be called directly via REST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- rls_auto_enable is an admin utility — not meant for public or user access.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- delete_my_account is superseded by the delete-account Edge Function which
-- validates the JWT, cleans relational data, and calls auth.admin.deleteUser.
-- Revoke REST access entirely so the Edge Function is the only code path.
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM anon, authenticated;
