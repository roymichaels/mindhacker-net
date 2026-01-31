
# תוכנית: שינוי שם Launchpad והוספת כפתור גישה מהדאשבורד

## סקירה כללית
שינוי שם ה-"Launchpad" לשם מתאים יותר בעברית ובאנגלית, קישור כפתור "התחל שינוי עכשיו" לפתיחתו, והוספת כפתור גישה מה-ProfileDrawer בדאשבורד.

## שם חדש מוצע
במקום "Launchpad" (שם טכני מדי):
- **עברית**: "מסע הטרנספורמציה" או "מסע השינוי"
- **English**: "Transformation Journey"

זהו שם שמשקף את המהות - מסע אישי של שינוי והתפתחות, ולא רק "רמת השקה".

## שלבי הביצוע

### שלב 1: עדכון קבצי התרגום
עדכון `src/i18n/translations/he.ts`:
- שינוי `lifePlanSubtitle` מ-"10 שלבים ב-Launchpad" ל-"10 שלבים במסע הטרנספורמציה"
- הוספת מפתחות חדשים:
  - `transformationJourney`: "מסע הטרנספורמציה"
  - `editTransformationJourney`: "ערוך מסע טרנספורמציה"

עדכון `src/i18n/translations/en.ts`:
- שינוי `lifePlanSubtitle` מ-"10 steps in Launchpad" ל-"10 steps in Transformation Journey"
- הוספת מפתחות חדשים:
  - `transformationJourney`: "Transformation Journey"
  - `editTransformationJourney`: "Edit Transformation Journey"

### שלב 2: עדכון StartChangeModal
שינוי `src/components/StartChangeModal.tsx`:
- במקום לפתוח דיאלוג עם אופציות offers, לנווט ישירות ל-`/launchpad`
- או לחלופין: לשמור את הדיאלוג אבל להוסיף אופציה ראשונה בולטת למסע הטרנספורמציה

### שלב 3: הוספת כפתור ב-ProfileDrawer
עדכון `src/components/dashboard/ProfileDrawer.tsx`:
- הוספת כפתור "התחל/המשך מסע טרנספורמציה" בראש ה-Drawer
- הכפתור יהיה בולט עם גרדיאנט וספרקלס
- לחיצה תנווט ל-`/launchpad`

### שלב 4: עדכון תצוגות נוספות (אופציונלי)
עדכון שמות בקומפוננטות:
- `LaunchpadPreviewSection.tsx` - עדכון הטקסט המוצג
- `LifePlan.tsx` - עדכון הודעת "התחל Launchpad"
- `UnifiedDashboardView.tsx` - עדכון טקסט הכפתור

---

## פרטים טכניים

### עדכון קבצי תרגום

**he.ts:**
```typescript
home: {
  // ...existing
  lifePlanSubtitle: "9 שלבים במסע הטרנספורמציה → תוכנית אישית מלאה",
  transformationJourney: "מסע הטרנספורמציה",
  editTransformationJourney: "ערוך מסע טרנספורמציה",
  startTransformationJourney: "התחל מסע טרנספורמציה",
  continueTransformationJourney: "המשך מסע טרנספורמציה",
}
```

**en.ts:**
```typescript
home: {
  // ...existing
  lifePlanSubtitle: "9 steps in Transformation Journey → Complete personal plan",
  transformationJourney: "Transformation Journey",
  editTransformationJourney: "Edit Transformation Journey",
  startTransformationJourney: "Start Transformation Journey",
  continueTransformationJourney: "Continue Transformation Journey",
}
```

### עדכון StartChangeModal.tsx
```tsx
const handleSelect = (route: string) => {
  onOpenChange(false);
  navigate(route);
};

// Option 1: Navigate directly to transformation journey
// Change the modal to navigate directly to /launchpad

// Option 2: Keep modal but add transformation journey as first option
// Add a prominent button at the top for the journey
```

### עדכון ProfileDrawer.tsx
```tsx
// Add at top of drawer content, after header:
<div className="p-4 border-b">
  <Button
    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
    onClick={() => {
      onOpenChange(false);
      navigate('/launchpad');
    }}
  >
    <Sparkles className="w-4 h-4 mr-2" />
    {progress?.launchpad_complete 
      ? (language === 'he' ? 'ערוך מסע טרנספורמציה' : 'Edit Transformation Journey')
      : (language === 'he' ? 'התחל מסע טרנספורמציה' : 'Start Transformation Journey')
    }
  </Button>
</div>
```

### קבצים לעדכון
1. `src/i18n/translations/he.ts` - מפתחות תרגום חדשים
2. `src/i18n/translations/en.ts` - מפתחות תרגום חדשים
3. `src/components/StartChangeModal.tsx` - ניווט ישיר ל-launchpad
4. `src/components/dashboard/ProfileDrawer.tsx` - כפתור גישה למסע
5. `src/components/home/LaunchpadPreviewSection.tsx` - עדכון טקסט תצוגה
6. `src/pages/LifePlan.tsx` - עדכון טקסט כפתור
7. `src/components/dashboard/UnifiedDashboardView.tsx` - עדכון טקסט כפתור

### הערות חשובות
- נשמור על ה-route `/launchpad` ללא שינוי (שם טכני פנימי)
- רק הטקסט המוצג למשתמש ישתנה ל-"מסע הטרנספורמציה"
- זה מבטיח תאימות אחורה ומונע שבירת קישורים
