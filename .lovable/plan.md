

# Wireframe and Component Audit Report

## STEP 1 -- REQUIRED WIREFRAMES (Contract)

### 1. App Shell / Layout
- **Route/entry**: Wraps `/today`, `/plan`, `/me` via `DashboardLayout`
- **Purpose**: Provides the responsive shell with navigation, dock, and content area
- **Must-contain**: TopNavBar (desktop), BottomTabBar (mobile), AuroraDock, SettingsModal trigger, HypnosisModal trigger, main content slot
- **Critical states**: RTL/LTR, mobile/desktop responsive switch

### 2. Dashboard / Home (Today Tab)
- **Route**: `/today` (protected)
- **Purpose**: Daily action focus -- habits, checklists, next action
- **Must-contain**: DashboardBannerSlider, NextActionBanner, TodaysHabitsCard, ChecklistsCard, HypnosisModal
- **Critical states**: Loading (launchpad check), empty habits, auth gate via ProtectedRoute

### 3. Dock / Orb Collapsed State
- **Route/entry**: Rendered inside DashboardLayout via `AuroraDock`
- **Purpose**: Persistent Aurora access point showing orb icon + "Aurora" label
- **Must-contain**: AuroraOrbIcon, expand/collapse toggle, streaming indicator dot, bug report icon (hidden when collapsed)
- **Critical states**: Collapsed (default), streaming pulse indicator

### 4. Docked Chat Expanded State
- **Route/entry**: AuroraDock expanded state (toggle)
- **Purpose**: Show recent chat bubbles inline above the input
- **Must-contain**: AuroraChatBubbles (animated height), collapse toggle, bug report button
- **Critical states**: Animating open/close, streaming content, empty conversation

### 5. Global Chat Input
- **Route/entry**: Always visible inside AuroraDock
- **Purpose**: Text/voice/image input for Aurora AI
- **Must-contain**: Textarea, send button, voice recording button, image attach menu (+), upgrade prompt modal, subscription gate check
- **Critical states**: Streaming (disabled), transcribing, image preview, free-tier limit reached

### 6. Chat Thread / Conversation View (Full Aurora)
- **Route**: Was `/aurora` -- now removed from routes (comment: "Aurora route removed - chat is globally docked")
- **Purpose**: Full-page chat experience with Aurora AI
- **Must-contain**: AuroraChatArea, conversation history, launchpad gating
- **Critical states**: Loading, launchpad incomplete (shows LaunchpadIntro/LaunchpadFlow), full chat mode
- **STATUS**: Page file exists (`src/pages/Aurora.tsx` + `AuroraLayout.tsx`) but route is **removed** from App.tsx. Chat is now dock-only.

### 7. Settings (Profile + Preferences)
- **Route/entry**: Modal triggered from gear icon on MeTab, or from AppNameDropdown/HeaderActions
- **Purpose**: Manage profile, Aurora preferences, appearance, account
- **Must-contain**: Tabbed modal (Profile, Aurora Preferences, Appearance, Account), save with change detection
- **Critical states**: Loading profile data, saving, validation errors

### 8. Profile / Me Tab
- **Route**: `/me` (protected, wrapped in DashboardLayout)
- **Purpose**: Identity card -- level, tokens, streak, values, traits, life direction
- **Must-contain**: ProfileContent (inline), Settings gear icon, SettingsModal
- **Critical states**: Loading profile, no data yet (fresh user), regenerating AI analysis

### 9. Auth (Sign In / Sign Up)
- **Route**: `/login`, `/signup`
- **Purpose**: Email/password authentication
- **Must-contain**: Email + password form, validation, redirect handling, link to opposite form
- **Critical states**: Loading, validation errors, redirect after auth

### 10. Subscription / Paywall Gating
- **Route**: `/subscriptions` (public page), inline gating via `useSubscriptionGate`
- **Purpose**: Pro upgrade flow + feature gating
- **Must-contain**: Plan cards, checkout flow, UpgradePromptModal, ProGateOverlay
- **Critical states**: Loading subscription status, already Pro, checkout in progress
- **Inline gating used in**: GlobalChatInput, AuroraChatInput, PlanTab, HypnosisModal

### 11. Onboarding (Launchpad)
- **Route**: `/launchpad`, `/launchpad/complete`, plus inline in AuroraLayout
- **Purpose**: Consciousness journey onboarding flow
- **Must-contain**: LaunchpadIntro, LaunchpadFlow, LaunchpadComplete, step progression
- **Critical states**: Loading progress, mid-flow, complete, skip

### 12. Notifications / Toast System
- **Entry**: Global -- mounted in App.tsx
- **Purpose**: User feedback for actions
- **Must-contain**: Toaster (radix), Sonner, NotificationPermissionPrompt, PWAInstallBanner
- **Critical states**: Permission prompt, toast queue

