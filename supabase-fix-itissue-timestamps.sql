-- Fix: IT issue notification timestamps show 12:00 AM instead of the real time
--
-- The app writes full ISO datetimes for created_on / updated_on and each
-- comment's "on" stamp, but created_on/updated_on were created as plain DATE,
-- so Postgres truncated the time on every upsert and the notification list
-- showed midnight. (Same issue and fix as
-- supabase-fix-ticket-timestamps.sql and supabase-fix-leave-timestamps.sql.)
--
-- Run this ONCE in the Supabase SQL Editor. It upgrades the two columns to
-- timestamptz (preserving the stored dates) and shifts legacy date-only
-- values from UTC midnight to UTC noon so old notifications stop showing
-- 12:00 AM. New submissions, assignments and status changes store the real time.
--
-- NOTE: This migration was applied to the Supabase project on 2026-09-02 via
-- the Supabase MCP (saved as migration "fix_it_issue_timestamp_columns").
-- Kept in the repo for reference / re-creating a fresh environment.

alter table public.it_issues
  alter column created_on type timestamptz using (created_on at time zone 'UTC'),
  alter column updated_on type timestamptz using (updated_on at time zone 'UTC');

-- Shift legacy midnight values (i.e. rows that were date-only) to noon UTC.
update public.it_issues
set    created_on = created_on + interval '12 hours'
where  created_on is not null and (created_on at time zone 'UTC')::time = '00:00:00';

update public.it_issues
set    updated_on = updated_on + interval '12 hours'
where  updated_on is not null and (updated_on at time zone 'UTC')::time = '00:00:00';
