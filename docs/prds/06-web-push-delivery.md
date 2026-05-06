# PRD Draft: Web Push Delivery

## Problem Statement

Users need browser-based push notifications for reminder delivery in a PWA-first experience.

## Solution

Implement web push subscription management and delivery so the app can notify users about balance updates and zakat due events.

## User Stories

1. As a user, I want to receive reminders through web push, so that the app can notify me as a PWA.
2. As a user, I want the app to work as a PWA, so that I can install it and use it like an app on my device.
3. As a user, I want reminders to respect my timezone and quiet hours, so that notifications arrive when they are actually useful.

## Implementation Decisions

- Use browser web push as the notification transport.
- Persist subscriptions per profile or device as appropriate.
- Deliver pushes from Cloudflare Workers.

## Testing Decisions

- Verify subscription registration, notification send, and failure handling.
- End-to-end test notification permission flows.

## Out of Scope

- Native mobile push.
- Email/SMS notification channels.

## Further Notes

This slice should build on the reminder job model rather than bypass it.
