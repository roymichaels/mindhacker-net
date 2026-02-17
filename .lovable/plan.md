

## Add Visual DNA Breakdown Card to Profile Page

### Overview
Create a new "Orb DNA" card on the profile page that shows users exactly which traits, hobbies, and behaviors are shaping their orb's appearance. This gives transparency into the avatar system and makes the personalization feel tangible.

### What the Card Will Show

**1. Archetype Blend** -- The dominant and secondary archetypes with their icons and percentage weights (e.g., "Creator 45% / Mystic 30%"), rendered as colored progress bars matching the orb's gradient.

**2. Influencing Hobbies** -- The user's hobbies displayed as pill chips, each tagged with which archetype they feed into (e.g., "music" with a Creator icon).

**3. Behavioral Signature** -- Decision style, conflict style, and problem-solving style shown as compact labeled chips (e.g., "Decisions: Gut Feeling", "Conflict: Diplomatic").

**4. Orb Stats** -- Level complexity, particle count, layer count, and texture type as a small metrics row showing how progression affects visual complexity.

**5. Color Preview** -- A small row of color swatches showing the orb's primary, secondary, and accent colors derived from the DNA blend.

### Technical Details

**New file: `src/components/gamification/OrbDNACard.tsx`**
- Imports `useOrbProfile` to access `profile.computedFrom` (archetypeWeights, dominantHobbies, egoState, level, streak, clarityScore)
- Imports `useLaunchpadProgress` to access `step_2_profile_data` for behavioral styles (decision_style, conflict_handling, problem_approach, life_priorities)
- Uses the existing `extractProfileData` pattern from `useOrbProfile.ts`
- Uses existing `getArchetypeName`, `getArchetypeIcon` from `orbProfileGenerator.ts`
- Uses existing `PillChips` component for hobby/trait display
- Uses existing `CompactCard` pattern from `ProfileContent.tsx`
- Bilingual support via `useTranslation`

**Modified file: `src/components/dashboard/ProfileContent.tsx`**
- Import and render `OrbDNACard` as a new section below the existing Career + Transformation grid
- Passes no props -- the card is self-contained via hooks

**No database changes needed** -- all data comes from existing hooks (`useOrbProfile`, `useLaunchpadProgress`).

