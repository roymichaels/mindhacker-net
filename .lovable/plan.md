

# תוכנית: שמירה מלאה של כל השיחות והנתונים במסע הטרנספורמציה

## הבעיה המרכזית

צעד 4 (**השיחה עם אורורה**) לא שומר את ה-transcript כלל. בכל פעם שחוזרים לצעד הזה, השיחה מתחילה מאפס עם ההודעה הראשונה. המשתמש ביקש במפורש שכל ההודעות יישמרו ויוצגו מחדש.

בנוסף, צעד 3 (GrowthDeepDiveStep) לא משולב במערכת ה-auto-save.

## היקף הפתרון

### צעד 4 - FirstChatStep (השינוי העיקרי)

יש ליצור לוגיקה לשמירה וטעינה של השיחה המלאה:

1. **שמירה לדאטאבייס** - עמודה `step_2_summary` כבר קיימת בטבלה, נשתמש בה לשמור JSON עם:
   - `messages` - מערך כל ההודעות (role + content)
   - `questionIndex` - באיזו שאלה המשתמש
   - `answers` - התשובות של המשתמש
   - `isComplete` - האם סיים

2. **טעינה מהדאטאבייס** - כשנכנסים לצעד:
   - אם יש שיחה קיימת → טוען ומציג את כל ההודעות
   - אם השיחה הושלמה → מראה את כל השיחה עם כפתור "המשך"
   - אם לא הושלמה → ממשיך מאותה נקודה

3. **Auto-save מיידי** - בכל הודעה חדשה (user או assistant) → שמירה אוטומטית

### צעד 3 - GrowthDeepDiveStep

- הוספת `savedData` ו-`onAutoSave` props
- שמירה ב-`step_2_profile_data.deep_dive`
- טעינה ראשונית מהנתונים השמורים

### עדכון useLaunchpadAutoSave

הרחבת ה-hook לתמיכה בצעד 4:
- מיפוי step 4 ← `step_2_summary` (כ-JSON עם השיחה)
- הוספת לוגיקת טעינה ל-step 4

### עדכון LaunchpadFlow

- העברת `savedData` ו-`onAutoSave` לצעדים 3 ו-4
- שימוש ב-key ייחודי לכל צעד (כבר קיים)

---

## שינויים טכניים לפי קובץ

### 1. `src/hooks/useLaunchpadAutoSave.ts`

```typescript
// הוספה ל-saveToDatabase:
case 4: // First Chat
  updates.step_2_summary = JSON.stringify(data);
  break;

// הוספה ל-getSavedData:
case 4: // First Chat
  if (launchpadData?.firstChat) {
    try {
      dbData = typeof launchpadData.firstChat === 'string' 
        ? JSON.parse(launchpadData.firstChat)
        : launchpadData.firstChat;
    } catch {}
  }
  break;
```

### 2. `src/hooks/useLaunchpadData.ts`

הוספת שליפה של `step_2_summary` ומיפוי ל-`firstChat`:

```typescript
// בתוך ה-query:
let firstChat = null;
try {
  if (progress.step_2_summary) {
    firstChat = typeof progress.step_2_summary === 'string'
      ? JSON.parse(progress.step_2_summary)
      : progress.step_2_summary;
  }
} catch (e) {
  console.error('Error parsing first chat data:', e);
}

// ב-return:
return {
  // ... existing
  firstChat,
};
```

### 3. `src/components/launchpad/steps/FirstChatStep.tsx`

שינוי מלא של הקומפוננטה:

```typescript
interface FirstChatStepProps {
  onComplete: (data: { summary: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
  savedData?: {
    messages?: Message[];
    questionIndex?: number;
    answers?: string[];
    isComplete?: boolean;
  };
  onAutoSave?: (data: { messages: Message[]; questionIndex: number; answers: string[]; isComplete: boolean }) => void;
}

// אתחול מ-savedData:
const [messages, setMessages] = useState<Message[]>(savedData?.messages || []);
const [questionIndex, setQuestionIndex] = useState(savedData?.questionIndex || 0);
const [answers, setAnswers] = useState<string[]>(savedData?.answers || []);

// בכל שינוי להודעות:
useEffect(() => {
  if (messages.length > 0 && onAutoSave) {
    onAutoSave({
      messages,
      questionIndex,
      answers,
      isComplete: questionIndex >= 5,
    });
  }
}, [messages, questionIndex, answers]);

// ביצירת הודעת greeting ראשונית:
useEffect(() => {
  if (savedData?.messages && savedData.messages.length > 0) {
    return; // יש שיחה שמורה, לא יוצרים greeting חדש
  }
  // ... המשך הלוגיקה הקיימת
}, []);
```

