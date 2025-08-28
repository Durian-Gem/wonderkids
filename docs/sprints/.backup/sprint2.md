🚀 Sprint-2 Master Prompt — WonderKids English

You are implementing Sprint-2 using Next.js (App Router), NestJS, Supabase (Postgres/Auth/Storage) via MCP, and Yarn.
Use latest library versions (no pinned versions). Follow cursor.mdc rules (TS strict, a11y, i18n, RLS-safe).

SPRINT-2 GOALS

Lesson Player (core) with activity renderer

Activity types: MCQ, Listen-and-Choose (audio), Match Pairs (drag)

Attempts + Auto-Scoring + Progress

Gamification (basic): XP events, daily streak counter, 3 starter badges

Blog (MDX) skeleton and RSS

Tests for protected endpoints & lesson happy path

Deliver in atomic PRs (listed at the end).

1) Supabase — Migration (write to supabase/migrations/0002_learning_core.sql and execute via MCP)
-- === Learning Core ===
create table if not exists app.activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references app.lessons on delete cascade,
  idx int not null,
  kind text not null check (kind in ('quiz_mcq','listen_choose','match_pairs')),
  prompt jsonb default '{}'::jsonb,           -- activity-level instruction/media
  is_required boolean default true,
  created_at timestamptz default now(),
  unique(lesson_id, idx)
);

create table if not exists app.questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references app.activities on delete cascade,
  idx int not null,
  stem jsonb not null,                        -- question text/assets
  answer jsonb,                               -- canonical answer(s)
  metadata jsonb,
  unique(activity_id, idx)
);

create table if not exists app.options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references app.questions on delete cascade,
  idx int not null,
  label jsonb not null,                       -- choice text/assets
  is_correct boolean default false,
  unique(question_id, idx)
);

-- Attempts / Answers / Progress / XP / Badges
create table if not exists app.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  lesson_id uuid not null references app.lessons on delete cascade,
  started_at timestamptz default now(),
  completed_at timestamptz,
  score numeric,
  metadata jsonb
);

create table if not exists app.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references app.attempts on delete cascade,
  question_id uuid not null references app.questions on delete cascade,
  response jsonb not null,
  is_correct boolean,
  created_at timestamptz default now(),
  unique(attempt_id, question_id)
);

create table if not exists app.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  lesson_id uuid not null references app.lessons on delete cascade,
  status text default 'in_progress' check (status in ('not_started','in_progress','completed')),
  last_activity_at timestamptz default now(),
  stars int default 0,
  mastery numeric default 0.0,
  unique(coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
         coalesce(child_id, '00000000-0000-0000-0000-000000000000'::uuid),
         lesson_id)
);

create table if not exists app.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  reason text,
  amount int not null,
  created_at timestamptz default now()
);

create table if not exists app.badges (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  description text,
  icon text
);

create table if not exists app.user_badges (
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  badge_id uuid references app.badges on delete cascade,
  earned_at timestamptz default now(),
  primary key (coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
               coalesce(child_id, '00000000-0000-0000-0000-000000000000'::uuid),
               badge_id)
);

-- RLS
alter table app.activities enable row level security;
alter table app.questions enable row level security;
alter table app.options enable row level security;
alter table app.attempts enable row level security;
alter table app.answers enable row level security;
alter table app.progress enable row level security;
alter table app.xp_events enable row level security;
alter table app.badges enable row level security;
alter table app.user_badges enable row level security;

-- Public read for published learning content
create policy "public read activities" on app.activities for select using (true);
create policy "public read questions"  on app.questions  for select using (true);
create policy "public read options"    on app.options    for select using (true);

-- Owner/guardian scope for attempts/answers/progress/xp/badges
create policy "attempts owner" on app.attempts for all using (
  user_id = auth.uid() or exists (
    select 1 from app.children c where c.id = app.attempts.child_id and c.guardian_id = auth.uid()
  )
);