### 13. Error / Not Found Boundary
- **Route**: `*` catch-all for NotFound, ErrorBoundary wraps entire app
- **Purpose**: Graceful error handling
- **Must-contain**: 404 page with home/courses navigation, ErrorBoundary with reload/go-home buttons
- **Critical states**: 404, runtime error with error ID

### 14. Plan Tab
- **Route**: `/plan` (protected, DashboardLayout)
- **Purpose**: 90-day progress, life analysis, pillar navigation
- **Must-contain**: PlanProgressHero, LifeAnalysisChart, ProGateOverlay (if not Pro)
- **Critical states**: Loading, gated (non-Pro), pillar data loaded

---

## STEP 2 -- INVENTORY (Repo Truth)

| # | Wireframe | Status | Evidence (files + mount) |
|---|-----------|--------|--------------------------|
| 1 | App Shell | EXISTS | `DashboardLayout.tsx` wraps `/today`, `/plan`, `/me` in App.tsx routes. Contains `TopNavBar`, `BottomTabBar`, `AuroraDock`, `SettingsModal`, `HypnosisModal` |
| 2 | Today Tab | EXISTS | `src/pages/TodayTab.tsx` at `/today`, inside DashboardLayout |
| 3 | Dock Collapsed | EXISTS | `src/components/aurora/AuroraDock.tsx`, rendered in DashboardLayout. Has orb icon, collapse toggle, streaming dot |
| 4 | Dock Expanded | EXISTS | Same file, AnimatePresence toggle shows `AuroraChatBubbles` |
| 5 | Global Chat Input | EXISTS | `src/components/dashboard/GlobalChatInput.tsx`, rendered inside AuroraDock always |
| 6 | Full Aurora Chat | ORPHANED | `src/pages/Aurora.tsx` + `src/components/aurora/AuroraLayout.tsx` exist but route is **commented out** in App.tsx. No route mounts them. |
| 7 | Settings | EXISTS | `src/components/settings/SettingsModal.tsx` with tabs in `src/components/settings/tabs/`. Triggered from MeTab gear icon + AppNameDropdown + HeaderActions |
| 8 | Me Tab | EXISTS | `src/pages/MeTab.tsx` at `/me`. Renders ProfileContent inline + SettingsModal |
| 9 | Auth | EXISTS | `src/pages/Login.tsx` at `/login`, `src/pages/SignUp.tsx` at `/signup`, `ProtectedRoute.tsx` guards all dashboard routes |
| 10 | Subscription Gate | EXISTS | `src/hooks/useSubscriptionGate.ts`, `src/pages/Subscriptions.tsx` at `/subscriptions`, `UpgradePromptModal`, `ProGateOverlay` |
| 11 | Onboarding | EXISTS | `src/components/launchpad/` (LaunchpadIntro, LaunchpadFlow), `src/pages/Launchpad.tsx` at `/launchpad`, `src/pages/LaunchpadComplete.tsx` at `/launchpad/complete`, inline gating in AuroraLayout |
| 12 | Toasts/Notifications | EXISTS | `Toaster` + `Sonner` in App.tsx, `NotificationPermissionPrompt`, `PWAInstallBanner`, `CookieConsent` all mounted globally |
| 13 | Error/NotFound | EXISTS | `src/components/ErrorBoundary.tsx` wraps App root, `src/pages/NotFound.tsx` at `*` catch-all |
| 14 | Plan Tab | EXISTS | `src/pages/PlanTab.tsx` at `/plan`, with ProGateOverlay |

---

## STEP 3 -- FINDINGS and PLAN

### Nothing needs to be created.

All 14 required wireframes exist in the codebase with their must-contain blocks present.

### One wiring issue detected:

**Aurora full-page chat is orphaned.** `src/pages/Aurora.tsx` and `src/components/aurora/AuroraLayout.tsx` exist but no route in App.tsx points to them (the comment says "Aurora route removed - chat is globally docked"). This is **intentional by design** -- the chat is now dock-only. These files are dead code but harmless. The `JourneyChatDock.tsx` component also exists for journey pages and self-wraps with `AuroraChatProvider` if needed.

### Recommendation: No action required

| Item | Action |
|------|--------|
| All 14 wireframes | Verified present and wired |
| Aurora.tsx / AuroraLayout.tsx | Dead code (intentional). Optional cleanup -- delete if desired, no functional impact |
| JourneyChatDock.tsx | Used by journey pages, correctly self-contained with provider detection |
| All navigation (3 tabs + dock) | Correctly wired in both mobile and desktop |
| Subscription gating | Applied in 4 locations (chat input, plan tab, hypnosis, chat input legacy) |
| Auth gating | All dashboard routes wrapped in ProtectedRoute |

**Verdict: Create Nothing. Everything exists and is wired correctly.**

