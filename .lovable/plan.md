

# תוכנית: שיפור אפשרויות פרופיל אישי

## סקירת השינויים הנדרשים

משתמש ביקש לשפר את שלב הפרופיל האישי ב-Launchpad עם מספר שיפורים חשובים:

### 1. הוספת סוגי אימונים נוספים
**נוסיף:**
- קליסטניקס (Calisthenics)
- קרוספיט (CrossFit)
- טאי צ'י (Tai Chi)
- הליכה מהירה (Power Walking)
- ריקוד (Dance)
- ספורט קבוצתי (Team Sports)
- טיפוס (Climbing)
- סקייטבורד/רולרבלייד (Skateboarding)
- **אחר** (Other)

### 2. שינוי "שתיית מים" לקטגוריית "שתייה והידרציה יומית"
**הבהרה + אפשרויות חדשות:**
- כותרת חדשה: "שתייה יומית (הידרציה)"
- מים רגילים
- מיצים טבעיים
- מי קוקוס
- תה צמחים
- שייקים ירוקים
- משקאות אלקטרוליטים
- אחר

### 3. הוספת סוגי תזונה נוספים
**נוסיף לתזונה:**
- טבעוני אלקלייני (Alkaline Vegan)
- גלם טבעוני (Raw Vegan)
- ים תיכוני (Mediterranean)
- אינטואיטיבי (Intuitive)
- ללא גלוטן (Gluten-Free)
- ללא סוכר (Sugar-Free)
- **אחר** (Other) - כבר קיים ✓

### 4. הוספת "אחר" לכל קטגוריה שחסרה
קטגוריות שחסרה בהן אפשרות "אחר":
- `exercise_types` - סוגי אימונים ← נוסיף אחר
- `smoking` - כבר יש "none"
- `supplements` - נוסיף אחר
- `music_genres` - נוסיף אחר
- `sports` - נוסיף אחר
- `hobbies` - נוסיף אחר
- `life_priorities` - נוסיף אחר
- `age_group` - לא רלוונטי (טווחי גילאים)
- `sleep_hours` - לא רלוונטי (טווחים מספריים)

---

## פרטים טכניים

### קובץ לעריכה:
`src/components/launchpad/steps/PersonalProfileStep.tsx`

### שינויים בפירוט:

#### A. עדכון קטגוריית `exercise_types` (שורות 197-214)
```typescript
exercise_types: {
  section: 'health',
  title: 'סוגי אימונים',
  titleEn: 'Exercise Types',
  icon: '🏋️',
  multiSelect: true,
  options: [
    { value: 'gym', label: 'חדר כושר', labelEn: 'Gym' },
    { value: 'running', label: 'ריצה', labelEn: 'Running' },
    { value: 'swimming', label: 'שחייה', labelEn: 'Swimming' },
    { value: 'yoga', label: 'יוגה', labelEn: 'Yoga' },
    { value: 'pilates', label: 'פילאטיס', labelEn: 'Pilates' },
    { value: 'calisthenics', label: 'קליסטניקס', labelEn: 'Calisthenics' },  // NEW
    { value: 'crossfit', label: 'קרוספיט', labelEn: 'CrossFit' },            // NEW
    { value: 'martial-arts', label: 'אומנויות לחימה', labelEn: 'Martial Arts' },
    { value: 'cycling', label: 'רכיבה', labelEn: 'Cycling' },
    { value: 'hiking', label: 'טיולים', labelEn: 'Hiking' },
    { value: 'dancing', label: 'ריקוד', labelEn: 'Dancing' },                // NEW
    { value: 'climbing', label: 'טיפוס', labelEn: 'Climbing' },              // NEW
    { value: 'tai-chi', label: 'טאי צ\'י', labelEn: 'Tai Chi' },             // NEW
    { value: 'power-walking', label: 'הליכה מהירה', labelEn: 'Power Walking' }, // NEW
    { value: 'team-sports', label: 'ספורט קבוצתי', labelEn: 'Team Sports' }, // NEW
    { value: 'none', label: 'לא מתאמן', labelEn: 'None' },
    { value: 'other', label: 'אחר', labelEn: 'Other' },                      // NEW
  ],
}
```