create policy "answers owner" on app.answers for all using (
  exists (
    select 1 from app.attempts a
    where a.id = attempt_id
      and (a.user_id = auth.uid() or exists (select 1 from app.children c where c.id = a.child_id and c.guardian_id = auth.uid()))
  )
);

create policy "progress owner" on app.progress for all using (
  user_id = auth.uid() or exists (select 1 from app.children c where c.id = app.progress.child_id and c.guardian_id = auth.uid())
);

create policy "xp owner" on app.xp_events for all using (
  user_id = auth.uid() or exists (select 1 from app.children c where c.id = app.xp_events.child_id and c.guardian_id = auth.uid())
);

create policy "badges read" on app.badges for select using (true);
create policy "user_badges owner" on app.user_badges for all using (
  user_id = auth.uid() or exists (select 1 from app.children c where c.id = app.user_badges.child_id and c.guardian_id = auth.uid())
);

Storage buckets & policies (write to supabase/migrations/0003_storage.sql)
-- Images & audio for activities
insert into storage.buckets (id, name, public) values ('images','images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('audio','audio', true)
on conflict (id) do nothing;

-- Public read, authenticated write for guardians/admin
create policy "public read images" on storage.objects for select
using (bucket_id = 'images');

create policy "public read audio" on storage.objects for select
using (bucket_id = 'audio');

create policy "auth write images" on storage.objects for insert
with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "auth write audio" on storage.objects for insert
with check (bucket_id = 'audio' and auth.role() = 'authenticated');

Seed activities (write to supabase/seed/seed_sprint2.sql)

Provide one fully playable lesson:

-- Pick first lesson from a1-starters
with L as (
  select l.id from app.lessons l
  join app.units u on u.id = l.unit_id
  join app.courses c on c.id = u.course_id
  where c.slug='a1-starters' and u.idx=1 and l.idx=1
  limit 1
)
insert into app.activities (lesson_id, idx, kind, prompt)
select (select id from L), 1, 'quiz_mcq', '{"title":"Choose the correct greeting"}'
union all
select (select id from L), 2, 'listen_choose', '{"title":"Listen and choose"}'
union all
select (select id from L), 3, 'match_pairs', '{"title":"Match words to pictures"}';

-- MCQ
with A as (select id from app.activities where kind='quiz_mcq' and lesson_id=(select id from L))
insert into app.questions (activity_id, idx, stem, answer)
select (select id from A), 1, '{"text":"How do you say hello?"}'::jsonb, '{"correct":["Hello"]}'::jsonb;

with Q as (select id from app.questions where activity_id=(select id from (select id from app.activities where kind='quiz_mcq' and lesson_id=(select id from L)) A))
insert into app.options (question_id, idx, label, is_correct)
select (select id from Q), 1, '{"text":"Goodbye"}', false union all
select (select id from Q), 2, '{"text":"Hello"}', true  union all
select (select id from Q), 3, '{"text":"Please"}', false;

-- Listen & choose (expects audio URL in stem)
with A2 as (select id from app.activities where kind='listen_choose' and lesson_id=(select id from L))
insert into app.questions (activity_id, idx, stem, answer)
select (select id from A2), 1,
       jsonb_build_object('audio','/audio/greetings/hello.mp3'),
       '{"correct":["Hello"]}'::jsonb;

with Q2 as (select id from app.questions where activity_id=(select id from A2))
insert into app.options (question_id, idx, label, is_correct)
select (select id from Q2), 1, '{"text":"Hello"}', true union all
select (select id from Q2), 2, '{"text":"Thanks"}', false;

-- Match pairs
with A3 as (select id from app.activities where kind='match_pairs' and lesson_id=(select id from L))
insert into app.questions (activity_id, idx, stem, answer, metadata)
select (select id from A3), 1,
       '{"pairs":[["Hi", "👋"],["Bye","👋🚪"]]}'::jsonb,
       '{"pairs":[["Hi","👋"],["Bye","👋🚪"]]}'::jsonb,
       '{"mode":"emoji"}'::jsonb;


Note: replace /audio/... with Supabase Storage URLs (public).

2) API (NestJS) — New/updated modules

