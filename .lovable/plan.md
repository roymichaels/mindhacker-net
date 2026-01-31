
# תיקון האורב התלת-מימדי - Full Solid Mercury Sphere

## הבעיה
האורב נראה "חתוך" כמו פקמן במקום כדור מלא. זה נגרם מכמה בעיות טכניות ברנדור.

---

## הסיבות הטכניות

1. **רינדור צד אחד בלבד**: הקוד משתמש ב-`THREE.FrontSide` שמרנדר רק את הצד הקדמי של הכדור
2. **מיקום מצלמה קרוב מדי**: המצלמה ב-z=2.8 עם רדיוס 0.85 יוצרת חיתוך
3. **עיוות קודקודים אגרסיבי**: המורפינג החזק גורם לחלקים "להיעלם"
4. **בעיית Frustum Culling**: חלקים מהכדור נחתכים מהתצוגה

---

## הפתרון

### שלב 1: רנדור דו-צדדי
```typescript
// לפני
side: THREE.FrontSide

// אחרי  
side: THREE.DoubleSide
```

### שלב 2: כיול מצלמה מחדש
- הרחקת המצלמה ל-z=3.5 (במקום 2.8)
- שינוי FOV ל-45 מעלות
- near plane של 0.1 (לא 0.01)

### שלב 3: ביטול Frustum Culling
```typescript
mainOrb.frustumCulled = false;
```

### שלב 4: הקטנת עוצמת המורפינג
- הקטנת `morphIntensity` מ-0.15 ל-0.08
- הגבלת טווח העיוות המקסימלי

### שלב 5: שיפור Inner Core
- הגדלת האטימות של הליבה הפנימית
- שינוי ל-DoubleSide גם לליבה
- הוספת עומק ויזואלי

---

## שינויים בקבצים

### `src/components/orb/MultiThreadOrb.tsx`

**מצלמה (שורה ~172)**
```typescript
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 0, 3.5);
```

**גאומטריה (שורה ~234)**
```typescript
const mainGeometry = new THREE.SphereGeometry(0.9, 128, 128);
```

**מטריאל (שורה ~264)**
```typescript
side: THREE.DoubleSide,  // שינוי מ-FrontSide
depthWrite: true,
```

**Frustum Culling (אחרי יצירת המש)**
```typescript
mainOrb.frustumCulled = false;
```

**מורפינג (שורה ~366)**
```typescript
const morphIntensity = vis.organicFlow * 0.08 * morphMod; // הקטנה מ-0.15
```

**תנועת מצלמה (שורה ~453-454)**
```typescript
// שמירה על מרחק קבוע יותר
camera.position.z = 3.5 + Math.sin(time * 0.18) * 0.03;
```

---

## התוצאה הצפויה

- כדור מלא 360° ללא חיתוכים
- מראה מתכתי/כספי (mercury) עם השתקפויות
- תנועה נוזלית אורגנית (אבל מבוקרת)
- עובד בכל גדלי המסך וכל המיקומים באפליקציה
