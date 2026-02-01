
# תוכנית: תיקון חיתוך טקסט במשימות

## הבעיה
הטקסט במשימות נחתך בגלל שימוש ב-`truncate` שמסתיר טקסט ארוך. צריך להציג את כל הטקסט במלואו.

---

## השינויים הנדרשים

### קובץ: `src/components/aurora/AuroraChatQuickActions.tsx`

**שינוי 1 - כותרת רשימה (שורה 132):**

לפני:
```tsx
<span className="text-sm font-medium truncate block">
```

אחרי:
```tsx
<span className="text-sm font-medium block break-words whitespace-normal">
```

**שינוי 2 - תוכן משימה (שורות 185-192):**

לפני:
```tsx
<span
  className={cn(
    "text-xs flex-1 truncate",
    item.is_completed && "line-through text-muted-foreground"
  )}
>
  {item.content}
</span>
```

אחרי:
```tsx
<span
  className={cn(
    "text-xs flex-1 break-words whitespace-normal leading-relaxed",
    item.is_completed && "line-through text-muted-foreground"
  )}
>
  {item.content}
</span>
```

**שינוי 3 - הרחבת רוחב הפופאובר (שורה 66):**

לפני:
```tsx
className="w-80 p-0"
```

אחרי:
```tsx
className="w-96 p-0"
```

---

## סיכום

| בעיה | פתרון |
|------|-------|
| טקסט כותרת נחתך | הסרת `truncate`, הוספת `break-words whitespace-normal` |
| טקסט משימה נחתך | הסרת `truncate`, הוספת `break-words whitespace-normal leading-relaxed` |
| פופאובר צר מדי | הגדלת רוחב מ-`w-80` ל-`w-96` |

---

## תוצאה צפויה
כל הטקסטים יוצגו במלואם עם שבירת שורות אוטומטית במקום חיתוך.
