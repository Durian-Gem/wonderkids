-- Fix: Move WonderKids tables to public schema for API access
-- Run this SQL in your Supabase SQL editor

-- Drop existing tables in public if they exist
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.units CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create tables in public schema
CREATE TABLE public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  role text default 'guardian' check (role in ('guardian','child','admin','teacher')),
  locale text default 'en',
  created_at timestamptz default now()
);

CREATE TABLE public.children (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users on delete cascade,
  display_name text not null,
  avatar_url text,
  birth_year int,
  locale text default 'en',
  created_at timestamptz default now()
);

CREATE TABLE public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  cefr_level text check (cefr_level in ('preA1','A1','A2','B1','B2','C1','C2')),
  description text,
  is_published boolean default false,
  created_at timestamptz default now()
);

CREATE TABLE public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  idx int not null,
  title text not null,
  description text,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique(course_id, idx)
);

CREATE TABLE public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units on delete cascade,
  idx int not null,
  title text not null,
  objective text,
  est_minutes int default 5,
  is_published boolean default false,
  created_at timestamptz default now(),
  unique(unit_id, idx)
);

-- Copy data from app schema to public schema (if app schema exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'courses') THEN
    INSERT INTO public.profiles SELECT * FROM app.profiles ON CONFLICT DO NOTHING;
    INSERT INTO public.children SELECT * FROM app.children ON CONFLICT DO NOTHING;
    INSERT INTO public.courses SELECT * FROM app.courses ON CONFLICT DO NOTHING;
    INSERT INTO public.units SELECT * FROM app.units ON CONFLICT DO NOTHING;
    INSERT INTO public.lessons SELECT * FROM app.lessons ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Insert seed data if no courses exist
INSERT INTO public.courses (slug, title, cefr_level, description, is_published)
VALUES ('a1-starters', 'A1 Starters', 'A1', 'Beginner topics for ages 6-10', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert units for A1 Starters course
WITH c as (select id from public.courses where slug='a1-starters')
INSERT INTO public.units (course_id, idx, title, description, is_published)
SELECT c.id, x.idx, x.title, x.description, true FROM c,
      (VALUES (1,'Hello & Introductions','Greetings and names'),
              (2,'Family & Pets','Talk about family and animals'),
              (3,'Colors & Numbers','Basic colors and counting')) as x(idx,title,description)
ON CONFLICT (course_id, idx) DO NOTHING;

-- Insert lessons for each unit
WITH u as (select id, idx from public.units where course_id=(select id from public.courses where slug='a1-starters'))
INSERT INTO public.lessons (unit_id, idx, title, objective, is_published)
SELECT (select id from u where idx=1), 1, 'Saying Hello', 'Greet and ask names', true
UNION ALL
SELECT (select id from u where idx=1), 2, 'My Name Is', 'Introduce yourself', true
UNION ALL
SELECT (select id from u where idx=2), 1, 'This is my family', 'Identify family members', true
UNION ALL
SELECT (select id from u where idx=2), 2, 'My Pet Dog', 'Talk about pets', true
UNION ALL
SELECT (select id from u where idx=3), 1, 'Colors Around Me', 'Name basic colors', true
UNION ALL
SELECT (select id from u where idx=3), 2, 'Count with Me', 'Count from 1 to 10', true
ON CONFLICT (unit_id, idx) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profile self read" ON public.profiles;
DROP POLICY IF EXISTS "profile self upsert" ON public.profiles;
DROP POLICY IF EXISTS "profile self update" ON public.profiles;
DROP POLICY IF EXISTS "children guardian all" ON public.children;
DROP POLICY IF EXISTS "public courses" ON public.courses;
DROP POLICY IF EXISTS "public units" ON public.units;
DROP POLICY IF EXISTS "public lessons" ON public.lessons;

-- RLS Policies
CREATE POLICY "profile self read" ON public.profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profile self upsert" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profile self update" ON public.profiles 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "children guardian all" ON public.children 
  FOR ALL USING (guardian_id = auth.uid());

CREATE POLICY "public courses" ON public.courses 
  FOR SELECT USING (is_published IS TRUE);

CREATE POLICY "public units" ON public.units 
  FOR SELECT USING (is_published IS TRUE);

CREATE POLICY "public lessons" ON public.lessons 
  FOR SELECT USING (is_published IS TRUE);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_children_guardian_id ON public.children(guardian_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);
CREATE INDEX IF NOT EXISTS idx_units_published ON public.units(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);

-- Verify the data was created
SELECT 'Courses created:' as status, count(*) as count FROM public.courses;
SELECT 'Units created:' as status, count(*) as count FROM public.units;
SELECT 'Lessons created:' as status, count(*) as count FROM public.lessons;
