# PRD Draft: Profile Management and Delegation

## Problem Statement

Users need to manage zakat tracking for themselves, spouses, and children, and some users need delegated access to maintain profiles on someone else's behalf.

## Solution

Add profile creation, profile switching, and delegated manager permissions inside the app's settings area. Profiles represent zakat tracking records, not auth identities.

## User Stories

1. As an authenticated user, I want to create multiple `profile`s, so that I can track zakat for myself and family members.
2. As an authenticated user, I want to manage a spouse's profile as a `delegated manager`, so that I can help maintain zakat records for someone who does not want to use the app directly.
3. As an authenticated user, I want to manage a child's profile with permission, so that I can keep their zakat records up to date if needed.
4. As a profile owner, I want to grant and revoke custom app permissions, so that I control who can edit my zakat data.
5. As a user, I want profile switching and profile creation to live in `Settings`, so that profile management stays in one place.

## Implementation Decisions

- Keep delegated access as custom app permissions in the product domain.
- Store profile ownership and manager relationships separately from auth accounts.
- Keep profile switching and creation in settings, not as a primary tab.

## Testing Decisions

- Verify create, switch, edit, and permission-revocation flows.
- Test delegated access control at the server boundary and in the UI.

## Out of Scope

- Social org-style auth memberships.
- Financial calculations.

## Further Notes

This slice establishes the user-to-profile relationship that every later product path depends on.
