# Issue 16: History and Cycle Review

## Status

- Overall: in progress
- Current step: step 5

## Goal

Implement a cycle-centric history surface for the selected profile where users can review prior zakat cycles, payment state, reminder attempts, and related calculation history, and mark a cycle as paid without rewriting the underlying snapshot history.

## Plan

1. Define the history read model and boundaries.
   - Status: completed
   - Treat `zakat_cycle` as the primary history record.
   - Include the linked source snapshot summary, cycle state, `dueAt`, `paidAt`, and any reminder activity needed for the timeline.
   - Keep the history contract separate from the immutable wealth snapshot contract so payment state can evolve independently.

2. Add a dedicated `history` feature server layer.
   - Status: completed
   - Create feature-local repositories, services, schemas, and server functions under `src/features/history/server/`.
   - Query the active profile's cycles and join the snapshot and reminder data needed for display.
   - Keep route files thin and expose the feature through a narrow public `index.ts` barrel.

3. Add the cycle-paid mutation.
   - Status: completed
   - Add a `markCyclePaid` server function in the history feature.
   - Reuse the existing `zakat_cycle.state` and `paidAt` columns instead of introducing a new payment model.
   - Make the mutation idempotent so repeated submits do not corrupt history.

4. Build the history page UI.
   - Status: completed
   - Replace the empty `/app/history` surface with a real cycle timeline.
   - Show one row per cycle with cycle state, payment state, due date, snapshot summary, and reminder attempts.
   - Use the repo's standard loading, empty-state, and destructive-action patterns.
   - Keep the page mobile-first and aligned with `History` as a primary tab.

5. Use the repo's infinite-list pattern if the history can grow.
   - Status: in progress
   - Return history data in the shared `items`, `page`, `pageSize`, `hasMore` contract.
   - Reuse the shared infinite-list primitive for scrolling and loading behavior.
   - Keep the history surface readable even when a profile has many prior cycles.

6. Add translations and client-facing copy.
   - Status: pending
   - Add any new labels, loading text, empty states, error text, and action copy to Paraglide first.
   - Do not inline client-facing strings in the UI or server layer.
   - Keep server error messages translated if they can surface to the client.

7. Add tests.
   - Status: pending
   - Test that history returns cycles for the active profile only.
   - Test that reminder attempts and snapshot summaries appear in the cycle timeline.
   - Test that marking a cycle paid updates `state` and `paidAt`.
   - Test the empty state, loading state, and mutation flow in the history UI.

## Acceptance Criteria

- A user can view historical cycles for a profile.
- A user can see prior calculation outputs and payment state.
- A user can mark a cycle as paid and the history reflects the change.
- Reminder attempts appear in the history view.
- `History` works as a primary tab on the mobile shell.

