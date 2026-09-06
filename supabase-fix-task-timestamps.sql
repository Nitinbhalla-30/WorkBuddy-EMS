-- Fix tasks table timestamp columns from DATE to timestamptz
-- This prevents PostgREST from silently truncating full ISO datetimes,
-- which caused notification timestamps to show as 12:00 AM.

ALTER TABLE tasks
  ALTER COLUMN closed_on TYPE timestamptz USING closed_on::timestamp with time zone,
  ALTER COLUMN completed_on TYPE timestamptz USING completed_on::timestamp with time zone;

-- Backfill legacy midnight values to noon UTC so they display correctly
UPDATE tasks
SET closed_on = closed_on::date + interval '12 hours'
WHERE closed_on IS NOT NULL AND closed_on::time = '00:00:00';

UPDATE tasks
SET completed_on = completed_on::date + interval '12 hours'
WHERE completed_on IS NOT NULL AND completed_on::time = '00:00:00';
