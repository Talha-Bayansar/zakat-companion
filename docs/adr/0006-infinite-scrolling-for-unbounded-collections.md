# ADR 0006: Use infinite scrolling for unbounded async collections

## Status

Accepted

## Context

The app will fetch many lists from the database or from external APIs. Some of those lists are naturally small at first, but they are user-growable and cannot be assumed to stay bounded. The product should therefore default to infinite scrolling for any async collection that users can keep expanding over time, including overview pages and searchable pickers.

The implementation needs to stay aligned with Drizzle ORM, so the pagination shape should fit `orderBy(...)`, `limit(...)`, and `offset(...)` queries instead of relying on an abstract pagination model that is awkward to express in repositories.

## Decision

Use page-based infinite scrolling as the default contract for unbounded async collections.

- Any user-growable async collection should use infinite scrolling by default.
- Search must run on the server and reset pagination back to the first matching page.
- The shared response shape should be:
  - `items`
  - `page`
  - `pageSize`
  - `hasMore`
- Callers may supply `pageSize`, but repositories and server functions must enforce a maximum page size.
- Shared pagination helpers should live in technical shared code, while features provide their own page, sort, and filter mappings.
- Feature-specific UI should use a shared infinite-list primitive with thin wrappers for page views and searchable pickers.

## Consequences

- Page-style list views and searchable selectors can reuse the same fetch contract.
- Drizzle repositories keep a consistent, predictable page-based pagination pattern.
- Searchable pickers work correctly for large result sets without loading everything into memory.
- The UI can still offer a manual `Load more` fallback when needed, but infinite scroll remains the default behavior.
- Fixed small lists may still use simpler non-infinite patterns if they are genuinely bounded and not user-growable.
