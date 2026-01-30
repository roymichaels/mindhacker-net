
# תוכנית: קטלוג לכל מאמן + העברת תכנים לדין

## הבנת המצב הנוכחי

### מבנה הנתונים הנוכחי:
1. **`offers` table** - מציג מוצרים בקטלוג הראשי (`/courses`) - יש 3 offers פעילים כרגע
2. **`products` table** - מוצרים עם workflow (Personal Hypnosis, Consciousness Leap)
3. **`content_products` table** - קורסים ותוכן סטטי, כבר יש לו `practitioner_id` column!
4. **`practitioners` table** - טבלת מאמנים עם כל הפרטים (כרגע ריקה - אין מאמנים רשומים)

### הבעיה:
- אין חיבור בין offers/products לבין practitioners
- הקטלוג הראשי (`/courses`) מציג את כל ה-offers ללא סינון למאמן
- אין קטלוג ספציפי לכל מאמן בדף הפרופיל שלו

---

## שלב 1: שינויי Database

### 1.1 הוספת practitioner_id לטבלאות offers ו-products
```sql
ALTER TABLE offers ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);
ALTER TABLE products ADD COLUMN practitioner_id UUID REFERENCES practitioners(id);
```

### 1.2 יצירת פרופיל מאמן עבור דין (Admin)
יצירת רשומת practitioner עבור הוא לשימוש המערכת (user_id של האדמין)

---

## שלב 2: עדכון הקטלוג הראשי (`/courses`)

### שינויים בקובץ `src/pages/Courses.tsx`:
1. הוספת סינון אופציונלי לפי `practitioner_id`
2. אם לא נבחר מאמן ספציפי - מציג את כל ה-offers
3. אם נבחר מאמן - מציג רק את ה-offers שלו

### לוגיקה חדשה:
```typescript
// Query offers with optional practitioner filter
let query = supabase
  .from("offers")
  .select("*, practitioners(display_name, slug, avatar_url)")
  .eq("status", "active")
  .eq("landing_page_enabled", true);

if (practitionerId) {
  query = query.eq("practitioner_id", practitionerId);
}
```

---

## שלב 3: קטלוג בדף המאמן (`/practitioner/:slug`)

### עדכון `src/pages/PractitionerProfile.tsx`:
הוספת סקציית קטלוג חדשה שמציגה רק את ה-offers של אותו מאמן

### קומפוננטה חדשה:
```typescript
// src/components/practitioner-landing/PractitionerCatalog.tsx
const PractitionerCatalog = ({ practitionerId }) => {
  const { data: offers } = useQuery({
    queryKey: ['practitioner-offers', practitionerId],
    queryFn: async () => {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', practitionerId)
        .eq('status', 'active')
        .eq('landing_page_enabled', true);
      return data;
    }
  });
  
  return (
    <section>
      {offers?.map(offer => <OfferCard key={offer.id} offer={offer} />)}
    </section>
  );
};
```

---

## שלב 4: Admin Panel - ניהול מוצרים למאמנים

### עדכונים ב-`src/pages/admin/Offers.tsx`:
1. הוספת שדה בחירת practitioner בטופס עריכה/יצירה
2. סינון לפי מאמן בתצוגת הרשימה

### עדכונים ב-`src/pages/admin/Products.tsx`:
1. הוספת שדה practitioner_id בעריכת מוצר
2. סינון לפי מאמן

### עדכונים ב-`src/pages/admin/Content.tsx`:
1. שדה בחירת practitioner כבר קיים (practitioner_id קיים בטבלה)
2. צריך רק לוודא שהממשק מאפשר בחירה

---

## שלב 5: Panel למאמנים (Practitioner Panel)

### עדכון `src/components/panel/UnifiedSidebar.tsx`:
כבר יש `/panel/my-products` בניווט - צריך ליצור את הדף

### יצירת דף חדש: `src/pages/panel/MyProducts.tsx`
מאמנים יוכלו לראות ולנהל רק את המוצרים שלהם:
```typescript
const MyProducts = () => {
  const { data: myProfile } = useMyPractitionerProfile();
  
  const { data: offers } = useQuery({
    queryKey: ['my-offers', myProfile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('practitioner_id', myProfile.id);
      return data;
    },
    enabled: !!myProfile?.id
  });
  
  // Display and manage own offers
};
```

---

## שלב 6: העברת התוכן הקיים לדין

לאחר הוספת הטבלאות:
1. יצירת רשומת practitioner עבור דין (אם לא קיימת)
2. עדכון כל ה-offers הקיימים עם ה-practitioner_id של דין
3. עדכון כל ה-products הקיימים עם ה-practitioner_id של דין

```sql
-- Assign existing offers to Dean's practitioner profile
UPDATE offers SET practitioner_id = '<dean_practitioner_id>';
UPDATE products SET practitioner_id = '<dean_practitioner_id>';
```

---

## סיכום קבצים לעריכה

| קובץ | שינוי |
|------|-------|
| **Database** | הוספת practitioner_id ל-offers ו-products |
| `src/pages/Courses.tsx` | סינון אופציונלי לפי practitioner + הצגת שם המאמן |
| `src/pages/PractitionerProfile.tsx` | הוספת סקציית קטלוג |
| `src/components/practitioner-landing/PractitionerCatalog.tsx` | **חדש** - קטלוג מוצרים של מאמן |
| `src/pages/admin/Offers.tsx` | הוספת שדה practitioner בטופס |
| `src/pages/admin/Products.tsx` | הוספת שדה practitioner בטופס |
| `src/pages/panel/MyProducts.tsx` | **חדש** - ניהול מוצרים למאמנים |
| `src/pages/panel/index.ts` | ייצוא MyProducts |
| `src/App.tsx` | הוספת route ל-MyProducts |

---

## תוצאה סופית

```text
┌────────────────────────────────────────────────────────────────┐
│                        CATALOG STRUCTURE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  /courses                                                      │
│  ├── All Offers (main catalog)                                │
│  │   ├── Shows practitioner name on each card                 │
│  │   └── Optional filter by practitioner                      │
│  │                                                            │
│  /practitioner/dean                                            │
│  ├── Dean's Profile                                            │
│  ├── Dean's Services (sessions, packages)                     │
│  └── Dean's Catalog (offers with practitioner_id = dean)      │
│                                                                │
│  /panel/my-products (for practitioners)                        │
│  └── Manage own offers and products                           │
│                                                                │
│  /admin/offers (for admin)                                     │
│  └── Manage all offers + assign practitioner                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### יתרונות:
1. **קטלוג ראשי** - מציג את כל ה-offers מכל המאמנים
2. **קטלוג למאמן** - כל מאמן מציג רק את המוצרים שלו בדף הפרופיל
3. **Admin יכול להקצות** - מי שיוצר מוצר יכול לבחור לאיזה מאמן הוא שייך
4. **מאמנים יכולים לנהל** - כל מאמן רואה ומנהל רק את שלו ב-Panel
