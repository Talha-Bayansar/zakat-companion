# Issue 14: Reminder Jobs and Preferences

## Status

- Overall: planned
- Current step: step 3

## Goal

Implement profile-level reminder preferences and database-backed reminder jobs that can be executed by cron now and a queue later, covering balance update reminders, zakat due reminders, cadence, timezone, quiet hours, and follow-up behavior.

## Plan

1. Define the reminder preference and job model.
   - Status: completed
   - Add explicit domain fields for reminder cadence, timezone, quiet hours, and follow-up behavior.
   - Define the reminder job record shape for balance update and zakat due work.
   - Keep the reminder job model separate from notification delivery so the executor can change later without rewriting domain state.

2. Add schema and migration support.
   - Status: completed
   - Update `src/server/db/schema.ts` with reminder preference and reminder job tables.
   - Add the necessary relations for profile ownership and job history.
   - Generate and apply the database migration.

3. Build server repositories and services.
   - Status: pending
   - Add feature-local repositories under `src/features/reminders/server/repositories/`.
   - Add a service layer under `src/features/reminders/server/services/` to validate input, resolve the active profile, persist preference changes, and create due jobs.
   - Keep job creation idempotent so repeated scheduling work does not duplicate reminders.

4. Add server functions for settings and job orchestration.
   - Status: pending
   - Add server functions under `src/features/reminders/server/functions/` for reading and updating reminder preferences.
   - Add server entry points for creating and claiming due jobs.
   - Keep the route surface thin and expose the feature through a public `index.ts` barrel.

5. Implement the settings UI for reminder preferences.
   - Status: pending
   - Add the reminder preferences experience inside `Settings`.
   - Use the repo's standard form, loading, and empty-state patterns.
   - Keep all client-facing copy in Paraglide messages.

6. Wire cron execution and retry behavior.
   - Status: pending
   - Add the Cloudflare cron-driven execution path that picks up due jobs.
   - Ensure claims are idempotent and safe to retry.
   - Record enough job state to support future queue-based execution without changing the model.

7. Add tests for preference updates and job execution.
   - Status: pending
   - Test cadence, timezone, quiet hours, and follow-up validation.
   - Test job creation, claiming, dispatch, and retry behavior.
   - Confirm the behavior stays stable when the active profile changes.

## Acceptance Criteria

- A profile can configure balance update reminder cadence.
- Balance reminders default to monthly.
- A profile can configure zakat due reminder behavior.
- Reminder settings respect timezone and quiet hours.
- Reminder work is stored as database-backed jobs.
- Cron execution can pick up and process due jobs idempotently.