### 4. `src/components/launchpad/steps/GrowthDeepDiveStep.tsx`

הוספת props ושמירה אוטומטית:

```typescript
interface GrowthDeepDiveStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
  previousAnswers?: Record<string, unknown>;
  savedData?: { answers?: Record<string, string[]>; currentAreaIndex?: number };
  onAutoSave?: (data: { answers: Record<string, string[]>; currentAreaIndex: number }) => void;
}

// אתחול מ-savedData:
const [answers, setAnswers] = useState<Record<string, string[]>>(savedData?.answers || {});
const [currentAreaIndex, setCurrentAreaIndex] = useState(savedData?.currentAreaIndex || 0);

// בכל שינוי לתשובות:
useEffect(() => {
  if (Object.keys(answers).length > 0 && onAutoSave) {
    onAutoSave({ answers, currentAreaIndex });
  }
}, [answers, currentAreaIndex]);
```

### 5. `src/components/launchpad/LaunchpadFlow.tsx`

עדכון להעברת props לצעדים 3 ו-4:

```typescript
case 3:
  return (
    <GrowthDeepDiveStep 
      key={`step-3-${viewingStep ?? 'current'}`}
      {...stepProps} 
      previousAnswers={profileData || undefined}
      savedData={getSavedData(3) as { answers?: Record<string, string[]>; currentAreaIndex?: number } | undefined}
      onAutoSave={(data) => handleAutoSave(3, data)}
    />
  );
case 4:
  return (
    <FirstChatStep 
      key={`step-4-${viewingStep ?? 'current'}`}
      {...stepProps}
      savedData={getSavedData(4) as { messages?: Message[]; questionIndex?: number; answers?: string[]; isComplete?: boolean } | undefined}
      onAutoSave={(data) => handleAutoSave(4, data)}
    />
  );
```

---

## זרימת הנתונים החדשה

```text
משתמש נכנס לצעד 4 (שיחה עם אורורה)
         │
         ▼
LaunchpadFlow קורא ל-getSavedData(4)
         │
         ├── יש נתונים בדאטאבייס? ───> טוען messages, questionIndex, answers
         │                                     │
         │                                     ▼
         │                            FirstChatStep מציג את כל ההודעות הקודמות
         │                            ממשיך מהשאלה שבה נעצר המשתמש
         │
         └── אין נתונים ───> מתחיל שיחה חדשה (greeting + שאלה 1)
                                     │
                                     ▼
                            משתמש שולח הודעה
                                     │
                                     ▼
                            onAutoSave({ messages, questionIndex, answers, isComplete })
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             localStorage (מיידי)              DB (debounced 500ms)
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                            חוזר לצעד מאוחר יותר
                                     │
                                     ▼
                            רואה את כל השיחה הקודמת ✅
```

---

## תוצאה צפויה

לאחר היישום:

1. **צעד 3** - תשובות ה-deep dive נשמרות ונטענות מחדש
2. **צעד 4** - **השיחה המלאה עם אורורה נשמרת** - כל ההודעות, השאלות והתשובות
3. כשחוזרים לצעד 4 אחרי שסיימו → רואים את כל השיחה שהייתה
4. כשחוזרים לצעד 4 באמצע → ממשיכים מאותה נקודה
5. כל הצעדים האחרים (1, 2, 7, 8) כבר עובדים עם auto-save

---

## סדר יישום

1. עדכון `useLaunchpadData.ts` - הוספת firstChat לנתונים הנטענים
2. עדכון `useLaunchpadAutoSave.ts` - תמיכה בצעדים 3 ו-4
3. עדכון `FirstChatStep.tsx` - קבלת savedData + onAutoSave + לוגיקת טעינה/שמירה
4. עדכון `GrowthDeepDiveStep.tsx` - קבלת savedData + onAutoSave
5. עדכון `LaunchpadFlow.tsx` - העברת props לצעדים 3 ו-4

