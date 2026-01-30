

# הבהרת שאלות - מצב נוכחי vs מה שרוצה

## הבעיה

בשאלון Personal Profile, השאלות לא מבהירות האם הכוונה ל:
- **מצב נוכחי** - "כמה שעות אתה ישן כרגע?"
- **מצב רצוי** - "כמה שעות אתה רוצה לישון?"

## הפתרון

הוספת תת-כותרת (subtitle) לכל שאלה שמבהירה את ההקשר.

### קטגוריות שאלות:

| סוג | דוגמאות | הבהרה |
|-----|---------|-------|
| **עובדתי** | גיל, מין, ילדים, מגורים | לא צריך הבהרה - ברור שזה המצב הנוכחי |
| **התנהגות נוכחית** | שעות שינה, תדירות אימונים, עישון, אלכוהול, קפאין, תזונה | צריך להוסיף: "כרגע" / "Currently" |
| **תחושות נוכחיות** | רמת סטרס, מקורות אנרגיה | צריך להוסיף: "כרגע" / "Currently" |
| **ניסיון** | מדיטציה, טיפול | ברור מהאופציות שזה על העבר והווה |
| **סגנון** | החלטות, קונפליקטים | ברור שזה על הדרך שלו כרגע |

---

## שינויים בקובץ

**קובץ:** `src/components/launchpad/steps/PersonalProfileStep.tsx`

### 1. הוספת שדה subtitle לכל קטגוריה רלוונטית

```typescript
// דוגמה - sleep_hours
sleep_hours: {
  section: 'health',
  title: 'שעות שינה',
  titleEn: 'Sleep Hours',
  subtitle: 'כמה אתה ישן כרגע בממוצע?',    // חדש
  subtitleEn: 'How much do you currently sleep on average?', // חדש
  icon: '😴',
  ...
},

// דוגמה - stress_level  
stress_level: {
  section: 'mental',
  title: 'רמת סטרס',
  titleEn: 'Stress Level',
  subtitle: 'מה רמת הלחץ שלך בחיים כרגע?',
  subtitleEn: 'What is your current stress level?',
  icon: '😰',
  ...
},
```

### 2. שאלות שצריכות הבהרה:

| שאלה | הבהרה בעברית | הבהרה באנגלית |
|------|--------------|----------------|
| `sleep_hours` | "כמה אתה ישן כרגע בממוצע?" | "How much do you currently sleep on average?" |
| `exercise_frequency` | "כמה פעמים בשבוע אתה מתאמן כרגע?" | "How often do you currently exercise?" |
| `exercise_types` | "באילו אימונים אתה עוסק כרגע?" | "What types of exercise do you currently do?" |
| `smoking` | "האם אתה מעשן כרגע?" | "Do you currently smoke?" |
| `alcohol` | "מה צריכת האלכוהול שלך כרגע?" | "What is your current alcohol consumption?" |
| `caffeine` | "כמה קפאין אתה צורך כרגע?" | "How much caffeine do you currently consume?" |
| `hydration` | "מה אתה שותה בדרך כלל?" | "What do you usually drink?" |
| `supplements` | "אילו תוספים אתה לוקח כרגע?" | "What supplements do you currently take?" |
| `diet` | "איך נראית התזונה שלך כרגע?" | "What does your diet currently look like?" |
| `stress_level` | "מה רמת הסטרס שלך כרגע?" | "What is your current stress level?" |
| `energy_source` | "מה נותן לך אנרגיה בדרך כלל?" | "What usually gives you energy?" |
| `relaxation_methods` | "מה מרגיע אותך בדרך כלל?" | "What usually relaxes you?" |

### 3. עדכון ה-UI להציג את ה-subtitle

בחלק שמציג את כותרת השאלה, הוספת שורה:

```tsx
{/* Title */}
<h3 className="text-lg font-semibold mb-1">
  {category.icon} {isRTL ? category.title : category.titleEn}
</h3>

{/* Subtitle - clarification (חדש) */}
{category.subtitle && (
  <p className="text-sm text-muted-foreground mb-3">
    {isRTL ? category.subtitle : category.subtitleEn}
  </p>
)}
```

---

## סיכום

| פריט | פעולה |
|------|-------|
| הוספת שדות `subtitle` ו-`subtitleEn` | ל-12 קטגוריות |
| עדכון ה-UI | הצגת תת-כותרת מתחת לכותרת הראשית |
| קובץ יחיד | `src/components/launchpad/steps/PersonalProfileStep.tsx` |

