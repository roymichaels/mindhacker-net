
# Presence Cleanup — Remove Manual Inputs, Update Subscores, Re-tier Fixes

Exact changes as specified, nothing more.

## 1. Delete File
- `src/components/presence/ManualInputs.tsx` — removed entirely

## 2. PresenceHome cleanup
**File:** `src/pages/presence/PresenceHome.tsx`
- Remove line 10 (`import ManualInputs`)
- Remove line 56 (`<ManualInputs />`)
- No other changes

## 3. Types updates
**File:** `src/lib/presence/types.ts`
- Delete `ManualInputs` interface (lines 8-14)
- Replace `SubScoreKey` union with: `facial_structure`, `posture_alignment`, `body_composition`, `frame_development`, `inflammation_puffiness`
- Remove `manual_inputs` from `PresenceDomainConfig`
- Add `tier: 1 | 2 | 3` to `FixItem` interface

## 4. Scoring updates
**File:** `src/lib/presence/scoring.ts`
- Remove `ManualInputs` from imports
- Rewrite `mapRawScoresToPresence` to output the 5 new keys with new labels
- Delete `enrichWithManualInputs` function entirely
- Remove manual input check from `generateFindings` (the `skincare_routine === 'none'` check, and update `facial_definition` refs to `facial_structure`, `grooming_baseline` refs to `frame_development`)
- Update `selectTopPriorities` references from old keys to new keys
- Update `buildScanResult`: remove `manual` parameter, remove `enrichWithManualInputs` call, update index weights to use new 5 keys

## 5. Fix library tiers
**File:** `src/lib/presence/levers.ts`
- Add `tier` field to every entry
- Reorder: Tier 1 (body_fat_lever, chin_tuck_drills, tongue_posture, resistance_training, sleep_depuff, walking_neat), Tier 2 (grooming_optimization, beard_shaping NEW, hair_optimization NEW), Tier 3 (skincare_baseline)
- Remove `nasal_breathing`, `posture_reset`, `hydration_sodium` (not in spec) OR keep and tier appropriately — the spec lists exactly which items go where, so we match it precisely
- Add `beard_shaping` and `hair_optimization` entries

## 6. Hook cleanup
**File:** `src/hooks/usePresenceCoach.ts`
- Remove `saveManualInputs` function (lines 47-52)
- Remove `ManualInputs` from import
- Remove `saveManualInputs` from return object

## 7. Results page updates
**File:** `src/pages/presence/PresenceResultsPage.tsx`
- Update `SUB_SCORE_ORDER` to: `facial_structure`, `posture_alignment`, `body_composition`, `frame_development`, `inflammation_puffiness`
- Add low-confidence warning banner after the Presence Index card, shown only when `latest.confidence === 'low'`, with exact text: "Lighting or angle reduced confidence. Re-scan recommended."

## 8. FixLibrary UI grouping
**File:** `src/components/presence/FixLibrary.tsx`
- Group fixes by `tier` with section headers: "Tier 1 — High Impact", "Tier 2 — Refinement", "Tier 3 — Optional"
- No card design changes, selection behavior unchanged
