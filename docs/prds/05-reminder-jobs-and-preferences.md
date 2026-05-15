# PRD Draft: Reminder Jobs and Preferences

## Problem Statement

Users need separate reminders for balance updates and zakat due dates, and those reminders must be configurable by cadence, timezone, and quiet hours.

## Solution

Add profile-level reminder preferences and database-backed reminder jobs that can be executed by cron now and a queue later, including balance update reminders, zakat due reminders, cadence, timezone, quiet hours, and follow-up behavior.

## User Stories

1. As a user, I want the app to support a `balance update reminder`, so that I remember to refresh my financial state periodically.
2. As a user, I want the app to support a separate `zakat due reminder`, so that payment reminders are distinct from balance refresh reminders.
3. As a user, I want balance reminders to default to monthly, so that I have a sensible cadence out of the box.
4. As a user, I want to change reminder cadence in settings, so that I can make reminders more or less frequent.
5. As a user, I want zakat reminders to fire before the due date, on the due date, and optionally follow up, so that I do not miss the obligation.
6. As a user, I want reminders to respect my timezone and quiet hours, so that notifications arrive when they are actually useful.
7. As a maintainer, I want reminder execution to be represented as database-backed jobs, so that the app can evolve from cron polling to a queue later.

## Implementation Decisions

- Store reminder jobs in PostgreSQL.
- Execute jobs via Cloudflare Cron Triggers initially.
- Keep jobs idempotent and retryable.
- Store reminder cadence, timezone, and quiet hours per profile.

## Testing Decisions

- Verify reminder job creation, claiming, dispatch, idempotent execution, and retry behavior.
- Verify cadence and timezone rules against profile settings.

## Out of Scope

- Queue infrastructure in the initial release.

## Further Notes

This slice should not assume any notification transport beyond web push plumbing.
