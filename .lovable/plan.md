
# תיקון עיצוב ה-Dropdown לתמיכה בתמה

## הבעיה
הדרופדאון (תפריט המשתמש) מופיע עם רקע לבן בטעות במצב כהה, במקום להשתמש בצבעי התמה שהוגדרו במערכת.

## הסיבה
הקומפוננטה הבסיסית `dropdown-menu.tsx` משתמשת בערכים קשיחים (`bg-white`, `text-gray-900`) במקום במשתני CSS סמנטיים (`bg-popover`, `text-popover-foreground`) שכבר מוגדרים נכון לשני המצבים.

## הפתרון
עדכון הקומפוננטה `src/components/ui/dropdown-menu.tsx` להסיר את הערכים הקשיחים ולהשתמש במשתנים הנכונים:

### שינויים נדרשים:

1. **DropdownMenuContent** (שורות 66-71):
   - לפני: `bg-white dark:bg-popover ... text-gray-900 dark:text-popover-foreground`
   - אחרי: `bg-popover text-popover-foreground`

2. **DropdownMenuSubContent** (שורות 46-50):
   - אותו שינוי

3. **DropdownMenuItem** (שורה 88):
   - לפני: `text-gray-900 dark:text-foreground` ו-`focus:bg-gray-100 dark:focus:bg-muted hover:bg-gray-100 dark:hover:bg-muted`
   - אחרי: `text-popover-foreground focus:bg-muted hover:bg-muted`

4. **DropdownMenuSubTrigger** (שורה 28):
   - אותו שינוי

## תוצאה צפויה
הדרופדאון יירש את הצבעים הנכונים מהתמה:
- **מצב כהה**: רקע כהה עם טקסט לבן (כמו שאר הממשק)
- **מצב בהיר**: רקע לבן עם טקסט כהה

## פרטים טכניים
קובץ אחד לעריכה:
- `src/components/ui/dropdown-menu.tsx`
