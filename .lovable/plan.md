
# תוכנית: מעבר מארכיטייפים ל"ג'וב" דינאמי + תיקון עברית נקבית בממשק

## סקירה כללית

### שני חלקים לתיקון:

1. **מערכת ג'וב דינאמית** - במקום ארכיטייפים קבועים, ה-AI יקבע את ה"ג'וב" של המשתמש בצורה משחקית בסיום ה-Launchpad
2. **תיקון עברית נקבית** - החלפת כל הטקסטים הקבועים שרשומים בלשון נקבה לטקסטים דינאמיים לפי מגדר הפרופיל

---

## חלק 1: מערכת ה-Job (במקום Archetypes)

### הרעיון המרכזי:
- המשתמש לא בוחר ארכיטייפ
- ה-AI מנתח את הדאטה מה-Launchpad ומחזיר "Job" משחקי כמו במשחקי RPG
- ה-Job יכול להתפתח עם העלאת רמות (Job Advancement)

### מבנה ה-Job:

```text
רמות 1-3: Beginner Job (ג'וב מתחיל)
   → Apprentice Mind Hacker / שוליית האקר המוח
   → Trainee Dream Weaver / מתלמד טווה החלומות

רמות 4-6: First Advancement (התקדמות ראשונה)
   → Mind Ninja / נינג'ת המוח
   → Reality Architect / ארכיטקט המציאות

רמות 7-9: Second Advancement (התקדמות שנייה)
   → Shadow Master / שליט הצללים
   → Fate Shaper / מעצב הגורל

רמות 10+: Ultimate Job (ג'וב עילאי)
   → Consciousness Sage / חכם התודעה
   → Infinite Player / השחקן האינסופי
```

### רשימת ג'ובים לפי סגנון משתמש:

| סגנון | Beginner Job | Advanced Job | Ultimate Job |
|-------|-------------|--------------|--------------|
| **פיזי-לוחמני** | Warrior Trainee | Combat Monk | Legendary Warrior |
| **אינטלקטואלי** | Knowledge Seeker | Mind Architect | Wisdom Sage |
| **יצירתי** | Dream Apprentice | Reality Weaver | Creation Master |
| **רוחני** | Mystic Initiate | Shadow Walker | Consciousness Sage |
| **יזמי** | Path Finder | Reality Hacker | Infinite Player |
| **מרפא** | Heart Healer | Soul Mender | Light Bearer |

### שינויים טכניים:

#### 1. עדכון generate-launchpad-summary

במקום `suggested_ego_state` ו-`identity_title`, יוחזר:

```json
{
  "job_profile": {
    "job_name": "נינג'ת המוח",
    "job_name_en": "Mind Ninja",
    "job_tier": 1,
    "job_icon": "🥷",
    "job_description": "לוחם/ת שקט/ה שמשתלט/ת על המוח בדיוק כירורגי",
    "job_category": "warrior_intellectual",
    "next_job_at_level": 4,
    "next_job_preview": "Shadow Master"
  }
}
```

#### 2. הוספת טבלת job_definitions (אופציונלי)

```sql
-- כל הג'ובים והמסלולים שלהם
CREATE TABLE job_definitions (
  id TEXT PRIMARY KEY,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  tier INTEGER NOT NULL, -- 1-4
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  description_he TEXT,
  next_job_id TEXT,
  min_level INTEGER,
  visual_properties JSONB -- צבעים, טקסטורות, מורפולוגיה
);
```

#### 3. עדכון aurora_identity_elements

שינוי element_type מ-`identity_title` ל-`job` עם metadata מורחב.

#### 4. עדכון avatarDNA.ts

במקום blendArchetypes - פונקציה שמחשבת ויזואליה לפי ה-Job:

```typescript
export function computeAvatarFromJob(job: JobProfile, userData: UserDataForDNA): AvatarDNA {
  // הג'וב הוא הבסיס, התחביבים וההתנהגות משפיעים על הניואנסים
}
```

---

## חלק 2: תיקון עברית נקבית ב-UI

### טקסטים שנמצאו בלשון נקבה (HARDCODED):

| קובץ | טקסט נוכחי | תיקון |
|------|-----------|-------|
| `he.ts:1996` | `בואי נתחיל לחקור...` | לפי מגדר |
| `he.ts:2004` | `שתפי את מה שעובר עלייך...` | לפי מגדר |
| `he.ts:2009` | `בואי נחקור את הכיוון שלך` | לפי מגדר |
| `he.ts:2010` | `בואי נגלה מה באמת חשוב לך` | לפי מגדר |
| `he.ts:2011` | `בואי נמפה את האנרגיה שלך` | לפי מגדר |
| `he.ts:2012` | `בואי נעגן את הזהות שלך` | לפי מגדר |
| `he.ts:2043` | `ספרי קצת על עצמך...` | לפי מגדר |

