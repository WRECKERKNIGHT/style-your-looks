-- 003_fix_community_rls.sql
-- Fixes community data issues caused by restrictive RLS:
--   1. The feed could not resolve display names (profiles are private to owners).
--   2. Average ratings were never recomputed because only the post owner could
--      update community_posts (the rater and the delete-trigger were blocked).

begin;

-- 1) Minimal public profile lookup used by the community feed.
--    Exposes only id/full_name/avatar_url and only for the requested ids.
create or replace function public.get_public_profiles(target_ids uuid[])
returns table (id uuid, full_name text, avatar_url text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url
  from public.profiles p
  where p.id = any(target_ids);
$$;

grant execute on function public.get_public_profiles(uuid[]) to anon, authenticated;

-- 2) Security-definer recompute so any user can refresh a post's average.
create or replace function public.recompute_post_rating(target_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.community_posts
  set avg_rating = (
    select coalesce(round(avg(score)::numeric, 1), 0)
    from public.community_ratings
    where post_id = target_post_id
  ),
  rating_count = (
    select count(*)
    from public.community_ratings
    where post_id = target_post_id
  )
  where id = target_post_id;
end;
$$;

grant execute on function public.recompute_post_rating(uuid) to anon, authenticated;

-- 3) Route the existing delete trigger through the security-definer function
--    and add triggers for insert/update so the average stays in sync.
create or replace function public.recalc_post_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_post_rating(coalesce(old.post_id, new.post_id));
  return coalesce(old, new);
end;
$$;

drop trigger if exists on_rating_delete on community_ratings;
create trigger on_rating_delete
  after delete on community_ratings
  for each row
  execute function public.recalc_post_rating();

drop trigger if exists on_rating_write on community_ratings;
create trigger on_rating_write
  after insert or update on community_ratings
  for each row
  execute function public.recalc_post_rating();

commit;
