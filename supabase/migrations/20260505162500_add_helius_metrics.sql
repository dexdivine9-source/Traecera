-- Tracera on-chain metrics schema for Helius ingestion.
-- Safe to run multiple times (idempotent where possible).

begin;

-- Ensure UUID generation is available for snapshot primary keys.
create extension if not exists "pgcrypto";

-- Add required metric columns to projects table.
alter table if exists public.projects
  add column if not exists transaction_volume numeric(20, 2) not null default 0,
  add column if not exists active_users integer not null default 0,
  add column if not exists volume_24h numeric(20, 2) not null default 0,
  add column if not exists growth_percent numeric(10, 2) not null default 0,
  add column if not exists metrics_updated_at timestamptz;

-- Program address is required for mapping Helius requests to projects.
alter table if exists public.projects
  add column if not exists program_address text;

create unique index if not exists projects_program_address_unique_idx
  on public.projects (program_address)
  where program_address is not null;

-- Snapshot table keeps historical metric samples.
create table if not exists public.project_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  program_address text not null,
  transaction_volume numeric(20, 2) not null default 0,
  active_users integer not null default 0,
  volume_24h numeric(20, 2) not null default 0,
  growth_percent numeric(10, 2) not null default 0,
  tx_count_60d integer not null default 0,
  collected_at timestamptz not null default now()
);

create index if not exists project_metrics_snapshots_project_id_collected_at_idx
  on public.project_metrics_snapshots (project_id, collected_at desc);

create index if not exists project_metrics_snapshots_program_address_collected_at_idx
  on public.project_metrics_snapshots (program_address, collected_at desc);

commit;
