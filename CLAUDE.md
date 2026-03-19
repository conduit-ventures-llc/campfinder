# CLAUDE.md — The Container Constitution

## WHO YOU ARE BUILDING FOR

Joe Fedyna — Solo founder, non-developer, CEO of Conduit Ventures LLC (Family AI company). You are his technical hands. He is the architect. Execute his blueprint. Read DECISIONS.md before building anything.

**Mission:** Build AI agents that learn how families live — and get smarter every year.

## CRITICAL RULES — WILL CAUSE BUGS IF BROKEN

1. **Never hardcode API keys.** Server-only keys never in client code.
2. **Never edit DB directly.** Every schema change → migration file in `/supabase/migrations/`.
3. **Never skip pre-assembly.** Generation engine uses 3-step sequence (see `.claude/rules/quality-standard.md`).
4. **Never commit to main directly.** Build on `dev`, merge to `main`.
5. **Never say "this should work."** Confirm with `npx tsc --noEmit` + verification.
6. **Never generate without full intake context.** Every output reflects THIS teacher's classroom.
7. **Never build for one vertical only.** Cross-vertical sync same session (see `.claude/rules/cross-vertical-sync.md`).
8. **Never let agents run unbounded.** 24-hour cache on all executive/council routes. $20/day limit (see `.claude/rules/automation-laws.md`).

## GIT WORKFLOW

```
dev       ← Build here. Always start: git checkout dev && git pull
main      ← Production. Auto-deploys to Vercel. Merge from dev only.
```

- Commit after every meaningful unit of work
- Format: `[component] what was built/fixed`
- TypeScript must be clean before every push
- SYNC-GAPS.md must show zero blocking gaps before push

## ENVIRONMENT VARIABLES

Never commit `.env.local`. Required keys:
```
ANTHROPIC_API_KEY          # Server-side only
OPENAI_API_KEY             # Server-side only (DALL-E)
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
RESEND_API_KEY / CRON_SECRET
NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_SENTRY_DSN
```

## KEY ARCHITECTURE

**LLM Resilience:** `lib/ai/provider.ts` — Primary: Anthropic claude-sonnet-4-20250514. Fallback: OpenAI gpt-4o. All generation routes use `resilientGenerateText`.

**Shared UI:** Check `@conduit/ui` (`../packages/ui/src/`) before building any component. Never duplicate.

**Generation Engine:** `lib/maestra/generation-engine.ts` — 8-slot dynamic prompt assembled from live Supabase data. Conditional injection based on output type. DALL-E images cached + non-blocking.

**Intelligence Stack:** 18 agents (CFO, CTO, CRO, 8 Council Members, COO, Intelligence Loop, Revenue Signals, Marketing, Cron Health). All write to Supabase. All cached 24h. Wake-all rate limited 12h.

**Cost:** $0.12 per generation. Hardcoded in `app/api/admin/financials/route.ts`. Update monthly.

## WHAT TO BUILD

Read DECISIONS.md. It has tonight's plan.

## SESSION DISCIPLINE

- **START:** Read DECISIONS.md + CLAUDE.md
- **END:** Write SESSION-LOG.md, TypeScript clean, push to main
- **EVERY FEATURE:** Cross-vertical sync check. Run `node scripts/detect-sync-gaps.js`.

## PRODUCTS

| Product | Repo | Status |
|---|---|---|
| Maestra | the-container | Active — 8 users |
| CampFinder | campfinder | Active — registration season |
| Idea Synthesizer | idea-synthesizer | Active — landing page live |

## DETAILED RULES (in .claude/rules/)

- `.claude/rules/quality-standard.md` — Generation engine, 3-step sequence, billing gate, 8-slot prompt
- `.claude/rules/cross-vertical-sync.md` — Design system, product list, sync verification
- `.claude/rules/automation-laws.md` — 9 automation rules, cron schedule, cost controls
- `.claude/rules/verification-mandate.md` — Testing, git, rollback, env vars, session discipline
