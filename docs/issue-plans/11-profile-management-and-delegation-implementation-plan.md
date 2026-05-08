# Issue 11: Profile Management and Delegation

## Status

- Overall: planned
- Current step: step 3

## Goal

Implement profile creation, profile switching, and delegated manager permissions inside `Settings`, with profiles treated as zakat tracking records rather than auth identities.

## Plan

1. Define the profile data model and delegation model.
   - Status: completed
   - Add a `profile` table for zakat tracking records.
   - Add a separate permission table for delegated access.
   - Keep ownership and manager permissions distinct from auth users.

2. Add schema and migration support.
   - Status: completed
   - Update the Drizzle schema in `src/server/db/schema.ts`.
   - Generate and apply the database migration.
   - Ensure the schema can support multiple profiles per user and multiple managers per profile.

3. Build server helpers for profile access.
   - Status: pending
   - Add server functions to list accessible profiles, create profiles, switch the active profile, grant access, and revoke access.
   - Enforce authorization on the server boundary.
   - Reject profile edits from unauthorized users.

4. Extend the `Settings` UI.
   - Status: pending
   - Show the current active profile.
   - Add a profile creation form.
   - Add a profile switcher.
   - Add delegated access management actions.

5. Wire the active profile into app state.
   - Status: pending
   - Make the selected profile available across the app.
   - Ensure the shell and later profile-aware screens read the same active profile.
   - Define whether active profile state is persisted server-side, client-side, or both.

6. Add guards and fallback behavior.
   - Status: pending
   - Handle users with no profiles.
   - Redirect or prompt into profile creation when needed.
   - Prevent profile-specific actions when no active profile is selected.

7. Add tests.
   - Status: pending
   - Cover profile creation and switching.
   - Cover owner vs delegated manager permissions.
   - Cover unauthorized mutation rejection.
   - Cover the `Settings` happy path.

## Acceptance Criteria

- An authenticated user can create a new profile.
- An authenticated user can switch between profiles.
- A profile owner can grant and revoke delegated manager access.
- A delegated manager can edit allowed profiles.
- Profile switching and profile creation live in `Settings`.
