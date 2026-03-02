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

## Runtime note

This scaffold uses the current Vite-based TanStack Start setup (not Vinxi scripts).

## Next steps

1. wire router/app bootstrap for TanStack Start
2. install shadcn and generate base components
3. implement auth + protected layouts
4. add web-push subscription flow and cron reminder job
5. build first vertical slice: calculate-zakat


## Cloudflare deploy

This repo includes `wrangler.jsonc` configured for TanStack Start build output:

- Worker entry: `dist/server/server.js`
- Static assets: `dist/client`

Build before deploy:

```bash
npm run build
```
