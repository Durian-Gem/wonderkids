-- WonderKids Sprint-2 Learning Core Database Schema
-- Run this via Supabase MCP or SQL editor

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
  mastery numeric default 0.0
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
  primary key (user_id, child_id, badge_id)
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

-- Indexes for performance
create index if not exists idx_activities_lesson_id on app.activities(lesson_id);
create index if not exists idx_questions_activity_id on app.questions(activity_id);
create index if not exists idx_options_question_id on app.options(question_id);
create index if not exists idx_attempts_user_child_lesson on app.attempts(user_id, child_id, lesson_id);
create index if not exists idx_answers_attempt_id on app.answers(attempt_id);
create index if not exists idx_progress_user_child_lesson on app.progress(user_id, child_id, lesson_id);
create index if not exists idx_xp_events_user_child on app.xp_events(user_id, child_id);
create index if not exists idx_user_badges_user_child on app.user_badges(user_id, child_id);

-- Functional index for progress uniqueness (handles null user_id/child_id)
create unique index if not exists idx_progress_unique_user_child_lesson
on app.progress (
  coalesce(user_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(child_id, '00000000-0000-0000-0000-000000000000'::uuid),
  lesson_id
);
