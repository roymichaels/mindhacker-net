# Spanish (`es`) localization

Spanish is a first-class third language alongside Hebrew (`he`) and English (`en`).

## What works today

- `Language` type is `'he' | 'en' | 'es'` everywhere (`src/i18n/index.ts`, `LanguageContext`).
- Geo-detection adds Spanish-speaking country codes (ES, MX, AR, CL, CO, PE, VE, UY, PY, BO, EC, GT, HN, SV, NI, CR, PA, DO, CU, PR) plus `navigator.language` tiebreaker.
- Persisted in `profiles.preferred_language` (CHECK constraint widened to allow `es`).
- Three-way language picker in `Header`, `AuroraAccountDropdown`, and `AppearanceSettingsTab`.
- Resolver fallback chain in `getTranslation`: requested language → English → Hebrew → key. Missing Spanish keys silently render the English string instead of the raw key.
- `src/i18n/translations/es.ts` ships translated copy for common, header, language, auth, dashboard top-level, footer, notifications, archetypes, avatar, settings.appearance, theme, messages, aurora.account, admin.panelTitle.
- `pickLang(language, { he, en, es? })` helper in `src/lib/i18nPick.ts` for inline copy. `es` is optional and falls back to `en`.
- AION/Aurora awareness: `supabase/functions/aurora-chat/orchestrator.ts` validates `language ∈ {he, en, es}` and prepends a universal `LANGUAGE:` directive ("Respond entirely in Spanish, neutral, warm, informal tuteo") to every system prompt. No prompt rewrites needed — the model speaks Spanish even where downstream scaffolding stays English.
- Timezone fallback: `he → Asia/Jerusalem`, `es → Europe/Madrid`, otherwise `UTC` (client-supplied timezone always wins).
- Spanish surfaces in AION presence/world copy: `useAmbientContext`, `useWorldAion`.
- Currency: `es → EUR (€)` in `src/lib/currency.ts`.
- `openclaw-workspace/agents/aurora-chat.yaml` lists `es` in supported languages.

## Phase 2 sweep (post-export)

~370 files still use the binary `language === 'he' ? heCopy : enCopy` pattern. Spanish users see English in those spots (intentional, non-breaking). Migration recipe for each file:

```ts
// before
{language === 'he' ? 'שלום' : 'Hello'}
// after
import { pickLang } from '@/lib/i18nPick';
{pickLang(language, { he: 'שלום', en: 'Hello', es: 'Hola' })}
```

Run `rg -l "language === 'he' \\?" src` to enumerate. Recommend doing this from CloudCode after export — it's mechanical and benefits from local iteration speed.

## Other edge functions

Only `aurora-chat` has the language directive wired today. To extend, copy the `buildLanguageDirective(language)` helper from `supabase/functions/aurora-chat/orchestrator.ts` and prepend its output to the system prompt. Functions worth updating next: `aurora-generate-title`, `aurora-summarize-conversation`, `generate-orb-narrative`, `generate-milestone-journey`, `generate-transformation-report`, `negotiate-plan`, `work-chat`, `career-wizard`, `generate-coach-plan`, `ai-hypnosis`, `api/domain-assess.ts`.

## Dialect

Default: **neutral Latin-American Spanish, informal "tú"**. Castilian-specific vocabulary avoided. If you need a Castilian variant later, split `es` into `es-ES` and `es-419` translation files and add a sub-picker; the resolver chain already supports it.