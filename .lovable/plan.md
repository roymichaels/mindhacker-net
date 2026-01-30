

# תוכנית: עדכון וחיזוק שלב הפרופיל האישי

## שינויים נדרשים

### 1. הסרת קטגוריות לא נחוצות

| קטגוריה | סיבה להסרה |
|---------|------------|
| `music_genres` (טעם מוזיקלי) | לא רלוונטי לתהליך |
| `sports` (ספורט צפייה/עניין) | לא רלוונטי לתהליך |
| `gaming` (גיימינג) | כפילות - כבר קיים בתחביבים |

### 2. הבהרת "הרגלי קריאה"

**לפני:**
```
הרגלי קריאה
📚 Reading Habits
```

**אחרי:**
```
קריאת ספרים (לא לימודי)
📚 Book Reading (non-academic)
תיאור: ספרי פיתוח עצמי, בדיוני, ביוגרפיות וכו׳
```

### 3. הוספת קטגוריות חדשות

נוסיף קטגוריות שיחלצו יותר מידע על אישיות וגישה לחיים:

#### A. גישה לחיים (Life Approach)
```typescript
life_approach: {
  section: 'social',
  title: 'גישה לחיים',
  titleEn: 'Life Approach',
  icon: '🧭',
  multiSelect: false,
  options: [
    { value: 'optimistic', label: 'אופטימי', labelEn: 'Optimistic' },
    { value: 'realistic', label: 'ריאליסטי', labelEn: 'Realistic' },
    { value: 'cautious', label: 'זהיר', labelEn: 'Cautious' },
    { value: 'adventurous', label: 'הרפתקני', labelEn: 'Adventurous' },
    { value: 'philosophical', label: 'פילוסופי', labelEn: 'Philosophical' },
  ],
}
```

#### B. קבלת החלטות (Decision Making)
```typescript
decision_making: {
  section: 'social',
  title: 'איך אתה מקבל החלטות?',
  titleEn: 'How do you make decisions?',
  icon: '🤔',
  multiSelect: false,
  options: [
    { value: 'intuition', label: 'אינטואיציה', labelEn: 'Intuition' },
    { value: 'analysis', label: 'ניתוח', labelEn: 'Analysis' },
    { value: 'feelings', label: 'רגשות', labelEn: 'Feelings' },
    { value: 'advice', label: 'עצות מאחרים', labelEn: 'Others\' advice' },
    { value: 'mixed', label: 'משולב', labelEn: 'Mixed' },
  ],
}
```

#### C. התמודדות עם אתגרים (Challenge Response)
```typescript
challenge_response: {
  section: 'mental',
  title: 'איך אתה מגיב לאתגרים?',
  titleEn: 'How do you respond to challenges?',
  icon: '💪',
  multiSelect: false,
  options: [
    { value: 'head-on', label: 'ישר פונה לפתרון', labelEn: 'Head-on' },
    { value: 'reflect', label: 'קודם חושב', labelEn: 'Reflect first' },
    { value: 'avoid', label: 'נוטה להימנע', labelEn: 'Tend to avoid' },
    { value: 'seek-help', label: 'מבקש עזרה', labelEn: 'Seek help' },
    { value: 'adapt', label: 'מסתגל', labelEn: 'Adapt' },
  ],
}
```

#### D. מקור אנרגיה (Energy Source)
```typescript
energy_source: {
  section: 'mental',
  title: 'מה נותן לך אנרגיה?',
  titleEn: 'What gives you energy?',
  icon: '⚡',
  multiSelect: true,
  options: [
    { value: 'people', label: 'אנשים', labelEn: 'People' },
    { value: 'solitude', label: 'זמן לבד', labelEn: 'Solitude' },
    { value: 'nature', label: 'טבע', labelEn: 'Nature' },
    { value: 'creativity', label: 'יצירה', labelEn: 'Creativity' },
    { value: 'learning', label: 'למידה', labelEn: 'Learning' },
    { value: 'achievement', label: 'הישגים', labelEn: 'Achievement' },
    { value: 'other', label: 'אחר', labelEn: 'Other' },
  ],
}
```

