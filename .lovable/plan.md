
# תוכנית: אפשור גישה חזרה ל-Launchpad כהגדרות

## סיכום המטרה
לאפשר למשתמשים שסיימו את ה-Launchpad לחזור ולראות/לערוך את התשובות שלהם, כאילו מדובר במסך "הגדרות" או "הפרופיל שלי".

---

## שלב 1: יצירת דף הגדרות Launchpad חדש

**קובץ:** `src/pages/LaunchpadSettings.tsx` (חדש)

דף שמציג את כל ה-Launchpad בתצוגת "עריכה" עם:
- כל התשובות מסומנות מראש מהנתונים השמורים
- אפשרות לנווט בין שלבים בחופשיות
- כפתור "שמור שינויים" שמעדכן את הנתונים

---

## שלב 2: שינוי LaunchpadFlow לתמיכה ב-"מצב הגדרות"

**קובץ:** `src/components/launchpad/LaunchpadFlow.tsx`

להוסיף prop חדש `mode: 'onboarding' | 'settings'`:
- **onboarding mode** (ברירת מחדל): ההתנהגות הנוכחית - שלב אחרי שלב
- **settings mode**: כל השלבים נגישים, טוען נתונים קיימים, מאפשר עריכה

```typescript
interface LaunchpadFlowProps {
  mode?: 'onboarding' | 'settings';
  className?: string;
  onComplete?: () => void;
  onClose?: () => void;
}
```

---

## שלב 3: עדכון כל Step להיות "Editable"

