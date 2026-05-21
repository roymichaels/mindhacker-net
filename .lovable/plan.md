# Plan — Continue Spanish (es) Translation Coverage

## Current state

- `en.ts`: 5,319 lines / `he.ts`: 5,402 lines / `es.ts`: **244 lines** (~5% coverage)
- **243 files** still use binary `isHe ? 'he' : 'en'` ternaries (no `es` branch)
- AI/AION backend already speaks Spanish via `buildLanguageDirective`
- Fallback chain (`es → en → he → key`) already in place, so nothing is broken — just English-leaking

## Scope of work

Two parallel tracks, both needed for "everything translated":

**Track A — Static translation bundle** (`src/i18n/translations/es.ts`)
Mirror every key from `en.ts` into `es.ts`. ~5,000 lines of strings.

**Track B — Inline `isHe` ternaries** (243 files)
Replace `isHe ? 'X' : 'Y'` with `pickLang(language, { he: 'X', en: 'Y', es: 'Z' })` using the existing helper at `src/lib/i18nPick.ts`.

## Phased execution (this prompt = Phase 1; further prompts continue)

### Phase 1 — Bundle parity (this run)
- Fully translate `src/i18n/translations/es.ts` so every key in `en.ts` has a Spanish equivalent.
- Neutral Latin American Spanish, informal "tú", consistent terminology glossary (AION stays AION, "pillar" → "pilar", "quest" → "misión", "world" → "mundo", "brain" → "mente", "energy" → "energía", "wallet" → "cartera", "free market" → "mercado libre").
- No structural changes to keys; pure value translation.

### Phase 2 — Chrome & high-visibility surfaces (next run)
Convert `isHe` ternaries in the surfaces a user sees first:
- `src/shellv2/layers/*` (Nav, Chrome, Composer, Overlay)
- `src/components/aion/ui/*` (AionHeader, AionComposerDock)
- `src/components/aurora/*` (Dock, Welcome, ChatBubbles, AmbientContextCard, AIONNamingGate, PlanModal, BeliefsModal)
- `src/selfworld/layers/*` and `src/selfworld/LayerCard.tsx`
- `src/components/Header.tsx` already done; verify dropdowns
- `src/components/onboarding/*` (UsernameSetupScreen, AIONActivation, calibration)
- `src/components/ErrorBoundary.tsx`

### Phase 3 — Feature surfaces (subsequent runs)
- Work hub (`components/work/*`)
- Practices, Modals, Quests, Pillar specs
- Web3 / SoulAvatar wizards
- World scenes & shell
- Remaining `outer/`, `aurora/` long-tail

### Phase 4 — Verification
- Typecheck + build
- Manual switch to `es` in the language picker on each major route
- Update `LOCALIZATION_SPANISH.md` with completion status and remaining debt

## Technical details

- Helper signature already exists:
  ```ts
  pickLang(language, { he: 'שלום', en: 'Hello', es: 'Hola' })
  ```
  When `es` is omitted, falls back to `en` — already safe.
- Translation file edits are append/replace-only, no key renames, so `TranslationKeys` type derived from `he` stays valid.
- No backend, DB, route, or runtime behavior changes.
- No file deletions.

## Out of scope

- Re-architecting i18n (no `i18next`, no namespacing changes)
- Translating user-generated content
- Translating AI-generated runtime strings (already handled by `buildLanguageDirective`)
- Edge function copy beyond what the language directive already covers

## Acceptance for Phase 1

- `es.ts` line count within ~95% of `en.ts`
- `getTranslation('es', key)` returns Spanish (not English fallback) for all keys present in `en.ts`
- Build passes; no type errors
- Phase 2-4 queued and documented

## Estimated size

Phase 1 alone is a single large file write (~5,000 lines). Phases 2-4 will each touch 20-80 files and should be run as separate prompts to keep diffs reviewable.
