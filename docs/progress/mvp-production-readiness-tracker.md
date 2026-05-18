# MVP Production Readiness Tracker

## Purpose

Use this file as the working reference for the remaining pre-production work on the MVP.

Current focus areas:

- fiqh correctness, especially nisab calculation
- reminder scheduling and execution
- docs alignment with the codebase

Google auth is accepted for now and is not part of the current blocker list.

## Current Status

### 1. Fiqh correctness

- Status: needs work
- Current risk: the wealth snapshot flow still uses a hardcoded nisab threshold shortcut instead of a proper benchmark-driven value.
- Impact: the app can produce misleading zakat guidance if the threshold is wrong.

### 2. Reminder scheduling

- Status: needs work
- Current risk: the Worker has a scheduled entrypoint, but the deployment config does not currently define a cron trigger.
- Impact: reminder jobs may never run in production even if the job runner logic is present.

### 3. Documentation

- Status: needs work
- Current risk: the architectural and issue-plan docs do not fully reflect the current code state or the remaining gaps.
- Impact: future work will be mis-scoped unless the docs are updated first.

## Execution Order

1. Update docs so the scope is explicit and current.
2. Fix nisab and fiqh calculation inputs.
3. Wire reminder scheduling end-to-end.
4. Add or update tests for the corrected behavior.
5. Re-run verification and mark remaining gaps clearly.

## Workstreams

### Workstream A: Docs sync

Goal:

- bring `docs/architecture.md`, PRDs, and issue plans in line with the actual code
- record the current MVP scope and the remaining blockers

Exit criteria:

- docs state Google auth is acceptable for now
- docs describe the real fiqh and reminder gaps
- docs no longer imply the app is production-ready in those areas

### Workstream B: Fiqh and nisab

Goal:

- replace the hardcoded nisab shortcut with a real benchmark-driven model
- keep madhab and benchmark selection visible in the UI and persisted in history
- preserve historical calculations after rule changes

Exit criteria:

- nisab threshold is derived from the selected benchmark
- gold and silver handling is explicit and tested
- snapshot history remains stable and reproducible

### Workstream C: Reminder scheduling

Goal:

- make reminder execution fully operational in Cloudflare Workers
- ensure timezone-aware scheduling, idempotent claims, and retry-safe execution

Exit criteria:

- cron trigger is configured in deployment
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
