-- Simple table creation for testing
DROP TABLE IF EXISTS public.courses CASCADE;

CREATE TABLE public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  cefr_level text,
  description text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Insert test data
INSERT INTO public.courses (slug, title, cefr_level, description, is_published)
VALUES ('a1-starters', 'A1 Starters', 'A1', 'Beginner topics for ages 6-10', true);

-- Enable RLS but allow public read for published courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public courses read" ON public.courses 
  FOR SELECT USING (is_published IS TRUE);

-- Verify data
SELECT * FROM public.courses;
