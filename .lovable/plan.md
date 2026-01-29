
# תכנית: קטלוג עם סימון בעלות בסגנון Skool

## סקירה כללית
הוספת תכונה שמציגה את כל המוצרים בקטלוג ומסמנת אלו שהמשתמש כבר רכש/נרשם אליהם, בדומה לאפליקציית Skool.

## מה ישתנה

### 1. עמוד הקטלוג (Courses.tsx)
- שליפת רשימת ההרשמות של המשתמש המחובר מטבלת `course_enrollments`
- העברת מידע על בעלות לכל כרטיס מוצר

### 2. כרטיס מוצר (CourseCard.tsx)
- הוספת תג "יש לך" (Badge) ירוק בולט בפינה העליונה
- אייקון צ'ק לאישור בעלות
- שינוי הכפתור מ"צפה במוצר" ל"המשך צפייה" למי שרכש
- הצגת התקדמות (progress bar) למי שיש לו את המוצר

### 3. עיצוב ויזואלי (בסגנון Skool)
- תג ירוק עם אייקון ✓ ו"יש לך"
- גבול ירוק עדין סביב כרטיסים שבבעלות
- הבחנה ויזואלית ברורה בין מוצרים שנרכשו לאלו שלא

---

## פרטים טכניים

### שינויים ב-Courses.tsx
```typescript
// הוספת שליפת הרשמות המשתמש
const { data: userEnrollments } = useQuery({
  queryKey: ['user-enrollments', user?.id],
  queryFn: async () => {
    if (!user?.id) return [];
    const { data } = await supabase
      .from('course_enrollments')
      .select('product_id, progress_percentage, is_completed')
      .eq('user_id', user.id);
    return data || [];
  },
  enabled: !!user?.id,
});

// יצירת מפה לבדיקה מהירה
const enrollmentMap = new Map(
  userEnrollments?.map(e => [e.product_id, e]) || []
);

// העברה לכרטיס
<CourseCard 
  course={course} 
  enrollment={enrollmentMap.get(course.id)} 
/>
```

### שינויים ב-CourseCard.tsx
```typescript
interface CourseCardProps {
  course: Tables<"content_products">;
  enrollment?: {
    product_id: string;
    progress_percentage: number | null;
    is_completed: boolean | null;
  };
}

// בתוך הכרטיס - תג בעלות
{enrollment && (
  <Badge className="bg-green-500 text-white flex items-center gap-1">
    <CheckCircle className="h-3 w-3" />
    יש לך
  </Badge>
)}

// כפתור דינמי
<Button>
  {enrollment ? "המשך צפייה" : "צפה במוצר"}
</Button>

// סגנון כרטיס עם גבול ירוק
<Card className={cn(
  "glass-panel ...",
  enrollment && "ring-2 ring-green-500/50"
)}>
```

### תרגומים להוספה
```typescript
// he.ts
courses: {
  owned: "יש לך",
  continueWatching: "המשך צפייה",
}

// en.ts  
courses: {
  owned: "Owned",
  continueWatching: "Continue Watching",
}
```

---

## קבצים לעריכה
1. `src/pages/Courses.tsx` - הוספת שליפת הרשמות והעברה לכרטיסים
2. `src/components/courses/CourseCard.tsx` - הוספת תצוגת בעלות והתקדמות
3. `src/i18n/translations/he.ts` - תרגומים חדשים
4. `src/i18n/translations/en.ts` - תרגומים חדשים

