🚀 Sprint-1 Master Prompt (WonderKids English)

You are implementing Sprint-1 of WonderKids English using Next.js (App Router) for web, NestJS for API, Supabase (Postgres + Auth + Storage) via MCP, and Yarn.
Use latest versions for all libraries (no version pins). Follow our coding rules from cursor.mdc (type-safe TS, Tailwind+shadcn, a11y, i18n, RLS-safe). Keep PRs atomic with clear commits.

GOALS (Sprint-1 scope)

Foundation + Auth (A1, A2, A3 from Epics)

Basic Content surfacing (B1)

Seed minimal course data

Marketing shell (Home + Pricing placeholder)

CI basics (lint, typecheck, build)

MONOREPO SETUP

Create Turborepo

npx create-turbo@latest wonderkids --no
cd wonderkids


Apps & packages

apps/web      # Next.js App Router (TS)
apps/api      # NestJS
packages/ui   # shared UI components (shadcn wrappers)
packages/types# zod schemas + TS types
packages/config# eslint, tsconfig, prettier, tailwind preset
docs/         # PRD.md + EPICS_STORIES.md (copy from canvas later)
supabase/     # migrations + seed
.github/workflows/ci.yml
cursor.mdc    # project rules (use our rules)
.env.example


Root workspace + scripts

