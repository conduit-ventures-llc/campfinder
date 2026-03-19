# Quality Standards

## Non-Negotiable Rules
1. No API keys in client code. Ever.
2. No direct DB edits. Every schema change is a migration file in `/supabase/migrations/`.
3. No generation without pre-assembly. The 3-step sequence is sacred.
4. No static system prompts. Prompts are assembled from live Supabase data before every call.
5. Rate limiting on all API routes before staging.
6. Error boundaries on all generation UI. Never a blank screen.
7. Mobile-first. Test on 390px width.

## Elite Output Standard
Every generation must reference the client's full intake data: print budget, room setup, class energy, period length, grades, Catholic elements, IEP load, technology, teaching style, and prior knowledge from the ledger. No generic filler. Every line reflects THIS teacher's classroom.

**The test:** Could a first-year teacher pick up this output Monday morning and teach from it without any additional research, editing, or preparation? If no, it fails.

## Generation Engine — 3-Step Sequence
```
Step 1 — Pre-Generation Assembly:
  READ: clients (system_prompt + intake_answers + learner_profile)
  READ: knowledge_ledger (last 30 items)
  READ: feedback (last 10 signals)
  READ: resources_master (approved resources)
  READ: context_uploads (curriculum docs)
  AUTO-CALC: calendar, ACTFL standards, curriculum alignment
  ASSEMBLE: full dynamic prompt with all 8 slots

Step 2 — Generation:
  CALL: Anthropic via resilientGenerateText (fallback to OpenAI)
  STREAM: response to UI
  SAVE: to generations table

Step 3 — Post-Generation:
  WRITE: generations table
  EXTRACT: vocab → vocabulary_library, topics → knowledge_ledger
  CHECK: billing gate
  INJECT: resource links + video companions (post-process)
  DALL-E: non-blocking background image generation with cache
```

## Dynamic Prompt — 8 Slots
- [IDENTITY] — name, role, organization, experience
- [BELIEF_SYSTEM] — philosophy, theory of users
- [VOICE] — extracted phrases from intake + voice memos
- [CONSTRAINTS] — budget, tools, environment, curriculum
- [WHAT_WORKS] — style + positive feedback patterns
- [WHAT_DOESNT] — flopped approaches + negative feedback
- [CALENDAR] — today + events within 21 days + knowledge coverage
- [QUALITY_FILTER] — quality standard + feedback history

## Billing Gate
- Trial: generations_used < trial_limit (default 3) → generate freely
- Gate: over limit + no Stripe → block, show checkout
- Active: stripe_status = 'active' → generate freely
- Paused: Joe toggled off → show "access paused"
