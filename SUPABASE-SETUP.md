# CampFinder Supabase Setup

**IMPORTANT: This is a separate Supabase project from Maestra. Zero data bleed.**

## Steps

1. Go to https://supabase.com/dashboard → New Project
2. Project name: `campfinder`
3. Organization: Conduit Ventures
4. Region: US East (same as Maestra)
5. Generate a strong database password — save it
6. Wait for project to provision

## After project is created:

1. Go to Settings → API (https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/api)
2. Copy these values into `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to SQL Editor → New Query
4. Paste the contents of `supabase/migrations/001_campfinder_base_schema.sql`
5. Click Run
6. Verify all tables created in Table Editor

## Environment Variables Needed

| Variable | Where to find |
|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `GOOGLE_MAPS_API_KEY` | https://console.cloud.google.com → APIs & Services → Credentials |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
