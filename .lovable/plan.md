

# תכנית: הגדלת כפתורי ההצעות בשלב תכנון השבוע

## מה הבעיה?
כרגע הכפתורים/צ'יפים של ההצעות קטנים מדי:
- `px-3 py-2` - ריפוד קטן
- `text-xs` - טקסט זעיר
- `gap-1.5` - רווח קטן בין האייקון לטקסט
- `rounded-full` - עיגול שמגביל

## הפתרון: עיצוב גדול ובולט יותר

### שינויים ויזואליים

**1. כפתורי פעולות (Actions):**
- ריפוד: `px-3 py-2` → `px-4 py-3`
- טקסט: `text-xs` → `text-sm font-medium`
- אייקון: גדול יותר עם `text-lg`
- עיגול: `rounded-full` → `rounded-xl`
- רווח: `gap-1.5` → `gap-2.5`
- הוספת מינימום רוחב

**2. כפתורי הרגל עוגן (Anchors):**
- אותם שינויים כמו הפעולות

**3. כותרות הסעיפים:**
- הגדלת האייקונים והטקסט

**4. תצוגת הבחירות:**
- הגדלת הטקסט והריפוד

---

## פרטים טכניים

### קובץ: `src/components/launchpad/steps/FirstWeekStep.tsx`

**שורות 181-215 (כפתורי פעולות):**
```tsx
// לפני
className={cn(
  "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all",
  ...
)}
<span className="text-xs">{label}</span>

// אחרי
className={cn(
  "relative flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all min-w-fit",
  ...
)}
<span className="text-base">{action.icon}</span>
<span className="text-sm font-medium">{label}</span>
```

**שורות 258-282 (כפתורי הרגל עוגן):**
```tsx
// אותם שינויים
```

**שורות 169-178 (כותרת סעיף פעולות):**
```tsx
// הגדלת האייקון ל-w-5 h-5
// הגדלת הטקסט ל-text-base
```

---

## תוצאה צפויה
- כפתורים גדולים ונוחים ללחיצה
- טקסט קריא יותר
- חוויה מובייל-פרנדלית יותר
- מראה מקצועי ומודרני

