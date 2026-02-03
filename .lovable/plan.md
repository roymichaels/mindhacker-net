
# Translation & RTL/LTR Standardization Plan

## Overview
This plan addresses two interconnected issues:
1. **Incomplete translations**: Many components use inline `isHebrew ? 'text' : 'text'` or `language === 'he' ? 'text' : 'text'` patterns instead of the centralized `t()` function
2. **RTL/LTR inconsistencies**: Hardcoded directional CSS classes (`ml-`, `mr-`, `left-`, `right-`) instead of logical properties (`ms-`, `me-`, `start-`, `end-`)

---

## Scope Analysis

### Files with Inline Translations (Priority Order)

| Category | Files | Hardcoded Strings |
|----------|-------|-------------------|
| **Panel Pages** | UserDashboardView.tsx | ~60+ strings |
| **Gamification** | GameStatsCard.tsx, IdentityDisplay.tsx | ~15 strings |
| **Dashboard** | UnifiedDashboardView.tsx | ~12 strings |
| **Launchpad** | FinalNotesStep.tsx, summary components | ~25 strings |
| **Hypnosis** | HypnosisModal.tsx | ~20 strings |
| **Sidebars** | AdminSidebar.tsx, AffiliateSidebar.tsx | ~5 strings |

### RTL/LTR Issues Found

| Pattern | Occurrences | Fix |
|---------|-------------|-----|
| `ml-` / `mr-` | 881 matches | Replace with `ms-` / `me-` |
| `left-` / `right-` (positioning) | 830 matches | Replace with `start-` / `end-` where applicable |
| `isRTL ? 'ml-2' : 'mr-2'` | ~50 matches | Replace with `me-2` (single class) |

---

## Phase 1: Add Translation Keys

### New Keys for `he.ts` and `en.ts`

```text
panel.userDashboard
├── errorLoadingData
├── level / tokens
├── tabs (overview, analysis, plan, identity, tasks, patterns)
├── journeyStatus / questionnaireComplete / currentStep
├── ninetyDayPlan / milestones
├── tasksTitle / checklists / commitments
├── lifeDirection / clarityScore
├── aiSummary / consciousnessScores / consciousness / clarity / readiness
├── consciousnessAnalysis / identifiedChallenges
├── noAiAnalysis / noNinetyDayPlan
├── weekNumber / identityProfile / identityElements
├── noIdentityProfile / noChecklists / noCommitments
├── energyPatterns / behavioralPatterns / noPatterns

gamification
├── activeEgoState
├── streak / sessions / totalTime

dashboard
├── yourJourneyBegins
├── startTransformationJourney / chatWithAurora
├── level / streak / tokens
├── quickAccess

launchpad
├── finalNotes.title / subtitle / ideasLabel / placeholder
├── optionalSkip / saving / continueToSummary / skip

hypnosis
├── sessionTitle / completeFirst / goBack
├── personalHypnosis / week / duration / minutes
├── startSession / skip / creatingSession
├── sessionComplete / finish

sidebar
├── controlCenter
├── newCampaign
```

---

## Phase 2: Refactor Components

### High Priority Files

#### 1. `src/pages/panel/UserDashboardView.tsx` (~60 strings)
- Replace all `isHebrew ? 'text' : 'text'` with `t('panel.userDashboard.key')`
- This is the largest single file with hardcoded translations

#### 2. `src/components/gamification/GameStatsCard.tsx` (~5 strings)
- Replace: `isHebrew ? 'מצב אגו פעיל' : 'Active Ego State'` → `t('gamification.activeEgoState')`
- Similar for: streak, sessions, totalTime

#### 3. `src/components/gamification/IdentityDisplay.tsx` (~10 strings)
- Identity composition labels and archetype names

#### 4. `src/components/dashboard/UnifiedDashboardView.tsx` (~12 strings)
- Welcome section, quick stats labels

#### 5. `src/components/launchpad/steps/FinalNotesStep.tsx` (~8 strings)
- Header, prompts, button labels

#### 6. `src/components/dashboard/HypnosisModal.tsx` (~20 strings)
- Session flow messages, button labels

