

## "Build Your Empire" — Overarching Narrative Reframe

### Concept
Rebrand the entire homepage flow around "Build Your Empire" as the game's core promise. Each section becomes a chapter in empire-building, not standalone features.

### Narrative Flow

```text
1. HERO → "Build Your Empire"
   - Title: "Build Your Empire" / "בנה את האימפריה שלך"
   - Badge: "The Game Has Begun" / "המשחק התחיל"
   - CTA: "Start Building" / "התחל לבנות"
   - Tagline: "AI × Identity × Economy" (short, mysterious)

2. ORB GALLERY → "Choose Your Avatar"
   - No structural changes, just tweak header text:
   - "Your Orb. Your Identity." stays strong as-is

3. CITY SHOWCASE → "Your Empire. 6 Districts."
   - Rename from "The Digital City" to "Your Empire"
   - Subtitle: "Every empire needs infrastructure"
   - Keep the 6 district cards as-is

4. TRAITS → "Forge Your Character"
   - Rename from "Your Character. Your NFT."
   - to "Forge Your Identity" / "חשל את הזהות שלך"
   - Fits the empire-building narrative (character = ruler)

5. PLAN CINEMATIC → "Your Blueprint. AI-Engineered."
   - Rename from "100 Days. Engineered by AI."
   - to "Your Empire Blueprint" / "תוכנית האימפריה שלך"
   - Plan card text: "100-Day Conquest Path — Generated"

6. FINAL CTA → "Your Empire Awaits"
   - Change "Your City Awaits" → "Your Empire Awaits"
   - CTA button: "Start Building ⚡" / "התחל לבנות ⚡"
```

### Files to Edit

1. **`src/components/home/GameHeroSection.tsx`** — Replace title/badge/CTA with empire theme
2. **`src/components/home/CityShowcaseSection.tsx`** — Rename header to "Your Empire"
3. **`src/components/home/TraitShowcaseSection.tsx`** — Rename to "Forge Your Identity"
4. **`src/components/home/PlanCinematicSection.tsx`** — Rename to "Empire Blueprint"
5. **`src/components/home/FinalCTASection.tsx`** — "Your Empire Awaits"
6. **`src/i18n/translations/en.ts`** — Update all relevant translation keys
7. **`src/i18n/translations/he.ts`** — Update all relevant Hebrew translations

### Translation Updates

**English:**
- `gameHero.badge`: "The Game Has Begun"
- `gameHero.title`: "Build Your Empire."
- `gameHero.cta`: "⚡ Start Building"
- `gameHero.ctaMeta`: "5 min assessment • Free to start • Earn while you build"
- `finalCta.epicTitle`: "Your Empire Awaits"
- `finalCta.cta`: "⚡ Start Building"

**Hebrew:**
- `gameHero.badge`: "המשחק התחיל"
- `gameHero.title`: "בנה את האימפריה שלך."
- `gameHero.cta`: "⚡ התחל לבנות"
- `gameHero.ctaMeta`: "5 דקות אבחון • חינם להתחלה • הרווח תוך כדי בנייה"
- `finalCta.epicTitle`: "האימפריה שלך מחכה"
- `finalCta.cta`: "⚡ התחל לבנות"

All hardcoded strings in the section components will also be updated to match the empire narrative.

