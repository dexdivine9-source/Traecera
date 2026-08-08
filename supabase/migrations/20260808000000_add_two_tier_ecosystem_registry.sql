-- Two-Tier Ecosystem Registry schema migration
begin;

-- 1. directory_tier
alter table if exists public.projects
  add column if not exists directory_tier text not null default 'innovation';

-- Add check constraint for directory_tier if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_directory_tier_check'
  ) then
    alter table public.projects
      add constraint projects_directory_tier_check
      check (directory_tier in ('institutional', 'innovation'));
  end if;
end $$;

-- 2. solana_use_case
alter table if exists public.projects
  add column if not exists solana_use_case text;

-- 3. funding_stage
alter table if exists public.projects
  add column if not exists funding_stage text not null default 'bootstrap';

-- Add check constraint for funding_stage if not exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_funding_stage_check'
  ) then
    alter table public.projects
      add constraint projects_funding_stage_check
      check (funding_stage in ('bootstrap', 'grant', 'pre-seed', 'seed', 'vc-backed', 'unknown'));
  end if;
end $$;

-- 4. is_licensed
alter table if exists public.projects
  add column if not exists is_licensed boolean not null default false;

commit;
