# Issue 14: Wealth Snapshot Editing and Fiqh Explanations

## Status

- Overall: in progress
- Current step: step 5

## Goal

Close the remaining gaps in PRD 03 and PRD 04 by adding an edit/update path for existing snapshots and a richer fiqh explanation surface that shows how nisab and hawl decisions were reached.

## Progress

- The core wealth snapshot capture flow already exists and persists append-only snapshots with derived fiqh context.
- Steps 1 through 4 are implemented.
- The fiqh calculation engine now returns structured explanation data and preserved inputs.
- The dedicated edit flow writes a new snapshot revision and the current snapshot screen now surfaces the refresh action and explanation disclosure.
- Targeted test coverage was updated, but the Vitest runner still hits an existing `import.meta.env` startup error.

## Plan

1. Define the remaining product boundaries and data flow.
   - Status: done
   - Snapshot edits create a new revision.
   - The edit flow targets the current snapshot only.
   - The revision gets a new capture timestamp on save.
   - The explanation fields are explicit and structured.

2. Add snapshot edit/update support.
   - Status: done
   - Added a dedicated `/app/wealth-snapshot/edit` route and page.
   - Reused the existing wealth snapshot form.
   - Added a dedicated revision server function that creates a new snapshot.
   - Added the refresh action on the current snapshot card only.

3. Extend the fiqh engine with explanation data.
   - Status: done
   - Added structured explanation fields for nisab comparison, hawl behavior, due-amount derivation, and frozen inputs.
   - Kept the engine output versioned and backward-compatible.
   - Kept presentation text out of the engine beyond stable explanation data.

4. Surface fiqh explanations in the wealth snapshot UI.
   - Status: done
   - Added an explanation disclosure to the current snapshot experience.
   - Present the explanation in a concise, localized, user-facing format.
   - Kept the current summary rows and added a deeper explanation layer below them.

5. Add tests for the new flows.
   - Status: in progress
   - Test snapshot edit/update behavior and history stability.
   - Test fiqh explanation output for each madhab path.
   - Typecheck passes; targeted Vitest execution is still blocked by the existing runner startup error.

## Acceptance Criteria

- A user can update an existing wealth snapshot through a dedicated workflow.
- The fiqh engine returns explanation data that the UI can render.
- The wealth snapshot screen shows not only status, but also why that status was reached.
- History remains stable after edits, refreshes, and fiqh explanation changes.
