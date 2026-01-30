
# תוכנית: שיפור מערכת בחירת התכונות (Identity Building Step)

## הבעיה הנוכחית
- משתמשים יכולים לבחור כמה תכונות שרוצים (MIN_TRAITS=3, ללא מקסימום)
- אין תעדוף - כל תכונה שווה
- אין קונטקסט אישי (דמויות השראה)
- התוצאה: פרופיל מפוזר שלא עוזר ל-AI לדעת מי המשתמש רוצה להיות

## הפתרון המוצע

### חלק 1: הגבלה ותעדוף התכונות

**מגבלה חדשה:**
- מינימום: 3 תכונות
- מקסימום: 6 תכונות
- עידוד לבחור 5 (הנקודה האידיאלית)

**מערכת תעדוף:**
- לאחר בחירת התכונות, המשתמש יגרור אותן לסדר עדיפויות (1 = החשוב ביותר)
- או: שתי רמות - "תכונות ליבה" (עד 3) ו"תכונות משניות" (שאר)

### חלק 2: דמויות השראה (Role Models)

**שדה טקסט חופשי:**
- "כתוב 1-3 דמויות (מסדרות, סרטים, ספרים) שאתה רוצה להידמות אליהן ולמה"
- דוגמה: "הארוי ספקטר מ-Suits - הביטחון העצמי והאסטרטגיה שלו"

**AI Analysis (אופציונלי להמשך):**
- ב-background, ה-AI יכול לנתח את הדמויות ולהציע תכונות מתאימות

### חלק 3: סיכום ויזואלי משופר

**הצגה חדשה בדאשבורד:**
- תכונות הליבה בולטות יותר (גדול יותר, צבע חזק)
- תכונות משניות קטנות יותר
- ציטוט מדמות ההשראה

## שינויים טכניים

### קבצים שישתנו

**1. `src/components/launchpad/steps/IdentityBuildingStep.tsx`**
- הוספת MAX_TRAITS = 6
- הוספת state ל-prioritizedTraits (מערך ממוין)
- הוספת שלב שני - תעדוף עם drag & drop (או כפתורי up/down)
- הוספת שלב שלישי - דמויות השראה (textarea)
- שינוי הטופס ל-3 phases: בחירה → תעדוף → השראה

**2. `src/lib/characterTraits.ts`**
- אין שינויים נדרשים

**3. מסד הנתונים: `aurora_identity_elements`**
- הוספת עמודה priority (integer) ל-metadata
- הוספת element_type חדש: 'role_model'

**4. `src/components/dashboard/unified/TraitsCard.tsx`**
- הצגה ממוינת לפי עדיפות
- תכונות ליבה בולטות יותר

### Flow חדש

```text
┌─────────────────────────────────────────────────┐
│ שלב 1: בחירת תכונות (3-6)                       │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │ 🦁 אומץ │ │ 🧠 חכמה │ │ 💗 אמפתיה│             │
│ └─────────┘ └─────────┘ └─────────┘             │
│ "בחרת 4 מתוך 6 מקסימום"                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ שלב 2: סדר עדיפויות                             │
│ 1. 🦁 אומץ          [↑] [↓]                     │
│ 2. 🧠 חכמה          [↑] [↓]                     │
│ 3. 💗 אמפתיה        [↑] [↓]                     │
│ "מה הכי חשוב לך? גרור לסדר"                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ שלב 3: דמויות השראה                             │
│ ┌─────────────────────────────────────────────┐ │
│ │ כתוב דמויות שאתה רוצה להידמות אליהן...     │ │
│ │ "הארוי ספקטר - הביטחון והאסטרטגיה"          │ │
│ │ "איירון מן - היצירתיות והחזון"               │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### שמירה במסד הנתונים

```text
aurora_identity_elements:
┌────────────────┬─────────────────┬─────────────────────────────┐
│ element_type   │ content         │ metadata                    │
├────────────────┼─────────────────┼─────────────────────────────┤
│ character_trait│ courage         │ {priority: 1, category:...} │
│ character_trait│ wisdom          │ {priority: 2, category:...} │
│ character_trait│ empathy         │ {priority: 3, category:...} │
│ role_model     │ Harvey Specter  │ {reason: "הביטחון..."}      │
│ role_model     │ Tony Stark      │ {reason: "היצירתיות..."}    │
└────────────────┴─────────────────┴─────────────────────────────┘
```

## פרטים טכניים

### ספריות קיימות
- `@dnd-kit/sortable` - כבר מותקנת לגרירה
- `framer-motion` - לאנימציות

### שינויים ב-IdentityBuildingStep

```typescript
// קבועים חדשים
const MIN_TRAITS = 3;
const MAX_TRAITS = 6;
const CORE_TRAITS_COUNT = 3;

// States חדשים
const [phase, setPhase] = useState<'select' | 'prioritize' | 'rolemodels'>('select');
const [prioritizedTraits, setPrioritizedTraits] = useState<string[]>([]);
const [roleModels, setRoleModels] = useState<string>('');

// בדיקת מקסימום
const toggleTrait = (traitId: string) => {
  setSelectedTraits((prev) => {
    if (prev.includes(traitId)) {
      return prev.filter((id) => id !== traitId);
    }
    if (prev.length >= MAX_TRAITS) {
      toast.warning('ניתן לבחור עד 6 תכונות');
      return prev;
    }
    return [...prev, traitId];
  });
};
```

### עדכון schema במסד הנתונים
```sql
-- הוספת role_model ל-constraint
ALTER TABLE aurora_identity_elements
DROP CONSTRAINT aurora_identity_elements_element_type_check;

ALTER TABLE aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check
CHECK (element_type = ANY (ARRAY[
  'value', 'principle', 'self_concept', 
  'vision_statement', 'character_trait', 'role_model'
]));
```

## יתרונות הפתרון

1. **מיקוד** - 6 תכונות מקסימום מכריחות בחירה
2. **תעדוף** - ה-AI יודע מה הכי חשוב למשתמש
3. **קונטקסט** - דמויות השראה נותנות תמונה עשירה יותר
4. **אינטגרציה** - המידע זורם לדאשבורד ולאימון AI
