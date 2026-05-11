# Architecture

## Goals

- Ship a PWA-first zakat tracker in a single full-stack TypeScript application.
- Model zakat rules according to the user's selected madhab.
- Support multiple profiles and delegated management within one account.
- Keep reminder delivery simple at first while preserving a clean path to queues later.
- Make the data model explicit enough to support future fiqh expansion without redesign.

## Tech Stack

- Frontend and server runtime: TanStack Start + React + TypeScript
- Hosting/runtime: Cloudflare Workers
- Authentication: Better Auth with email and password only
- Database: Neon PostgreSQL
- ORM: Drizzle ORM
- Validation: Zod
- Push notifications: Web Push
- Scheduled execution: Cloudflare Cron Triggers
- Testing: Playwright
- CI: GitHub Actions
- UI primitives: Base UI via shadcn/ui
- Styling: Tailwind CSS
- Localization: Paraglide JS

## UI System

The UI should feel warm, disciplined, faith-aware, and mobile-first. It should not look like a generic finance dashboard.

The implementation conventions for this area are defined in:

- [ADR 0002: Feature-first folder structure with standardized server and page subfolders](./adr/0002-feature-first-folder-structure.md)
- [ADR 0003: Standardize UI patterns for forms, loading, empty states, and destructive actions](./adr/0003-ui-patterns-for-forms-loading-empty-and-destructive-actions.md)

### Design Principles

- Prioritize mobile interactions first.
- Keep the experience calm, readable, and low-clutter.
- Use a subtle branded accent system rather than a loud visual identity.
- Make the mobile version feel native-app-like.

### Navigation

- Mobile: bottom tab bar with three primary tabs.
- Desktop: left sidebar shell with the main content area centered.
- Profile switching and profile creation live under `Settings`.
- Reminder configuration lives under `Settings`.
- `History` is a primary tab.

### Component Approach

- Use Base UI primitives through shadcn/ui.
- Keep the component setup local-first.
- Prefer a small opinionated component kit over a heavy bespoke design system.
- If a UI primitive is missing, check shadcn/ui first and install the matching component before inventing a new shared wrapper.
- Build custom wrappers only where the product needs a distinct mobile feel or specialized workflow.
- Follow ADR 0003 for form composition, loading states, empty states, destructive confirmations, and translation coverage.
- Treat user-growable async collections as infinite-scrolling lists by default, including overview pages and searchable picker components.
- Prefer a shared infinite-list primitive plus thin feature wrappers so page views and pickers reuse the same fetch and scroll behavior.
- Use page-based pagination under the hood for those lists, with `page`, `pageSize`, and `hasMore` as the shared data contract.
- Keep React components small and focused.
- If a React component grows beyond roughly 150 to 180 lines, split it into smaller components, hooks, or helpers instead of letting it become overcrowded.

### Feature Structure

- Follow ADR 0002 for feature folder structure.
- Keep feature-specific server code inside `src/features/<feature>/server/` with `repositories/`, `services/`, `schemas/`, and `functions/` subfolders.
- Keep route files thin and use feature public APIs from `index.ts` barrels when crossing feature boundaries.

### Localization

- Use Paraglide JS for UI localization.
- Start with English as the base locale and Turkish and Dutch as the first additional locales.
- Keep all client-facing strings in message files rather than inlining them throughout the UI, including validation, error, loading, empty-state, and fallback display text.
- Treat server error messages as part of the localized UI whenever they can surface to the client.
- Make locale switching available from the app shell early so later slices inherit the same pattern.

## High-Level Shape

The application is a single full-stack TypeScript app. The same codebase owns:

- user authentication
- profile management
- wealth snapshot capture
- zakat calculation
- reminder job creation and execution
- push notification delivery

The backend lives inside the TanStack Start app through server routes and server functions rather than a separate API service.

## Core Domain Modules

### Identity and Access

Responsible for:

- sign-up and sign-in
- session handling
- user account state
- delegated app permissions

