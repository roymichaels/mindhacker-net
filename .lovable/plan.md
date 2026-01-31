

# תיקון פרופיל דין והוספת גישה לפאנל מאמן

## סיכום הבעיות שזיהיתי

### 1. בעיית ה-Route (404)
- המשתמש גולש ל-`/practitioners/dean` (רבים)
- אבל ה-route המוגדר הוא `/practitioner/:slug` (יחיד)
- צריך להוסיף redirect או route נוסף

### 2. דין חסר תפקיד "מאמן" (practitioner)
- יש לו רשומה בטבלת `practitioners` עם `user_id: 299f9800-48d9-4429-958b-b661595bd2dd`
- אבל אין לו שום תפקיד בטבלת `user_roles` (שאילתה מחזירה מערך ריק)
- בגלל זה הוא לא יוכל לגשת לפאנל המאמנים

### 3. כפתור פאנל מאמן חסר בתפריט
- ב-Header יש כפתור "פאנל ניהול" שמופיע רק לאדמינים
- צריך להוסיף כפתור "פאנל מאמן" למי שיש לו תפקיד practitioner

---

## תוכנית פעולה

### שלב 1: תיקון ה-Routes (App.tsx)
**קובץ:** `src/App.tsx`

הוספת route נוסף שיתמוך גם בפורמט `/practitioners/:slug`:
```tsx
<Route path="/practitioner/:slug" element={<PractitionerProfile />} />
<Route path="/practitioners/:slug" element={<PractitionerProfile />} /> // הוספה
```

### שלב 2: הענקת תפקיד מאמן לדין (Database Migration)
**פעולה:** הוספת רשומה לטבלת `user_roles`

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('299f9800-48d9-4429-958b-b661595bd2dd', 'practitioner');
```

כדי שדין יוכל:
- לגשת לפאנל `/panel`
- לנהל לקוחות, שירותים, מוצרים והכנסות
- לראות את הסיידבר "הפרקטיקה שלי"

### שלב 3: הוספת כפתור פאנל מאמן ל-Header
**קובץ:** `src/components/Header.tsx`

שינויים נדרשים:
1. ייבוא ה-hook `useUserRoles` לבדיקת תפקידים
2. הוספת כפתור "פאנל מאמן" ב-Avatar Dropdown (מובייל)
3. הכפתור יופיע רק למי שיש תפקיד `practitioner`

```tsx
// בתוך ה-imports
import { useUserRoles } from '@/hooks/useUserRoles';

// בתוך הקומפוננטה
const { hasRole, hasPanelAccess } = useUserRoles();

// בתוך DropdownMenuContent (לאחר Dashboard)
{hasPanelAccess() && (
  <DropdownMenuItem onClick={() => navigate("/panel")}>
    <Briefcase className="mr-2 h-4 w-4" />
    {t('header.practitionerPanel')}
  </DropdownMenuItem>
)}
```

### שלב 4: הוספת תרגומים
**קבצים:** `src/i18n/translations/he.ts`, `src/i18n/translations/en.ts`

```typescript
// he.ts
header: {
  // ... existing
  practitionerPanel: "פאנל מאמן",
}

// en.ts
header: {
  // ... existing
  practitionerPanel: "Coach Panel",
}
```

---

## פרטים טכניים

### קבצים לעריכה
| קובץ | שינוי |
|------|-------|
| `src/App.tsx` | הוספת route `/practitioners/:slug` |
| `src/components/Header.tsx` | הוספת כפתור פאנל מאמן + ייבוא hook |
| `src/i18n/translations/he.ts` | תרגום `practitionerPanel` |
| `src/i18n/translations/en.ts` | תרגום `practitionerPanel` |

### Database Migration
```sql
-- Add practitioner role for Dean
INSERT INTO user_roles (user_id, role)
VALUES ('299f9800-48d9-4429-958b-b661595bd2dd', 'practitioner')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## תוצאה צפויה

1. **פרופיל דין יהיה נגיש** בשני ה-URLs:
   - `/practitioner/dean`
   - `/practitioners/dean`

2. **דין יקבל גישה לפאנל** עם הסיידבר "הפרקטיקה שלי" שכולל:
   - לקוחות
   - שירותים
   - יומן
   - המוצרים שלי
   - הכנסות
   - פרופיל

3. **כפתור "פאנל מאמן"** יופיע בתפריט האווטר למשתמשים עם תפקיד practitioner/admin/affiliate

