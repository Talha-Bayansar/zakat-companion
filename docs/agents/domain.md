# Domain Docs

This repository uses a single-context documentation layout.

## Layout

- Root-level `CONTEXT.md` describes the project's shared domain language and operating assumptions.
- Root-level `docs/adr/` stores architectural decision records for the whole repo.

## Consumer Rules

- Read `CONTEXT.md` first when a skill needs domain language or project-specific terminology.
- Read `docs/adr/` when a skill needs prior architectural decisions or rationale.
- Keep these docs synchronized with major domain or architecture changes.
- If the repository later splits into distinct subdomains, migrate to a multi-context layout and add `CONTEXT-MAP.md` at the root.