Workspaces for apps/* and packages/*.

Scripts: lint, typecheck, build, dev:web, dev:api.

WEB APP (Next.js)

App Router, Tailwind, shadcn/ui, TanStack Query, react-hook-form + Zod, next-intl, Framer Motion.

Pages (route groups):

app/(marketing)/page.tsx        # Home
app/(marketing)/pricing/page.tsx
app/(app)/layout.tsx
app/(app)/dashboard/page.tsx
app/(app)/family/page.tsx       # Child profiles CRUD
app/(app)/course/[slug]/page.tsx# Course map -> units/lessons
app/auth/sign-in/page.tsx
app/auth/sign-up/page.tsx


Add shadcn components (no version pins): button, card, input, label, avatar, dialog, tabs, badge, skeleton, toast.

Supabase client: apps/web/lib/supabase.ts with createClient(); session persisted client-side; server data via RSC fetchers that call our Nest API (or direct Supabase read for published content only).

Auth flows:

Email/password + magic link.

AuthProvider (context) + protected (app) layout; redirect to /auth/sign-in if no session.

API APP (NestJS)

Modules for Sprint-1: auth, profiles, children, content (read-only).

Auth: validate Supabase JWT (bearer); guard to inject userId.

REST endpoints (subset):

GET /content/courses → published only

GET /content/courses/:slug → units + lessons (published only)

GET /profiles/me

POST /children {displayName, avatarUrl?, birthYear?, locale?}

PATCH /children/:id, DELETE /children/:id

Swagger enabled at /docs in dev.

SUPABASE (MCP) – Sprint-1 schema

Run the following SQL via Supabase MCP. Also write it to supabase/migrations/0001_init_sprint1.sql.

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

-- Enable RLS
alter table app.profiles enable row level security;
alter table app.children enable row level security;
alter table app.courses enable row level security;
alter table app.units enable row level security;
alter table app.lessons enable row level security;

-- Policies
create policy "profile self read" on app.profiles for select using (auth.uid() = user_id);
create policy "profile self upsert" on app.profiles for insert with check (auth.uid() = user_id);
create policy "profile self update" on app.profiles for update using (auth.uid() = user_id);

create policy "children guardian all" on app.children for all using (guardian_id = auth.uid());
create policy "public courses" on app.courses for select using (is_published is true);
create policy "public units" on app.units for select using (is_published is true);
create policy "public lessons" on app.lessons for select using (is_published is true);

Seed (write to supabase/seed/seed_sprint1.sql and execute)
insert into app.courses (slug, title, cefr_level, description, is_published)
values ('a1-starters', 'A1 Starters', 'A1', 'Beginner topics for ages 6-10', true)
on conflict (slug) do nothing;

with c as (select id from app.courses where slug='a1-starters')
insert into app.units (course_id, idx, title, description, is_published)
select c.id, x.idx, x.title, x.desc, true from c,
      (values (1,'Hello & Introductions','Greetings and names'),
              (2,'Family & Pets','Talk about family and animals'),
              (3,'Colors & Numbers','Basic colors and counting')) as x(idx,title,desc)
on conflict do nothing;

with u as (select id, idx from app.units where course_id=(select id from app.courses where slug='a1-starters'))
insert into app.lessons (unit_id, idx, title, objective, is_published)
select (select id from u where idx=1), 1, 'Saying Hello', 'Greet and ask names', true
union all
select (select id from u where idx=1), 2, 'My Name Is', 'Introduce yourself', true
union all
select (select id from u where idx=2), 1, 'This is my family', 'Identify family members', true
union all
select (select id from u where idx=3), 1, 'Colors Around Me', 'Name basic colors', true
on conflict do nothing;

ENV VARS

Create .env.example at repo root:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=   # api only

IMPLEMENTATION DETAILS
Web – Auth & Profiles

Components: AuthForm, ChildCard, ChildDialog.

Pages:

/auth/sign-in: email+password, “magic link” tab.

/auth/sign-up: create account → create guardian profile row (upsert by user_id).

/family: list children; create/edit/delete (calls API).

/dashboard: “Welcome, {guardianName}”; quick link to A1 course.

Guarded layout for (app) group: if no session → redirect to /auth/sign-in.

Internationalization: provide en + vi message files for all UI strings used in Sprint-1.

Web – Course Map

/course/[slug] (server component): fetch published units and lessons (read-only) and show grid with lock badges (always unlocked in Sprint-1).

If course not found → 404.

API – Routes

DTOs with class-validator; Zod types in packages/types.

Controllers/services for profiles, children, content.

Use Supabase JS (service key) on server; never expose service key to web.

Shared Packages

packages/ui: re-export shadcn components with project theming.

packages/types: share Course/Unit/Lesson/Child/Profile types and Zod schemas.

MARKETING PAGES (basic)

(marketing)/page.tsx: hero + CTA (Get started), features, simple testimonials.

(marketing)/pricing/page.tsx: one Family plan card with CTA → (no Stripe integration yet—placeholder link to sign up).

CI

GitHub Actions workflow ci.yml: install, lint, typecheck, build apps/web and apps/api.

SCRIPTS TO ADD

Root package.json (no version pins):

{
  "scripts": {
    "dev:web": "turbo run dev --filter=web",
    "dev:api": "turbo run start:dev --filter=api",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "build": "turbo run build",
    "seed": "node supabase/seed/run-seed.cjs"
  }
}


Create supabase/seed/run-seed.cjs that runs the SQL seed via MCP or psql (Cursor can write a tiny Node script that posts to Supabase SQL endpoint if MCP isn’t available in CI).

ACCEPTANCE CHECKLIST (must all pass)

Sign up/in/out works; guardian profile row auto-created; .profiles RLS verified.

Create/edit/delete child profiles from /family (RLS: only guardian can manage).

/course/a1-starters renders Unit/Lesson grid from published tables anonymously.

Basic Home/Pricing pages exist; responsive and accessible (keyboard focus visible).

Type-safe across apps; no console errors; yarn build passes for both apps.

CI green on lint, typecheck, build.

No package versions pinned.

NICE-TO-HAVE (if time remains in Sprint-1)

Blog index route scaffolding (MDX ready).

Simple “minutes learned” placeholder on /dashboard (static number).

DELIVERABLES

PRs:

chore(repo): scaffold monorepo + CI

feat(web): auth + profiles + family management

feat(api): profiles/children/content endpoints

feat(db): sprint-1 schema + seed

feat(web): course map + marketing shell

Follow this prompt exactly, narrate what you’re doing, and produce diffs/file contents for each step. Use Yarn for all installs and do not pin versions.