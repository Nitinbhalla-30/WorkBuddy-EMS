-- Fix: reimbursement notification timestamps always show 12:00 a.m.
--
-- The app writes full ISO datetimes (e.g. 2026-08-28T14:32:05.123Z) for
-- applied_on / decided_on / paid_on / withdrawn_on, but these columns were
-- created as plain DATE, so Postgres truncated the time on every upsert and
-- the notification list fell back to midnight.
--
-- Run this ONCE in the Supabase SQL Editor. It upgrades the columns to
-- timestamptz (preserving the stored dates) and shifts legacy date-only
-- values from UTC midnight to UTC noon so old notifications stop showing
-- 12:00 a.m. New claims store the real submission/approval time.

-- NOTE: This migration was applied to the Supabase project on 2026-08-28 via
-- the Supabase MCP (saved as migration "fix_reimbursement_timestamp_columns").
-- Kept in the repo for reference / re-creating a fresh environment.

alter table public.reimbursements
  alter column applied_on   type timestamptz using (applied_on   at time zone 'UTC'),
  alter column decided_on   type timestamptz using (decided_on   at time zone 'UTC'),
  alter column paid_on      type timestamptz using (paid_on      at time zone 'UTC'),
  alter column withdrawn_on type timestamptz using (withdrawn_on at time zone 'UTC');

-- Shift legacy midnight values (i.e. rows that were date-only) to noon UTC.
-- (Uses the `::time` cast instead of the `time(...)` function call, which the
-- MCP statement splitter cannot parse.)
update public.reimbursements
set    applied_on   = applied_on   + interval '12 hours'
where  applied_on   is not null and (applied_on   at time zone 'UTC')::time = '00:00:00';

update public.reimbursements
set    decided_on   = decided_on   + interval '12 hours'
where  decided_on   is not null and (decided_on   at time zone 'UTC')::time = '00:00:00';

update public.reimbursements
set    paid_on      = paid_on      + interval '12 hours'
where  paid_on      is not null and (paid_on      at time zone 'UTC')::time = '00:00:00';

update public.reimbursements
set    withdrawn_on = withdrawn_on + interval '12 hours'
where  withdrawn_on is not null and (withdrawn_on at time zone 'UTC')::time = '00:00:00';