### פתרון - יצירת מערכת תרגום דינאמית לפי מגדר:

#### 1. הוספת מפתחות תרגום לפי מגדר:

```typescript
// he.ts
aurora: {
  chat: {
    placeholder_male: "שתף את מה שעובר עליך...",
    placeholder_female: "שתפי את מה שעובר עלייך...",
    placeholder_neutral: "שתף/י את מה שעובר עלייך/עליך...",
  },
  welcomeSubtitle_male: "בוא נתחיל לחקור מה באמת חשוב לך...",
  welcomeSubtitle_female: "בואי נתחיל לחקור מה באמת חשוב לך...",
  welcomeSubtitle_neutral: "בוא/י נתחיל לחקור מה באמת חשוב לך...",
  cta: {
    life_direction_male: "בוא נחקור את הכיוון שלך",
    life_direction_female: "בואי נחקור את הכיוון שלך",
    // וכו'
  }
}
```

#### 2. יצירת hook חדש useGenderedTranslation:

```typescript
// src/hooks/useGenderedTranslation.ts
export function useGenderedTranslation() {
  const { t, language, isRTL } = useTranslation();
  const { userGender } = useUserProfile(); // 'male' | 'female' | 'neutral'
  
  const tg = (key: string): string => {
    // נסה קודם key_male / key_female / key_neutral
    const genderedKey = `${key}_${userGender}`;
    const translation = t(genderedKey);
    
    // אם לא קיים, החזר את המפתח הרגיל
    if (translation === genderedKey) {
      return t(key);
    }
    return translation;
  };
  
  return { t, tg, language, isRTL, userGender };
}
```

#### 3. עדכון קומפוננטים להשתמש ב-tg:

```tsx
// AuroraChatInput.tsx
const { tg } = useGenderedTranslation();

<input placeholder={tg('aurora.chat.placeholder')} />
```

---

## קבצים לעדכון/יצירה

### חלק 1 - מערכת Job:

| קובץ | פעולה |
|------|-------|
| `src/lib/jobs.ts` | **חדש** - הגדרת כל הג'ובים והמסלולים |
| `src/lib/avatarDNA.ts` | **עדכון** - computeAvatarFromJob |
| `src/lib/archetypes.ts` | **deprecated** - נשאר אבל לא בשימוש ישיר |
| `supabase/functions/generate-launchpad-summary/index.ts` | **עדכון** - החזרת job_profile |
| `src/hooks/aurora/useDashboard.tsx` | **עדכון** - טיפול ב-job |
| `src/components/gamification/JobDisplay.tsx` | **חדש** - תצוגת ג'וב עם אנימציית התקדמות |

### חלק 2 - תיקון מגדר:

| קובץ | פעולה |
|------|-------|
| `src/i18n/translations/he.ts` | **עדכון** - הוספת מפתחות לפי מגדר |
| `src/hooks/useGenderedTranslation.ts` | **חדש** - hook לתרגום דינאמי |
| `src/components/aurora/AuroraChatInput.tsx` | **עדכון** - שימוש ב-tg |
| `src/components/aurora/AuroraProfileSettings.tsx` | **עדכון** - שימוש ב-tg |
| `src/pages/Aurora.tsx` | **עדכון** - שימוש ב-tg |

---

## דוגמה לתוצאה הסופית

### משתמש שסיים Launchpad:

```text
נתונים:
- תחביבים: אומנויות לחימה, פילוסופיה, פסיכולוגיה
- התנהגות: ישיר, פותר מיידי
- עדיפויות: קריירה, צמיחה, השפעה
- Level: 2

תוצאה:
🥷 נינג'ת המוח (Mind Ninja)
"לוחם שקט ששולט במוח בדיוק כירורגי"

ויזואליה:
- צבע עיקרי: כתום עמוק (לוחמני)
- צבע משני: סגול עמוק (פילוסופי)
- טקסטורה: קוצנית אבל זורמת
- אפקט: להבות + ערפל מיסטי

בהתקדמות לרמה 4:
"🌑 אתה מתקרב להתקדמות ג'וב! בעוד 180 XP תוכל לבחור:
  → Shadow Master (שליט הצללים)
  → Mind Architect (ארכיטקט המוח)"
```

---

## סיכום

התוכנית הזו הופכת את המערכת מ"בחירה של קטגוריה" ל**מסע משחקי אמיתי** בו:
1. ה-AI קובע את ה"מקצוע" שלך בצורה מפתיעה ומשחקית
2. יש מסלול התקדמות ברור (Job Advancement)
3. כל הטקסטים מותאמים למגדר המשתמש
4. האווטאר משקף את ה-Job + התכונות האישיות
