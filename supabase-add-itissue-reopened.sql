-- Feature: tell a reopened IT issue apart from a new one
--
-- When an employee reopens an issue that IT marked resolved or closed, the issue
-- simply goes back to status 'open'. That is indistinguishable from a request
-- nobody has looked at yet, so the IT Manager's alert reads "New IT issue" and
-- the fact that the fix was rejected is lost.
--
-- This adds the column that records the reopen moment. The app writes it in
-- reopenITIssue (src/data/store.js) and the notification feeds in
-- src/utils/notifications.js read it to change the wording to "IT issue reopened".
--
-- NOTE: This migration was applied to the Supabase project on 2026-09-02 via the
-- Supabase MCP (saved as migration "add_it_issue_reopened_column"). It is
-- additive and nullable, so nothing stored today changes. Apply it BEFORE
-- deploying the app code: a row push upserts every field it carries, and the
-- write fails if the column is missing.

alter table public.it_issues
  add column if not exists reopened_on timestamptz;
