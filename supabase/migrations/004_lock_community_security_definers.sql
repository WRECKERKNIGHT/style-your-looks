-- 004_lock_community_security_definers.sql
-- The community feed and rating endpoints now require authentication
-- (checked server-side), so the security-definer helpers no longer need to be
-- callable by anonymous clients. Revoking anon closes the profile-enumeration
-- hole and removes an RLS-bypassing write path reachable by unauthenticated
-- callers.

begin;

revoke execute on function public.get_public_profiles(uuid[]) from anon;
revoke execute on function public.recompute_post_rating(uuid) from anon;

-- Keep the grants for authenticated users (used by the server-side routes).
grant execute on function public.get_public_profiles(uuid[]) to authenticated;
grant execute on function public.recompute_post_rating(uuid) to authenticated;

commit;
