

# Mind OS Launch Audit — Critical Path Analysis

## TASK 1: Canonical New User Flow Map

### Screens (in order)

1. **`/go` or `/`** — Landing (Go splash or Index homepage)
2. **`/onboarding`** — OnboardingIntro (splash + name/gender/age)
3. **`/onboarding`** — OnboardingFlow (16-step micro-flow calibration)
4. **`/onboarding`** — OnboardingReveal (diagnostics + Week 1 Protocol + upsell)
5. **`/dashboard`** — UserDashboard (gated: shows calibration CTA if not onboarded, otherwise full dashboard)

### Modals Involved

- **AuthModal** — triggered by `ProtectedRoute` when unauthenticated user hits a protected route
- **SubscriptionsModal** — global overlay, opened by upgrade prompts
- **UpgradePromptModal** — feature-specific upsell (hypnosis, projects)

### Contexts Involved

- `AuthProvider` (session state)
- `GameStateProvider` (XP, tokens, streak)
- `LanguageProvider` (HE/EN)
- `AuthModalProvider` (auth modal state)
- `SubscriptionsModalProvider` (upgrade modal state)
- `AuroraChatProvider` (AI chat context)
- `CoachesModalProvider`

### Friction / Ambiguity Points

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| F1 | **Onboarding is NOT protected** — `/onboarding` route has no `ProtectedRoute` wrapper. An anonymous user completes the entire 16-step flow, reaches Reveal, then the "Start Free" button calls `handleEnterSystem()` which requires `user.id`. If not logged in, it silently fails (`if (!user?.id) return`). The user sees nothing happen. No auth modal, no redirect, no error. | `OnboardingReveal.tsx:286`, `App.tsx:199` | **CRITICAL** |
| F2 | **Upgrade button on Reveal opens Stripe checkout without auth** — The "Upgrade Now" button calls `create-checkout-session` edge function. If user is anonymous, this will fail silently (the catch block is empty — just `// fall through to free`). User clicks upgrade, nothing visible happens. | `OnboardingReveal.tsx:503-512` | **HIGH** |
| F3 | **OnboardingReveal navigates to `/today` which redirects to `/dashboard`** — `navigate('/today', { replace: true })` is used after completion, but `/today` is a redirect route (`<Route path="/today" element={<Navigate to="/dashboard" replace />} />`). This works but adds an unnecessary redirect hop. | `OnboardingReveal.tsx:345`, `App.tsx:346` | LOW |
| F4 | **No subscription choice screen exists in the flow** — The funnel described (onboarding -> subscription choice -> signup) does not exist as a distinct screen. The only subscription touchpoint is an inline upsell card on the Reveal page. There is no dedicated "choose your plan" step between onboarding and dashboard. | Architecture gap | **MEDIUM** |
| F5 | **Stripe checkout opens in `_blank` tab** — Both SubscriptionsModal and OnboardingReveal use `window.open(data.url, '_blank')`. User completes payment in a different tab, then has to manually return. There is no webhook-driven redirect back to the app, and no post-payment landing page in the flow. | `SubscriptionsModal.tsx:90`, `OnboardingReveal.tsx:509` | **HIGH** |
| F6 | **`/success` route exists but is unreferenced in the onboarding/checkout flow** — The Success page is defined but never linked from Stripe checkout return URLs or post-payment redirects. | `App.tsx:644-650` | MEDIUM |

---

## TASK 2: Daily Loop Integrity

### Daily Loop Path

```text
/dashboard (UserDashboard)
  -> MobileHeroGrid
    -> StartSessionButton (hypnosis CTA, Pro-gated)
    -> MotivationalBanner
    -> DailyRoadmap (unified timeline)
    -> RecalibrationSummary
```

### DailyRoadmap Data Sources

The `DailyRoadmap` component merges 4 data sources into one timeline:

| Source | Hook | Table | Type |
|--------|------|-------|------|
| Daily Pulse check-in | `useDailyPulse()` | `daily_pulse_logs` | Separate system |
| Habits | `useTodaysHabits()` | `action_items` (type=habit) + `daily_habit_logs` | Hybrid |
| Tasks | Direct query in DailyRoadmap | `action_items` (type=task) | Unified |
| Milestones | `useLifePlanWithMilestones()` | `life_plan_milestones` | **Separate table** |

