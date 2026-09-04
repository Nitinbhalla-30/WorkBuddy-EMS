-- ---------------------------------------------------------------------------
-- Celebrations module test data
-- ---------------------------------------------------------------------------
--
-- Why: the Celebrations page shows a band of seven days either side of today,
-- and the 500-employee load set has nothing inside that band. The newest
-- dateJoined is 2026-07-10 (two months back), no birth date falls between 27 Aug
-- and 10 Sep, and hr_celebration_events does not exist yet at all. Every tab
-- except Work anniversaries therefore renders empty, which makes the module
-- impossible to test by eye.
--
-- What this does: re-points a small set of synthetic employees at dates around
-- 2026-09-03 and adds five company occasions, so each rule the module implements
-- has a row to exercise it — today, upcoming, recently celebrated, the window
-- edges, a leap-day birthday, upcoming joiners, the 1/2/5/10-year milestones, a
-- joining date less than a year old that must NOT become an anniversary, and an
-- occasion dated outside the window.
--
-- The employees touched are load-test records (EMP011-EMP035), not the login
-- accounts used for manual testing (EMP001-EMP010, ADM001, IT001, DRV01).
--
-- Side effect worth knowing: dateJoined also drives probation eligibility
-- (settings.probationMonths = 6) and the attendance period start. The seven
-- employees given a recent joining date are therefore on probation, and the four
-- given an older one are not — that is the realistic state, not a mistake.
--
-- Dates are absolute, so this stops landing in the window as time passes.
-- Run .qoder/celebrations-test-data-restore.sql to put the directory back, or
-- shift every date by the same number of days to move the whole set forward.
--
-- Re-runnable: every statement sets fixed values, so running it twice changes
-- nothing the second time.
--
-- After running it, reload the app — the browser keeps a local copy of the
-- directory and the Celebrations page refreshes these four collections on load.


-- ---------------------------------------------------------------------------
-- 1. Birthdays — personal.dob on the onboarding profile
-- ---------------------------------------------------------------------------
-- Only the month and day matter to the module; the birth year is kept in the
-- range the rest of the load set uses (1990-1998) so nothing else shifts.
--
--   EMP011 03 Sep  today            EMP017 02 Sep  yesterday
--   EMP012 03 Sep  today            EMP018 31 Aug  three days ago
--   EMP013 04 Sep  tomorrow         EMP019 28 Aug  six days ago (edge)
--   EMP014 06 Sep  in three days    EMP020 01 Sep  two days ago
--   EMP015 08 Sep  in five days     EMP022 26 Aug  OUTSIDE - must not appear
--   EMP016 10 Sep  last day (edge)  EMP023 11 Sep  OUTSIDE - must not appear
--   EMP024 29 Feb  leap day (1996, a real one): shows 28 Feb in a common year

