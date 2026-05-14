## AION Brand Rebrand — UI/Layer Only

Replace public-facing **MindOS / Aurora / Mind OS / אורורה / מיינד OS** with **AION** across the UI, metadata, and brand assets. Keep all backend code, file names, edge functions, table names, and internal identifiers untouched.

### Scope

- ~91 source files contain user-facing brand strings (~328 occurrences).
- Three categories: (1) HTML/PWA metadata, (2) i18n strings, (3) inline JSX/TS labels.
- Backend, hooks, contexts, file paths, supabase functions: **untouched**.

### 1. Brand assets

- Copy uploaded logo → `public/aion-logo.png` (full mark with wordmark) and `src/assets/aion-logo.png` (for component imports).
- Add `public/aion-icon.png` (cropped ring only) for favicon / PWA icons.
- Keep existing `aurora-icon.svg` file but stop referencing it from `index.html`.
- Replace favicon + apple-touch-icon + PWA 192/512 icons with the AION ring.

### 2. HTML / SEO / PWA metadata

Files: `index.html`, `public/manifest.webmanifest`, `src/lib/seo.ts`.

- Title → `AION — Your Future Self`
- Description → AION-centric copy (drop "MindOS"/"Evolve" from public meta).
- og:site_name, og:title, twitter:title, JSON-LD `name`, `application-name`, `apple-mobile-web-app-title` → `AION`.
- Manifest `name` / `short_name` / `description` → AION.
- Favicon link → `/aion-icon.png`.

### 3. i18n strings (Hebrew + English)

Files: `src/i18n/translations/he.ts`, `src/i18n/translations/en.ts`.

Find/replace user-visible values only (not keys):
- `Aurora`, `Aurora AI`, `MindOS`, `Mind OS` → `AION`
- `אורורה`, `מיינד OS`, `המיינד OS`, `מערכת MindOS` → `AION`
- Sentences like "אורורה חושבת..." → "AION חושב..." (masculine, matches existing AION persona rules).

### 4. Inline UI labels

Sweep through visible string literals in:

- **Shell**: `src/shellv2/ShellV2.tsx`, `ShellV2Header.tsx`, `ShellV2Drawer.tsx`, `layers/ChromeLayer.tsx`, `layers/ChatLayer.tsx`.
- **Pages**: `MindOSPage.tsx` (header text only — keep filename), `MindOS/JournalPage.tsx`, `Blog.tsx`, `BlogPost.tsx`, `Documentation.tsx`, `Install.tsx`, `Learn.tsx`, `LaunchpadComplete.tsx`, `Community.tsx`, `MessageThread.tsx`, `NotFound.tsx`, `Unsubscribe.tsx`, `PractitionerProfile.tsx`, `CourseDetail.tsx`, `FeatureDetailPage.tsx`, `pillars/PresenceHome.tsx`, `fm/FMMarket.tsx`, `fm/FMBridge.tsx`.
- **Components**: `aurora/AuroraDock.tsx`, `orb/AIONFloatingWidget.tsx`, `orb/AIONChatPanel.tsx`, `community/*`, `fm/FMOnboarding.tsx`, `fm/FMAuroraCard.tsx` (label only), `modals/WelcomeGateModal.tsx`, `modals/UserDocsModal.tsx`, `subscription/*Modal.tsx`, `pillars/DomainAssessChat.tsx`, `missions/MiniMilestoneModal.tsx`, `pdf/PDFCoverPage.tsx`, `docs/VisualWhitepaper.tsx`, `founding/FoundingPlatformDeep.tsx`, `profile/TransformationReportCard.tsx`, `story/StorySurfaceHost.tsx`.
- **Brain**: `features/brain/BrainView.tsx` → "AION is building your map" / "AION בונה לך את המפה".
- **Data files**: `data/galleryOrbData.ts`, `data/featureShowcaseData.ts`, `data/featureDetailData.ts`, `meta/appMap.ts`, `navigation/canonicalSurfaces.ts`, `flows/onboardingFlowSpec.ts`, `flows/pillarSpecs/mindQuestSpec.ts`, `lib/storyWorld.ts`, `lib/subscriptionTiers.ts`, `lib/tools/extractDomainProfile.ts`, `lib/pdfGenerator.ts`, `lib/flowAudit.ts`, `lib/stripReasoning.ts`, `config/tokenomics.ts` — replace display strings only.
- **Misc**: `utils/calendarExport.ts` (event titles), `services/unifiedContext.ts` (system text shown to user), `hooks/usePWA.ts`, `hooks/useThemeSettings.ts` defaults, `App.tsx` document.title.

### 5. Menu / header / chat labels

- App header brand → AION wordmark image (small) + "AION" text.
- Drawer header → AION logo.
- Chat thread label → use `useAIONDisplayName()` (already returns AION fallback) — replace any hard-coded "Aurora"/"MindOS" labels with that hook's `displayName`.
- `MindOSPage` tab `key: 'chat'` already shows `aionName` — keep; rebrand surrounding `h1` from "MindOS" → "AION" and update subtitle copy.

### 6. Explicitly NOT touched

- File/folder names (`MindOSPage.tsx`, `pages/MindOS/*`, `aurora-chat`, `useAuroraChat`, `AuroraChatContext`, `aurora-icon.svg`, edge functions `aurora-*`, `mindos-sw-reset-version` localStorage key, `__MINDOS_BOOTSTRAP__`).
- All Supabase tables, RPC names, edge function URLs.
- Internal types, hook names, context names, route paths (`/mindos/*` routes stay; only their displayed labels change).
- `_legacy/`, `docs/`, `mem/`, `management/`, `openclaw-workspace/`, `supabase/functions/` — internal only.
- `DEPLOYMENT.md`, comments, JSDoc.

### 7. Verification

- Grep `src/` for `MindOS|Mind OS|Aurora AI|Aurora|אורורה|מיינד` after edits — every remaining hit must be either (a) an identifier/import/path/comment, or (b) explicitly listed as intentional internal.
- Manual preview check on: home, /mindos/chat, /brain, /community, drawer, install prompt, PWA add-to-home title.
- Verify `<title>`, og tags, manifest in DevTools.

### 8. Deliverable

Single batched edit pass producing:
- updated `index.html`, `manifest.webmanifest`, copied logo assets
- updated i18n files
- updated visible JSX/TS strings across the file list above
- a final report listing: files changed, count of replacements, intentional internal residue (file paths, hooks, edge functions), and any preview screenshots of header/drawer/Brain/PWA title.

### Risks

- Over-replacement could break a route name or storage key — mitigated by replacing **string literals shown to users only**, never identifiers.
- Hebrew gender agreement: "אורורה" was feminine; "AION" treated as masculine per existing AION identity standard — adjust verbs in copied sentences.
- SEO churn: canonical URL stays `mindos.space` (domain unchanged); only displayed brand changes. If you want the canonical/domain rebrand too, that's a separate task.
- Some marketing pages (Blog, FoundingPlatformDeep, VisualWhitepaper) carry long-form copy referencing "MindOS as the AI layer of Evolve" — those sentences will be rewritten to AION-centric phrasing, which is a light copy edit, not just a token swap. Flag if you'd prefer to preserve original marketing narrative and only swap the brand token.
