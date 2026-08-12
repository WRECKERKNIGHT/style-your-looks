-- 005_harden_community_integrity.sql
-- Closes the remaining community integrity holes:
--   1. Fix the category constraint so it matches the app's real categories.
--   2. Anonymous clients can no longer read posts/ratings/comments (closes
--      the user_id enumeration hole the feed route already worked around).
--   3. Self-rating is blocked at the database level, not just the API.
--   4. Post owners can no longer forge avg_rating / rating_count directly.
--   5. Removes the leftover duplicate rating trigger from migration 001.
-- Idempotent: safe to run on an existing database.

begin;

-- 1) The app ships categories the constraint never allowed ('body', 'color',
--    'tryon'), while 'party' was allowed but never used. Align both.
alter table public.community_posts
  drop constraint if exists community_posts_category_check;
alter table public.community_posts
  add constraint community_posts_category_check
  check (category in ('outfit', 'face', 'grooming', 'body', 'color', 'tryon'));

-- 2) Require authentication for community reads. The feed/rating endpoints
--    already auth-gate, this removes the anon REST surface entirely.
drop policy if exists "Anyone can view public posts" on public.community_posts;
create policy "Authenticated users can view public posts"
  on public.community_posts
  for select
  using (auth.role() = 'authenticated'
         and (is_private = false or auth.uid() = user_id));

drop policy if exists "Anyone can view ratings" on public.community_ratings;
create policy "Authenticated users can view ratings"
  on public.community_ratings
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Anyone can view comments" on public.community_comments;
create policy "Authenticated users can view comments"
  on public.community_comments
  for select
  using (auth.role() = 'authenticated');

-- 3) Block self-rating at the database level. The API check is defense in
--    depth only; this trigger is the enforceable boundary.
create or replace function public.prevent_self_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_owner uuid;
begin
  select user_id into post_owner
  from public.community_posts
  where id = new.post_id;
  if post_owner is not null and post_owner = new.user_id then
    raise exception 'You cannot rate your own post';
  end if;
  return new;
end;
$$;

drop trigger if exists on_rating_self_check on public.community_ratings;
create trigger on_rating_self_check
  before insert or update on public.community_ratings
  for each row
  execute function public.prevent_self_rating();

-- 4) Only the security-definer recompute may write the aggregates. Owners can
--    still update their own post's other fields, but not these two columns.
revoke update (avg_rating, rating_count) on public.community_posts
  from anon, authenticated;

-- 5) Remove the migration-001 trigger/function that 003 superseded. Keeping
--    both made the recompute depend on trigger order and gave a redundant,
--    RLS-bypassing invoker that silently no-op'd for non-owners.
drop trigger if exists on_rating_change on public.community_ratings;
drop function if exists public.update_post_rating();

commit;
