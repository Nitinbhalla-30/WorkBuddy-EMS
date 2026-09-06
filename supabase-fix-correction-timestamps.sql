-- Fix: attendance-correction notifications show 12:00 a.m. instead of a real time
--
-- The app now writes full ISO datetimes for applied_on (when the employee
-- submitted the request) and decided_on (when HR/Admin approved or rejected
-- it), but both columns were created as plain DATE, so Postgres truncated the
-- time on every upsert and the notification list fell back to midnight.
--
-- Run this ONCE in the Supabase SQL Editor. It upgrades both columns to
-- timestamptz and lands the already-stored dates on 12:00 local (IST) instead
-- of midnight, so old notifications stop showing 12:00 a.m. New submissions
-- and decisions keep their exact time.
--
-- It also adds withdrawn_on: the store records when an employee withdraws a
-- request, and that field had no column at all. PostgREST rejects an entire
-- upsert batch when a payload carries a column the table does not have
-- (error PGRST204), which would strand every correction made from that
-- browser — the same failure that hid shift-change requests for a while.

-- NOTE: This migration was applied to the Supabase project on 2026-08-31 via
-- the Supabase MCP (saved as migration "fix_correction_timestamp_columns").
-- Kept in the repo for reference / re-creating a fresh environment.

alter table public.attendance_corrections
  alter column applied_on type timestamptz using ((applied_on::text || ' 12:00:00+05:30')::timestamptz),
  alter column decided_on type timestamptz using ((decided_on::text || ' 12:00:00+05:30')::timestamptz);

alter table public.attendance_corrections
  add column if not exists withdrawn_on timestamptz;

-- Recover the exact submission time where it is still knowable: request ids are
-- `ACR` + the Date.now() that created them, so real app submissions carry their
-- own timestamp. (The synthetic load-test rows are named ACR0001…, ACR0144 and
-- so on, so only genuine requests match.)
update public.attendance_corrections
set    applied_on = to_timestamp(nullif(replace(id, 'ACR', ''), '')::bigint / 1000.0)
where  id ~ '^ACR[0-9]{13}$';
