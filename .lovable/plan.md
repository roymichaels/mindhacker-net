
# Plan: Digital Avatar Orb Section + Header Orb Avatar + Larger Logo

## Overview

שלושה שיפורים עיקריים:
1. **סקשן חדש בדף הבית** - להציג שהאורב מתפתח ומותאם אישית לכל משתמש (כמו Avatar)
2. **אורב כאווטר בהדר** - להחליף את האווטר הרגיל באורב מותאם אישית עבור משתמשים מחוברים
3. **לוגו גדול יותר בהדר** - להגדיל את הלוגו שעדיין נראה קטן

---

## Part 1: New Homepage Section - "Digital Avatar Orb"

### Location in Page

הסקשן יתווסף מיד אחרי `GameHeroSection` ולפני `WhatIsThisSection` - כדי להמשיך את "הסיפור" של האורב שמופיע בהירו.

### Section Design

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│              🔮 Badge: "Your Digital Avatar"                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │                    [Animated Orb Demo]                          │ │
│  │                   Size: 200px, Morphing                         │ │
│  │                                                                 │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│           "Your Orb Evolves With You"                                │
│           ─────────────────────────────                              │
│    Subtitle: Colors, shapes, textures uniquely yours                │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ 🎨 Colors    │  │ ✨ Shapes    │  │ 🌟 Textures  │               │
│  │ Based on    │  │ Based on    │  │ Based on    │               │
│  │ your Ego    │  │ your traits │  │ your level  │               │
│  │ State       │  │             │  │ & progress  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  🧬 Guardian    🔥 Warrior    💚 Healer    🔮 Mystic   ...     │ │
│  │  [Mini orb]   [Mini orb]    [Mini orb]   [Mini orb]            │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Features to Display

| Feature | Icon | Description (HE) | Description (EN) |
|---------|------|------------------|------------------|
| **Colors** | Palette | צבעים ייחודיים לפי מצב האגו שלך | Unique colors based on your Ego State |
| **Shapes** | Sparkles | צורות גיאומטריות לפי התכונות שבחרת | Geometric shapes based on your traits |
| **Textures** | Layers | טקסטורות מתפתחות עם הרמה שלך | Evolving textures with your level |

### Mini Orb Showcase

נציג 4-5 מיני-אורבים קטנים (40px) בצבעים שונים לפי Ego States שונים:
- Guardian (Blue)
- Warrior (Orange)
- Healer (Green)
- Mystic (Purple)
- Sage (Cyan)

---

## Part 2: Header Avatar Orb

### Current Implementation

כרגע האווטר משתמש ב-Avatar component של shadcn עם initials:

```tsx
<Avatar className="h-8 w-8">
  <AvatarImage src={user.user_metadata?.avatar_url} />
  <AvatarFallback>{getUserInitials()}</AvatarFallback>
</Avatar>
```

### New Implementation

עבור משתמשים מחוברים, נחליף את האווטר באורב מותאם אישית קטן:

```tsx
{user ? (
  <div className="relative h-9 w-9 rounded-full overflow-hidden">
    <PersonalizedOrb 
      size={36}
      state="idle"
      showGlow={false}
      className="scale-110"
    />
  </div>
) : (
  <Avatar>...</Avatar>
)}
```

### Styling Considerations

- גודל: 36px (מותאם לגודל ההדר)
- ללא Glow (כדי לא לבלבל)
- state="idle" תמיד
- border-2 border-primary/30 לעקביות

---

## Part 3: Larger Header Logo

### Current Size

```tsx
<div className="w-10 h-10 sm:w-12 sm:h-12">
```

40px mobile, 48px desktop - עדיין קטן מדי

### New Size

```tsx
<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
```

- Mobile: 48px
- Small Desktop: 56px
- Desktop: 64px

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/DigitalAvatarSection.tsx` | New homepage section about personalized orb |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/Header.tsx` | Replace avatar with PersonalizedOrb for logged-in users, increase logo size |
| `src/pages/Index.tsx` | Add DigitalAvatarSection after GameHeroSection |
| `src/i18n/translations/he.ts` | Add Hebrew translations for new section |
| `src/i18n/translations/en.ts` | Add English translations for new section |
| `src/components/home/index.ts` | Export new component |

---

## Technical Details

### New Translations to Add

**Hebrew (he.ts)**:
```typescript
// Digital Avatar Section
avatarBadge: "האווטר הדיגיטלי שלך",
avatarTitle: "האורב שלך מתפתח איתך",
avatarSubtitle: "צבעים, צורות וטקסטורות ייחודיות לך בלבד",
avatarColors: "צבעים",
avatarColorsDesc: "צבעים ייחודיים לפי מצב האגו שלך",
avatarShapes: "צורות",
avatarShapesDesc: "צורות גיאומטריות לפי התכונות שבחרת",
avatarTextures: "טקסטורות",
avatarTexturesDesc: "מורכבות גיאומטרית שעולה עם הרמה",
avatarEvolution: "ככל שתתקדם - האורב ישתנה",
```

**English (en.ts)**:
```typescript
// Digital Avatar Section
avatarBadge: "Your Digital Avatar",
avatarTitle: "Your Orb Evolves With You",
avatarSubtitle: "Colors, shapes, and textures uniquely yours",
avatarColors: "Colors",
avatarColorsDesc: "Unique colors based on your Ego State",
avatarShapes: "Shapes",
avatarShapesDesc: "Geometric shapes based on your traits",
avatarTextures: "Textures",
avatarTexturesDesc: "Complexity that grows with your level",
avatarEvolution: "As you progress - your orb transforms",
```

### Header Component Changes

1. Import `PersonalizedOrb` from `@/components/orb`
2. For logged-in users, render mini orb instead of Avatar with initials
3. Increase logo container from `w-10 h-10 sm:w-12 sm:h-12` to `w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16`

### DigitalAvatarSection Component Structure

```tsx
export default function DigitalAvatarSection() {
  // Features array for the 3 pillars (Colors, Shapes, Textures)
  // Mini orbs showcase array with ego states
  // Framer Motion animations for entrance
  // RTL support via useTranslation
  
  return (
    <section>
      {/* Badge */}
      {/* Animated Central Orb */}
      {/* Title + Subtitle */}
      {/* 3-Column Features Grid */}
      {/* Mini Orbs Showcase Row */}
    </section>
  );
}
```

---

## Visual Summary

After implementation:
1. **Homepage** will have a dedicated section explaining that the orb is a personal digital avatar that evolves
2. **Header** will show the user's personalized mini-orb as their avatar (instead of just initials)
3. **Logo** will be significantly larger and more prominent in the header (48px → 64px)

