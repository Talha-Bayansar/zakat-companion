# PRD Draft: Auth and Account Shell

## Problem Statement

Users need a secure way to sign up and sign in before they can create profiles, save wealth data, or manage reminders.

## Solution

Implement Better Auth with Google social sign-in, mounted inside the TanStack Start app. Protect authenticated routes and provide the lightweight account shell and responsive navigation needed to lead into profile-aware product areas.

## User Stories

1. As a user, I want to continue with Google, so that I can securely use the app.
2. As a returning user, I want to sign in with Google, so that I can access my saved profiles and settings.
3. As a user, I want the app to stay in a single full-stack TypeScript codebase, so that the system remains easier to maintain.
4. As a user, I want the backend to live inside the same app, so that auth, data, and reminders share one implementation model.
5. As a mobile user, I want the primary navigation to stay compact and native-feeling, so that the app is easy to use with one hand.
6. As a desktop user, I want a left sidebar shell instead of a mobile bottom bar, so that the app feels appropriate on larger screens.
7. As a user, I want the app to keep the primary navigation focused on only three tabs, so that the interface does not feel crowded.

## Implementation Decisions

- Use Better Auth for Google social sign-in.
- Keep auth inside the TanStack Start app.
- Separate auth identity from zakat profile ownership.
- Use Zod to validate auth inputs and shared session-aware payloads.
- Use a bottom tab bar on mobile with three primary tabs.
- Use a left sidebar shell on desktop and larger screens.
- Keep profile switching, profile creation, and reminder management under `Settings`.
- Keep `History` as a primary tab.
- Localize the shell with Paraglide JS, starting with English, Turkish, and Dutch.

## Testing Decisions

- Verify Google sign-in, session persistence, protected route access, and sign-out behavior.
- Test only external auth behavior, not internal auth wiring.

## Out of Scope

- Email/password auth.
- Profile management.
- Reminder delivery.

## Further Notes

This slice should establish the secure entry point for all later slices.
