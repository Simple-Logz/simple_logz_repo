-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
-- SimpleLogz Database Schema
-- Run this entire file in your Supabase SQL Editor
-- âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

-- ââ Profiles (extends Supabase auth.users) âââââââââââââââââââ
create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  name                  text,
  avatar                text,
  plan                  text not null default 'free' check (plan in ('free','developer','enterprise')),
  stripe_customer_id    text unique,
  stripe_subscription_id text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ââ Analyses âââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists analyses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  log_snippet  text,
  severity     text,
  title        text,
  source       text,
  result       jsonb,
  created_at   timestamptz default now()
);

-- ââ Forum threads âââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists forum_threads (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade,
  title      text not null,
  body       text not null,
  category   text not null default 'general',
  views      integer default 0,
  is_pinned  boolean default false,
  file_url   text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ââ Forum comments ââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists forum_comments (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid references forum_threads(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  body       text not null,
  likes      integer default 0,
  created_at timestamptz default now()
);

-- ââ RLS (Row Level Security) ââââââââââââââââââââââââââââââââââ

-- Profiles: users can read all, update their own
alter table profiles enable row level security;
create policy "Public profiles readable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);

-- Analyses: users see only their own
alter table analyses enable row level security;
create policy "Users see own analyses" on analyses for select using (auth.uid() = user_id);
create policy "Users insert own analyses" on analyses for insert with check (auth.uid() = user_id);
create policy "Users delete own analyses" on analyses for delete using (auth.uid() = user_id);

-- Forum: threads and comments are public to read, auth required to write
alter table forum_threads enable row level security;
create policy "Anyone reads threads" on forum_threads for select using (true);
create policy "Auth users post threads" on forum_threads for insert with check (auth.uid() = user_id);
create policy "Users edit own threads" on forum_threads for update using (auth.uid() = user_id);

alter table forum_comments enable row level security;
create policy "Anyone reads comments" on forum_comments for select using (true);
create policy "Auth users post comments" on forum_comments for insert with check (auth.uid() = user_id);

-- ââ Helper functions ââââââââââââââââââââââââââââââââââââââââââ
create or replace function increment_thread_views(thread_id uuid)
returns void language plpgsql security definer as $$
begin
  update forum_threads set views = views + 1 where id = thread_id;
end;
$$;

create or replace function increment_comment_likes(comment_id uuid)
returns void language plpgsql security definer as $$
begin
  update forum_comments set likes = likes + 1 where id = comment_id;
end;
$$;

-- ââ Auto-create profile on signup âââââââââââââââââââââââââââââ
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ââ Projects âââââââââââââââââââââââââââââââââââââââââââââââââ
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  stack       text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table projects enable row level security;
create policy "Users see own projects"    on projects for select using (auth.uid() = user_id);
create policy "Users insert own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users delete own projects" on projects for delete using (auth.uid() = user_id);

-- Add project_id to analyses so they can be linked to a project
alter table analyses add column if not exists project_id uuid references projects(id) on delete set null;

-- ââ Indexes âââââââââââââââââââââââââââââââââââââââââââââââââââ
create index if not exists idx_analyses_user_id    on analyses(user_id);
create index if not exists idx_analyses_created_at on analyses(created_at desc);
create index if not exists idx_threads_category    on forum_threads(category);
create index if not exists idx_threads_created_at  on forum_threads(created_at desc);
create index if not exists idx_comments_thread_id  on forum_comments(thread_id);
