
# תוכנית: הוספת כותרת זהות מותאמת אישית לפרופיל הזהות

## סקירה
הוספת תצוגה של "כותרת זהות" קצרה ומשחקית (כמו "נינג'ה", "ארכיטקט", "לוחם האור") לתוך מודאל פרופיל הזהות בדאשבורד. הכותרת תהיה סיכום ויזואלי ופואטי של מי שהמשתמש בחר להיות.

## מקור הנתונים
הנתונים כבר קיימים במערכת:
- הטבלה `launchpad_summaries` מכילה את `summary_data.identity_profile.suggested_ego_state`
- ה-Edge Function `generate-identity-archetype` יכול ליצור ארכיטייפ AI מותאם אישית עם שם ייחודי

## שלבי הביצוע

### שלב 1: עדכון סכמת הנתונים (Database Migration)
הוספת `element_type` חדש: `identity_title` לטבלה `aurora_identity_elements`:
- עדכון ה-CHECK constraint לכלול `'identity_title'`
- זה יאפשר שמירה של כותרת זהות אישית לכל משתמש

### שלב 2: עדכון יצירת הסיכום (Edge Function)
שינוי `generate-launchpad-summary` כך שייצור גם כותרת זהות:
- הוספת שדה `identity_title` לפרומפט ה-AI
- הכותרת תהיה 1-3 מילים משחקיות (כמו "נינג'ה של הביצוע", "ארכיטקט החלומות")
- שמירת הכותרת ב-`aurora_identity_elements` עם `element_type: 'identity_title'`

### שלב 3: עדכון ה-Hook לקריאת הנתונים
עדכון `useDashboard.tsx`:
- הוספת חילוץ של `identity_title` מתוך `identityElements`
- הוספת החזרת `identityTitle` מה-hook

עדכון `useUnifiedDashboard.ts`:
- הוספת `identityTitle` ל-interface ולנתונים המוחזרים

### שלב 4: עדכון ה-IdentityModal ו-IdentityProfileCard
הוספת הצגת כותרת הזהות בראש המודאל:
- עיצוב בולט עם גרדיאנט ואייקון
- אנימציה עדינה
- תמיכה בעברית ואנגלית

### שלב 5: עדכון Props של המודאל
העברת `identityTitle` מ-`UnifiedDashboardView` ל-`IdentityModal`

---

## פרטים טכניים

### מבנה נתונים חדש
```typescript
interface IdentityTitle {
  title: string;      // "נינג'ה של הביצוע"
  titleEn?: string;   // "Execution Ninja"
  icon?: string;      // emoji
}
```

### עדכון הפרומפט ב-AI
הוספה ל-system prompt של generate-launchpad-summary:
```
"identity_title": {
  "title": "כותרת זהות קצרה 1-3 מילים בעברית - משהו משחקי ומעורר",
  "title_en": "Short 1-3 word identity title in English",
  "icon": "אימוג'י אחד שמייצג את הזהות"
}
```

### עיצוב בממשק
הכותרת תוצג בראש מודאל "פרופיל זהות" עם:
- גרדיאנט מ-primary ל-accent
- אייקון גדול (emoji)
- פונט בולט וגודל text-xl
- אנימציה fade-in

### קבצים לעדכון
1. `supabase/functions/generate-launchpad-summary/index.ts` - הוספת identity_title לפרומפט
2. `src/hooks/aurora/useDashboard.tsx` - חילוץ identityTitle
3. `src/hooks/useUnifiedDashboard.ts` - הוספת identityTitle
4. `src/components/dashboard/DashboardModals.tsx` - עדכון IdentityModal props
5. `src/components/dashboard/unified/IdentityProfileCard.tsx` - הוספת הצגת הכותרת
6. `src/components/dashboard/UnifiedDashboardView.tsx` - העברת identityTitle למודאל

### Migration SQL
```sql
ALTER TABLE aurora_identity_elements 
DROP CONSTRAINT aurora_identity_elements_element_type_check;

ALTER TABLE aurora_identity_elements
ADD CONSTRAINT aurora_identity_elements_element_type_check 
CHECK (element_type = ANY (ARRAY[
  'value', 'principle', 'self_concept', 
  'vision_statement', 'character_trait', 
  'role_model', 'identity_title', 'ai_archetype'
]));
```
