# PRD Draft: Wealth Snapshot Capture

## Problem Statement

Users need a reliable way to enter and update the zakatable financial state that determines whether zakat is due.

## Solution

Build a mobile-first wealth snapshot flow where users capture zakatable categories like cash, gold, silver, trade inventory, receivables, and debts/liabilities for the selected profile.

## User Stories

1. As a user, I want the app to track a full `wealth snapshot` rather than a single balance, so that I can see how zakat was derived.
2. As a user, I want to enter zakatable categories such as cash, gold, silver, trade inventory, receivables, and debts/liabilities, so that the app can compute a more complete zakat base.
3. As a user, I want the app to show whether my `wealth snapshot` is above or under `nisab`, so that I know whether zakat is currently due.
4. As a user, I want reminders to prompt me to refresh my financial state periodically, so that my records stay current.

## Implementation Decisions

- Model wealth as zakatable categories rather than a single scalar balance.
- Persist snapshot entries in PostgreSQL through Drizzle.
- Validate all entered amounts with Zod.

## Testing Decisions

- Verify create/edit/update flows for wealth entries.
- Test threshold status updates after changes.

## Out of Scope

- Full fiqh calculation nuances.
- Reminder delivery.

## Further Notes

This slice should leave room for future expansion of wealth classes without redesigning the model.
