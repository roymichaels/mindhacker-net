

# תיקון שגיאת שליחת טופס - בעיית RLS

## הבעיה שזוהתה

לוגים מהמערכת מראים:
```
"new row violates row-level security policy for table 'form_submissions'"
```

**שורש הבעיה:** הקוד ב-`FormView.tsx` מבצע INSERT ואז מיד SELECT:
```typescript
const { data: submissionData, error } = await supabase
  .from("form_submissions")
  .insert({ ... })
  .select('id').single();  // ← זה נכשל!
```

- ה-INSERT עובד (יש policy לזה)
- ה-SELECT נכשל כי **אין policy שמאפשרת לאנונימיים לקרוא** את form_submissions

## הפתרון

הוספת SELECT policy שמאפשרת למגישי טפסים לקרוא רק את ההגשה שלהם עצמם (על בסיס session).

**מאחר שמשתמשים אנונימיים לא ניתן לזהות ב-RLS**, הפתרון הטוב ביותר הוא לשנות את הקוד כך שלא ידרוש SELECT אחרי INSERT, תוך שימוש ב-`returning: 'minimal'` וחישוב מקומי של ה-ID.

## שלבי הביצוע

### שלב 1: עדכון הקוד ב-FormView.tsx

שינוי ה-handleSubmit function כך שתעבוד בלי לדרוש SELECT אחרי INSERT:

**לפני:**
```typescript
const { data: submissionData, error } = await supabase
  .from("form_submissions")
  .insert({ ... })
  .select('id').single();
```

**אחרי:**
```typescript
// Generate ID client-side
const submissionId = crypto.randomUUID();

const { error } = await supabase
  .from("form_submissions")
  .insert({ 
    id: submissionId,  // Provide ID explicitly
    ... 
  });

// Use the pre-generated ID
setSubmissionId(submissionId);
```

## פרטים טכניים

**שינויים בקובץ:**
- `src/pages/FormView.tsx` - lines 254-288

**הסבר:**
- ניצור UUID בצד הלקוח לפני ה-INSERT
- נספק את ה-ID במפורש בהכנסה
- נשתמש ב-ID שיצרנו ללא צורך ב-SELECT

**יתרונות:**
- לא דורש שינויי RLS בבסיס הנתונים
- פשוט יותר ובטוח יותר
- תואם לארכיטקטורה הקיימת