#### B. שינוי קטגוריית `water_intake` ל-`hydration` (שורות 256-268)
```typescript
hydration: {
  section: 'health',
  title: 'שתייה יומית (הידרציה)',
  titleEn: 'Daily Hydration',
  icon: '💧',
  multiSelect: true,  // Changed to multi-select
  options: [
    { value: 'water', label: 'מים', labelEn: 'Water' },
    { value: 'natural-juice', label: 'מיצים טבעיים', labelEn: 'Natural Juices' },
    { value: 'coconut-water', label: 'מי קוקוס', labelEn: 'Coconut Water' },
    { value: 'herbal-tea', label: 'תה צמחים', labelEn: 'Herbal Tea' },
    { value: 'green-smoothies', label: 'שייקים ירוקים', labelEn: 'Green Smoothies' },
    { value: 'electrolytes', label: 'משקאות אלקטרוליטים', labelEn: 'Electrolyte Drinks' },
    { value: 'other', label: 'אחר', labelEn: 'Other' },
  ],
}
```

#### C. עדכון קטגוריית `diet` (שורות 152-168)
```typescript
diet: {
  section: 'health',
  title: 'סוג תזונה',
  titleEn: 'Diet Type',
  icon: '🍽️',
  multiSelect: false,
  options: [
    { value: 'regular', label: 'רגיל', labelEn: 'Regular' },
    { value: 'vegetarian', label: 'צמחוני', labelEn: 'Vegetarian' },
    { value: 'vegan', label: 'טבעוני', labelEn: 'Vegan' },
    { value: 'alkaline-vegan', label: 'טבעוני אלקלייני', labelEn: 'Alkaline Vegan' }, // NEW
    { value: 'raw-vegan', label: 'גלם טבעוני', labelEn: 'Raw Vegan' },                // NEW
    { value: 'keto', label: 'קטו', labelEn: 'Keto' },
    { value: 'carnivore', label: 'קרניבור', labelEn: 'Carnivore' },
    { value: 'paleo', label: 'פליאו', labelEn: 'Paleo' },
    { value: 'mediterranean', label: 'ים תיכוני', labelEn: 'Mediterranean' },         // NEW
    { value: 'gluten-free', label: 'ללא גלוטן', labelEn: 'Gluten-Free' },             // NEW
    { value: 'sugar-free', label: 'ללא סוכר', labelEn: 'Sugar-Free' },                // NEW
    { value: 'intuitive', label: 'אינטואיטיבי', labelEn: 'Intuitive' },               // NEW
    { value: 'other', label: 'אחר', labelEn: 'Other' },
  ],
}
```

#### D. הוספת "אחר" לקטגוריות שחסרות
- `supplements` - נוסיף `{ value: 'other', label: 'אחר', labelEn: 'Other' }`
- `music_genres` - נוסיף `{ value: 'other', label: 'אחר', labelEn: 'Other' }`
- `sports` - נוסיף `{ value: 'other', label: 'אחר', labelEn: 'Other' }`
- `hobbies` - נוסיף `{ value: 'other', label: 'אחר', labelEn: 'Other' }`
- `life_priorities` - נוסיף `{ value: 'other', label: 'אחר', labelEn: 'Other' }`

#### E. עדכון הטיפוסים (interfaces)
נעדכן את `ProfileData`, `MultiSelectCategory`, ואת `getDefaultProfileData()` לתמוך בשינוי מ-`water_intake` (string) ל-`hydration` (string[]).

---

## סיכום השינויים

| קטגוריה | שינוי |
|---------|-------|
| סוגי אימונים | +8 אפשרויות חדשות (כולל קליסטניקס, קרוספיט, ריקוד, טיפוס, טאי צ'י, הליכה מהירה, ספורט קבוצתי, אחר) |
| שתייה יומית | שינוי שם + הפיכה ל-multi-select + אפשרויות מגוונות (מיצים, מי קוקוס, תה וכו') |
| סוג תזונה | +6 אפשרויות (טבעוני אלקלייני, גלם טבעוני, ים תיכוני, ללא גלוטן, ללא סוכר, אינטואיטיבי) |
| כל הקטגוריות | וידוא שיש אפשרות "אחר" בכל מקום רלוונטי |