לעדכן כל קומפוננטת שלב (WelcomeStep, PersonalProfileStep וכו') לטעון נתונים קיימים:

**קבצים:**
- `src/components/launchpad/steps/WelcomeStep.tsx`
- `src/components/launchpad/steps/PersonalProfileStep.tsx`  
- `src/components/launchpad/steps/FocusAreasStep.tsx`
- `src/components/launchpad/steps/FirstWeekStep.tsx`

כל Step יקבל prop אופציונלי `initialData` שימלא את הטופס עם הנתונים הקיימים:

```typescript
interface WelcomeStepProps {
  onComplete: (data: {...}) => void;
  isCompleting: boolean;
  rewards: {...};
  initialData?: Record<string, string | string[]>; // חדש
  isEditMode?: boolean; // חדש
}
```

---

## שלב 4: הוספת קישור בסיידבר

**קובץ:** `src/components/dashboard/DashboardSidebar.tsx`

להוסיף פריט ניווט חדש בסקשן "התוכן שלך":

```typescript
const contentItems = [
  // ... existing items
  { path: '/launchpad/settings', icon: Settings, label: language === 'he' ? 'הפרופיל שלי' : 'My Profile' },
];
```

---

## שלב 5: הוספת Route חדש

**קובץ:** `src/App.tsx`

להוסיף route חדש:

```typescript
<Route path="/launchpad/settings" element={<LaunchpadSettings />} />
```

---

## שלב 6: Hook לטעינת נתוני Launchpad קיימים

**קובץ:** `src/hooks/useLaunchpadData.ts` (חדש)

Hook שטוען את כל הנתונים השמורים מ-launchpad_progress:

```typescript
export function useLaunchpadData() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['launchpad-data', user?.id],
    queryFn: async () => {
      const { data: progress } = await supabase
        .from('launchpad_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return {
        welcomeQuiz: JSON.parse(progress.step_1_intention || '{}'),
        personalProfile: progress.step_2_profile_data,
        focusAreas: progress.step_5_focus_areas_selected,
        firstWeek: {
          actions: progress.step_6_actions,
          anchorHabit: progress.step_6_anchor_habit,
        },
      };
    },
    enabled: !!user?.id,
  });
}
```

---

## ארכיטקטורה ויזואלית

```text
DashboardSidebar
    └── "הפרופיל שלי" / "My Profile"
           ↓
    /launchpad/settings
           ↓
    LaunchpadSettings page
           ↓
    LaunchpadFlow (mode="settings")
           ↓
    ┌─────────────────────────────┐
    │ Header: כל השלבים נגישים   │
    │ (tabs או dots לניווט)      │
    ├─────────────────────────────┤
    │ WelcomeStep                 │
    │   └── initialData from DB   │
    ├─────────────────────────────┤
    │ PersonalProfileStep         │
    │   └── initialData from DB   │
    ├─────────────────────────────┤
    │ FocusAreasStep              │
    │   └── initialData from DB   │
    ├─────────────────────────────┤
    │ FirstWeekStep               │
    │   └── initialData from DB   │
    └─────────────────────────────┘
           ↓
    "שמור שינויים" → Update launchpad_progress
                   → Re-trigger AI analysis
```

---

## שלב 7: אופציה לעדכון הסיכום מחדש

כש-user משנה תשובות משמעותיות, להציע לו לרענן את הסיכום:

```typescript
const handleSaveSettings = async () => {
  // Save changes to launchpad_progress
  await updateProgress(newData);
  
  // Ask if user wants to regenerate summary
  toast({
    title: 'השינויים נשמרו',
    description: 'האם לחשב מחדש את הסיכום וההמלצות?',
    action: <Button onClick={regenerateSummary}>חשב מחדש</Button>,
  });
};
```

---

## קבצים שייווצרו/יעודכנו

| קובץ | פעולה |
|------|-------|
| `src/pages/LaunchpadSettings.tsx` | חדש - דף הגדרות |
| `src/hooks/useLaunchpadData.ts` | חדש - Hook לטעינת נתונים |
| `src/components/launchpad/LaunchpadFlow.tsx` | עדכון - תמיכה ב-settings mode |
| `src/components/launchpad/steps/WelcomeStep.tsx` | עדכון - initialData prop |
| `src/components/launchpad/steps/PersonalProfileStep.tsx` | עדכון - initialData prop |
| `src/components/launchpad/steps/FocusAreasStep.tsx` | עדכון - initialData prop |
| `src/components/launchpad/steps/FirstWeekStep.tsx` | עדכון - initialData prop |
| `src/components/dashboard/DashboardSidebar.tsx` | עדכון - הוספת לינק |
| `src/components/aurora/AuroraSidebar.tsx` | עדכון - הוספת לינק |
| `src/App.tsx` | עדכון - הוספת route |

---

## פרטים טכניים

### מקורות הנתונים בטבלת launchpad_progress:

| שלב | שדה בטבלה | סוג |
|-----|-----------|-----|
| Welcome Quiz | `step_1_intention` | JSON (quizAnswers) |
| Personal Profile | `step_2_profile_data` | JSON (full profile) |
| Focus Areas | `step_5_focus_areas_selected` | JSON (array of areas) |
| First Week | `step_6_actions`, `step_6_anchor_habit` | JSON + string |

### שמירה:

כל שינוי ישמר ישירות לטבלת `launchpad_progress` באמצעות:

```typescript
await supabase
  .from('launchpad_progress')
  .update({
    step_1_intention: JSON.stringify(welcomeData),
    step_2_profile_data: profileData,
    step_5_focus_areas_selected: focusAreas,
    step_6_actions: actions,
    step_6_anchor_habit: anchorHabit,
    updated_at: new Date().toISOString(),
  })
  .eq('user_id', userId);
```

---

## סיכום

התוכנית יוצרת "מצב הגדרות" ל-Launchpad שמאפשר:
1. גישה לכל השלבים בכל רגע
2. צפייה בתשובות הקיימות
3. עריכה ועדכון
4. אופציה לחישוב מחדש של הסיכום

זה הופך את ה-Launchpad מ"חד-פעמי" ל"פרופיל דינמי" שמשתמשים יכולים לעדכן לאורך זמן.
