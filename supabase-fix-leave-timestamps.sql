-- Fix: leave notification timestamps show 12:00 a.m. instead of the real time
--
-- The app writes full ISO datetimes for applied_on, decided_on, withdrawn_on,
-- manager_decided_on, and escalated_on, but these columns were created as
-- plain DATE, so Postgres truncated the time on every upsert and the
-- notification list showed midnight.
--
-- Run this ONCE in the Supabase SQL Editor. It upgrades the columns to
-- timestamptz (preserving the stored dates) and shifts legacy date-only
-- values from UTC midnight to UTC noon so old notifications stop showing
-- 12:00 a.m. New submissions store the real submission/approval time.

-- NOTE: This migration was applied to the Supabase project on 2026-09-01 via
-- the Supabase MCP (saved as migration "fix_leave_timestamp_columns").
-- Kept in the repo for reference / re-creating a fresh environment.

alter table public.leaves
  alter column applied_on        type timestamptz using (applied_on        at time zone 'UTC'),
  alter column decided_on        type timestamptz using (decided_on        at time zone 'UTC'),
  alter column withdrawn_on      type timestamptz using (withdrawn_on      at time zone 'UTC'),
  alter column manager_decided_on type timestamptz using (manager_decided_on at time zone 'UTC'),
  alter column escalated_on      type timestamptz using (escalated_on      at time zone 'UTC');

-- Shift legacy midnight values (i.e. rows that were date-only) to noon UTC.
update public.leaves
set    applied_on = applied_on + interval '12 hours'
where  applied_on is not null and (applied_on at time zone 'UTC')::time = '00:00:00';

update public.leaves
set    decided_on = decided_on + interval '12 hours'
where  decided_on is not null and (decided_on at time zone 'UTC')::time = '00:00:00';

update public.leaves
set    withdrawn_on = withdrawn_on + interval '12 hours'
where  withdrawn_on is not null and (withdrawn_on at time zone 'UTC')::time = '00:00:00';

update public.leaves
set    manager_decided_on = manager_decided_on + interval '12 hours'
where  manager_decided_on is not null and (manager_decided_on at time zone 'UTC')::time = '00:00:00';

update public.leaves
set    escalated_on = escalated_on + interval '12 hours'
where  escalated_on is not null and (escalated_on at time zone 'UTC')::time = '00:00:00';
