begin;

alter table if exists public.projects
  add column if not exists about text,
  add column if not exists about_updated date;

commit;
