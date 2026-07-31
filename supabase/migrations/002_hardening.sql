-- AuraStyle Hardening Migration
-- Adds: auto-profile on signup, audit timestamps, stricter RLS, performance indexes
-- Idempotent: safe to run on an existing database.

-- 1) Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 2) Keep updated_at fresh on profiles
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on profiles;
create trigger profiles_touch_updated_at
  before update on profiles
  for each row
  execute function public.touch_updated_at();

-- 3) Prevent rating/comment abuse: users may delete their own ratings and comments
drop policy if exists "Users can delete own rating" on community_ratings;
create policy "Users can delete own rating" on community_ratings
  for delete using (auth.uid() = user_id);

drop policy if exists "Users can delete own comment" on community_comments;
create policy "Users can delete own comment" on community_comments
  for delete using (auth.uid() = user_id);

-- 4) Block profile creation for someone else's id (defence in depth)
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- 5) Performance indexes for feed queries and user joins
create index if not exists idx_profiles_updated_at on profiles(updated_at desc);
create index if not exists idx_community_posts_avg_rating on community_posts(avg_rating desc);
create index if not exists idx_community_comments_created_at on community_comments(created_at desc);
create index if not exists idx_community_ratings_created_at on community_ratings(created_at desc);
create index if not exists idx_face_analyses_created_at on face_analyses(created_at desc);
create index if not exists idx_body_analyses_created_at on body_analyses(created_at desc);

-- 6) Recalculate average rating when a rating is deleted too
create or replace function public.recalc_post_rating()
returns trigger
language plpgsql
as $$
begin
  update community_posts
  set avg_rating = (
    select coalesce(round(avg(score)::numeric, 1), 0)
    from community_ratings
    where post_id = coalesce(old.post_id, new.post_id)
  ),
  rating_count = (
    select count(*)
    from community_ratings
    where post_id = coalesce(old.post_id, new.post_id)
  )
  where id = coalesce(old.post_id, new.post_id);
  return coalesce(old, new);
end;
$$;

drop trigger if exists on_rating_delete on community_ratings;
create trigger on_rating_delete
  after delete on community_ratings
  for each row
  execute function public.recalc_post_rating();
