
# תוכנית: עדכון רקע ה-Avatar Dropdown לסגנון כרטיס הזהות

## מה צריך לעשות
להחליף את הרקע של ה-DropdownMenuContent ב-AuroraAccountDropdown כך שיהיה זהה לרקע של כרטיס הזהות (Identity HUD) - גרדיאנט אפור כהה עם אפקט blur וגבול זוהר.

---

## שינויים נדרשים

### קובץ: `src/components/aurora/AuroraAccountDropdown.tsx`

**שורה 131-134** - עדכון ה-DropdownMenuContent:

**לפני:**
```tsx
<DropdownMenuContent
  align={isRTL ? "end" : "start"}
  side="top"
  className="w-56 bg-card border border-border shadow-xl z-[100]"
>
```

**אחרי:**
```tsx
<DropdownMenuContent
  align={isRTL ? "end" : "start"}
  side="top"
  className="w-56 backdrop-blur-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 border border-primary/30 shadow-xl z-[100] overflow-hidden"
>
  {/* Glow overlay - same as Identity Card */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
  <div className="relative z-10">
    {/* All existing menu items */}
  </div>
```

---

## סיכום הסגנון

| מאפיין | ערך |
|--------|-----|
| רקע | גרדיאנט gray-900 → gray-800 → gray-900 (dark: gray-950 → gray-900 → gray-950) |
| Blur | backdrop-blur-xl |
| גבול | border-primary/30 |
| זוהר | from-primary/20 via-transparent to-accent/20 |
| צל | shadow-xl |

---

## תוצאה צפויה
הדרופדאון יראה כמו "מיני כרטיס זהות" עם אותו אפקט עמוק וזוהר של ה-HUD הראשי.