### Identified Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| D1 | **Habits use a DUAL tracking system** — `useTodaysHabits` fetches habits from `action_items` but tracks daily completion in `daily_habit_logs` (a separate table). The `action_items` trigger `handle_action_item_completion` that awards XP is never hit for habits because status on the `action_items` row is never toggled to 'done'. Habit completion does NOT award XP. | `useTodaysHabits.ts:60-93` | **HIGH** |
| D2 | **Milestones come from `life_plan_milestones`, not `action_items`** — Despite the unified `action_items` model, the DailyRoadmap reads current milestone from `useLifePlanWithMilestones()` which queries `life_plan_milestones` directly. The milestone type in `action_items` is unused in the daily loop. | `DailyRoadmap.tsx:36, 76-84` | MEDIUM |
| D3 | **Task completion sets status to 'pending' instead of 'todo'** — `DailyRoadmap.tsx:99` sets `status: newDone ? 'done' : 'pending'` but the `ActionItemStatus` type only defines `'todo' | 'doing' | 'done' | 'skipped'`. There is no 'pending' status. Un-checking a task sets it to an invalid status. | `DailyRoadmap.tsx:99` | **HIGH** |
| D4 | **DailyRoadmap tasks have no date filter** — It queries ALL non-archived tasks (up to 10), regardless of `due_at`. There is no filtering for "today" — it just shows the first 10 tasks by `order_index`. This means old tasks appear forever until manually archived. | `DailyRoadmap.tsx:38-52` | MEDIUM |
| D5 | **Streak is read-only in the daily loop** — `useStreak()` reads `sessionStreak` from `game_state` but there is no mechanism in the daily task completion flow that increments the streak. Streak appears to only update via `GameStateContext` when the dashboard loads. | `useGameState.ts:43-55` | MEDIUM |
| D6 | **`/aurora` route does not exist** — Multiple components navigate to `/aurora` (UserDashboard, NextActionBanner, TodaysHabitsCard) but there is no `<Route path="/aurora">` in App.tsx. This results in a 404 page. | `App.tsx` (missing), `UserDashboard.tsx:108` | **CRITICAL** |

---

## TASK 3: Fake Door Scan

### Buttons/Tabs Leading to Empty or Broken States

| # | Element | Destination | Problem |
|---|---------|-------------|---------|
| FD1 | **Business tab** (bottom nav) | `/business` | Marked `comingSoon: true`, entire page is a "COMING SOON" watermark overlay. Clickable on desktop nav but blocked on mobile. | 
| FD2 | **"Add" habits button** | `navigate('/aurora')` | No `/aurora` route — 404. |
| FD3 | **"Open Aurora" / chat CTA** | `navigate('/aurora')` | No `/aurora` route — 404. |
| FD4 | **Multiple `navigate('/launchpad')` calls** (11 files, 20+ references) | `/launchpad` | Route exists but redirects to `/onboarding`. Components like `VerticalRoadmap`, `NextActionBanner`, `PlanProgressCard` navigate to `/launchpad` expecting the old multi-step flow, but get the new micro-flow onboarding instead. For already-onboarded users, this restarts the intake. |
| FD5 | **`navigate('/today')`** (4 files) | `/today` | Redirects to `/dashboard`. Not broken, but inconsistent — code navigates to a deprecated alias. |

### Routes Defined But Unreachable from Navigation

| Route | Status |
|-------|--------|
| `/dev/orb-gallery` | Dev-only, no nav link |
| `/launchpad/complete` | Protected, navigated to by legacy code only; the new onboarding flow goes directly to `/today` |
| `/quests` | Redirects to `/onboarding` |
| `/quests/:pillar` | Protected, no nav entry; accessible only if user knows the URL |
| `/success` | Protected, no links from checkout flow |
| `/form/:token` | Public, but requires direct link |
| `/audio/:token`, `/video/:token` | Public, token-gated media players |

### Multiple Routes Rendering Same Content

| Routes | Target |
|--------|--------|
| `/today`, `/plan`, `/me` | All redirect to `/dashboard` |
| `/launchpad` | Redirects to `/onboarding` |
| `/admin`, `/admin/*` | Redirect to `/admin-hub` |
| 20+ `/panel/*` routes | All redirect to `/admin-hub` with query params |

---

## TOP 10 LAUNCH BLOCKERS (Ranked by Impact)

