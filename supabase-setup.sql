-- WorkBuddy EMS — Supabase setup
-- Run this once in the Supabase Dashboard: SQL Editor -> New query -> Run.
--
-- The app keeps each data collection (employees, attendance, leaves, ...)
-- as one row in app_store, mirroring the previous localStorage layout.
-- This makes the migration seamless; individual tables can be split out
-- in a later phase.

create table if not exists public.app_store (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_store enable row level security;

-- The app talks to Supabase with the anon key, so the anon role needs
-- full access to this table. For an internal company tool this is the
-- intended setup; tighten per-user with Supabase Auth in a later phase.
drop policy if exists "app_store_all" on public.app_store;
create policy "app_store_all"
  on public.app_store
  for all
  to anon, authenticated
  using (true)
  with check (true);
