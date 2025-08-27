-- WonderKids Sprint-1 Database Schema
-- Run this via Supabase MCP or SQL editor

-- Create app schema
create schema if not exists app;

-- PROFILES
create table if not exists app.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  role text default 'guardian' check (role in ('guardian','child','admin','teacher')),
  locale text default 'en',
  created_at timestamptz default now()
);

-- CHILDREN
create table if not exists app.children (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  birth_year int,
  locale text default 'en',
  created_at timestamptz default now()
);

-- COURSES/UNITS/LESSONS (published-only read in Sprint-1)
create table if not exists app.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  cefr_level text check (cefr_level in ('preA1','A1','A2','B1','B2','C1','C2')),
  description text,
  is_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists app.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references app.courses on delete cascade,
  idx int not null,
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique(course_id, idx)
);

create table if not exists app.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references app.units on delete cascade,
  idx int not null,
  title text not null,
  objective text,
  est_minutes int default 5,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique(unit_id, idx)
);

-- Enable Row Level Security
alter table app.profiles enable row level security;
alter table app.children enable row level security;
alter table app.courses enable row level security;
alter table app.units enable row level security;
alter table app.lessons enable row level security;

-- RLS Policies

-- Profiles: users can only access their own profile
create policy "profile self read" on app.profiles 
  for select using (auth.uid() = user_id);

create policy "profile self upsert" on app.profiles 
  for insert with check (auth.uid() = user_id);

create policy "profile self update" on app.profiles 
  for update using (auth.uid() = user_id);

-- Children: guardians can manage their own children
create policy "children guardian all" on app.children 
  for all using (guardian_id = auth.uid());

-- Content: public read access for published content only
create policy "public courses" on app.courses 
  for select using (is_published is true);

create policy "public units" on app.units 
  for select using (is_published is true);

create policy "public lessons" on app.lessons 
  for select using (is_published is true);

-- Indexes for performance
create index if not exists idx_profiles_user_id on app.profiles(user_id);
create index if not exists idx_children_guardian_id on app.children(guardian_id);
create index if not exists idx_courses_slug on app.courses(slug);
create index if not exists idx_courses_published on app.courses(is_published);
create index if not exists idx_units_course_id on app.units(course_id);
create index if not exists idx_units_published on app.units(is_published);
create index if not exists idx_lessons_unit_id on app.lessons(unit_id);
create index if not exists idx_lessons_published on app.lessons(is_published);
