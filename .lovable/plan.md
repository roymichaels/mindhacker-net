
# תוכנית: מערכת הודעות בסגנון טלגרם

## סקירה

נבנה מערכת הודעות מלאה הכוללת:
1. **דף הודעות ראשי** - רשימת שיחות (כמו טלגרם)
2. **צ'אט AI מוצמד** - תמיד ראשון ברשימה
3. **הודעות פרטיות בין משתמשים** - כמו Twitter DMs
4. **פרופילי משתמשים** - ללא פיד אישי

---

## מבנה הדפים החדשים

```text
/messages                    → רשימת שיחות (Conversations List)
/messages/ai                 → צ'אט עם AI (Aurora)
/messages/:conversationId    → צ'אט עם משתמש אחר
/community/profile/:userId   → פרופיל משתמש (כבר קיים)
```

---

## שינויים בתפריט התחתון

**לפני:**
```
[ דאשבורד ] [ צ'אט ]
```

**אחרי:**
```
[ דאשבורד ] [ צ'אט ]
                ↓
           נווט ל-/messages
```

---

## מסד נתונים - טבלאות חדשות

### טבלה 1: `conversations`
| עמודה | סוג | תיאור |
|-------|-----|-------|
| id | UUID | מזהה ייחודי |
| type | ENUM | 'direct' / 'ai' |
| participant_1 | UUID | user_id של משתתף 1 |
| participant_2 | UUID | user_id של משתתף 2 (null עבור AI) |
| last_message_at | TIMESTAMP | זמן ההודעה האחרונה |
| created_at | TIMESTAMP | זמן יצירה |

### טבלה 2: `messages`
| עמודה | סוג | תיאור |
|-------|-----|-------|
| id | UUID | מזהה ייחודי |
| conversation_id | UUID | FK לשיחה |
| sender_id | UUID | user_id של השולח (null עבור AI) |
| content | TEXT | תוכן ההודעה |
| is_ai_message | BOOLEAN | האם הודעה מ-AI |
| is_read | BOOLEAN | האם נקרא |
| created_at | TIMESTAMP | זמן שליחה |

---

## רכיבים חדשים

### 1. דף Messages (`/messages`)
```text
┌─────────────────────────────────────────┐
│ < חזור          הודעות            ✎     │  ← Header
├─────────────────────────────────────────┤
│ 🤖 Aurora (AI)              עכשיו       │  ← מוצמד ראשון
│    היי! איך אני יכול לעזור?              │
├─────────────────────────────────────────┤
│ 👤 יוסי כהן                  2 דק        │
│    תודה על ההמלצה!                       │
├─────────────────────────────────────────┤
│ 👤 מירב לוי                  1 שעה       │
│    ראית את הפוסט החדש?                  │
└─────────────────────────────────────────┘
```

### 2. רכיב ConversationsList
- מציג רשימת שיחות
- AI chat מוצמד ראשון תמיד
- Avatar + שם + הודעה אחרונה + זמן
- Badge לא נקרא

### 3. רכיב MessageThread
- תצוגת הודעות בשיחה
- Header עם פרטי הצד השני
- Input בתחתית
- תמיכה ב-streaming עבור AI

### 4. עדכון GlobalBottomNav
- Tab "צ'אט" ינווט ל-`/messages` במקום לפתוח ChatPanel

---

## קבצים חדשים

| קובץ | תיאור |
|------|-------|
| `src/pages/Messages.tsx` | דף ראשי - רשימת שיחות |
| `src/pages/MessageThread.tsx` | דף שיחה בודדת |
| `src/components/messages/ConversationItem.tsx` | פריט שיחה ברשימה |
| `src/components/messages/MessageBubble.tsx` | בועת הודעה |
| `src/components/messages/NewMessageDialog.tsx` | דיאלוג יצירת שיחה חדשה |

---

## קבצים לעריכה

| קובץ | שינוי |
|------|-------|
| `src/components/GlobalBottomNav.tsx` | שינוי לנווט ל-/messages |
| `src/App.tsx` | הוספת routes חדשים |
| `src/i18n/translations/he.ts` | תרגומים למערכת הודעות |
| `src/i18n/translations/en.ts` | תרגומים באנגלית |

---

## פרטים טכניים

### עיצוב ConversationItem

```typescript
// src/components/messages/ConversationItem.tsx
const ConversationItem = ({ conversation, isAI, otherUser, lastMessage }) => (
  <Link to={isAI ? "/messages/ai" : `/messages/${conversation.id}`}>
    <div className="flex items-center gap-3 p-4 hover:bg-muted/50 border-b">
      <Avatar className="h-12 w-12">
        {isAI ? (
          <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
        ) : (
          <>
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback>{otherUser.name?.charAt(0)}</AvatarFallback>
          </>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{isAI ? "Aurora (AI)" : otherUser.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>
      {unreadCount > 0 && (
        <Badge className="bg-primary">{unreadCount}</Badge>
      )}
    </div>
  </Link>
);
```

### עדכון GlobalBottomNav

```typescript
// במקום לפתוח ChatPanel
<NavLink
  to="/messages"
  className={({ isActive }) => cn(
    "flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs",
    isActive ? "text-primary" : "text-muted-foreground"
  )}
>
  <MessageCircle className="h-5 w-5" />
  <span>{t('messages.title')}</span>
</NavLink>
```

### תרגומים חדשים

```typescript
// he.ts
messages: {
  title: "צ'אט",
  conversations: "שיחות",
  noConversations: "אין שיחות עדיין",
  startConversation: "התחל שיחה",
  newMessage: "הודעה חדשה",
  typePlaceholder: "כתוב הודעה...",
  aiAssistant: "Aurora (AI)",
  aiSubtitle: "העוזר החכם שלך",
  searchUsers: "חפש משתמשים...",
  selectUser: "בחר משתמש לשיחה",
}
```

---

## RLS Policies

```sql
-- conversations: משתמש רואה רק שיחות שהוא חלק מהן
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- messages: משתמש רואה רק הודעות בשיחות שלו
CREATE POLICY "Users can view messages in own conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);
```

---

## זרימת עבודה

1. משתמש לוחץ על "צ'אט" בתפריט התחתון
2. נפתח דף `/messages` עם רשימת שיחות
3. שיחת AI מופיעה ראשונה (מוצמדת)
4. לחיצה על שיחה → נכנס לתצוגת ההודעות
5. כפתור ✎ ב-header → פותח דיאלוג לבחירת משתמש לשיחה חדשה

---

## תוצאה צפויה

```text
דף הודעות (/messages):
┌─────────────────────────────────────────┐
│ <          הודעות              ✎        │
├─────────────────────────────────────────┤
│ 🤖 Aurora (AI)                 📌        │
│    היי! במה אוכל לעזור?                 │
├─────────────────────────────────────────┤
│ 👤 יוסי כהן                   3 דק       │
│    מעולה, תודה רבה!                     │
├─────────────────────────────────────────┤
│ 👤 דנה שמיר                  1 שעה       │
│    אשמח להמליץ לך!                      │
└─────────────────────────────────────────┘
         [ דאשבורד ] [ צ'אט ]  ← active
```

המערכת תהיה דומה לטלגרם/טוויטר DMs עם צ'אט AI מובנה ומוצמד!

