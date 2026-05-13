# Issue 12: Wealth Snapshot Capture

## Status

- Overall: in progress
- Current step: step 3

## Goal

Implement an append-only wealth snapshot flow where each save creates a frozen financial record for the active profile, stores one normalized entry per v1 wealth class, and persists the derived calculation context needed for stable history later.

## Plan

1. Define the snapshot and entry data model.
   - Status: done
   - Add a `wealth_snapshot` table for the immutable snapshot header.
   - Add a `wealth_snapshot_entry` table for one row per v1 wealth class.
   - Store the frozen calculation context on the snapshot, including `profileId`, `capturedAt`, `madhab`, `nisab benchmark`, and `calculation version`.
   - Store derived outputs on the snapshot so history remains stable even if rules or profile preferences change later.

2. Add schema and migration support.
   - Status: done
   - Update `src/server/db/schema.ts` with the snapshot tables and relations.
   - Generate and apply the database migration.
   - Ensure the schema supports multiple snapshots per profile and one entry row per category per snapshot.

3. Build server persistence and calculation helpers.
   - Status: partial
   - Add feature-local repositories under `src/features/wealth-snapshot/server/repositories/`.
   - Add a service layer under `src/features/wealth-snapshot/server/services/` to validate input, resolve the active profile, compute derived values, and write the snapshot plus entries in a transaction.
   - Add server functions under `src/features/wealth-snapshot/server/functions/` for snapshot creation and history retrieval.

4. Define the snapshot input schema and v1 category set.
   - Status: done
   - Add Zod schemas for the fixed v1 wealth classes: cash, gold, silver, trade inventory, receivables, and debts/liabilities.
   - Validate numeric entry values and required fields consistently on the server boundary.
   - Keep client-facing validation copy in Paraglide messages.

5. Implement the current snapshot calculation workflow.
   - Status: pending
   - Calculate the net zakatable base from the raw category entries.
   - Determine whether the snapshot is above nisab and whether zakat is due.
   - Persist the derived result on the snapshot record at write time.
   - Keep the calculation version explicit so historical snapshots remain reproducible.

6. Replace the placeholder wealth snapshot screen.
   - Status: done
   - Replace the empty state in `src/features/wealth-snapshot/pages/wealth-snapshot.page.tsx`.
   - Add a mobile-first form for the fixed v1 wealth classes.
   - Show the current saved snapshot and recent snapshot history for the active profile.
   - Use the repo’s standard loading, empty-state, and form patterns.

7. Wire routing, profile context, and tests.
   - Status: partial
   - Keep the route file thin and connect it to the feature public API.
   - Require or resolve the active profile before allowing snapshot capture.
   - Prevent snapshot capture when the user has no accessible profile.
   - Add tests for snapshot creation, normalized entry persistence, stable derived output, append-only history behavior, and authorization checks.

## Acceptance Criteria

- A user can save a wealth snapshot for the active profile.
- A snapshot stores one normalized row per v1 wealth class.
- A snapshot stores the frozen calculation context used at the time it was captured.
- Historical snapshots remain stable even if profile preferences or rules change later.
- The wealth snapshot screen is usable in the app instead of showing only an empty state.
