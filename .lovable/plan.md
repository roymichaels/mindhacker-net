

# Add Analysis & Summary Modal Buttons to Profile Page

## Problem
The Consciousness hub page (`/consciousness`) has 8 tool buttons that open detailed analysis modals (AI Analysis, 90-Day Plan, Consciousness Map, Identity Card, Character Traits, Behavioral Insights, Commitments, Anchors). These modals already exist in `DashboardModals.tsx` and work correctly. However, the **Me/Profile page** (`/me`) only shows static summary cards with no way to access these deep-dive modals. Since the dashboard was simplified to a "stats-first" layout, users lost easy access to these analysis views.

## Solution
Add a "My Insights" tools grid to `ProfileContent.tsx` that reuses the existing `DashboardModals` -- the same pattern used in `Consciousness.tsx`. No new components needed.

## Changes

### File: `src/components/dashboard/ProfileContent.tsx`

1. **Import** the modal components from `DashboardModals.tsx`:
   - `AIAnalysisModal`, `LifePlanModal`, `ConsciousnessModal`, `BehavioralModal`, `IdentityModal`, `TraitsModal`, `CommitmentsModal`, `AnchorsModal`

2. **Add state** for `activeModal` (same pattern as Consciousness.tsx):
   ```
   type ModalType = 'ai' | 'plan' | 'consciousness' | 'behavioral' | 'identity' | 'traits' | 'commitments' | 'anchors' | null;
   const [activeModal, setActiveModal] = useState<ModalType>(null);
   ```

3. **Add a tools grid section** after the existing "Transformation" section and before the "Action Buttons" section. Each tool is a compact button/card with icon + label that sets `activeModal`. The 8 tools:
   - AI Analysis (Brain icon)
   - 90-Day Plan (Calendar icon)
   - Consciousness Map (Sparkles icon)
   - Identity Card (UserCircle icon)
   - Character Traits (Heart icon)
   - Behavioral Insights (Activity icon)
   - Commitments (Target icon)
   - Anchors (Anchor icon)

4. **Render all modals** at the bottom of the component, passing the same props from `dashboardData` (values, principles, selfConcepts, identityTitle, activeCommitments, dailyAnchors) -- identical to how `Consciousness.tsx` does it.

### Visual Design
The tools grid will use the existing `GlassCard` sub-component style with a 2x4 or responsive grid of compact icon+label buttons, keeping the profile page's glassmorphism aesthetic consistent.

### No other files need changes
- `DashboardModals.tsx` -- already has all modals, no changes
- `MeTab.tsx` -- no changes, it just renders `ProfileContent`
- No new files created

