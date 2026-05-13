## Goal

1. When a new strategy is generated, the previous active strategy + downstream artifacts are wiped (no leftovers).
2. The composer dock feels like a native iOS app: bigger inputs, taller pill, lifted off the bottom edge.
3. AION can delete/regenerate strategies on user request from chat, with an in-chat approval card before destructive action runs.

---

## 1. Strategy regen always wipes the previous one

**`src/hooks/useStrategyPlans.ts`**
- In `generateStrategy.mutationFn`, always pass `force_regenerate: true` (the edge function already archives plans + deletes `plan_missions`, `action_items`, `life_plan_milestones`, `skills`). Drop the `forceRegenerate` opt-in branch — the new contract is "generate = replace".
- After success, also invalidate `['weekly-tactical-plan']`, `['plan-missions']`, `['skills']`, `['life-plan-milestones']` (already partially invalidated) and clear any cached `plan_data` in `react-query`.

No edge-function change needed — `force_regenerate` already does the SQL wipe (lines 743–752 of `generate-100day-strategy/index.ts`).

---

## 2. Native-feel composer dock

**`src/shellv2/layers/ComposerLayer.tsx`**
- Lift the dock above the bottom edge: replace `bottom-0` with `bottom-[max(env(safe-area-inset-bottom),12px)]` and add horizontal padding `px-3`.
- Add a soft floating background container (`rounded-2xl`, `bg-background/70 backdrop-blur-xl`, `border border-border/40`, subtle shadow) wrapping `<GlobalChatInput />` so it visually floats like an iOS pill bar.

**`src/components/dashboard/GlobalChatInput.tsx`**
- Increase pill height: input row from `h-9` → `h-12`, textarea `maxHeight: 36px` → `120px` with `rows={1}` auto-grow kept. Buttons `h-9 w-9` → `h-11 w-11`, icons `w-4` → `w-5`.
- Bump font `text-sm` → `text-base`, `rounded-lg` → `rounded-xl` on inner controls.
- Increase form vertical padding (`py-2`) so the dock breathes.

Memory rule respected: rounded-2xl floating UI, backdrop-blur, no gradients/shadows beyond subtle.

---

## 3. AION can delete & regenerate strategies (with approval card)

### a) Skill registration in chat orchestrator

**`supabase/functions/aurora-chat/orchestrator.ts`**
- Add two new action tags to the prompt (Hebrew + English sections):
  - `[action:strategy_regenerate]` — "use when user explicitly asks to rebuild / replace / regenerate their 100-day plan"
  - `[action:strategy_delete]` — "use when user explicitly asks to delete / wipe their plan"
- Instruct AION to ALWAYS emit the tag, never run silently. Frontend will show a confirmation card; AION must wait for the user reply before assuming success.

### b) Frontend command handler

**`src/hooks/aurora/useAuroraCommands.tsx`**
- Add `actionCommands.strategy_regenerate` and `strategy_delete`. They dispatch a `window.dispatchEvent(new CustomEvent('aion:strategy-confirm', { detail: { kind: 'regenerate' | 'delete' } }))`.
- Append the new tags to `getAvailableCommands()` doc.

### c) In-chat approval card

New component: **`src/components/aurora/StrategyApprovalCard.tsx`**
- Listens for the `aion:strategy-confirm` event, renders a floating card inside the chat thread (mounted near the chat layer) with:
  - Title: "Replace your 100-day plan?" / "מחיקת התוכנית הנוכחית?"
  - Body explaining: archives current plan + clears all related missions, daily actions, milestones, skills.
  - Buttons: **Confirm** (calls `useStrategyPlans().generateStrategy.mutate({ hub: 'both' })` for regenerate, or a new `deleteAllStrategies` mutation for delete), **Cancel**.
- After confirm/cancel, dispatch `aion:strategy-confirm-result` so AION's next turn (and toast) reflects the outcome.

Mount the card once globally inside `src/shellv2/ShellV2.tsx` (chat layer overlay) so it works on every route.

### d) Delete-all mutation

**`src/hooks/useStrategyPlans.ts`**
- Add `deleteAllStrategies` mutation: calls a small new edge function `strategy-purge` (or reuses `generate-100day-strategy` with a new `mode: 'purge'` flag).
- Recommended: extend existing edge function with `mode: 'purge'` branch that runs the same SQL wipe block (lines 743–752) and returns `{ purged: true }` without generating new plans. This avoids a new function file and keeps the destructive logic in one place.

---

## File touch list

- `src/hooks/useStrategyPlans.ts` — always force regen, add `deleteAllStrategies`
- `src/shellv2/layers/ComposerLayer.tsx` — lift + float container
- `src/components/dashboard/GlobalChatInput.tsx` — bigger native-feel pill
- `src/hooks/aurora/useAuroraCommands.tsx` — strategy_regenerate / strategy_delete tags
- `supabase/functions/aurora-chat/orchestrator.ts` — register tags in system prompt (HE + EN)
- `supabase/functions/generate-100day-strategy/index.ts` — `mode: 'purge'` branch
- `src/components/aurora/StrategyApprovalCard.tsx` — new approval card
- `src/shellv2/ShellV2.tsx` — mount approval card globally

---

## Acceptance

- Tapping "Generate strategy" anywhere always replaces the active plan; no duplicate active rows remain.
- Composer floats ~12px off the bottom with safe-area, taller (h-12) input with iOS-style rounded pill.
- Saying "regenerate my strategy" / "תמחק את התוכנית" in chat produces an approval card; only after confirm does the wipe + regen run; AION acknowledges the result.
