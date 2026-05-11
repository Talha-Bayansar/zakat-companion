# Domain Docs

This repository uses a single-context documentation layout.

## Layout

- Root-level `CONTEXT.md` describes the project's shared domain language and operating assumptions.
- Root-level `docs/adr/` stores architectural decision records for the whole repo.

## Consumer Rules

- Read `CONTEXT.md` first when a skill needs domain language or project-specific terminology.
- Read `docs/architecture.md` before any implementation work that touches app structure, UI, localization, testing, or feature conventions.
- Read `docs/adr/0002-feature-first-folder-structure.md` and `docs/adr/0003-ui-patterns-for-forms-loading-empty-and-destructive-actions.md` when implementation work needs the canonical feature-layout or UI-pattern conventions.
- Read `docs/adr/` when a skill needs broader prior architectural decisions or rationale.
- Keep these docs synchronized with major domain or architecture changes.
- Feature server code should use the `repositories/`, `services/`, `schemas/`, and `functions/` subfolder split inside `src/features/<feature>/server/`.
- Keep persistence in repositories, orchestration in services, validation in schemas, and TanStack Start entrypoints in functions.
- Treat any new client-facing text as a translation task: add or reuse a Paraglide message before shipping the UI change.
- Treat server error strings as client-facing whenever they can propagate to the UI; translate them before shipping.
- Keep React components small and focused.
- If a React component grows beyond roughly 150 to 180 lines, split it into smaller components, hooks, or helpers.
- If the repository later splits into distinct subdomains, migrate to a multi-context layout and add `CONTEXT-MAP.md` at the root.
