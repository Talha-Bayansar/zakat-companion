# ADR 0005: Model profile ownership and delegated access separately from auth

## Status

Accepted

## Context

The app needs to support multiple zakat tracking profiles per authenticated user, while also allowing some users to maintain a profile they do not own. The product already distinguishes auth accounts from zakat profiles in the domain language, so the data model should preserve that separation instead of folding profile ownership into the auth layer.

Delegated access is a product permission, not an auth membership. A profile owner must remain the only actor who can grant or revoke access.

## Decision

Model profile ownership and delegated access as separate concepts.

- A `profile` is the zakat tracking record itself.
- Each profile has exactly one owner, which is an authenticated user.
- A separate permission record links additional authenticated users to a profile as delegated managers.
- Delegated managers can edit the profile data they are granted access to.
- Delegated managers cannot grant access to other users.
- Ownership and delegated access are both distinct from Better Auth account records.

The data model should therefore use:

- a `profile` table for the tracking record
- a separate permission table for delegated access grants
- explicit ownership references on the profile record

## Consequences

- A user can own multiple profiles without duplicating auth records.
- A profile can have multiple delegated managers.
- Access control remains explicit at the product layer instead of being hidden inside auth memberships.
- Later server helpers can check ownership and delegation independently, which keeps authorization rules simple and auditable.
