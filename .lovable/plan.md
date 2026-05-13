## Goal

Remove the legacy onboarding surface entirely. First launch (signed‑in, no data) lands directly on Home (`/` → ShellV2 → AION chat). No wizard, no intro splash, no welcome modal, no `/onboarding` route.

## What is still mounting onboarding (root cause)

1. **`/onboarding` route** in `src/App.tsx` (line 313) → `Onboarding.tsx` → `OnboardingFlow` → `OnboardingIntro` (the "ברוכים הבאים ל‑MindOS / בוא נתחיל" mountain splash).
2. **Auth `redirectTo`** in `OnboardingIntro` sends new sign‑ups to `/onboarding` (lines 190, 202) — so first sign‑in literally lands on the wizard.
3. **`WelcomeGateProvider` + `WelcomeGateModal`** mounted globally inside `pages/Index.tsx`; every public CTA (`InlineCTA`, `GameHeroSection`, `FinalCTASection`, `PricingPreviewSection`, `OrbCollectionSection`) calls `openWelcomeGate()` which routes into the same flow.
4. **`SmartOnboardingProvider`** in `App.tsx` + `useSmartOnboardingRedirect` still hard‑navigates to `/onboarding`.
5. **`redirects.tsx`** maps `/start`, `/free-journey`, `/free-journey/start` → `/onboarding`; `Go.tsx` CTA → `/onboarding`.
6. `OnboardingGate` is already a no‑op passthrough — fine, will be removed for clarity.

## Changes

### Routing & providers
- `src/App.tsx`
  - Remove `<Route path="/onboarding" …>` and the `Onboarding` lazy import.
  - Remove `<SmartOnboardingProvider>` wrapper (and import).
- `src/routes/redirects.tsx` — rewrite `/start`, `/free-journey`, `/free-journey/start`, **and add `/onboarding`** → `/`.
- `src/pages/Go.tsx` — CTA navigates to `/` instead of `/onboarding` (or delete the page; will replace target only to keep blast radius small).

### Auth redirects
- `src/components/onboarding/OnboardingIntro.tsx` is being quarantined (see below); but for any remaining `supabase.auth.signUp/signInWithOAuth` calls in active code, set `redirectTo: window.location.origin + '/'`. Grep `redirectTo.*onboarding` to fix every one (currently only OnboardingIntro itself).

### Welcome gate (public marketing CTAs)
- Delete `src/contexts/WelcomeGateContext.tsx` and `src/components/modals/WelcomeGateModal.tsx`.
- Replace every `useWelcomeGate()` / `openWelcomeGate()` call site with `navigate('/auth')` (or `/` if signed in). Files: `Index.tsx`, `home/InlineCTA.tsx`, `home/GameHeroSection.tsx`, `home/FinalCTASection.tsx`, `home/PricingPreviewSection.tsx`, `home/OrbCollectionSection.tsx`.

### Smart redirect hook
- `src/hooks/useSmartOnboardingRedirect.ts` — `smartNavigate()` always navigates to `/` (and still surfaces missing‑quest modals if a plan exists). Remove the `/onboarding` fallback path.
- Delete `src/contexts/SmartOnboardingContext.tsx` after callers updated, or keep as no‑op shim if too many imports — audit shows only `App.tsx` mounts the provider; will delete.

### Quarantine onboarding visuals (no deletion of business logic, just unmount)
Move the following into `src/_legacy/onboarding/` so nothing in the active tree imports them:
- `src/pages/Onboarding.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/onboarding/OnboardingIntro.tsx`
- `src/components/onboarding/OnboardingReveal.tsx`
- `src/components/onboarding/OnboardingAssessments.tsx`
- `src/components/onboarding/OnboardingPlanGeneration.tsx`
- `src/components/onboarding/OnboardingPresenceScan.tsx`
- Any sibling `Onboarding*` files in `components/onboarding/`

Keep `src/flows/onboardingFlowSpec.ts` and `FRICTION_PILLAR_MAP` (used by `lib/vitality/dataMap.ts` and brain pillar logic — that's data, not UI).

### Runtime kill switch
- Add a thin `OnboardingFlow` and `OnboardingIntro` re‑export shim at the **original paths** wrapped with `withLegacyGuard('OnboardingFlow', …)` returning `null` and `console.warn("Legacy onboarding blocked")`. This catches any straggler import we missed and prevents the splash from ever painting under ShellV2.

### Cleanup
- Delete `src/components/layout/OnboardingGate.tsx` and remove its imports from `SmartRoot.tsx` and `ProtectedAppShellV2.tsx`.
- Update `meta/appMap.ts` to drop the `/onboarding` entry.
- Update `AIONFloatingWidget` `HIDDEN_ROUTES` to remove `/onboarding`.

## Acceptance proof returned after build
1. `git diff --stat` of removed/disabled files (route, providers, modal, gate, intro, flow).
2. `rg "/onboarding"` shows zero active references (only quarantined `_legacy/`).
3. Network/console proof on `/` after fresh sign‑in: lands on ShellV2 chat, no `/onboarding` redirect, no `OnboardingIntro` DOM.
4. Manual click of every former Welcome CTA on the marketing page → goes to `/auth`.
5. Confirm `LegacyMountGuard` warns if anything still tries to mount `OnboardingFlow`.

## Out of scope
- Hebrew copy in `i18n/translations/he.ts` (data, not a mount).
- DomainAssess "ברוכים הבאים לסריקת…" pillar scan intros (that's the assessment system, not onboarding).
- `SoulAvatarMintWizard` (a different gated flow, kept).
