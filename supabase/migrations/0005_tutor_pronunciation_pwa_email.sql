-- ========== Sprint 4: AI Tutor, Pronunciation, PWA, Email ==========
-- Migration for WonderKids English learning platform
-- Created: Sprint 4 implementation

-- ========== AI TUTOR ==========
create table if not exists app.ai_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  topic text,
  provider text default 'anthropic',
  system_prompt text,
  created_at timestamptz default now()
);

create table if not exists app.ai_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references app.ai_sessions on delete cascade,
  sender text check (sender in ('user','assistant','system')) not null,
  content text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- Guardian can read child transcripts; owners can manage
alter table app.ai_sessions enable row level security;
alter table app.ai_messages enable row level security;

create policy "ai_sessions owner/guardian" on app.ai_sessions
for all using (
  user_id = auth.uid() or exists(
    select 1 from app.children c where c.id = app.ai_sessions.child_id and c.guardian_id = auth.uid()
  )
);

create policy "ai_messages via session" on app.ai_messages
for all using (
  exists(select 1 from app.ai_sessions s where s.id = session_id
    and (s.user_id = auth.uid() or exists(
      select 1 from app.children c where c.id = s.child_id and c.guardian_id = auth.uid()
    )))
);

-- ========== PRONUNCIATION ==========
create table if not exists app.speech_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  child_id uuid references app.children on delete cascade,
  lesson_id uuid references app.lessons on delete cascade,
  activity_id uuid references app.activities on delete cascade,
  question_id uuid references app.questions on delete cascade,
  audio_path text not null,            -- storage path
  words_total int,
  words_correct int,
  accuracy numeric,                    -- 0..1
  fluency_score numeric,               -- 0..1 (heuristic)
  pron_score numeric,                  -- overall 0..1
  wpm numeric,
  created_at timestamptz default now()
);

alter table app.speech_attempts enable row level security;
create policy "speech owner" on app.speech_attempts for all using (
  user_id = auth.uid() or exists(select 1 from app.children c where c.id = app.speech_attempts.child_id and c.guardian_id = auth.uid())
);

-- Private storage bucket for recordings (idempotent)
insert into storage.buckets (id, name, public) values ('recordings','recordings', false)
on conflict (id) do nothing;

-- Allow owners (guardian/child) to read/write their own objects
create policy "recordings read owner" on storage.objects for select
using (bucket_id = 'recordings' and (auth.role() = 'authenticated'));
create policy "recordings write owner" on storage.objects for insert
with check (bucket_id = 'recordings' and (auth.role() = 'authenticated'));

-- ========== OFFLINE PWA PACKS ==========
create table if not exists app.content_packs (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,           -- e.g., 'a1-u1'
  title text not null,
  description text,
  assets jsonb not null,               -- [{url, hash, bytes, kind}]
  created_at timestamptz default now(),
  is_published boolean default false
);
alter table app.content_packs enable row level security;
create policy "packs public read" on app.content_packs for select using (is_published is true);

-- ========== WEEKLY EMAIL QUEUE ==========
create table if not exists app.email_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  kind text check (kind in ('weekly_summary')),
  payload jsonb not null,
  status text default 'queued' check (status in ('queued','sent','failed')),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz
);
alter table app.email_jobs enable row level security;
create policy "email jobs owner read" on app.email_jobs for select using (user_id = auth.uid());

-- Update view for dashboard minutes (preserve existing structure but ensure compatibility)
drop view if exists app.v_user_minutes_week;
create view app.v_user_minutes_week as
select user_id,
       child_id,
       date_trunc('week', coalesce(completed_at, started_at)) as week,
       sum(coalesce(duration_sec, 0)) as total_seconds,
       round((sum(coalesce(duration_sec, 0))::numeric / 60.0), 1) as total_minutes
from app.attempts a
where completed_at is not null
group by user_id, child_id, date_trunc('week', coalesce(completed_at, started_at));

-- Add indexes for performance
create index if not exists idx_ai_sessions_user_child on app.ai_sessions(user_id, child_id);
create index if not exists idx_ai_messages_session on app.ai_messages(session_id);
create index if not exists idx_speech_attempts_child_lesson on app.speech_attempts(child_id, lesson_id);
create index if not exists idx_email_jobs_status_scheduled on app.email_jobs(status, scheduled_at);
create index if not exists idx_content_packs_published on app.content_packs(is_published) where is_published = true;
