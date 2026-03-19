# Automation Laws — Never Break These

1. SYNC-GAPS.md must be empty before every push
2. Migrations go in `/supabase/migrations/`. Never manual SQL.
3. Every feature applies to all verticals same session
4. Overnight agents run server-side via Vercel cron — no browser needed
5. CRO messages send automatically after approval
6. Deployment health checked automatically
7. Supabase health checked daily
8. Cron failures self-heal via /api/cron-health (every 30 min)
9. Joe never does operational work. Ever.

If Joe is doing any of these manually → the system has failed. Fix it immediately.

## Cron Schedule (23 jobs in vercel.json)
- Every 6h: Intelligence loop, Council members 4+5
- Every 12h: Council members 1+2
- Every 30min: Cron health (self-healing)
- Daily 5am-6:15am ET: VC→McKinsey→CFO→CTO→CRO→Brother Nick→Consensus→Morning Brief→COO→Marketing
- Sunday 4am: COO learning loop
- Sunday 7pm: Revenue signals
- Monday 5am: Full council session
- Daily 11pm ET: Overnight intelligence agents

## Cost Controls
- All executive/council routes cache for 24 hours. Run ONCE per day max.
- Wake-all rate limited to once per 12 hours.
- Marketing prompts read-only on dashboard load. Generation only via cron.
- Daily spend limit: $20. /api/health/spending monitors.
- DALL-E images cached in Supabase Storage (shared across all teachers).
