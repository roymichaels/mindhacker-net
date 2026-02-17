

# Energy Economy Implementation Plan

## Overview
Replace the current hollow "Tokens" system with a fully functional "Energy" economy. Energy is earned through gameplay and spent on premium features (Hypnosis, Onboarding Re-evaluation, Aurora messages beyond free quota).

## Phase 1: Rename + Foundation

### 1.1 Database Migration
- Create `energy_events` ledger table (id, user_id, change, balance_after, source, reason, idempotency_key, created_at) with RLS policies
- No new column needed -- reuse existing `profiles.tokens` as the energy balance (avoids data migration complexity)
- Add unique constraint on `energy_events.idempotency_key`

### 1.2 Database RPCs
- `spend_energy(p_user_id, p_amount, p_source, p_reason, p_idempotency_key)` -- atomic check-and-deduct, returns `{success, new_balance}` or fails if insufficient
- `award_energy(p_user_id, p_amount, p_source, p_reason, p_idempotency_key)` -- adds energy, logs event, returns `{new_balance}`
- Update `award_unified_xp` level-up bonus to call `award_energy` instead of raw UPDATE (maintains ledger trail)

### 1.3 Frontend Rename (Tokens -> Energy)
**Files to update:**
- `src/hooks/useGameState.ts` -- rename `useTokens` export to `useEnergy`, keep `useTokens` as alias for backwards compat
- `src/contexts/GameStateContext.tsx` -- rename `spendTokens`/`addTokens` to `spendEnergy`/`addEnergy`, update to call new RPCs
- `src/lib/feedback.ts` -- rename `showTokensEarned` to `showEnergyEarned`, update toast text to "Energy" / "אנרגיה"
- `src/components/gamification/TokenBalance.tsx` -- rename to `EnergyBalance.tsx`, swap Coins icon to Zap/Battery
- `src/components/dashboard/MobileHeroGrid.tsx` -- update Gem icon to Zap, label from tokens to Energy
- `src/components/dashboard/unified/CharacterHUD.tsx` -- same icon/label swap
- `src/components/dashboard/unified/SidebarCharacterHUD.tsx` -- same
- `src/components/gamification/GameStatsCard.tsx` -- update TokenBalance reference
- `src/i18n/translations/en.ts` -- all `tokens` keys become `energy` ("Energy")
- `src/i18n/translations/he.ts` -- all `טוקנים` become `אנרגיה`
- `src/pages/LaunchpadComplete.tsx` -- update reward label
- `src/lib/achievements.ts` -- rename `tokens` field to `energy` in achievement definitions

### 1.4 Tooltip
- Add a small info tooltip next to the Energy badge in the HUD explaining: "Energy is used for Hypnosis sessions, Re-evaluations, and premium Aurora messages"

---

## Phase 2: Spend Gates

### 2.1 Energy Cost Configuration
Create a simple config object in `src/lib/energyCosts.ts`:
```text
HYPNOSIS_STANDARD = 5
ONBOARDING_RERUN  = 15
AURORA_MESSAGE     = 2
```

### 2.2 Hypnosis Session Gate
- Before starting a session in the hypnosis flow, check `canAfford(HYPNOSIS_STANDARD)`
- If yes: show spend confirmation modal ("This session costs 5 Energy. Your balance: X. Proceed?")
- If no: show "Not enough Energy" modal with earn tips
- On confirm: call `spend_energy` RPC, then proceed to session
- Log in `energy_events` with source `hypnosis`

### 2.3 Onboarding Re-evaluation Gate
- Add a "Re-evaluate" button in the appropriate settings/profile area
- On click: check `canAfford(15)`, show confirmation, call `spend_energy`, then trigger re-evaluation flow

### 2.4 Aurora Premium Message Gate
- Modify `useSubscriptionGate` and chat input components
- For free-tier users who exhaust daily free messages (currently 5): instead of blocking, offer to spend 2 Energy per message
- Flow: "You've used your free messages. Spend 2 Energy to continue?" -> call `spend_energy` -> send message
- Pro users: unlimited, no energy cost

### 2.5 Spend Confirmation Modal
- Create reusable `EnergySpendModal` component
- Props: `cost`, `source`, `onConfirm`, `onCancel`
- Shows current balance, cost, remaining after spend
- "Not enough" variant with earn suggestions

### 2.6 Low Energy Toast
- When balance drops below 5, show a subtle toast: "Energy running low! Complete tasks to earn more."

---

## Phase 3: Earning Hooks

### 3.1 Update Existing Award Points
- `award_unified_xp` level-up: change raw `tokens` UPDATE to call `award_energy` RPC (maintains ledger)
- Streak milestone bonuses: same -- route through `award_energy`
- Action item completion trigger (`handle_action_item_completion`): route `token_reward` through `award_energy`
- Achievement unlocks: route `tokens` awards through `addEnergy` frontend method

### 3.2 Aurora Task Completion
- When Aurora assigns a task and it's completed (action_items status -> done), award energy via the existing `token_reward` column (already in place)
- Ensure Aurora-generated tasks have `token_reward` set (default 2-5 energy)

---

## Phase 4: Polish

### 4.1 Energy History
- Add an "Energy History" section in profile/settings that queries `energy_events` and shows a timeline of earnings and spends

### 4.2 Analytics Events
- Track `energy_awarded` and `energy_spent` via the existing analytics system

### 4.3 Safety Net
- 1 free hypnosis session per week for free-tier users (configurable), tracked via a simple date check

---

## Technical Details

### New DB Table: `energy_events`
```text
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id       UUID NOT NULL REFERENCES profiles(id)
change        INTEGER NOT NULL (positive = earn, negative = spend)
balance_after INTEGER NOT NULL
source        TEXT NOT NULL
reason        TEXT
idempotency_key TEXT UNIQUE
created_at    TIMESTAMPTZ DEFAULT now()
```
RLS: Users can only read their own events. Inserts only via RPC (security definer).

### New RPCs
- `spend_energy`: SELECT FOR UPDATE on profiles, check balance >= amount, deduct, insert into energy_events, return result
- `award_energy`: UPDATE profiles, insert into energy_events, return result
- Both use idempotency keys to prevent duplicates

### New Frontend Components
- `src/lib/energyCosts.ts` -- cost constants
- `src/components/energy/EnergySpendModal.tsx` -- reusable spend confirmation
- `src/components/energy/EnergyBalance.tsx` -- renamed from TokenBalance
- `src/hooks/useEnergy.ts` -- clean hook wrapping the context

### Files Modified (summary)
- ~15 frontend files for rename (tokens -> energy)
- 2 translation files
- GameStateContext (core logic update to use RPCs)
- 2-3 chat input components (Aurora message gate)
- Hypnosis session start flow
- feedback.ts (toast messages)

### Estimated Scope
- Phase 1: DB migration + ~15 file renames
- Phase 2: 1 new modal component + 3-4 gate integrations
- Phase 3: Update 3-4 DB triggers/functions
- Phase 4: 1 history component + analytics hooks

