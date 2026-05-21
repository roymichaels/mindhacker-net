---
name: Spanish Language Support
description: Spanish (es) is a first-class third language. Resolver falls back es→en→he. `pickLang` helper for inline copy. Aurora orchestrator prepends a Spanish LANGUAGE: directive. Currency es→EUR. See LOCALIZATION_SPANISH.md.
type: feature
---

Spanish (`es`) is supported alongside Hebrew and English.

- `Language` type: `'he' | 'en' | 'es'`. `isRTL` stays Hebrew-only.
- Inline copy: use `pickLang(language, { he, en, es? })` from `@/lib/i18nPick`. The `es` key is optional and falls back to `en` — adopting the helper is non-breaking.
- Translation keys (`t('...')`): resolver in `src/i18n/index.ts` falls back `requested → en → he → key`, so missing Spanish strings render English, not the raw key.
- AION/Aurora: `supabase/functions/aurora-chat/orchestrator.ts` prepends a `LANGUAGE:` directive that forces Spanish output even when prompt scaffolding stays English. Extend to other edge functions by copying `buildLanguageDirective(language)`.
- Currency: `es → EUR (€)` in `src/lib/currency.ts`.
- ~370 files still use the binary `isHe` pattern (Spanish users see English in those spots). Migration is mechanical — see `LOCALIZATION_SPANISH.md` for the recipe.
- DB: `profiles.preferred_language` CHECK constraint allows `he | en | es`.