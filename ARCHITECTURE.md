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
- for client-side writes to server functions, use `useMutation` from `@tanstack/react-query` (do not call mutation server functions directly inside UI handlers)

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

## ios design system baseline (ui consistency rules)

The app is intentionally styled with an iOS-inspired, glassy visual language. Keep this consistent across all new screens/components.

### visual direction

- mobile-first layout (`max-w-md`) centered on larger screens
- soft, bright radial background + layered glass cards
- rounded geometry (`rounded-2xl` / `rounded-3xl`) for controls and surfaces
- subtle blur and soft shadows, not heavy contrast
- touch-friendly controls (`min-h-12` for primary taps)

### canonical utility classes

Defined in `src/app/styles/index.css` and should be reused instead of one-off style strings:

- `.ios-glass-card` → default card surface for content sections
- `.ios-primary-action` → filled primary CTA button/link
- `.ios-secondary-action` → outlined/soft secondary action
- `.ios-input` → default form control treatment for iOS look

When building new routes or forms, use these first.

### shell + safe area

`src/components/layout/ios-app-shell.tsx` is the canonical app shell:

- keeps proper bottom spacing with `env(safe-area-inset-bottom)`
- floating tab bar should remain above the home indicator
- preserve current header + tab bar blur/shadow balance unless intentionally redesigning

### icon system

- default icon stack: `@hugeicons/react` + `@hugeicons/core-free-icons`
- avoid reintroducing `lucide-react` unless there is a strong, explicit need
- keep icon stroke and size visually consistent in nav/actions/forms

### implementation notes

- prefer reusable utility classes/components over per-page style duplication
- if a page needs a style variant, add a named class in global styles and document it
- preserve accessibility: visible focus styles, touch target sizing, contrast checks
