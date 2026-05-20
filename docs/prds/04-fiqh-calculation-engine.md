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

## Fiqh Rule Reference

Use this as the fallback baseline when expanding the fiqh engine. If a future rule changes, update this section first, then align the engine, tests, and explanation payloads to match.

### Hawl and cycle reset

- Hanafi:
  - A temporary dip below nisab during the hawl does not break the cycle.
  - The cycle resets only if the zakatable wealth becomes nil or effectively bankrupt, or if the zakat anniversary arrives while the net amount is still below nisab.
  - There is no separate "X days below nisab" reset timer in the current rule baseline.
- Maliki:
  - If wealth falls below nisab during the hawl, the cycle restarts when nisab is regained.
  - If wealth remains below nisab on the anniversary, that anniversary does not hold and a new hawl begins when nisab is reached again.
- Shafi'i:
  - If wealth falls below nisab during the hawl, the cycle restarts when nisab is regained.
  - If wealth remains below nisab on the anniversary, the cycle restarts from the next time nisab is met.
- Hanbali:
  - If wealth falls below nisab during the hawl, the cycle restarts when nisab is regained.
  - If wealth remains below nisab on the anniversary, the cycle restarts from the next time nisab is met.

### Nisab benchmark baseline

- For monetary wealth and trade wealth, the current baseline is:
  - Hanafi: silver benchmark
  - Maliki: gold benchmark
  - Shafi'i: gold benchmark
  - Hanbali: gold benchmark
- For gold and silver holdings themselves, use the corresponding metal nisab for that asset class.
- The exact gram-to-currency value is derived from current benchmark pricing at snapshot time, not hardcoded in the engine.

### Numeric nisab references

- Gold nisab:
  - 20 dinars / mithqals
  - Common modern conversions used in sources: 85g pure gold or 87.48g pure gold
- Silver nisab:
  - 200 dirhams
  - Common modern conversions used in sources: 595g silver or 612.36g silver
- The docs should treat these as source-dependent reference values, not as a claim that the conversion is identical in every fiqh manual.
- When the engine needs a live currency threshold, it should convert the selected benchmark weight using current market pricing at capture time.

## Testing Decisions

- Unit test each madhab rule path, especially nisab transitions and hawl resets.
- Verify amount and due-date calculations against known rule cases.

## Out of Scope

- Exhaustive niche asset-class coverage.

## Further Notes

This slice should be isolated enough to test without involving reminder delivery.