This module should not model profile ownership as an auth concern. Auth accounts and zakat profiles are separate concepts.

### Profile Management

Responsible for:

- creating and editing profiles
- linking delegated managers to profiles
- storing profile-level preferences such as timezone, quiet hours, reminder cadence, and selected madhab

### Wealth Snapshot Engine

Responsible for:

- capturing zakatable categories
- tracking current asset and liability state
- computing the net zakatable base
- identifying whether the user is above or below nisab

This engine should work from explicit domain data, not a single scalar balance.

### Fiqh Rule Engine

Responsible for:

- applying the selected madhab's rules
- deciding how nisab status affects hawl progression
- calculating zakat due timing
- calculating zakat amount based on supported wealth classes

The rule engine should be versioned in code so changes in fiqh logic do not mutate historical records unexpectedly.

### Reminder Engine

Responsible for:

- creating reminder jobs
- deciding which jobs are due
- executing reminder jobs
- sending balance update reminders
- sending zakat due reminders
- recording delivery attempts and outcomes

Reminder execution should be represented as database-backed jobs from day one. Cron is only the initial executor.

### Notification Delivery

Responsible for:

- managing browser push subscriptions
- preparing push payloads
- delivering web push notifications
- handling retries and failures

## Data Model Shape

The database should model:

- users and auth records from Better Auth
- profiles
- profile permissions and delegated managers
- wealth snapshots
- wealth snapshot entries by category
- madhab selection and profile preferences
- reminder jobs
- notification subscriptions
- reminder delivery attempts
- zakat cycle state
- payment state for the current cycle

The key rule is that reminder jobs and fiqh state are first-class records. This keeps execution separate from calculation.

## Reminder Flow

1. Cron runs on Cloudflare Workers.
2. The app looks up due reminder jobs in Postgres.
3. Due jobs are claimed idempotently.
4. The app calculates the right payload for the profile and reminder type.
5. Web Push sends the notification.
6. The job is marked successful or failed with enough detail to retry safely.

This design can later be swapped to a queue without changing the job model or the reminder domain.

## Auth Flow

- Better Auth handles email and password authentication.
- TanStack Start server routes mount the Better Auth handler.
- Protected routes check session state on the server.
- Delegated access is enforced in the app domain after authentication.

## Deployment Shape

- Cloudflare Workers runs the app.
- Neon hosts PostgreSQL.
- Cloudflare Cron Triggers run periodic reminder execution.
- Web Push delivery is handled from the Worker runtime.

Because Cloudflare cron executes in UTC, timezone-aware scheduling must be handled in application logic.

## Testing Strategy

### What to test

- Fiqh rule calculations for each madhab
- nisab threshold transitions
- hawl reset behavior
- profile delegation permissions
- reminder job creation and execution
- push subscription handling
- auth-protected route behavior

### Test styles

- unit tests for the fiqh rule engine and reminder job orchestration
- integration tests for server functions and database interactions
- Playwright flows for sign-up, profile setup, reminder preferences, and reminder permission UX

### What makes a good test

- Verifies external behavior, not implementation details
- Captures a clear user-visible rule
- Covers a regression boundary, especially around madhab-specific timing and reminder state transitions

## Operational Practices

- Keep validation schemas shared between client and server where practical.
- Make reminder execution idempotent.
- Record attempt history for notification delivery.
- Store timezone and quiet hours per profile.
- Use migrations explicitly and version schema changes.
- Keep fiqh rules and notification execution separated so each can evolve independently.

## Future Expansion

The architecture should leave room for:

- queue-based reminder processing
- more detailed wealth class handling
- richer fiqh rules per madhab
- additional notification channels
- optional social authentication
- additional regional or family workflows
- reusable infinite-scroll list views and searchable selectors backed by page-based pagination

## Summary

This architecture prioritizes a single codebase, explicit domain state, and a clean seam between calculation and delivery. It is intentionally simple in execution but structurally ready for more complex reminder infrastructure later.
