-- AuraStyle Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Face analysis results
create table if not exists face_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  image_url text,
  overall_score decimal(3,1),
  symmetry_score decimal(3,1),
  proportion_score decimal(3,1),
  jawline_score decimal(3,1),
  skin_clarity_score decimal(3,1),
  eye_spacing_score decimal(3,1),
  facial_shape text,
  skin_tone text,
  undertone text,
  age_estimation integer,
  gender_estimation text,
  emotion_detected text,
  grooming_suggestions jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Body analysis results
create table if not exists body_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  image_url text,
  body_type text,
  skin_tone_scale text,
  skin_tone_value text,
  undertone text,
  shoulder_width decimal(5,4),
  waist_width decimal(5,4),
  hip_width decimal(5,4),
  created_at timestamptz default now()
);

-- Community posts for rating
create table if not exists community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  image_url text,
  category text check (category in ('outfit', 'face', 'grooming', 'party')),
  title text,
  description text,
  face_blurred boolean default false,
  is_private boolean default false,
  avg_rating decimal(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now()
);

-- Individual ratings
create table if not exists ratings (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references community_posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  score integer check (score >= 1 and score <= 10),
  comment text,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- User style preferences
create table if not exists style_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade unique,
  preferred_styles jsonb default '[]'::jsonb,
  saved_outfits jsonb default '[]'::jsonb,
  favorite_colors jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_face_analyses_user_id on face_analyses(user_id);
create index if not exists idx_body_analyses_user_id on body_analyses(user_id);
create index if not exists idx_community_posts_user_id on community_posts(user_id);
create index if not exists idx_community_posts_category on community_posts(category);
create index if not exists idx_community_posts_created_at on community_posts(created_at desc);
create index if not exists idx_ratings_post_id on ratings(post_id);
create index if not exists idx_ratings_user_id on ratings(user_id);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table face_analyses enable row level security;
alter table body_analyses enable row level security;
alter table community_posts enable row level security;
alter table ratings enable row level security;
alter table style_preferences enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own analyses" on face_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own analyses" on face_analyses for insert with check (auth.uid() = user_id);
create policy "Users can delete own analyses" on face_analyses for delete using (auth.uid() = user_id);

create policy "Users can view own body analyses" on body_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own body analyses" on body_analyses for insert with check (auth.uid() = user_id);

create policy "Anyone can view public posts" on community_posts for select using (is_private = false or auth.uid() = user_id);
create policy "Users can create posts" on community_posts for insert with check (auth.uid() = user_id);
create policy "Users can update own posts" on community_posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on community_posts for delete using (auth.uid() = user_id);

create policy "Anyone can view ratings" on ratings for select using (true);
create policy "Users can rate once" on ratings for insert with check (auth.uid() = user_id);
create policy "Users can update own rating" on ratings for update using (auth.uid() = user_id);

create policy "Users can view own preferences" on style_preferences for select using (auth.uid() = user_id);
create policy "Users can upsert own preferences" on style_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on style_preferences for update using (auth.uid() = user_id);

-- Function to update avg_rating on community_posts
create or replace function update_post_rating()
returns trigger as $$
begin
  update community_posts
  set avg_rating = (
    select coalesce(avg(score), 0)
    from ratings
    where post_id = NEW.post_id
  ),
  rating_count = (
    select count(*)
    from ratings
    where post_id = NEW.post_id
  )
  where id = NEW.post_id;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-update ratings
create trigger on_rating_change
  after insert or update on ratings
  for each row
  execute function update_post_rating();
