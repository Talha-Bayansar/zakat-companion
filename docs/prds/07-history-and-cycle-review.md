# PRD Draft: History and Cycle Review

## Problem Statement

Users need a way to review prior zakat cycles, payment state, and reminder attempts so they can trust the app's records over time.

## Solution

Add a history surface that shows historical cycles, calculations, payment state, and reminder activity for the selected profile.

## User Stories

1. As a user, I want the app to keep historical cycles and reminder attempts, so that I can review prior zakat activity.
2. As a user, I want to mark a cycle as `paid`, so that I can record that zakat for the current cycle has been settled.
3. As a user, I want the `paid state` to clear the current obligation without silently rewriting history, so that past calculations remain traceable.
4. As a user, I want to see an explanation of why a zakat amount or due date was calculated, so that I can trust the result.
5. As a user, I want `History` as a primary tab, so that historical cycles and calculations are easy to access.

## Implementation Decisions

- Persist zakat cycle state and payment state separately from current snapshot data.
- Preserve historical calculations even if rules or settings change later.
- Show reminder delivery attempts and payment state in a readable timeline.

## Testing Decisions

- Verify cycle transitions, paid state behavior, and history rendering.

## Out of Scope

- Analytics dashboards.

## Further Notes

This slice is the audit trail for the rest of the product.
