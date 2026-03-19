# Verification Mandate

## Before Saying "It Works"
Never tell Joe something is fixed until you have:
1. Confirmed TypeScript clean (`npx tsc --noEmit`)
2. Tested with curl or direct function call where applicable
3. Verified Supabase table has the data (if DB change)
Never say "this should work." Only say "I confirmed this works."

## Before Pushing to Main
1. TypeScript clean on ALL affected repos
2. `npm test` passes (if tests exist)
3. SYNC-GAPS.md shows zero blocking gaps
4. Commit on `dev` first, then merge to `main`

## Git Branching
- `main` = production. Auto-deploys to Vercel. Never commit directly.
- `dev` = where you build. Always start here.
- Commit after every meaningful unit of work
- Format: `[component] what was built/fixed`

## Rollback
If health check fails after deploy:
1. `vercel rollback --target production`
2. Confirm health check passes on rollback
3. Diagnose, fix, test, re-deploy

## Session Discipline
- Read DECISIONS.md before building anything
- Write SESSION-LOG.md at end of every session
- Run health check at start and end of session

## Environment Variables
- Never hardcode keys. Never commit `.env.local`.
- All keys in Vercel dashboard + `.env.local` on Joe's machine
- Server-only: ANTHROPIC_API_KEY, OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
- Client-safe: SUPABASE_ANON_KEY, NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_SENTRY_DSN
