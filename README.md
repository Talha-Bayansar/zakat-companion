# zakat-companion

Zakat Companion PWA scaffold using TanStack Start, shadcn/ui conventions, Better Auth, Neon + Drizzle, and TanStack Query.

## Stack

- tanstack start
- tanstack query (query key factory pattern)
- better auth
- drizzle orm + neon postgres
- pwa via vite-plugin-pwa
- recharts via shadcn chart patterns
- decimal.js for money math

## Conventions

- kebab-case file/folder naming
- folder-based routes only (`route-name/index.tsx`)
- feature-sliced design modules
- server functions preferred over API routes

## Project rules (must follow in future iterations)

- keep route files compact; move UI building blocks into `src/features/<feature>/components/*` (never under `src/routes`)
- prefer composition via reusable building blocks over monolithic page components
- one standalone component per file (avoid "kitchen sink" component files)
- target short, navigable files (avoid large multi-hundred-line page files when possible)
- use reusable TanStack Query hooks for all data retrieval/mutations
- keep infinite lists on `useInfiniteQuery` + shared infinite-scroll sentinel pattern

## UI direction (project-wide)

- iOS-like visual language is the default (glassmorphism cards, soft gradients, rounded controls, calm motion)
- use shadcn/ui primitives for consistency and accessibility
- prefer shared layout wrappers (`src/components/layout/*`) over page-specific shell code
- maintain this design language across all future routes/components unless explicitly changed
- loading states must use shared `Spinner` via `Button`'s `loading` / `loadingText` props (default pattern for future components)

## Runtime note

This scaffold uses the current Vite-based TanStack Start setup (not Vinxi scripts).

## Next steps

1. wire router/app bootstrap for TanStack Start
2. install shadcn and generate base components
3. implement auth + protected layouts
4. add web-push subscription flow and cron reminder job
5. build first vertical slice: calculate-zakat


## Netlify deploy

This repo is configured for Netlify using `@netlify/vite-plugin-tanstack-start`.

Build and deploy with Netlify CLI:

```bash
npm run build
npx netlify deploy
```

For manual Netlify configuration, `netlify.toml` is included with:

- build command: `vite build`
- publish dir: `dist/client`
- local dev command: `vite dev`
- local dev port: `3000`

## Operations

See `docs/OPERATIONS.md` for:

- production env checks
- DB migration runbook
- auth smoke e2e test steps
