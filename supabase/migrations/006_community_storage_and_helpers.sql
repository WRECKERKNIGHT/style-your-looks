-- 006_community_storage_and_helpers.sql
-- Enables real community posting end to end:
--   1. A public storage bucket for shared post images.
--   2. Security-definer helpers the feed/detail endpoints use to resolve
--      comment counts, comment lists and a real member directory without
--      exposing private profile columns or user ids through RLS bypass.
-- Idempotent: safe to run on an existing database.

begin;

-- 1) Public bucket for community post images. Public read so shared photos
--    load directly in the feed; writes are gated to authenticated users.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-posts',
  'community-posts',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Public read community images" on storage.objects;
create policy "Public read community images"
  on storage.objects
  for select
  using (bucket_id = 'community-posts');

drop policy if exists "Authenticated upload community images" on storage.objects;
create policy "Authenticated upload community images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'community-posts'
    and auth.role() = 'authenticated'
  );

drop policy if exists "Owners update community images" on storage.objects;
create policy "Owners update community images"
  on storage.objects
  for update
  using (bucket_id = 'community-posts' and auth.uid() = owner);

drop policy if exists "Owners delete community images" on storage.objects;
create policy "Owners delete community images"
  on storage.objects
  for delete
  using (bucket_id = 'community-posts' and auth.uid() = owner);

-- 2) Comment counts for a batch of post ids (used by the feed).
create or replace function public.get_post_comment_counts(target_ids uuid[])
returns table (post_id uuid, count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select c.post_id, count(*)::bigint
  from public.community_comments c
  where c.post_id = any(target_ids)
  group by c.post_id;
$$;

grant execute on function public.get_post_comment_counts(uuid[]) to authenticated;

-- 3) Full comment list for one post with the commenter's display name and
--    avatar. Never exposes the commenter's user id.
create or replace function public.get_post_comments(target_post_id uuid)
returns table (
  id uuid,
  text text,
  rating integer,
  created_at timestamptz,
  full_name text,
  avatar_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.id, c.text, c.rating, c.created_at, p.full_name, p.avatar_url
  from public.community_comments c
  join public.profiles p on p.id = c.user_id
  where c.post_id = target_post_id
  order by c.created_at asc;
$$;

grant execute on function public.get_post_comments(uuid) to authenticated;

-- 4) Real member directory: only people who have actually shared a public
--    post appear. Sorted by how much they contribute.
create or replace function public.get_community_members()
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  post_count bigint,
  first_post_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.full_name, p.avatar_url,
         count(posts.id)::bigint as post_count,
         min(posts.created_at) as first_post_at
  from public.profiles p
  join public.community_posts posts on posts.user_id = p.id
  where posts.is_private = false
  group by p.id
  order by post_count desc, first_post_at asc;
$$;

grant execute on function public.get_community_members() to authenticated;

commit;
