
# תוכנית: תיקון בהירות האורב - למניעת מראה "לבן"

## הבעיה שזוהתה

האורב מופיע כלבן במקום בצבעים המותאמים אישית. הסיבות:

### סיבה 1: Lightness גבוה מדי
ערכי ה-Lightness בהגדרות הנושא (Theme) הם **73%**, שזה גבוה מאוד ב-HSL:
- 50% = צבע טהור
- 73% = צבע בהיר מאוד  
- 100% = לבן מוחלט

### סיבה 2: פורמט HSL לא תואם
הצבעים מועברים בפורמט `hsl(292, 95%, 73%)` אבל חלק מהקוד מצפה לפורמט `292 95% 73%`.

### סיבה 3: Opacity גבוה של קווי הוויירפריים
הקווים מוגדרים עם `opacity: 0.95` שמוסיף לתחושה הלבנה.

---

## השינויים הנדרשים

### שינוי 1: הפחתת Lightness בפונקציית הפענוח
**קובץ:** `src/components/orb/WebGLOrb.tsx`

נוסיף התאמת בהירות בפונקציית `parseHslToThreeColor` - הפחתת 15% מערך ה-Lightness כשהוא גבוה מ-60%:

```typescript
function parseHslToThreeColor(colorStr: string): THREE.Color {
  // ... existing matching code ...
  
  // After parsing, reduce lightness if too bright
  let adjustedL = l;
  if (l > 0.6) {
    adjustedL = 0.4 + (l - 0.6) * 0.5; // Map 60-100% to 40-60%
  }
  
  color.setHSL(h, s, adjustedL);
  return color;
}
```

### שינוי 2: הפחתת Opacity של קווי הוויירפריים
**קובץ:** `src/components/orb/WebGLOrb.tsx`

שינוי ה-opacity מ-0.95 ל-0.75:

```typescript
const lineMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.75,  // היה 0.95
});
```

### שינוי 3: שיפור תמיכה בפורמט HSL מרובה
**קובץ:** `src/components/orb/WebGLOrb.tsx`

הוספת תמיכה בפורמטים נוספים:

```typescript
function parseHslToThreeColor(colorStr: string): THREE.Color {
  // Pattern 1: Space-separated (e.g., "292 95% 73%")
  // Pattern 2: CSS hsl function (e.g., "hsl(292, 95%, 73%)")
  // Pattern 3: CSS hsl with spaces (e.g., "hsl(292 95% 73%)")
  // + התאמת בהירות
}
```

---

## פרטים טכניים

### לוגיקת התאמת הבהירות:
- אם L > 60%: נמפה את הטווח 60-100% לטווח 40-60%
- הנוסחה: `adjustedL = 0.4 + (l - 0.6) * 0.5`
- דוגמה: L=73% → adjustedL = 0.4 + 0.13 * 0.5 = 46.5%

### קבצים לשינוי:
1. `src/components/orb/WebGLOrb.tsx` - פונקציית parseHslToThreeColor + opacity
2. `src/components/orb/MultiThreadOrb.tsx` - אותו שינוי לפונקציה המקבילה

---

## תוצאה צפויה
האורב יופיע בצבעים עמוקים ועשירים יותר במקום לבן בוהק, תוך שמירה על האופי הייחודי של הפרופיל.
