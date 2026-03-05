# Operations Checklist

## Production env checklist (Netlify)

Required environment variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`

After changing env vars:

1. Trigger redeploy (recommended once with clear cache).
2. Verify auth pages load (`/auth/sign-in`, `/auth/sign-up`).
3. Verify dashboard/profile load for signed-in users.

## DB migration checklist

When schema changes are shipped:

1. Generate migration locally: `npm run db:generate`
2. Commit migration SQL + schema updates.
3. Ensure `DATABASE_URL` secret exists in GitHub Actions.
4. Merge to `master` (workflow runs `npm run db:migrate`).
5. Check workflow success in `.github/workflows/run-migrations.yml`.

## Auth smoke test

Run smoke e2e test locally:

```bash
npm run test:e2e:smoke
```

Against deployed site:

```bash
E2E_BASE_URL=https://your-site.netlify.app npm run test:e2e:smoke
```