#### E. מה מרגיע אותך (Relaxation)
```typescript
relaxation_methods: {
  section: 'mental',
  title: 'מה מרגיע אותך?',
  titleEn: 'What relaxes you?',
  icon: '🌿',
  multiSelect: true,
  options: [
    { value: 'music', label: 'מוזיקה', labelEn: 'Music' },
    { value: 'nature', label: 'טבע', labelEn: 'Nature' },
    { value: 'exercise', label: 'פעילות גופנית', labelEn: 'Exercise' },
    { value: 'meditation', label: 'מדיטציה', labelEn: 'Meditation' },
    { value: 'social', label: 'חברים/משפחה', labelEn: 'Friends/Family' },
    { value: 'alone', label: 'זמן לבד', labelEn: 'Alone time' },
    { value: 'hobbies', label: 'תחביבים', labelEn: 'Hobbies' },
    { value: 'other', label: 'אחר', labelEn: 'Other' },
  ],
}
```

#### F. יחס לשינויים (Change Attitude)
```typescript
change_attitude: {
  section: 'social',
  title: 'יחס לשינויים',
  titleEn: 'Attitude to Change',
  icon: '🔄',
  multiSelect: false,
  options: [
    { value: 'embrace', label: 'מחבק שינויים', labelEn: 'Embrace change' },
    { value: 'cautious', label: 'זהיר עם שינויים', labelEn: 'Cautious about change' },
    { value: 'resist', label: 'מעדיף יציבות', labelEn: 'Prefer stability' },
    { value: 'depends', label: 'תלוי בסיטואציה', labelEn: 'Depends on situation' },
  ],
}
```

#### G. צמיחה אישית (Personal Growth Focus)
```typescript
growth_focus: {
  section: 'values',
  title: 'במה אתה רוצה לצמוח?',
  titleEn: 'Where do you want to grow?',
  icon: '🌱',
  multiSelect: true,
  maxSelect: 3,
  options: [
    { value: 'confidence', label: 'ביטחון עצמי', labelEn: 'Self-confidence' },
    { value: 'discipline', label: 'משמעת', labelEn: 'Discipline' },
    { value: 'emotional', label: 'אינטליגנציה רגשית', labelEn: 'Emotional intelligence' },
    { value: 'communication', label: 'תקשורת', labelEn: 'Communication' },
    { value: 'leadership', label: 'מנהיגות', labelEn: 'Leadership' },
    { value: 'creativity', label: 'יצירתיות', labelEn: 'Creativity' },
    { value: 'mindfulness', label: 'מודעות עצמית', labelEn: 'Mindfulness' },
    { value: 'other', label: 'אחר', labelEn: 'Other' },
  ],
}
```

---

## פרטים טכניים

### קובץ לעריכה:
`src/components/launchpad/steps/PersonalProfileStep.tsx`

### שינויים בקוד:

1. **`ProfileData` interface** - הסרת שדות והוספת חדשים:
   - הסרה: `music_genres`, `sports`, `gaming`
   - הוספה: `life_approach`, `decision_making`, `challenge_response`, `energy_source`, `relaxation_methods`, `change_attitude`, `growth_focus`

2. **`MultiSelectCategory` type** - עדכון לרשימה החדשה

3. **`CATEGORIES` object** - הסרת 3 קטגוריות, הוספת 7 קטגוריות חדשות

4. **`reading_habits`** - עדכון כותרת והבהרה

5. **`CATEGORY_ORDER`** - עדכון סדר הקטגוריות

6. **`getDefaultProfileData()`** - עדכון ערכי ברירת מחדל

---

## סיכום

| פעולה | כמות |
|-------|------|
| קטגוריות שמוסרות | 3 |
| קטגוריות שמתווספות | 7 |
| קטגוריות שמתעדכנות | 1 (הרגלי קריאה) |
| **סה"כ שינוי נטו** | +4 קטגוריות |

### קטגוריות חדשות שמחלצות מידע עמוק:
- גישה לחיים (אופטימי/ריאליסטי/וכו')
- קבלת החלטות (אינטואיציה/ניתוח/וכו')
- התמודדות עם אתגרים
- מקור אנרגיה
- שיטות הרגעה
- יחס לשינויים
- תחומי צמיחה רצויים