Modules: lessons, attempts, progress, gamification.

Routes

GET /lessons/:lessonId → lesson + activities + questions + options (published only)

POST /attempts { lessonId, childId? } → returns attemptId

POST /attempts/:id/answers { answers: Array<{questionId, response}> }

POST /attempts/:id/finish → calculates score, writes progress and xp_events, checks badges, returns {score, xpAwarded, streak}

Scoring rules

MCQ: all correct choices selected and no incorrect → correct.

Listen-choose: selected label matches answer.correct[0].

Match pairs: all mapped pairs match answer; otherwise incorrect (no partial in MVP).

Gamification

XP: +5 per correct question, +10 lesson completion bonus.

Streak: if user/child has a completion in the last 24h window, increment; else reset to 1 (persist in progress.metadata or a simple running counter in profiles for MVP).

Badges (seed three): FIRST_LESSON, SEVEN_DAY_STREAK, FIVE_LESSONS.
Award when thresholds hit; insert into user_badges.

Testing

Jest + Supertest for: start attempt → answer → finish; verifies RLS by trying to fetch another guardian’s attempt (should fail).

3) Web (Next.js) — Lesson Player & Blog skeleton

Routes

app/(app)/lesson/[lessonId]/page.tsx        # server comp
app/(app)/lesson/[lessonId]/play/client.tsx # client wrapper
app/(app)/review/page.tsx                    # basic review queue placeholder
app/(marketing)/blog/page.tsx                # list
app/(marketing)/blog/[slug]/page.tsx         # MDX post


Components

ActivityRenderer.tsx → switch by kind

cards/MCQCard.tsx (with multi/single select)

cards/ListenChooseCard.tsx (HTMLAudioElement + choices)

cards/MatchPairsCard.tsx (drag/drop via dnd-kit)

ResultDialog.tsx (score, XP, confetti)

ProgressDots.tsx, TimerBadge.tsx

State

Ephemeral player state with Zustand (current index, local responses).

Data fetch with TanStack Query; POST answers on submit; finalize on finish.

Blog

MDX support (no pins), RSS (/rss.xml), basic tags list.

Example post “Welcome to WonderKids”.

i18n

Add keys for all strings; en + vi.

A11y

Keyboard selectable options; ARIA roles for lists and dialogs; focus trap in dialogs.

4) Analytics (client events)

Fire these (console stub or analytics provider later):

lesson_start, answer_submit, attempt_finish, xp_awarded.

5) CI updates

Add API test job (yarn test in apps/api).

Add Playwright smoke: sign-in (mock), open lesson, submit one MCQ.

6) Acceptance Checklist (Sprint-2)

 /lesson/[lessonId] renders activities with audio/images from Supabase buckets.

 Attempt lifecycle works: start → answer → finish; score returned; progress row updated.

 XP/streak computed and visible on result dialog; badges award when thresholds met.

 RLS verified by failing cross-guardian access in tests.

 Blog index + single post render (MDX) with RSS.

 Type-safe; no console errors; CI green.

7) PR Plan (order)

feat(db): learning core tables + policies + storage buckets

feat(api): lessons read models + attempts/answers/finish endpoints

feat(web): lesson player (MCQ, listen-choose, match pairs)

feat(api): gamification xp/streak + badges + tests

feat(web): blog (MDX) + RSS + i18n keys

chore(ci): api tests + basic e2e

Commit style: type(scope): summary (feat, fix, chore, docs, test).

8) Notes

Keep using latest deps; no pins.

Never expose service role key to web.

Use signed public URLs from Supabase for media.

Keep activities JSON lean and documented in docs/content-templates/*.