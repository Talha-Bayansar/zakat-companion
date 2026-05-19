# MVP Production Readiness Tracker

## Purpose

Use this file as the working reference for the MVP readiness state and any new pre-production gaps that appear later.

Current focus areas:

- benchmark pricing freshness for snapshot capture
- reminder job creation flows that connect product events to scheduled jobs
- docs alignment with the codebase

Google auth is accepted for now and is not part of the blocker list.

## Current Status

### 1. Fiqh correctness

- Status: resolved
- Current risk: none on the fresh-deployment benchmark path; snapshot capture now bootstraps benchmark pricing on cache miss and falls back to the translated benchmark-unavailable error only if Metals.dev cannot provide data.
- Impact: the app no longer blocks snapshot capture just because the benchmark cache has not been seeded yet.

### 2. Reminder execution

- Status: resolved
- Current risk: none for the implemented reminder orchestration path; reminder execution now runs on its own hourly cron, while benchmark refresh uses a separate daily cron. Snapshot saves persist explicit reset state below nisab while seeding reminder sequences when the next above-nisab snapshot starts a new cycle.
- Impact: reminders are scheduled automatically from the snapshot save and cycle payment flows, with reset semantics preserved in history, and the scheduled flows no longer contend for the same cron event.

### 3. Documentation

- Status: resolved
- Current risk: none for the MVP readiness docs; the architecture and tracker now describe the current bootstrap, orchestration, and scheduling state.
- Impact: future work can be scoped against the current implementation rather than older blocker states.

### 4. Overall readiness

- Status: ready for MVP closeout
- Current risk: only routine maintenance items remain, unless a new product gap appears.
- Impact: the current MVP slice is functionally complete for the tracked blocker set.

## Execution Order

1. Keep docs aligned with future product changes.
2. Add or update tests when new gaps are introduced.
3. Re-run verification if the MVP scope changes again.

## Workstreams

### Workstream A: Docs sync

Goal:

- keep `docs/architecture.md`, PRDs, and issue plans in line with the actual code
- record the current MVP scope and any newly discovered gaps

Exit criteria:

- docs state Google auth is acceptable for now
- docs describe the benchmark bootstrap and reminder wiring accurately
- docs no longer imply stale blocker states that the code has already resolved

### Workstream B: Benchmark pricing

Goal:

- keep benchmark pricing available for snapshot capture, including fresh deployments with an empty cache
- keep benchmark freshness visible in the UI and persisted in history
- preserve historical calculations after benchmark refreshes

Exit criteria:

- snapshot capture can succeed once benchmark pricing is fetched or refreshed
- gold and silver handling remains explicit and tested
- snapshot history remains stable and reproducible

### Workstream C: Reminder wiring

Goal:

- keep product flows connected to reminder job creation
- ensure timezone-aware scheduling, idempotent claims, and retry-safe execution

Exit criteria:

- due jobs are generated and claimed correctly
- reminder delivery is safe to retry

### Workstream D: Verification

Goal:

- prove the MVP behaves correctly before shipping

Exit criteria:

- tests cover fiqh, nisab, and hawl behavior
- tests cover reminder scheduling and execution
- docs reflect the final implementation state

## Key Files

- [Architecture](../architecture.md)
- [Current Context](../../CONTEXT.md)
- [Fiqh Engine](../../src/features/fiqh-calculation/lib/fiqh-calculation.engine.ts)
- [Wealth Snapshot Service](../../src/features/wealth-snapshot/server/services/wealth-snapshot.service.ts)
- [Worker Entrypoint](../../src/server.ts)
- [Wrangler Config](../../wrangler.jsonc)

## Notes

- This tracker is intentionally narrow: it focuses on the current MVP readiness state and any newly discovered gaps.
- When a workstream changes status, update the tracker and the related docs in the same change.
- If a new blocker appears, add it here before starting implementation so the scope stays visible.
