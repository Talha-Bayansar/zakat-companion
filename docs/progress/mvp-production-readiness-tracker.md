# MVP Production Readiness Tracker

## Purpose

Use this file as the working reference for the remaining pre-production work on the MVP.

Current focus areas:

- benchmark pricing freshness for snapshot capture
- reminder job creation flows that connect product events to scheduled jobs
- docs alignment with the codebase

Google auth is accepted for now and is not part of the current blocker list.

## Current Status

### 1. Fiqh correctness

- Status: resolved
- Current risk: none on the fresh-deployment benchmark path; snapshot capture now bootstraps benchmark pricing on cache miss and falls back to the translated benchmark-unavailable error only if Metals.dev cannot provide data.
- Impact: the app should no longer block snapshot capture just because the benchmark cache has not been seeded yet.

### 2. Reminder execution

- Status: wired
- Current risk: reminder execution is now on its own hourly cron, while benchmark refresh uses a separate daily cron. Snapshot saves still persist explicit reset state below nisab while seeding reminder sequences when the next above-nisab snapshot starts a new cycle.
- Impact: reminders are now scheduled automatically from the current snapshot save flow and cycle payment flow, with reset semantics preserved in history, and the scheduled flows no longer contend for the same cron event.

### 3. Documentation

- Status: needs work
- Current risk: some architecture and issue-plan docs still describe older blocker states or omit the current bootstrap and wiring gaps.
- Impact: future work will be mis-scoped unless the docs are updated first.

## Execution Order

1. Update docs so the scope is explicit and current.
2. Add or update tests for the corrected behavior.
3. Re-run verification and mark remaining gaps clearly.

## Workstreams

### Workstream A: Docs sync

Goal:

- bring `docs/architecture.md`, PRDs, and issue plans in line with the actual code
- record the current MVP scope and the remaining gaps

Exit criteria:

- docs state Google auth is acceptable for now
- docs describe the benchmark bootstrap and reminder wiring gaps accurately
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

- This tracker is intentionally narrow: it focuses only on the remaining MVP blockers.
- When a workstream is completed, update the status here and the related docs in the same change.
- If a new blocker appears, add it here before starting implementation so the scope stays visible.
