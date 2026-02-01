
# תוכנית: סקשן חדש "למה לבחור בנו" - מקסימום שכנוע ודופמין

## מטרת הפיצ'ר
להוסיף סקשן משכנע חדש לדף הבית שמדגיש את הערך הייחודי של הפלטפורמה בצורה ויזואלית ממכרת.

## עיצוב הסקשן החדש

### כותרת ראשית:
**"הכל מה שתמיד חיפשת — במקום אחד"**

### כרטיסי Value Prop (6 כרטיסים מרכזיים):

| אייקון | כותרת עברית | כותרת אנגלית | תיאור |
|--------|-------------|---------------|--------|
| 🎧 | היפנוטרפיסט פרטי משלך | Your Personal Hypnotherapist | סשנים מותאמים אישית בכל שעה |
| 🧠 | מאמן תודעתי אישי | Personal Consciousness Coach | Aurora מלווה אותך 24/7 |
| ⚡ | מערכת פרודקטיביות שמבינה אותך | Productivity System That Gets You | משימות, הרגלים ולוח זמנים שמתכווננים אליך |
| 🗺️ | אסטרטגיה וכיוון | Strategy & Direction | תוכנית 90 יום עם יעדים ו-Milestones |
| 🔮 | אווטר שמראה לך מי אתה | Avatar That Shows Who You Are | זהות דיגיטלית שמתפתחת איתך |
| 📊 | דאשבורד מטורף | Crazy Dashboard | כל הנתונים במבט אחד, עם XP, רמות והישגים |

### תת-סקשן "חוויה ממכרת":
- **Badge:** "דופמין בכל לחיצה"
- 3-4 נקודות על הממכרנות:
  - כל פעולה מזכה ב-XP
  - תחרות עם עצמך - עלה ברמות
  - הישגים שנפתחים כמו פרסים
  - הכל מתוכנן כדי שתרצה לחזור

## מיקום בדף הבית

הסקשן החדש יתווסף אחרי `JobShowcaseSection` ולפני `WhatIsThisSection`:

```
GameHeroSection
TransformationProofSection  
JobShowcaseSection
⬇️ **WhyChooseUsSection** (חדש!) ⬇️
WhatIsThisSection
FreeJourneyBannerSection
...
```

## פרטים טכניים

### קבצים שייווצרו:
1. **`src/components/home/WhyChooseUsSection.tsx`** - הסקשן החדש

### קבצים שיערכו:
1. **`src/components/home/index.ts`** - הוספת export
2. **`src/pages/Index.tsx`** - הוספת הסקשן לרצף
3. **`src/i18n/translations/he.ts`** - תרגומים בעברית
4. **`src/i18n/translations/en.ts`** - תרגומים באנגלית

### טכנולוגיות:
- **Framer Motion** - לאנימציות hover ו-viewport
- **Tailwind CSS** - glassmorphism (backdrop-blur)
- **Lucide Icons** - לאייקונים
- גרדיאנטים צבעוניים לכל כרטיס
- Stagger animations לטעינה הדרגתית

### מבנה הקומפוננטה:
```tsx
<section className="py-24 px-4 bg-gradient-to-b">
  {/* Header with badge */}
  <Badge>הכל מה שתמיד חיפשת</Badge>
  <h2>למה לבחור ב-Mind Hacker?</h2>
  
  {/* 6-card grid */}
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {valueProps.map(card => (
      <motion.div whileHover={{ scale: 1.03 }}>
        {/* Gradient icon box */}
        {/* Title + Description */}
      </motion.div>
    ))}
  </div>
  
  {/* Dopamine addiction sub-section */}
  <div className="mt-12 p-6 rounded-2xl bg-card/60 border">
    <Badge>דופמין בכל לחיצה 🔥</Badge>
    <div className="flex flex-wrap gap-4">
      {addictionPoints.map(point => ...)}
    </div>
  </div>
</section>
```

### עיצוב כרטיסים:
- רקע גלאסמורפיזם: `bg-card/60 backdrop-blur-sm`
- גרדיאנט לכל אייקון לפי הנושא
- אנימציית hover עם shadow glow
- RTL-aware עם `dir={isRTL ? 'rtl' : 'ltr'}`

## זמן משוער
~15-20 דקות

