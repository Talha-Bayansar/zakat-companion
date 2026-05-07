# ADR 0002: Feature-first folder structure with standardized server and page subfolders

## Status

Accepted

## Context

The repository is a single full-stack TypeScript application built with TanStack Start, React, Drizzle, Better Auth, Tailwind, and Cloudflare Workers. The product contains several distinct domain areas, including profiles, wealth snapshot calculation, reminders, history, settings, and authentication.

The codebase should stay easy to navigate as the app grows, while keeping related logic together and avoiding a generic `utils/` or `server/` dumping ground.

## Decision

Use a feature-first folder structure under `src/features/`, with a consistent internal shape for each feature.

Feature folders are namespaces only. They should not contain loose implementation files at the feature root.

The standard feature layout is:

```txt
src/features/<feature>/
  components/
  pages/
  server/
    functions/
    repositories/
    services/
    schemas/
    types/
    jobs/
  lib/
  hooks/
  tests/
  index.ts
```

Conventions:

- Use `kebab-case` for folders and files.
- Use suffixes to make file purpose explicit:
  - `.page.tsx` for page-level components
  - `.function.ts` for server handlers and route-triggered entry points
  - `.service.ts` for business workflows and orchestration
  - `.repository.ts` for persistence and data access
  - `.schema.ts` for validation schemas
  - `.job.ts` for background or scheduled work
  - `.test.ts` or `.test.tsx` for tests
- Keep `index.ts` as a strict public API for the feature.
- Prefer direct imports inside the feature.
- Use the feature `index.ts` only when another part of the app should consume the feature as a unit.
- Keep route files thin; they should import feature page components or feature public APIs rather than owning business logic.
- Prefer route files as folder indexes, for example `src/routes/index/index.tsx`, instead of flat named files.

Server structure:

- Keep feature-specific server logic inside `src/features/<feature>/server/`.
- Reserve `src/server/` for shared infrastructure such as:
  - database bootstrap and schema wiring
  - authentication setup
  - push notification infrastructure
  - shared job/queue plumbing
  - shared server configuration and utilities
- Keep repositories feature-local unless the same persistence logic is genuinely shared across multiple features.

Shared code:

- Keep `src/shared/` small and technical only.
- Use it for reusable UI primitives, pure helpers, configuration, and truly generic types.
- Do not place feature-specific business logic in `shared/`.

Testing:

- Prefer colocated tests for small units.
- Use `tests/` inside a feature when a broader feature-level scenario suite is helpful.

## Consequences

- Related logic stays grouped by product area, which matches the app's domain complexity.
- Route files remain thin and easier to maintain.
- Server logic has clear ownership boundaries between feature-local code and shared infrastructure.
- The structure is predictable across features, which reduces navigation overhead.
- The repository avoids premature abstraction into a broad `domain/` layer or a generic `server/` bucket.
- Strict `index.ts` barrels limit accidental coupling, but require discipline to avoid over-exporting internal implementation details.

## Notes

This ADR records the current preferred structure for the repository. If a future cross-feature domain concept becomes stable and broadly reused, it can be promoted out of a feature folder or into `src/shared/` with a separate decision.
