

# תוכנית: עדכון תפריט דאשבורד + הורדת PDF פרופיל מלא

## סיכום המשימות

### משימה 1: הסרת פריטים מהתפריט
הסרת הפריטים הבאים מ-`DashboardSidebar.tsx`:
- **קטלוג** (מ-navItems)
- **מוצרים דיגיטליים** (מ-contentItems)
- **מנויים** (מ-contentItems)
- **ההקלטות שלי** (מ-contentItems)

### משימה 2: התאמת מבנה התפריט לסגנון אורורה
העברת פרופיל המשתמש + Dropdown לתחתית הסיידבר (כמו ב-Aurora), כולל:
- Avatar + שם משתמש
- אפשרויות: דאשבורד, הגדרות, רשימות משימות
- החלפת שפה
- התנתקות

### משימה 3: הוספת אפשרות הורדת PDF
יצירת כפתור להורדת הפרופיל המלא כ-PDF, הכולל:
- ציוני תודעה (Consciousness, Clarity, Readiness)
- כיוון חיים (Life Direction)
- ניתוח תודעה מלא (Consciousness Analysis)
- פרופיל זהות (Identity Profile)
- תובנות התנהגותיות (Behavioral Insights)
- נתיב קריירה (Career Path)
- תוכנית 90 יום עם כל 12 השבועות

---

## פרטים טכניים

### שלב 1: עדכון DashboardSidebar.tsx

**שינויים:**

```text
// לפני:
const navItems = [
  { path: '/dashboard', ... },
  { path: '/messages', ... },
  { path: '/aurora', ... },
  { path: '/courses', ... },      // ← להסיר
  { path: '/community', ... },
  { path: '/hypnosis', ... },
];

const contentItems = [
  { path: '/courses', ... },      // ← להסיר הכל
  { path: '/subscriptions', ... },
  { path: '/hypnosis', ... },
];

// אחרי:
const navItems = [
  { path: '/dashboard', ... },
  { path: '/messages', ... },
  { path: '/aurora', ... },
  { path: '/community', ... },
  { path: '/hypnosis', ... },
];

// הסרה מלאה של contentItems
```

**החלפת Footer:**
- הסרה של כפתור Logout הנוכחי
- ייבוא והוספת `AuroraAccountDropdown` במקום
- התאמת ה-props (onOpenDashboard, onOpenSettings, onOpenChecklists)
- הסרת כרטיס הפרופיל העליון (כי הוא עובר לתחתית ב-dropdown)

### שלב 2: יצירת generateProfilePDF

**קובץ חדש:** `src/lib/profilePdfGenerator.ts`

פונקציה שתקבל:
- `summaryData` - מ-launchpad_summaries
- `milestones` - מ-life_plan_milestones
- `planData` - מ-life_plans
- `language` - עברית/אנגלית

**מבנה ה-PDF:**

1. **עמוד שער**
   - לוגו + שם המותג
   - כותרת: "פרופיל הטרנספורמציה שלי"
   - שם המשתמש + תאריך

2. **עמוד ציונים**
   - מד תודעה (Hawkins Scale)
   - 3 ציונים: תודעה, בהירות, מוכנות

3. **עמוד כיוון חיים**
   - שאיפה מרכזית
   - סיכום חזון
   - ציון בהירות

4. **עמוד ניתוח תודעה**
   - מצב נוכחי
   - חוזקות
   - דפוסים דומיננטיים
   - קצוות צמיחה
   - נקודות עיוורות

5. **עמוד פרופיל זהות**
   - מצב אגו מומלץ
   - תכונות דומיננטיות
   - היררכיית ערכים

6. **עמוד התנהגות וקריירה**
   - הרגלים לשנות/לפתח
   - דפוסי התנגדות
   - סטטוס קריירה + שאיפות + צעדים

7. **עמודי תוכנית 90 יום** (3-4 עמודים)
   - כל 12 השבועות עם:
     - כותרת + יעד
     - משימות
     - אתגר שבועי
     - המלצת היפנוזה

### שלב 3: הוספת כפתור הורדה ב-QuickAccessGrid

**שינויים ב-QuickAccessGrid.tsx:**

הוספת כרטיס נוסף עם אייקון `FileDown`:
- טקסט: "הורד PDF" / "Download PDF"
- צבע gradient ייחודי (כחול/אינדיגו)
- `onClick` שמפעיל את `generateProfilePDF`

**או לחילופין** - הוספה ב-header של הדאשבורד ככפתור עם אייקון.

### שלב 4: Hook לשליפת נתונים

**יצירת useProfilePDF hook:**

```text
// src/hooks/useProfilePDF.ts
export function useProfilePDF() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [generating, setGenerating] = useState(false);

  async function downloadPDF() {
    setGenerating(true);
    
    // Fetch summary
    const { data: summary } = await supabase
      .from('launchpad_summaries')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    // Fetch plan + milestones
    const { data: plan } = await supabase
      .from('life_plans')
      .select('*, life_plan_milestones(*)')
      .eq('user_id', user.id)
      .single();
    
    // Generate PDF
    await generateProfilePDF({
      summary: summary.summary_data,
      scores: {
        consciousness: summary.consciousness_score,
        clarity: summary.clarity_score,
        readiness: summary.transformation_readiness,
      },
      milestones: plan?.life_plan_milestones || [],
      planData: plan,
      language,
    });
    
    setGenerating(false);
  }

  return { downloadPDF, generating };
}
```

---

## קבצים שישתנו

| קובץ | שינוי |
|------|-------|
| `src/components/dashboard/DashboardSidebar.tsx` | הסרת פריטים + שינוי footer |
| `src/lib/profilePdfGenerator.ts` | **חדש** - יצירת PDF פרופיל |
| `src/hooks/useProfilePDF.ts` | **חדש** - hook לשליפה והורדה |
| `src/components/dashboard/QuickAccessGrid.tsx` | הוספת כפתור "הורד PDF" |

---

## תוצאה צפויה

1. **תפריט נקי** - רק: דאשבורד, הודעות, אורורה, קהילה, היפנוזה
2. **תפריט משתמש בתחתית** - כמו באורורה עם dropdown
3. **כפתור הורדת PDF** - ייצור מסמך PDF מקצועי עם:
   - כל הניתוחים מ-AI
   - תוכנית 90 יום מלאה
   - עיצוב Dark theme מותאם למותג

