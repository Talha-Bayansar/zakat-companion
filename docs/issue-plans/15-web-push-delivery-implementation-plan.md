# Issue 15: Web Push Delivery

## Status

- Overall: planned
- Current step: step 2

## Goal

Implement browser web push subscription management and delivery so reminder jobs can notify users from the PWA runtime without bypassing the database-backed reminder model.

## Plan

1. Define the notification delivery contract and subscription scope.
   - Status: done
   - Use profile-scoped browser push subscriptions, with multiple subscriptions allowed per profile.
   - Freeze the canonical data needed for a push subscription: channel, endpoint, keys, profile ownership, and timestamps.
   - Define the notification payload shape for balance update and zakat due reminders.
   - Keep the subscription model separate from reminder jobs so delivery can change later without rewriting scheduling state.

2. Add schema and migration support.
   - Status: pending
   - Update `src/server/db/schema.ts` with a notification subscription table and a delivery-attempt table if failures need to be persisted separately.
   - Add the supporting enums or status fields needed for active, disabled, expired, and failed states.
   - Generate and apply the database migration.
   - Ensure the schema supports multiple subscriptions for one profile if the chosen ownership model requires it.

3. Build server persistence and delivery helpers.
   - Status: pending
   - Add feature-local repositories under `src/features/notifications/server/repositories/`.
   - Add a service layer under `src/features/notifications/server/services/` to validate input, store subscriptions, and send web push notifications.
   - Add server functions under `src/features/notifications/server/functions/` for subscription registration, removal, and test delivery if needed.
   - Keep push sending isolated behind a dedicated helper so the reminder executor does not know about transport details.

4. Wire reminder execution to push delivery.
   - Status: pending
   - Have the reminder job flow build the correct payload for balance update and zakat due jobs.
   - Resolve the target profile's active notification subscriptions at send time.
   - Record send success and failure outcomes so retries and inspection are possible.
   - Keep the job execution idempotent if the same reminder is claimed more than once.

5. Add the user-facing permission and subscription UI.
   - Status: pending
   - Add a notification settings section in `Settings` for push permission status and subscription management.
   - Surface permission prompts and unsubscribe actions with the repo's standard form, loading, and empty-state patterns.
   - Keep all user-facing copy in Paraglide messages.
   - If a dedicated browser permission step is needed, wire it into the existing PWA-friendly app shell rather than a separate flow.

6. Add tests.
   - Status: pending
   - Verify subscription registration and removal.
   - Verify reminder payload generation for balance update and zakat due notifications.
   - Verify push send success, failure handling, and inactive subscription behavior.
   - Add an end-to-end test for the notification permission flow where practical.

## Acceptance Criteria

- A user can grant push notification permission.
- A profile or device can store a push subscription.
- The app can send a push notification for a due reminder.
- The app can send a push notification for a balance update reminder.
- Push failures are recorded for later retry or inspection.
