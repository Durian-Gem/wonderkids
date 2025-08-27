-- WonderKids Sprint-1 Seed Data
-- Creates initial course content for testing

-- Insert A1 Starters course
insert into app.courses (slug, title, cefr_level, description, is_published)
values ('a1-starters', 'A1 Starters', 'A1', 'Beginner topics for ages 6-10', true)
on conflict (slug) do nothing;

-- Insert units for A1 Starters course
with c as (select id from app.courses where slug='a1-starters')
insert into app.units (course_id, idx, title, description, is_published)
select c.id, x.idx, x.title, x.desc, true from c,
      (values (1,'Hello & Introductions','Greetings and names'),
              (2,'Family & Pets','Talk about family and animals'),
              (3,'Colors & Numbers','Basic colors and counting')) as x(idx,title,desc)
on conflict do nothing;

-- Insert lessons for each unit
with u as (select id, idx from app.units where course_id=(select id from app.courses where slug='a1-starters'))
insert into app.lessons (unit_id, idx, title, objective, is_published)
select (select id from u where idx=1), 1, 'Saying Hello', 'Greet and ask names', true
union all
select (select id from u where idx=1), 2, 'My Name Is', 'Introduce yourself', true
union all
select (select id from u where idx=2), 1, 'This is my family', 'Identify family members', true
union all
select (select id from u where idx=2), 2, 'My Pet Dog', 'Talk about pets', true
union all
select (select id from u where idx=3), 1, 'Colors Around Me', 'Name basic colors', true
union all
select (select id from u where idx=3), 2, 'Count with Me', 'Count from 1 to 10', true
on conflict do nothing;
