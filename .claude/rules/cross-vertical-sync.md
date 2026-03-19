# Cross-Vertical Sync Rules

## The Law
Every feature built for any vertical must be evaluated for cross-vertical application in the same session.

## Active Products
| Product | Repo | Status |
|---|---|---|
| Maestra | the-container | Active — 8 users, 30+ generations |
| CampFinder | campfinder | Active — registration season |
| Idea Synthesizer | idea-synthesizer | Active — landing page live |

## Design System (shared across all products)
- Background: #FAFAF8 warm white
- Primary: #2D6A4F forest green
- Accent: #C8922A gold
- Text: #1A1A1A primary, #6B7280 muted
- Font: Lora serif headings, Source Sans Pro body
- Cards: 12px radius, shadow-sm, 16px padding
- Typography: 16px body minimum, 13px label minimum, 18px card titles
- All tap targets: 44px minimum height

## Sync Verification
Run `node scripts/detect-sync-gaps.js` before pushing.
SYNC-GAPS.md must show zero blocking gaps.

## Architectural Exceptions (not gaps)
- CampFinder library page — Summer Maps model, Phase 2
- Idea Synthesizer library — single-page app, email flow
