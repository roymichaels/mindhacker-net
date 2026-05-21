## Goal

Add Spanish (`es`) as a first-class third language alongside Hebrew (`he`) and English (`en`), and make AION / Aurora / all language-aware UI respond in Spanish when the user selects or is geo-detected as Spanish-speaking.

## Approach

The codebase has ~370 files using a **binary `isHe` / `language === 'he'`** pattern that implicitly treats "not Hebrew" as English. A naive replacement to ternaries across every file would be enormous and risky. Instead we use a **layered strategy**:

1. **Type + infrastructure layer** — Spanish becomes a full citizen everywhere the type system enforces it.
2. **Translation file layer** — full `es.ts` mirror of `en.ts` so all `t('...')` keys resolve in Spanish automatically.
3. **AION/Aurora prompt layer** — backend system prompts get a universal "Reply only in {languageLabel}" directive so the LLM speaks Spanish, even where prompt scaffolding stays in English. No need to translate every prompt template.
4. **Inline ternary layer** — keep existing `isHe ? he : en` files working unchanged (Spanish users fall through to English). High-visibility AION surfaces (presence lines, ambient context, composer placeholder, world copy) get a small `pickLang(language, { he, en, es })` helper and Spanish overrides shipped now. The rest is documented as Phase 2 sweep, done off-Lovable.

This ships a usable Spanish experience now and a clean migration path for the remaining inline strings.

---

## Changes

### 1. Type + context (foundation)

- `src/contexts/LanguageContext.tsx`
  - `type Language = 'he' | 'en' | 'es'`.
  - `isRTL` stays `language === 'he'`.
  - `detectLocation`: map Spanish-speaking country codes (`ES, MX, AR, CL, CO, PE, VE, UY, PY, BO, EC, GT, HN, SV, NI, CR, PA, DO, CU, PR`) → `'es'`; `IL` → `'he'`; otherwise `'en'`. Also honor `navigator.language` starting with `es` as a tiebreaker.
  - `updateDocumentDirection`: `dir = 'rtl'` only for `he`; sets `lang` attribute to actual code.

- `src/i18n/index.ts`
  - `Language = 'he' | 'en' | 'es'`; register `es` in translations map.

- `src/lib/i18nPick.ts` (new) — tiny helper:
  ```ts
  export function pickLang<T>(lang: Language, m: { he: T; en: T; es?: T }): T {
    if (lang === 'he') return m.he;
    if (lang === 'es') return m.es ?? m.en;
    return m.en;
  }
  export const LANGUAGE_LABEL: Record<Language, string> = {
    he: 'Hebrew', en: 'English', es: 'Spanish',
  };
  ```

### 2. Translation files

- `src/i18n/translations/es.ts` (new) — full mirror of `en.ts` keyed identically, professionally translated (neutral Latin American Spanish, formal "tú"). Keys missing in `es` automatically fall back to the key string today; we will ship full coverage for `en.ts`'s key set.

### 3. Language picker UI

- `src/components/Header.tsx`, `src/components/settings/tabs/AppearanceSettingsTab.tsx`, `src/components/aurora/AuroraAccountDropdown.tsx`
  - Add Spanish as a third option (`Español`) alongside existing toggles. Picker becomes a three-way select instead of a binary toggle.

- `src/components/pillars/DomainAssessChat.tsx` — same.

- First-visit language prompt (if present) — add Spanish option.

### 4. AION / Aurora backend awareness

These edge functions already receive a `language` field from the client. We extend, not rewrite:

- `supabase/functions/aurora-chat/orchestrator.ts`
  - Validate `language` against `{he, en, es}`; default `en` if unknown (was `he`).
  - At the top of every `buildXPrompt(...)` (Full, Lite, Widget, Pillar, Socratic, Lane, Phase4, Opener, Intake) — when `language === 'es'`, prepend a directive block:
    ```
    LANGUAGE: Respond entirely in Spanish (neutral, warm, informal "tú").
    All user-facing text — greetings, questions, lists, headings — must be in Spanish.
    Keep proper nouns (AION, MindOS) untranslated.
    ```
  - Keep existing `isHe` Hebrew branches intact; English scaffold serves as Spanish scaffold + the directive above forces Spanish output.

