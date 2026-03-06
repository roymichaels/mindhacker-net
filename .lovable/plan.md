

## Unified Character Profile Modal

### Problem
The bottom HUD bar currently has 4 separate buttons (Traits, Insights, Direction, Identity) that each open independent modals. This fragments the character's data across 4 surfaces. The user wants a single "Profile" button that opens one RPG-style character sheet containing everything.

### Architecture

**Replace:** 4 buttons → 1 "Profile" button
**Replace:** 4 separate modals (MergedIdentityModal, MergedDirectionModal, MergedInsightsModal, SkillsModal) → 1 `CharacterProfileModal`

### Structure of CharacterProfileModal

```text
┌──────────────────────────────┐
│  HEADER: Character Identity  │
│  ┌─────┐                     │
│  │ ORB │  Name / Title       │
│  └─────┘  Archetype Badge    │
│  Lv.12  🔥7  ⚡340           │
│  ━━━━━━━━━ XP Bar ━━━━━━━━━  │
│  היום | שבוע | חודש streaks   │
├──────────────────────────────┤
│  STAT WHEEL (pillar scores)  │
│  תודעה 70  בריאות 65  ...    │
│  (circular badges, tappable) │
├──────────────────────────────┤
│ ┌────────┬────────┬────────┐ │
│ │Profile │ Traits │Insights│ │
│ │        │        │Direction│
│ └────────┴────────┴────────┘ │
│  [TAB CONTENT]               │
│                              │
└──────────────────────────────┘
```

### File Changes

**1. Create `src/components/modals/CharacterProfileModal.tsx`** (new file)
- Full-screen modal (z-[9999], 100% opaque, `role="dialog"`)
- **Header section**: PersonalizedOrb (64px), identity title, archetype, level/tokens/streak badges, XP bar, streak indicators (today/week/month)
- **Stat wheel**: Compact row of pillar score circles from launchpad assessment data (consciousness, health, energy, etc.) — tappable to expand
- **4 internal tabs**: Profile | Traits | Realizations | Direction
  - **Profile tab**: Identity card (archetype breakdown, values as chips, principles, self-concepts, career, habits) — content from current MergedIdentityModal + ProfileContent
  - **Traits tab**: Existing TraitGalleryView grid from SkillsModal with detail drill-down
  - **Realizations tab**: AI analysis, consciousness score, diagnostics, behavioral insights — content from current MergedInsightsModal, rendered as compact timeline cards with expandable details and tags
  - **Direction tab**: Commitments + anchors + career path + strategic goals — content from current MergedDirectionModal, compressed into chip/tag format

**2. Update `src/components/navigation/BottomHudBar.tsx`**
- Replace the 4 quick-action buttons with a single "Profile" button (UserCircle icon)
- Remove imports for MergedIdentityModal, MergedDirectionModal, MergedInsightsModal, SkillsModal
- Import and render CharacterProfileModal instead
- Keep OrbDNAModal for orb click

**3. Update `src/components/dashboard/ProfileContent.tsx`**
- Remove the MergedModals that were also rendered here (they'll live only inside CharacterProfileModal now)

**4. Keep existing files intact** (MergedModals.tsx, SkillsModal.tsx)
- These files stay as-is for potential reuse, but are no longer rendered from BottomHudBar or ProfileContent
- Their sub-components (TraitGalleryView, ConsciousnessCard, etc.) are imported directly into CharacterProfileModal

### Gamification Touches
- Aura gradient glow around the orb based on profile colors
- Trait cards show pillar-colored glow (already exists)
- Archetype icon next to name in header
- Stat wheel uses color-coded circular badges with score numbers

### Community Ready
- CharacterProfileModal accepts an optional `userId` prop
- When viewing another user: hide Realizations tab content (private), show only public traits/archetype/stats/achievements
- Owner view shows everything

### Technical Details
- Uses existing hooks: `useUnifiedDashboard`, `useOrbProfile`, `useXpProgress`, `useStreak`, `useEnergy`, `useTraitGallery`, `useTraitDetail`
- Reuses existing sub-components: `IdentityProfileCard`, `TraitsCard`, `CommitmentsCard`, `DailyAnchorsDisplay`, `ConsciousnessCard`, `BehavioralInsightsCard`, `AIAnalysisDisplay`
- Full-viewport overlay per modal standard (memory: `ui/modal-chat-integration-standard`)
- RTL/LTR support throughout