UPDATE app_store
SET value = (
      SELECT jsonb_agg(
               CASE
                 WHEN p ->> 'employeeId' = 'EMP011' THEN jsonb_set(p, '{personal,dob}', '"1991-09-03"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP012' THEN jsonb_set(p, '{personal,dob}', '"1992-09-03"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP013' THEN jsonb_set(p, '{personal,dob}', '"1993-09-04"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP014' THEN jsonb_set(p, '{personal,dob}', '"1994-09-06"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP015' THEN jsonb_set(p, '{personal,dob}', '"1995-09-08"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP016' THEN jsonb_set(p, '{personal,dob}', '"1996-09-10"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP017' THEN jsonb_set(p, '{personal,dob}', '"1997-09-02"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP018' THEN jsonb_set(p, '{personal,dob}', '"1998-08-31"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP019' THEN jsonb_set(p, '{personal,dob}', '"1990-08-28"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP020' THEN jsonb_set(p, '{personal,dob}', '"1991-09-01"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP022' THEN jsonb_set(p, '{personal,dob}', '"1993-08-26"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP023' THEN jsonb_set(p, '{personal,dob}', '"1994-09-11"'::jsonb)
                 WHEN p ->> 'employeeId' = 'EMP024' THEN jsonb_set(p, '{personal,dob}', '"1996-02-29"'::jsonb)
                 ELSE p
               END
               ORDER BY ord
             )
      FROM jsonb_array_elements(app_store.value) WITH ORDINALITY AS t(p, ord)
    ),
    updated_at = now()
WHERE key = 'hr_profiles';


-- ---------------------------------------------------------------------------
-- 2. New joiners and work anniversaries — dateJoined on the employee row
-- ---------------------------------------------------------------------------
-- New joiners (window is seven days either side, editable in Settings):
--
--   EMP025 2026-09-03  joined today
--   EMP026 2026-09-01  two days ago
--   EMP027 2026-08-28  six days ago (edge of the window)
--   EMP028 2026-09-07  has not started yet -> "joins us on Tue, 07 Sep"
--   EMP029 2026-09-10  has not started yet, last day of the window
--   EMP030 2026-08-20  fourteen days ago -> OUTSIDE, must not appear
--
-- Work anniversaries (completed years, so the greeting can read "5th"):
--
--   EMP033 2016-09-03  10th anniversary, today
--   EMP031 2025-09-04   1st anniversary, tomorrow
--   EMP035 2024-09-08   2nd anniversary, upcoming
--   EMP032 2021-09-02   5th anniversary, yesterday
--   EMP034 2026-09-05   under a year old -> must show as a new joiner only,
--                       never as a "0th" anniversary

UPDATE app_store
SET value = (
      SELECT jsonb_agg(
               CASE
                 WHEN e ->> 'id' = 'EMP025' THEN jsonb_set(e, '{dateJoined}', '"2026-09-03"'::jsonb)
                 WHEN e ->> 'id' = 'EMP026' THEN jsonb_set(e, '{dateJoined}', '"2026-09-01"'::jsonb)
                 WHEN e ->> 'id' = 'EMP027' THEN jsonb_set(e, '{dateJoined}', '"2026-08-28"'::jsonb)
                 WHEN e ->> 'id' = 'EMP028' THEN jsonb_set(e, '{dateJoined}', '"2026-09-07"'::jsonb)
                 WHEN e ->> 'id' = 'EMP029' THEN jsonb_set(e, '{dateJoined}', '"2026-09-10"'::jsonb)
                 WHEN e ->> 'id' = 'EMP030' THEN jsonb_set(e, '{dateJoined}', '"2026-08-20"'::jsonb)
                 WHEN e ->> 'id' = 'EMP031' THEN jsonb_set(e, '{dateJoined}', '"2025-09-04"'::jsonb)
                 WHEN e ->> 'id' = 'EMP032' THEN jsonb_set(e, '{dateJoined}', '"2021-09-02"'::jsonb)
                 WHEN e ->> 'id' = 'EMP033' THEN jsonb_set(e, '{dateJoined}', '"2016-09-03"'::jsonb)
                 WHEN e ->> 'id' = 'EMP034' THEN jsonb_set(e, '{dateJoined}', '"2026-09-05"'::jsonb)
                 WHEN e ->> 'id' = 'EMP035' THEN jsonb_set(e, '{dateJoined}', '"2024-09-08"'::jsonb)
                 ELSE e
               END
               ORDER BY ord
             )
      FROM jsonb_array_elements(app_store.value) WITH ORDINALITY AS t(e, ord)
    ),
    updated_at = now()
WHERE key = 'hr_employees';


-- ---------------------------------------------------------------------------
-- 3. Company occasions — hr_celebration_events
-- ---------------------------------------------------------------------------
-- The collection HR/Admin manage from Celebrations -> Manage occasions. It has
-- never existed in this project, so the store has been falling back to its empty
-- default. Field names match createCelebrationEvent() in src/data/store.js.
--
--   CEL-TEST-FOUNDATION  03 Sep, recurring  -> Today
--   CEL-TEST-SPORTS      29 Aug, recurring  -> Recently celebrated (national)
--   CEL-TEST-WELLNESS    29 Aug, recurring  -> Recently celebrated (occasion)
--   CEL-TEST-OFFSITE     08 Sep, one-off    -> Upcoming
--   CEL-TEST-TOWNHALL    30 Oct, one-off    -> outside the window; visible in
--                                              the Manage list only
--
-- The three CEL-TEST ids are deliberately unlike the CEL<timestamp> ids the
-- screen generates, so removing them later is a one-line delete.

INSERT INTO app_store (key, value, updated_at)
VALUES (
  'hr_celebration_events',
  '[
    {
      "id": "CEL-TEST-FOUNDATION",
      "name": "Foundation Day",
      "kind": "occasion",
      "date": "2016-09-03",
      "greeting": "Happy Foundation Day!",
      "message": "Ten years of WorkBuddy - thank you for being part of the journey.",
      "recurring": true,
      "createdBy": "ADM001",
      "createdOn": "2026-09-01T09:00:00.000Z"
    },
    {
      "id": "CEL-TEST-SPORTS",
      "name": "National Sports Day",
      "kind": "national",
      "date": "2020-08-29",
      "greeting": "Happy National Sports Day!",
      "message": "Celebrating Major Dhyan Chand, born 29 August 1926.",
      "recurring": true,
      "createdBy": "ADM001",
      "createdOn": "2026-09-01T09:05:00.000Z"
    },
    {
      "id": "CEL-TEST-WELLNESS",
      "name": "Wellness Week",
      "kind": "occasion",
      "date": "2026-08-29",
      "greeting": "Wellness Week",
      "message": "Eye check-ups and stretch breaks in the cabin through Friday.",
      "recurring": true,
      "createdBy": "ADM001",
      "createdOn": "2026-09-01T09:10:00.000Z"
    },
    {
      "id": "CEL-TEST-OFFSITE",
      "name": "Team Offsite",
      "kind": "occasion",
      "date": "2026-09-08",
      "greeting": "Team offsite day",
      "message": "All teams gather at the Gurugram office. Transport leaves at 8 AM.",
      "recurring": false,
      "createdBy": "ADM001",
      "createdOn": "2026-09-01T09:15:00.000Z"
    },
    {
      "id": "CEL-TEST-TOWNHALL",
      "name": "Quarterly Town Hall",
      "kind": "occasion",
      "date": "2026-10-30",
      "greeting": "Town hall at 4 PM",
      "message": "Q3 results and the year ahead, in the main hall and on the call.",
      "recurring": false,
      "createdBy": "ADM001",
      "createdOn": "2026-09-01T09:20:00.000Z"
    }
  ]'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();