#### 7. `src/components/panel/AdminSidebar.tsx` & `AffiliateSidebar.tsx` (~5 strings)
- "Control Center" brand text, "New Campaign" button

---

## Phase 3: RTL/LTR Fixes

### Pattern Replacements

| Before | After | Files Affected |
|--------|-------|----------------|
| `${isRTL ? 'ml-2' : 'mr-2'}` | `me-2` | ~50 files |
| `${isRTL ? 'mr-2' : 'ml-2'}` | `ms-2` | ~30 files |
| `mr-2` (icon before text) | `me-2` | UI components |
| `ml-2` (icon after text) | `ms-2` | UI components |
| `left-3` (input icons) | `start-3` | Form components |
| `right-3` (input icons) | `end-3` | Form components |

### Key Files to Fix

1. **AuthModal.tsx** - Loading spinner positioning
2. **Login.tsx / SignUp.tsx** - Button icon spacing
3. **AdminLogin.tsx** - Spinner positioning
4. **StorefrontHeader.tsx** - Dropdown menu icons
5. **PersonalHypnosisLanding.tsx** - Price and button formatting
6. **Admin pages** (Menu.tsx, Settings.tsx) - Various icons

### Note on Positioning Classes
Some `left-`/`right-` classes are used for absolute positioning decorations (blur circles, overlays) where they represent specific visual positions rather than logical flow. These should NOT be changed.

---

## Implementation Steps

### Step 1: Expand Translation Files
Add ~100 new keys to both `he.ts` and `en.ts` organized under:
- `panel.userDashboard.*`
- `gamification.*`
- `dashboard.welcome.*`
- `launchpad.finalNotes.*`
- `hypnosis.session.*`
- `sidebar.*`

### Step 2: Refactor High-Priority Components
For each component:
1. Ensure import: `const { t, isRTL } = useTranslation();`
2. Replace `isHebrew` conditionals with `t()` calls
3. Keep `isRTL` only for layout direction handling

### Step 3: RTL/LTR Class Standardization
Replace conditional margin/padding patterns:
```tsx
// Before
<Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />

// After
<Loader2 className="h-4 w-4 me-2" />
```

### Step 4: UI Component Updates
Update shared UI components to use logical properties by default:
- `dropdown-menu.tsx` - Use `me-auto` instead of `ml-auto`
- `calendar.tsx` - Use `start-1` / `end-1` for nav buttons

---

## Files to Modify

### Translation Files
1. `src/i18n/translations/he.ts` - Add ~100 new keys
2. `src/i18n/translations/en.ts` - Add corresponding English translations

### Component Refactoring (High Priority)
3. `src/pages/panel/UserDashboardView.tsx`
4. `src/components/gamification/GameStatsCard.tsx`
5. `src/components/gamification/IdentityDisplay.tsx`
6. `src/components/dashboard/UnifiedDashboardView.tsx`
7. `src/components/launchpad/steps/FinalNotesStep.tsx`
8. `src/components/dashboard/HypnosisModal.tsx`
9. `src/components/panel/AdminSidebar.tsx`
10. `src/components/panel/AffiliateSidebar.tsx`

### RTL/LTR Fixes
11. `src/components/AuthModal.tsx`
12. `src/pages/Login.tsx`
13. `src/pages/SignUp.tsx`
14. `src/pages/AdminLogin.tsx`
15. `src/components/storefront/StorefrontHeader.tsx`
16. `src/pages/PersonalHypnosisLanding.tsx`
17. `src/pages/admin/Menu.tsx`
18. `src/pages/admin/Settings.tsx`
19. `src/components/ui/dropdown-menu.tsx`

---

## Benefits

1. **Consistency**: All translations flow through the centralized `t()` function
2. **Maintainability**: Adding languages requires only updating translation files
3. **RTL-Ready**: Logical CSS properties automatically adapt to text direction
4. **Reduced Code**: No more `isRTL ? 'class-a' : 'class-b'` conditionals for spacing
5. **Mobile-First**: Proper RTL support critical for mobile Hebrew users

---

## Estimated Impact

| Metric | Value |
|--------|-------|
| New Translation Keys | ~100 |
| Files Refactored | ~19 |
| RTL Fixes | ~80 class replacements |
| Lines Changed | ~500 |
