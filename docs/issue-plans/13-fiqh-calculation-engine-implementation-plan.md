# Issue 13: Fiqh Calculation Engine

## Status

- Overall: in progress
- Current step: step 4

## Goal

Implement a versioned, madhab-aware fiqh calculation engine that reads the active profile's madhab and nisab benchmark preferences, determines nisab status and hawl behavior, calculates zakat due timing and amount, and preserves historical results when rules evolve later.

## Plan

1. Define the fiqh calculation contract and persistence boundary.
   - Status: done
   - Freeze the canonical enum values for `madhab` and `nisab benchmark`.
   - Decide which outputs belong on the immutable wealth snapshot and which belong on mutable cycle state.
   - Keep the contract aligned with PRD 04 and the shared glossary so the engine can be tested independently.

2. Persist profile-level fiqh preferences.
   - Status: done
   - Extend the profile data model to store the selected madhab and nisab benchmark.
   - Add schema and migration support for those preferences.
   - Add server validation and Settings UI so the active profile can be configured from the profile-management flow.
   - Require an explicit selection rather than silently inferring a madhab for new or legacy profiles.

3. Build the versioned fiqh rule engine.
   - Status: done
   - Add a dedicated, testable calculation module for fiqh logic.
   - Calculate nisab status from the current wealth snapshot and the selected benchmark.
   - Determine hawl progression and the current zakat date rule from the selected madhab.
   - Calculate the due amount using the current version's baseline zakat rule.
   - Return enough derived metadata for later history and explanation surfaces.

4. Wire the engine into snapshot capture and cycle state.
   - Status: pending
   - Have snapshot capture read the active profile's fiqh preferences and persist the frozen calculation context.
   - Write the derived fiqh outputs at capture time so history stays stable even if preferences change later.
   - Introduce or refresh cycle state records if the app needs a mutable current obligation separate from the immutable snapshot.
   - Keep the snapshot/cycle boundary explicit so later payment and reminder changes do not rewrite calculation history.

5. Surface the fiqh outputs in the app.
   - Status: pending
   - Show the selected madhab and nisab benchmark in the profile settings experience.
   - Show nisab status, due amount, and date-rule summary in the wealth snapshot experience.
   - Keep all client-facing copy in Paraglide messages.

6. Add unit and integration tests.
   - Status: pending
   - Unit test each madhab path, nisab threshold transition, and hawl reset or preserve behavior.
   - Test snapshot capture against profile preferences and rule-version stability.
   - Test that historical outputs remain unchanged after preference changes or later rule-version updates.

## Acceptance Criteria

- A user can select one of the four major madhabs.
- The selected madhab governs nisab and hawl behavior.
- A user can choose gold or silver as the nisab benchmark.
- The app can calculate how much zakat is due for the current snapshot.
- The app can determine the zakat cycle's current date rule based on the selected madhab.
- Historical calculations remain stable when the rules are versioned.
