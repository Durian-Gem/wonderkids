-- WonderKids Sprint-2 Seed Data
-- Run this via Supabase MCP or SQL editor after migrations

-- Insert starter badges
insert into app.badges (code, title, description, icon) values
('FIRST_LESSON', 'First Steps', 'Completed your first lesson!', '🎓'),
('SEVEN_DAY_STREAK', 'Week Warrior', '7 days in a row!', '🔥'),
('FIVE_LESSONS', 'Learning Explorer', 'Completed 5 lessons', '🚀')
on conflict (code) do nothing;

-- Seed activities for the first lesson in A1-Starters
-- Note: This assumes you have courses/units/lessons seeded from Sprint-1
-- If not, you'll need to seed those first or update the lesson reference

-- Pick first lesson from a1-starters (adjust UUID if needed)
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
select (select id from L), 3, 'match_pairs', '{"title":"Match words to pictures"}'
on conflict do nothing;

-- MCQ Questions and Options
with A as (select id from app.activities where kind='quiz_mcq' and lesson_id=(
  select l.id from app.lessons l
  join app.units u on u.id = l.unit_id
  join app.courses c on c.id = u.course_id
  where c.slug='a1-starters' and u.idx=1 and l.idx=1
  limit 1
))
insert into app.questions (activity_id, idx, stem, answer)
select (select id from A), 1, '{"text":"How do you say hello?"}'::jsonb, '{"correct":["Hello"]}'::jsonb
on conflict do nothing;

with Q as (select id from app.questions where activity_id=(select id from (
  select id from app.activities where kind='quiz_mcq' and lesson_id=(
    select l.id from app.lessons l
    join app.units u on u.id = l.unit_id
    join app.courses c on c.id = u.course_id
    where c.slug='a1-starters' and u.idx=1 and l.idx=1
    limit 1
  )
) A))
insert into app.options (question_id, idx, label, is_correct)
select (select id from Q), 1, '{"text":"Goodbye"}', false union all
select (select id from Q), 2, '{"text":"Hello"}', true  union all
select (select id from Q), 3, '{"text":"Please"}', false
on conflict do nothing;

-- Listen & Choose Questions and Options
with A2 as (select id from app.activities where kind='listen_choose' and lesson_id=(
  select l.id from app.lessons l
  join app.units u on u.id = l.unit_id
  join app.courses c on c.id = u.course_id
  where c.slug='a1-starters' and u.idx=1 and l.idx=1
  limit 1
))
insert into app.questions (activity_id, idx, stem, answer)
select (select id from A2), 1,
       jsonb_build_object('audio','/audio/greetings/hello.mp3'),
       '{"correct":["Hello"]}'::jsonb
on conflict do nothing;

with Q2 as (select id from app.questions where activity_id=(select id from A2))
insert into app.options (question_id, idx, label, is_correct)
select (select id from Q2), 1, '{"text":"Hello"}', true union all
select (select id from Q2), 2, '{"text":"Thanks"}', false
on conflict do nothing;

-- Match Pairs Questions
with A3 as (select id from app.activities where kind='match_pairs' and lesson_id=(
  select l.id from app.lessons l
  join app.units u on u.id = l.unit_id
  join app.courses c on c.id = u.course_id
  where c.slug='a1-starters' and u.idx=1 and l.idx=1
  limit 1
))
insert into app.questions (activity_id, idx, stem, answer, metadata)
select (select id from A3), 1,
       '{"pairs":[["Hi", "👋"],["Bye","👋🚪"]]}'::jsonb,
       '{"pairs":[["Hi","👋"],["Bye","👋🚪"]]}'::jsonb,
       '{"mode":"emoji"}'::jsonb
on conflict do nothing;

-- Note: Replace /audio/... with actual Supabase Storage URLs when you upload audio files
-- The audio files should be uploaded to the 'audio' bucket and referenced with signed public URLs