- `supabase/functions/_shared/contextBuilder.ts`
  - Timezone fallback: `he → Asia/Jerusalem`, `es → Europe/Madrid`, else `UTC`. Client-supplied timezone still wins.

- `supabase/functions/aurora-generate-title/index.ts`, `aurora-summarize-conversation/index.ts`, `generate-orb-narrative/index.ts`, `generate-milestone-journey/index.ts`, `generate-transformation-report/index.ts`, `negotiate-plan/index.ts`, `work-chat/index.ts`, `career-wizard/index.ts`, `generate-coach-plan/index.ts`, `generate-branding-suggestions/index.ts`, `ai-hypnosis/index.ts`, `domain-assess` (api/) — same minimal pattern: accept `language`, inject the Spanish directive when `language === 'es'`. No prompt rewrites.

- `openclaw-workspace/agents/aurora-chat.yaml` — extend `languages` list with `es`; system_prompt already uses `{{language_label}}` so no change beyond the language list.

### 5. Client → edge wiring

- `src/services/messaging.ts` and any other caller that posts to aurora-chat / work-chat / etc. — ensure the current `language` from `useLanguage()` is forwarded in the request body. Spot-check the ~12 callers; most already pass it.

- `src/aion/voice.ts` (ElevenLabs TTS) — pass `lang` to TTS so Spanish text gets a Spanish-capable voice; map `es → es` model/voice (use existing multilingual voice already configured; document if a new voice needs to be added to ElevenLabs).

- `src/services/ttsSpeak.ts` — same.

### 6. High-visibility AION surfaces (Spanish strings shipped now)

Using `pickLang(language, { he, en, es })`:

- `src/hooks/aurora/useAmbientContext.ts` — all `isHe` literals get Spanish equivalents (mode labels, "What shall we do right now?", etc.).
- `src/worlds/aion/useWorldAion.ts` — `HE_PRESENCE`, `EN_PRESENCE` gain a sibling `ES_PRESENCE` map; awareness lines ("I notice you keep returning…", "there is weight here") get Spanish copy.
- `src/aion/presence/orbBehavior.ts`, `src/copy/aionPresence.ts` — Spanish copy.
- `src/components/dashboard/GlobalChatInput.tsx` — composer placeholder Spanish.
- `src/components/aion/ui/AionComposerDock.tsx` — any hard-coded labels.
- `src/world/terrain/useWorldAnchors.ts` — anchors gain `labelEs` / `metaEs`; renderer picks based on language.
- `src/shellv2/layers/NavLayer.tsx`, `src/shellv2/ShellV2Header.tsx` — nav labels.

### 7. Documentation

- Update `mem://localization/...` memory: rename "Hebrew Standards" note to add a Spanish section (BiDi still only applies to Hebrew; Spanish is LTR with normal punctuation; numbers/currency use es-ES locale by default unless user country implies otherwise).
- Update `CLONE_AND_DEPLOY.md` with a one-paragraph "Languages: he / en / es" note and the env knobs for default language.
- Add `LOCALIZATION_PHASE2.md` listing the remaining ~360 files still on binary `isHe` pattern, with `pickLang` migration recipe, so the sweep can be done from CloudCode after export without re-discovery.

### 8. Verification

- `npx tsc --noEmit` — type-check the new union narrowing.
- Manual: switch language to Español in the header; confirm AION composer placeholder, ambient context, world copy, and an AION reply (via aurora-chat) all return Spanish.
- Confirm Hebrew + English unchanged (regression check on one Hebrew route and one English route).

---

## What this explicitly does NOT do

- Does not rewrite every existing `isHe ? 'X' : 'Y'` ternary in the 370-file long tail. Those keep working; Spanish users see English in those spots until the Phase 2 sweep.
- Does not change DB schema, RLS, auth, or any backend logic beyond prompt-language directives.
- Does not change Hebrew or English behavior.
- Does not add new translation infrastructure (no i18next migration) — keeps the existing `getTranslation` system.

## Open question

Spanish dialect preference for the translation file and AION voice: **neutral Latin American Spanish** (default I'd ship) vs **Castilian (Spain)** vs **dual variants (`es-ES` / `es-419`)**. Dual variants double the translation work and the language picker UI. Confirm before I implement.
