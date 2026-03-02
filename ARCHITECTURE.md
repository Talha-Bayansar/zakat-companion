# architecture

## feature-sliced structure

- `app/`: app composition, providers, router
- `routes/`: folder-based route entry points only
- `widgets/`: composite UI blocks
- `features/`: user interactions/use-cases
- `entities/`: domain objects and pure business logic
- `shared/`: reusable libs/ui/config/types
- `server/`: auth, db, services, server functions

## tanstack query pattern

- keep keys in `shared/lib/query/query-keys.ts`
- define reusable options factories in feature/entity modules
- avoid inline query keys in components

Example:

```ts
// feature query options
import { createQueryOptions } from '@/shared/lib/query/create-query-options'
import { queryKeys } from '@/shared/lib/query/query-keys'
import { getLatestAssessment } from '@/server/functions/zakat/get-latest-assessment'

export const latestAssessmentQueryOptions = (userId: string) =>
  createQueryOptions({
    queryKey: queryKeys.zakatAssessment.latestByUser(userId),
    queryFn: () => getLatestAssessment(),
    staleTime: 60_000
  })
```

## server functions vs api routes

Prefer server functions for app-internal client/server data flow.

Use API routes only for:

- third-party webhooks/callbacks
- public endpoints
- transport-specific needs

## non-negotiables

- all money math via `decimal.js`
- domain zakat logic in pure functions
- zod validation at boundaries
- idempotent reminder processing
