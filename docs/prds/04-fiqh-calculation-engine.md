# PRD Draft: Fiqh Calculation Engine

## Problem Statement

Users need zakat calculations that follow their selected madhab, including nisab behavior, hawl progression, and due timing.

## Solution

Implement a dedicated fiqh engine that applies the selected madhab across nisab and hawl logic and calculates the zakat due amount for the current wealth snapshot.

## User Stories

1. As a user, I want to select one of the four major madhabs, so that the app follows the fiqh rules I rely on.
2. As a user, I want the selected `madhab` to govern nisab and hawl behavior, so that the app reflects my school of thought.
3. As a user, I want to choose gold or silver as the `nisab benchmark`, so that I can use the threshold appropriate to my preference.
4. As a user, I want the app to calculate how much zakat is due, so that I know what I should pay.
5. As a user, I want the app to follow the selected madhab's `zakat date rule`, so that the `hawl` and reset behavior match my school of thought.
6. As a user, I want the app to reset or preserve the zakat cycle according to my madhab, so that timing remains religiously accurate.
7. As a user, I want the app to see an explanation of why a zakat amount or due date was calculated, so that I can trust the result.

## Implementation Decisions

- Centralize fiqh logic in a versioned rule engine.
- Keep madhab selection and nisab benchmark as profile settings.
- Preserve historical cycles when rule logic changes.

## Testing Decisions

- Unit test each madhab rule path, especially nisab transitions and hawl resets.
- Verify amount and due-date calculations against known rule cases.

## Out of Scope

- Exhaustive niche asset-class coverage.

## Further Notes

This slice should be isolated enough to test without involving reminder delivery.