| Rank | Blocker | Category | Impact |
|------|---------|----------|--------|
| **1** | **Anonymous user completes onboarding, clicks "Start Free" — nothing happens.** No auth gate, no modal, silent failure. The entire conversion funnel is broken for new users. | Funnel break | CRITICAL |
| **2** | **`/aurora` route does not exist** — Multiple CTAs navigate to a 404. Users cannot access the AI chat from the dashboard. | Dead link | CRITICAL |
| **3** | **Stripe checkout opens in new tab with no return path.** No success URL configured in the flow, `/success` page exists but is unreferenced. Paid users have no way back into the app after payment. | Payment flow | HIGH |
| **4** | **Habit completion does not award XP.** The dual `daily_habit_logs` system bypasses the `action_items` trigger. Users complete habits daily but never see XP rewards from them. | Gamification broken | HIGH |
| **5** | **Task un-check sets invalid status `'pending'`** instead of `'todo'`. This creates orphan records that don't match any query filter. | Data integrity | HIGH |
| **6** | **11 files navigate to `/launchpad`** expecting old flow. For onboarded users, this restarts the intake questionnaire — destructive UX. | Navigation confusion | HIGH |
| **7** | **Upgrade button on Reveal page fails silently** for anonymous users (empty catch block). User sees the price, clicks, nothing happens. | Conversion leak | HIGH |
| **8** | **No subscription choice screen** in the canonical flow. The only upsell is an inline card buried at the bottom of the Reveal page. | Funnel gap | MEDIUM |
| **9** | **DailyRoadmap shows all tasks regardless of date.** No "today" filter means stale tasks accumulate and overwhelm the timeline. | UX clutter | MEDIUM |
| **10** | **Business tab is a clickable fake door** on desktop (comingSoon only blocks mobile nav). | Trust erosion | LOW |

---

## TIGHTEN PLAN (Numbered Steps)

### Step 1: Gate the Reveal CTA for anonymous users
- **Files:** `src/components/onboarding/OnboardingReveal.tsx`
- **Change:** In `handleEnterSystem()`, if `!user?.id`, open the AuthModal (import from AuthModalContext) instead of silently returning. After successful auth, re-trigger the save.
- **Risk:** LOW — additive logic, no existing behavior changes for authenticated users.

### Step 2: Gate the Reveal upgrade button for anonymous users
- **Files:** `src/components/onboarding/OnboardingReveal.tsx`
- **Change:** In the upgrade button's onClick, check `user?.id` first. If missing, open AuthModal. Replace empty catch block with a toast error.
- **Risk:** LOW

### Step 3: Add `/aurora` route pointing to Messages AI thread
- **Files:** `src/App.tsx`
- **Change:** Add `<Route path="/aurora" element={<Navigate to="/messages/ai" replace />} />` in the public routes section (or wrap in ProtectedRoute if needed).
- **Risk:** LOW — single line addition.

### Step 4: Fix task un-check status from 'pending' to 'todo'
- **Files:** `src/components/dashboard/DailyRoadmap.tsx` (line 99)
- **Change:** Replace `status: newDone ? 'done' : 'pending'` with `status: newDone ? 'done' : 'todo'`.
- **Risk:** LOW — single word change.

### Step 5: Replace all `navigate('/launchpad')` with appropriate targets
- **Files:** 11 files (listed in search results)
- **Change:** For authenticated/onboarded users, these should navigate to `/dashboard` (not restart onboarding). For un-onboarded users, navigate to `/onboarding`. Use `useLaunchpadProgress` to decide.
- **Risk:** MEDIUM — touches many files, needs per-call context analysis.

### Step 6: Make habit completion award XP via action_items
- **Files:** `src/hooks/useTodaysHabits.ts`
- **Change:** When toggling a habit to completed, also update the `action_items` row status to `'done'` (which triggers XP via the DB trigger). When uncompleting, set it back to `'todo'`.
- **Risk:** MEDIUM — must ensure the DB trigger handles repeated done/todo cycles without double-awarding.

### Step 7: Add date filter to DailyRoadmap tasks query
- **Files:** `src/components/dashboard/DailyRoadmap.tsx`
- **Change:** Add `.or('due_at.is.null,due_at.lte.${todayEnd}')` to the task query, and filter out completed tasks older than today.
- **Risk:** LOW

### Step 8: Configure Stripe checkout success/cancel URLs
- **Files:** `supabase/functions/create-checkout-session/index.ts`
- **Change:** Set `success_url` to `${origin}/success?session_id={CHECKOUT_SESSION_ID}` and `cancel_url` to `${origin}/dashboard`. Update the Success page to handle the session_id and verify payment.
- **Risk:** MEDIUM — requires edge function update and Success page logic.

### Step 9: Replace all `navigate('/today')` with `navigate('/dashboard')`
- **Files:** `OnboardingReveal.tsx`, `LaunchpadComplete.tsx`, `ActivationFlow.tsx`, `LaunchpadFlow.tsx`, `AuthModal.tsx`
- **Change:** Direct navigation to canonical route instead of alias.
- **Risk:** LOW — cosmetic, but eliminates redirect hops.

### Step 10: Disable Business tab click on desktop
- **Files:** `src/navigation/osNav.ts` or the TopNavBar component
- **Change:** Apply the same `comingSoon` gate that BottomTabBar uses to the desktop TopNavBar.
- **Risk:** LOW
