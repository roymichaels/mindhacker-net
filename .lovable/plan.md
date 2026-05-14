## Phase 3B.1 — Legacy Profile Copy Softening

Frontend-only copy pass inside the Advanced Profile artifact. No logic, props, DB, routes, or variable names change. Only strings rendered to the user.

### Replacement map (visible strings only)

| Old | New (EN / HE) |
|---|---|
| XP | Energy / אנרגיה |
| Level / Lv. | Phase / שלב |
| Streak / רצף | Rhythm / מקצב |
| NFT (in comments only — drop word) | — |
| Loot / Loot Bag / שק השלל / שלל | Collectibles / אוסף |
| Achievement / Achievements / Achievement Collection / הישגים / אוסף הישגים | Milestone / Milestones / Milestone Collection / אבני דרך / אוסף אבני דרך |
| Inventory / Bag empty | Collection / Collection empty |
| Stats / Stats Strip / Stats cards | Signals |
| Score | Signal |
| Rank | Phase |
| Game | Journey |

Hebrew already standardized for some terms via `aionPresence.ts`; reuse where practical, otherwise inline literals (this is a copy-only pass, no SSOT refactor).

### Files to edit (visible copy only)

1. **src/components/profile/TransformationReportCard.tsx**
   - L197 `'רמה' / 'Level'` → `'שלב' / 'Phase'`
   - L205 `'רצף' / 'Streak'` → `'מקצב' / 'Rhythm'`
   - L108–109 share text: `רמה {n}` → `שלב {n}`, `streak` → `rhythm`, keep `📊` emoji
   - L193 comment `Stats bar` → `Signals bar` (comment, low priority but quick)

2. **src/components/modals/PracticesModal.tsx**
   - L349 `'רמה' / 'Level'` → `'שלב' / 'Phase'` (the `Lv.{n}` value stays as-is since it comes from `practice.skill_level`; only label changes)
   - L334 comment `Stats cards` → `Signals cards`
   - L220 comment `NFT-style card` → `Collectible-style card`

3. **src/components/modals/AchievementGalleryModal.tsx**
   - L38 `'אוסף הישגים' / 'Achievements'` → `'אבני דרך' / 'Milestones'`
   - L2 file header comment: `achievement collection` → `milestone collection`

4. **src/components/modals/InventoryBagModal.tsx**
   - L38 `'שק השלל' / 'Loot Bag'` → `'אוסף' / 'Collection'`
   - L2 comment `loot inventory` → `collectibles collection`

5. **src/components/gamification/AchievementGallery.tsx**
   - L52 `'אוסף הישגים' / 'Achievement Collection'` → `'אוסף אבני דרך' / 'Milestone Collection'`
   - L17 category `labelEn: 'Streaks' / labelHe: 'רצפים'` → `'Rhythms' / 'מקצבים'`
   - L2 file comment, L36 comment "by XP" → "by Energy"

6. **src/components/gamification/InventoryBag.tsx**
   - L61 `'שק השלל' / 'Loot Bag'` → `'אוסף' / 'Collection'`
   - L108 `'השק ריק — השלם משימות כדי לקבל שלל!' / 'Bag empty — complete quests to earn loot!'` → `'האוסף ריק — השלם משימות כדי להוסיף פריטים' / 'Collection empty — complete quests to earn collectibles'`
   - L2 file header comment softened

7. **src/components/modals/CharacterProfileModal.tsx**
   - L178 comment `Level + XP — premium bar` → `Phase + Energy — premium bar`
   - L182 visible text `Lv.{xp.level}` → `{isHe ? 'שלב' : 'Phase'} {xp.level}`
   - L193 visible `{xp.current}/{xp.required}` keeps numbers; no label there
   - L201 streak chip: pure number + flame icon, no visible "streak" label — leave value, no copy change needed
   - L147 comment `NFT Triad` → `Identity Triad`
   - L436 comment `Stats Strip` → `Signals Strip`
   - L480 comment `Below stats` → `Below signals`
   - L593 comment `NFT-style trait gallery grid` → `Trait gallery grid`

8. **src/components/gamification/OrbDNAModal.tsx**
   - L3 file comment `orb stats` → `orb signals`
   - Title `'ה-DNA של האורב שלך' / 'Your Orb DNA'` already neutral — no change

9. **src/components/profile/OrbNarrativeCard.tsx** — no offending visible strings found. Skip.

### Intentionally left untouched (internal / non-visible / out of scope)

- All variable/hook/type names: `xp`, `useXpProgress`, `useStreak`, `level`, `streak`, `score`, `scores`, `pillarScores`, `unlockedAchievements`, `LootItemCard`, `useInventory`, `practice.skill_level`, `xp_total`, `xp.percentage`, `consciousness_score`, `clarity_score`, etc.
- DB columns / API field names.
- Achievement/Loot/Inventory in import paths and component file names.
- Diagnostics / dev / admin surfaces.
- `aionPresence.ts` SSOT — not extended in this pass; literals are inlined to keep diff small per scope rules.
- Numeric values like `Lv.{practice.skill_level}` stay as numbers; only the surrounding label is softened.

### Acceptance / return after build

- Files changed: 8 (list above; OrbNarrativeCard untouched).
- Copy terms replaced: per map above.
- Internal terms intentionally kept: variable names, hook names, DB fields, import paths, file names.
- Remaining copy leaks flagged for a future pass: `LootItemCard` rendered item names (data-driven, not in scope), category id `'streak'` stored in state, achievement category metadata in `@/lib/achievements`, and the "Lv." prefix that lives inside `practice.skill_level` value rendering — left numeric.
