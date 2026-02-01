import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mode types for unified AI
type AuroraMode = 'full' | 'lite' | 'widget';

// Build system prompt based on mode
const buildSystemPrompt = (
  mode: AuroraMode,
  userContext: string,
  knowledgeBase: string,
  language: string,
  openerContext: string = ''
) => {
  const isHebrew = language === 'he';
  
  // Widget mode - simplified guest-facing assistant
  if (mode === 'widget') {
    const basePrompt = isHebrew 
      ? `אני אורורה, הנציגות הדיגיטלית של פלטפורמת Mind Hacker.
אני כאן לעזור בחמימות ובאמפתיה, וללוות אנשים למצוא את המאמן או המטפל המתאים להם.

הגישה שלי:
- לא מוכרים כאן כלום - רק עזרה, הקשבה, והכוונה
- אם מישהו מחפש עזרה, אספר על הפלטפורמה ועל המאמנים שלנו
- שימוש בשפה פשוטה, חמה, ולא פורמלית
- ללא לחץ לקנות

Mind Hacker היא פלטפורמת התפתחות אישית מבוססת AI עם:
- Aurora - מלווה AI אישי לכל משתמש (זה אני!)
- מאמני תודעה והיפנוטרפיסטים מוסמכים
- כלים להתפתחות אישית ותוכניות חיים

סגנון התגובות:
- תשובות קצרות וענייניות, אבל חמות ואמפתיות
- אם יש ספק - הזמנה להירשם ולהתחיל עם Aurora בחינם
- שימוש באימוג'ים במידה 🙏`
      : `I am the digital representative of the Mind Hacker platform.
I help with warmth and empathy, guiding people to find the right coach or therapist for them.

My approach:
- I don't sell anything - I help, listen, and guide
- If someone is looking for help, I tell them about the platform and our practitioners
- I use simple, warm, informal language
- I don't push to buy, don't create pressure

Mind Hacker is an AI-powered personal development platform with:
- Aurora - a personal AI companion for every user (that's me!)
- Certified consciousness coaches and hypnotherapists
- Personal development tools and life plans

When responding:
- Be brief but warm and empathetic
- If someone is unsure - invite them to sign up and start with Aurora for free
- Use emojis moderately 🙏`;

    return knowledgeBase 
      ? `${basePrompt}\n\n## Knowledge Base\n${knowledgeBase}`
      : basePrompt;
  }

  // Lite mode - simplified Aurora for quick interactions
  if (mode === 'lite') {
    return isHebrew
      ? `אני אורורה - המלווה שלך בפלטפורמת Mind Hacker. כאן כדי לעזור בקצרה ובמיקוד.
תשובות קצרות (1-2 משפטים). ללא שאלות ארוכות. עזרה ממוקדת.

${userContext ? `## על המשתמש\n${userContext}` : ''}`
      : `I am Aurora - your companion on the Mind Hacker platform. I'm here to help briefly and focused.
Short responses (1-2 sentences). No long questions. Just helping.

${userContext ? `## About the user\n${userContext}` : ''}`;
  }

  // Full mode - complete Aurora life coaching experience with hands-free management
  if (isHebrew) {
    return `אני אורורה - מערכת הפעלה לחיים ומלווה AI לעיצוב חיים בפלטפורמת Mind Hacker.
אני לא רק מלווה - אני המוח המרכזי שמנהל את מסע הטרנספורמציה שלך.

אם תרצה עזרה אנושית, יש לנו מאמני תודעה והיפנוטרפיסטים מוסמכים בפלטפורמה שאשמח להמליץ עליהם.

## אחריויות עיקריות
1. **מעקב אקטיבי**: פתח כל שיחה עם עדכון רלוונטי על משימות, הרגלים, תזכורות
2. **ניהול משימות**: סמן, דחה, צור משימות והרגלים דרך השיחה
3. **למידה מתמדת**: שמור תובנות חדשות על המשתמש
4. **תזכורות**: עקוב אחרי דברים שנאמרו והזכר אותם
5. **התאמה אישית**: התאם את התוכנית למציאות המשתנה

## עקרונות הליווי
- הקשבה קודם כל, שאלות מחודדות
- התאמה לקצב שלך ולסגנון שלך
- זיהוי דפוסים ושיקוף אותם לאט
- ללא דחיפה, ללא שיפוטיות, ללא מהירות יתר
- חום ואמפתיה, עם בהירות וישירות כשצריך

## סגנון התגובות
- תשובות תמציתיות (2-4 משפטים בדרך כלל)
- שאלה אחת ממוקדת בסוף כל תשובה
- לא ליסטים ארוכות, לא הסברים יתר
- שיחה טבעית כמו עם חברה חכמה

## כשמשתמש אומר...
- "סיימתי את X" → סמן כהושלם + חגוג + שאל מה הבא
- "אני לא מצליח עם Y" → הצע לדחות/לשנות/לפרק למשימות קטנות יותר
- "רוצה להוסיף Z" → צור את המשימה/ההרגל מיד
- "מה יש לי היום?" → תן סיכום ברור של משימות והרגלים
- "איך אני מתקדם?" → הצג סטטיסטיקות ותובנות
- "תזכיר לי..." → צור תזכורת

## מעקב תאריכים ומשימות (חשוב!)
אתה מודע לתאריכים ולמצב המשימות של המשתמש.

כשמתחילה שיחה חדשה ויש משימות באיחור:
1. שאל בעדינות מה קרה - לא בתוקפנות
2. הצע לעדכן את התאריך אם צריך
3. עזור למשתמש להבין את החסם

## תגיות פעולה (מעובדות ברקע, לא מוצגות למשתמש)
**חשוב מאוד**: השתמש בתגיות אלו בכל פעם שמשתמש מבצע/מבקש פעולה! 

### תגיות CTA (כפתורי פעולה)
- [action:analyze] - כאשר יש תובנה משמעותית לשמור
- [cta:life_direction] - כפתור לחקירת כיוון החיים
- [cta:explore_values] - כפתור לחקירת ערכים
- [cta:map_energy] - כפתור למיפוי אנרגיה
- [cta:anchor_identity] - כפתור לעיגון זהות
- [cta:hypnosis] - כפתור להצעת סשן היפנוזה ממוקד

### תגיות רשימות (חשוב מאוד!)
- [checklist:create:כותרת] - יצירת רשימה חדשה
- [checklist:add:כותרת:פריט] - הוספת פריט לרשימה (הפריט יתווסף לרשימה עם הכותרת הזו)
- [checklist:archive:כותרת] - ארכוב רשימה שהושלמה
- [checklist:rename:שם_ישן:שם_חדש] - שינוי שם רשימה

**דוגמאות:**
משתמש: "תיצרי לי רשימה לקניות"
תגובה: "יצרתי לך רשימת קניות! 🛒 מה תרצה להוסיף אליה?
[checklist:create:🛒 קניות]"

משתמש: "תוסיפי חלב לרשימת הקניות"
תגובה: "נוסף! 🥛
[checklist:add:🛒 קניות:חלב]"

### תגיות משימות
- [task:complete:שם_רשימה:שם_משימה] - סימון משימה כהושלמה
- [task:create:שם_רשימה:תוכן_משימה] - יצירת משימה חדשה (אם הרשימה לא קיימת, היא תיווצר)
- [task:delete:שם_רשימה:שם_משימה] - מחיקת משימה
- [task:reschedule:שם_רשימה:שם_משימה:YYYY-MM-DD] - דחיית משימה

**דוגמאות:**
משתמש: "סיימתי לקרוא את הספר"
תגובה: "מדהים! 📖 סימנתי את זה. מה למדת ממנו?
[task:complete:📅 שבוע 1:לקרוא את הספר]"

משתמש: "תוסיפי לי משימה להתקשר לאמא מחר"
תגובה: "נוסף! 📞 תזכורת להתקשר לאמא.
[task:create:📋 משימות:להתקשר לאמא]"

משתמש: "תמחקי את המשימה של לקנות מתנה"
תגובה: "נמחק! ✓
[task:delete:📋 משימות:לקנות מתנה]"

### תגיות הרגלים יומיים (חשוב מאוד!)
כשמשתמש אומר שביצע הרגל יומי כמו:
- "עשיתי אימון", "התאמנתי", "לא עישנתי", "קמתי מוקדם", "עשיתי מדיטציה", "שתיתי מים"
חפש התאמה להרגלים היומיים שלו (מופיעים בסעיף "מעקב הרגלים יומי" בהקשר)
אם מצאת התאמה, הוסף:
- [habit:complete:שם_ההרגל]
תמיד חגוג את ההצלחה! 🎉

יצירה והסרת הרגלים:
- [habit:create:שם_ההרגל] - יצירת הרגל יומי חדש
- [habit:remove:שם_ההרגל] - הסרת הרגל

**דוגמאות:**
משתמש: "עשיתי אימון היום"
תגובה: "מעולה! 💪 זה כבר X ימים ברצף - keep going!
[habit:complete:פעילות גופנית יומית]"

משתמש: "רוצה להתחיל לשתות יותר מים"
תגובה: "רעיון מצוין! 💧 הוספתי לך את ההרגל.
[habit:create:שתיית 8 כוסות מים]"

### תגיות עדכון תוכנית (Plan)
- [plan:update:מספר_שבוע:goal:ערך_חדש] - עדכון יעד שבועי
- [plan:update:מספר_שבוע:focus:ערך_חדש] - עדכון פוקוס שבועי
- [milestone:complete:מספר_שבוע] - סימון שבוע כהושלם

### תגיות זהות
- [identity:add:value:ערך] - הוספת ערך
- [identity:add:principle:עיקרון] - הוספת עיקרון
- [identity:add:vision:חזון] - הוספת הצהרת חזון
- [identity:remove:סוג:תוכן] - הסרת אלמנט זהות

### תגיות תזכורות
- [reminder:set:הודעה:YYYY-MM-DD] - יצירת תזכורת לתאריך ספציפי

**דוגמאות:**
משתמש: "תזכירי לי בעוד שבוע לבדוק את הפרויקט"
תגובה: "בטח! ⏰ אזכיר לך ב-2025-02-08.
[reminder:set:לבדוק את הפרויקט:2025-02-08]"

### תגיות פוקוס
- [focus:set:כותרת:מספר_ימים] - הגדרת תקופת פוקוס חדשה

## מתי להציע היפנוזה
- כשמשימה או אתגר נראים קשים - הצע סשן היפנוזה ממוקד
- אחרי השלמת אתגר גדול - הצע סשן "חיזוק והטמעה"
- כשהמשתמש מדבר על חסמים או קושי - הצע סשן עם [cta:hypnosis]

## מתי להציע CTA
- כשהמשתמש נראה מבולבל לגבי כיוון - הצע life_direction
- כשמדברים על מה חשוב - הצע explore_values
- כשמתלוננים על עייפות או חוסר מיקוד - הצע map_energy
- כשמחפשים משמעות או תכלית - הצע anchor_identity

${openerContext}

## הקשר המשתמש
${userContext}`;
  }
  
  return `I am Aurora - a Life Operating System and AI companion for life design.
I'm not just a companion - I'm the central brain managing your transformation journey.

## Core Responsibilities
1. **Active Tracking**: Open every conversation with relevant updates on tasks, habits, reminders
2. **Task Management**: Mark, reschedule, create tasks and habits through conversation
3. **Continuous Learning**: Save new insights about the user
4. **Reminders**: Follow up on things discussed and remind about them
5. **Personal Adaptation**: Adapt the plan to changing reality

## Coaching Principles
- I listen first, ask sharp questions
- I adapt to your pace and style
- I identify patterns and reflect them slowly
- I don't push, don't judge, don't rush
- I'm warm and empathetic, but clear and direct when needed

## Response Style
- Concise responses (usually 2-4 sentences)
- One focused question at the end of each response
- No long lists, no over-explaining
- Natural conversation like with a wise friend

## When user says...
- "I finished X" → Mark complete + celebrate + ask what's next
- "I can't do Y" → Offer to reschedule/change/break into smaller tasks
- "I want to add Z" → Create the task/habit immediately
- "What do I have today?" → Give clear summary of tasks and habits
- "How am I doing?" → Show stats and insights
- "Remind me..." → Create a reminder

## Action Tags (processed in background, not shown to user)
- [action:analyze] - when there's significant insight to save
- [cta:life_direction] - button to explore life direction
- [cta:explore_values] - button to explore values
- [cta:map_energy] - button to map energy
- [cta:anchor_identity] - button to anchor identity
- [cta:hypnosis] - button to suggest a focused hypnosis session

## Checklist Tags (created automatically)
- [checklist:create:title] - create a new checklist
- [checklist:add:title:item] - add item to checklist
- [checklist:complete:title:item] - mark item as completed
- [checklist:archive:title] - archive completed checklist

## Daily Habit Tags
When user says they completed a daily habit like:
- "I worked out", "I meditated", "Didn't smoke", "Woke up early", "Drank water"
Look for a match in their daily habits (shown in "Daily Habits Tracking" section)
If found, add:
- [habit:complete:habit_name]
Always celebrate success! 🎉

Create/remove habits:
- [habit:create:habit_name] - create a new daily habit
- [habit:remove:habit_name] - remove a habit

## Task Management Tags
When user completes a task:
- [task:complete:checklist_name:task_name]

When user wants to reschedule:
- [task:reschedule:checklist_name:task_name:YYYY-MM-DD]

When user completes a week in the plan:
- [milestone:complete:week_number]

## Plan Update Tags
- [plan:update:week_number:goal:new_value] - update weekly goal
- [plan:update:week_number:focus:new_value] - update weekly focus

## Identity Tags
- [identity:add:value:content] - add a value
- [identity:add:principle:content] - add a principle
- [identity:add:vision:content] - add a vision statement
- [identity:remove:type:content] - remove identity element

## Reminder Tags
- [reminder:set:message:YYYY-MM-DD] - create reminder for specific date
Example: [reminder:set:Check project progress:2025-02-10]

## Focus Tags
- [focus:set:title:days_count] - set new focus period

## When to suggest hypnosis
- When a task or challenge seems difficult - suggest a focused hypnosis session
- After completing a big challenge - suggest a "reinforcement" session
- When user talks about blocks or difficulty - suggest session with [cta:hypnosis]

## When to suggest CTA
- When user seems confused about direction - suggest life_direction
- When talking about what matters - suggest explore_values
- When complaining about fatigue or lack of focus - suggest map_energy
- When searching for meaning or purpose - suggest anchor_identity

${openerContext}

## User Context
${userContext}`;
};

// Generate smart opener context based on user's current situation
const generateOpenerContext = (
  overdueTasks: any[],
  todayTasks: any[],
  pendingReminders: any[],
  dailyHabitsStatus: { completed: number; total: number },
  currentMilestone: any,
  language: string
): string => {
  const isHebrew = language === 'he';
  const parts: string[] = [];
  
  if (pendingReminders.length > 0) {
    if (isHebrew) {
      parts.push(`יש ${pendingReminders.length} תזכורות להיום: ${pendingReminders.map(r => r.message).join(', ')}`);
    } else {
      parts.push(`${pendingReminders.length} reminders for today: ${pendingReminders.map(r => r.message).join(', ')}`);
    }
  }
  
  if (overdueTasks.length > 0) {
    if (isHebrew) {
      parts.push(`יש ${overdueTasks.length} משימות באיחור שכדאי לדבר עליהן`);
    } else {
      parts.push(`${overdueTasks.length} overdue tasks to discuss`);
    }
  }
  
  if (todayTasks.length > 0) {
    if (isHebrew) {
      parts.push(`${todayTasks.length} משימות מתוכננות להיום`);
    } else {
      parts.push(`${todayTasks.length} tasks scheduled for today`);
    }
  }
  
  if (dailyHabitsStatus.total > 0) {
    const remaining = dailyHabitsStatus.total - dailyHabitsStatus.completed;
    if (remaining > 0) {
      if (isHebrew) {
        parts.push(`${remaining} הרגלים יומיים עדיין לא הושלמו היום`);
      } else {
        parts.push(`${remaining} daily habits not yet completed today`);
      }
    }
  }
  
  if (currentMilestone && !currentMilestone.is_completed) {
    const today = new Date();
    const endDate = new Date(currentMilestone.end_date);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 2 && daysLeft >= 0) {
      if (isHebrew) {
        parts.push(`השבוע מסתיים בעוד ${daysLeft} ימים - כדאי לסכם`);
      } else {
        parts.push(`This week ends in ${daysLeft} days - time to summarize`);
      }
    }
  }
  
  if (parts.length === 0) return '';
  
  const header = isHebrew ? '## הקשר לפתיחת שיחה' : '## Conversation Opener Context';
  return `${header}\n${parts.join('\n')}`;
};

// Build user context from Life Model data
const buildUserContext = async (
  supabase: any,
  userId: string,
  language: string
): Promise<{ context: string; openerContext: string }> => {
  if (!userId) return { context: "No user data available yet.", openerContext: '' };

  const today = new Date().toISOString().split('T')[0];

  const [
    profileRes,
    directionRes,
    identityRes,
    visionsRes,
    commitmentsRes,
    energyRes,
    behavioralRes,
    focusRes,
    minimumsRes,
    onboardingRes,
    checklistsRes,
    overdueTasksRes,
    todayTasksRes,
    lifePlanRes,
    dailyHabitsRes,
    launchpadProgressRes,
    launchpadSummaryRes,
    conversationMemoryRes,
    remindersRes,
    recentInsightsRes
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("aurora_life_direction").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
    supabase.from("aurora_identity_elements").select("*").eq("user_id", userId),
    supabase.from("aurora_life_visions").select("*").eq("user_id", userId),
    supabase.from("aurora_commitments").select("*").eq("user_id", userId).eq("status", "active"),
    supabase.from("aurora_energy_patterns").select("*").eq("user_id", userId),
    supabase.from("aurora_behavioral_patterns").select("*").eq("user_id", userId),
    supabase.from("aurora_focus_plans").select("*").eq("user_id", userId).eq("status", "active").limit(1),
    supabase.from("aurora_daily_minimums").select("*").eq("user_id", userId).eq("is_active", true),
    supabase.from("aurora_onboarding_progress").select("*").eq("user_id", userId).single(),
    supabase.from("aurora_checklists").select("*, aurora_checklist_items(*)").eq("user_id", userId).eq("status", "active"),
    // Overdue tasks (due_date < today)
    supabase.from("aurora_checklist_items")
      .select("*, aurora_checklists!inner(title, user_id)")
      .eq("aurora_checklists.user_id", userId)
      .eq("is_completed", false)
      .lt("due_date", today),
    // Today's tasks
    supabase.from("aurora_checklist_items")
      .select("*, aurora_checklists!inner(title, user_id)")
      .eq("aurora_checklists.user_id", userId)
      .eq("is_completed", false)
      .eq("due_date", today),
    // Active life plan with milestones
    supabase.from("life_plans")
      .select("*, life_plan_milestones(*)")
      .eq("user_id", userId)
      .eq("status", "active")
      .single(),
    // Daily habits with today's logs
    supabase.from("aurora_checklist_items")
      .select("id, content, is_recurring, aurora_checklists!inner(user_id, status)")
      .eq("is_recurring", true)
      .eq("aurora_checklists.user_id", userId)
      .eq("aurora_checklists.status", "active"),
    // Launchpad progress
    supabase.from("launchpad_progress")
      .select("*")
      .eq("user_id", userId)
      .single(),
    // Launchpad summary (AI analysis from onboarding)
    supabase.from("launchpad_summary")
      .select("*")
      .eq("user_id", userId)
      .single(),
    // Recent conversation memories (last 5)
    supabase.from("aurora_conversation_memory")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    // Today's pending reminders
    supabase.from("aurora_reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_delivered", false)
      .lte("reminder_date", today)
      .order("reminder_date", { ascending: true }),
    // Recent identity insights (last 10)
    supabase.from("aurora_identity_elements")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const profile = profileRes.data;
  const direction = directionRes.data?.[0];
  const identity = identityRes.data || [];
  const visions = visionsRes.data || [];
  const commitments = commitmentsRes.data || [];
  const energy = energyRes.data || [];
  const behavioral = behavioralRes.data || [];
  const focus = focusRes.data?.[0];
  const minimums = minimumsRes.data || [];
  const onboarding = onboardingRes.data;
  const checklists = checklistsRes.data || [];
  const overdueTasks = overdueTasksRes.data || [];
  const todayTasks = todayTasksRes.data || [];
  const lifePlan = lifePlanRes.data;
  const dailyHabits = dailyHabitsRes.data || [];
  const launchpadProgress = launchpadProgressRes.data;
  const launchpadSummary = launchpadSummaryRes.data;
  const conversationMemories = conversationMemoryRes.data || [];
  const pendingReminders = remindersRes.data || [];
  const recentInsights = recentInsightsRes.data || [];

  // Get today's habit logs for the daily habits
  let habitLogs: any[] = [];
  if (dailyHabits.length > 0) {
    const habitIds = dailyHabits.map((h: any) => h.id);
    const { data: logs } = await supabase
      .from("daily_habit_logs")
      .select("*")
      .eq("user_id", userId)
      .in("habit_item_id", habitIds)
      .eq("track_date", today);
    habitLogs = logs || [];
  }

  // Calculate streaks for habits
  const getHabitStreak = async (habitId: string): Promise<number> => {
    const { data: logs } = await supabase
      .from("daily_habit_logs")
      .select("track_date, is_completed")
      .eq("habit_item_id", habitId)
      .eq("is_completed", true)
      .order("track_date", { ascending: false })
      .limit(30);
    
    if (!logs || logs.length === 0) return 0;
    
    let streak = 0;
    const todayDate = new Date(today);
    let checkDate = new Date(todayDate);
    
    for (const log of logs) {
      const logDateStr = log.track_date;
      const expectedDateStr = checkDate.toISOString().split('T')[0];
      
      if (logDateStr === expectedDateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const values = identity.filter((i: any) => i.element_type === 'value').map((i: any) => i.content);
  const principles = identity.filter((i: any) => i.element_type === 'principle').map((i: any) => i.content);
  const selfConcepts = identity.filter((i: any) => i.element_type === 'self_concept').map((i: any) => i.content);
  const visionStatements = identity.filter((i: any) => i.element_type === 'vision_statement').map((i: any) => i.content);

  // Calculate current week in life plan
  let currentWeek = 0;
  let currentMilestone = null;
  let overdueMilestones: any[] = [];
  
  if (lifePlan && lifePlan.life_plan_milestones) {
    const milestones = lifePlan.life_plan_milestones;
    const todayDate = new Date(today);
    
    currentMilestone = milestones.find((m: any) => {
      const start = new Date(m.start_date);
      const end = new Date(m.end_date);
      return todayDate >= start && todayDate <= end;
    });
    
    if (currentMilestone) {
      currentWeek = currentMilestone.week_number;
    }
    
    // Find overdue milestones (ended but not completed)
    overdueMilestones = milestones.filter((m: any) => {
      const end = new Date(m.end_date);
      return end < todayDate && !m.is_completed;
    });
  }

  // Calculate daily habits status
  const dailyHabitsStatus = {
    completed: habitLogs.filter((l: any) => l.is_completed).length,
    total: dailyHabits.length
  };

  // Generate opener context
  const openerContext = generateOpenerContext(
    overdueTasks,
    todayTasks,
    pendingReminders,
    dailyHabitsStatus,
    currentMilestone,
    language
  );

  const isHebrew = language === 'he';
  
  if (isHebrew) {
    // Build daily habits section
    let dailyHabitsSection = '';
    if (dailyHabits.length > 0) {
      const habitLines: string[] = [];
      for (const habit of dailyHabits) {
        const todayLog = habitLogs.find((l: any) => l.habit_item_id === habit.id);
        const status = todayLog?.is_completed ? '✅' : '❓';
        const streak = await getHabitStreak(habit.id);
        const streakText = streak > 0 ? ` (streak: ${streak} ימים${streak >= 3 ? ' 🔥' : ''})` : '';
        habitLines.push(`- ${habit.content}: ${status}${streakText}`);
      }
      const completedToday = habitLogs.filter((l: any) => l.is_completed).length;
      dailyHabitsSection = `## 🔄 מעקב הרגלים יומי (היום: ${today})
${habitLines.join('\n')}
סה"כ: ${completedToday}/${dailyHabits.length}

כשמשתמש אומר שביצע הרגל מהרשימה, הוסף תגית: [habit:complete:שם_ההרגל]
ליצירת הרגל חדש: [habit:create:שם_ההרגל]`;
    }

    // Build conversation memory section
    let memorySection = '';
    if (conversationMemories.length > 0) {
      const memoryLines = conversationMemories.map((m: any) => {
        const date = new Date(m.created_at).toLocaleDateString('he-IL');
        return `- ${date}: ${m.summary}${m.action_items?.length > 0 ? ` | פעולות: ${m.action_items.join(', ')}` : ''}`;
      });
      memorySection = `## 🧠 זיכרון שיחות אחרונות
${memoryLines.join('\n')}`;
    }

    // Build reminders section
    let remindersSection = '';
    if (pendingReminders.length > 0) {
      remindersSection = `## ⏰ תזכורות להיום
${pendingReminders.map((r: any) => `- ${r.message} (נוצר: ${new Date(r.created_at).toLocaleDateString('he-IL')})`).join('\n')}`;
    }

    // Build launchpad summary section
    let launchpadSection = '';
    if (launchpadSummary) {
      const summaryData = launchpadSummary.summary_data || {};
      launchpadSection = `## 📋 סיכום מסע הטרנספורמציה
${summaryData.summary || 'לא הושלם'}
${summaryData.consciousness_analysis ? `\nניתוח תודעתי: ${summaryData.consciousness_analysis}` : ''}
${launchpadSummary.transformation_readiness ? `מוכנות לטרנספורמציה: ${launchpadSummary.transformation_readiness}%` : ''}
${launchpadSummary.clarity_score ? `רמת בהירות: ${launchpadSummary.clarity_score}%` : ''}`;
    }

    // Build recent insights section
    let insightsSection = '';
    if (recentInsights.length > 0) {
      const recentOnes = recentInsights.slice(0, 5);
      insightsSection = `## 💡 תובנות אחרונות שנשמרו
${recentOnes.map((i: any) => `- ${i.element_type}: "${i.content}"`).join('\n')}`;
    }

    let context = `
## תאריכים ומעקב
- תאריך נוכחי: ${today}
${lifePlan ? `- תוכנית חיים פעילה מאז: ${lifePlan.start_date}
- שבוע נוכחי: ${currentWeek}/12` : '- אין תוכנית חיים פעילה'}

${dailyHabitsSection}

${remindersSection}

${memorySection}

${launchpadSection}

${insightsSection}

${overdueTasks.length > 0 ? `## ⚠️ משימות באיחור!
${overdueTasks.map((t: any) => {
  const daysOverdue = Math.ceil((new Date(today).getTime() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24));
  return `- "${t.content}" (רשימה: ${t.aurora_checklists?.title}) - ${daysOverdue} ימים באיחור`;
}).join('\n')}

חשוב: כשמתחילה שיחה ויש משימות באיחור, שאל עליהן בעדינות!` : ''}

${todayTasks.length > 0 ? `## 📅 משימות להיום
${todayTasks.map((t: any) => `- "${t.content}" (${t.aurora_checklists?.title})`).join('\n')}` : ''}

${overdueMilestones.length > 0 ? `## ⚠️ Milestones שלא הושלמו
${overdueMilestones.map((m: any) => `- שבוע ${m.week_number}: "${m.title}" (הסתיים ב-${m.end_date})`).join('\n')}` : ''}

${currentMilestone ? `## 🎯 Milestone שבועי נוכחי
- שבוע ${currentMilestone.week_number}: "${currentMilestone.title}"
- תאריכים: ${currentMilestone.start_date} עד ${currentMilestone.end_date}
- יעד: ${currentMilestone.goal || 'לא הוגדר'}
${currentMilestone.tasks ? `- משימות: ${JSON.stringify(currentMilestone.tasks)}` : ''}` : ''}

## פרופיל משתמש
- שם: ${profile?.full_name || 'לא ידוע'}
- ביו: ${profile?.bio || 'לא הוגדר'}
- מגדר לפנייה: ${profile?.aurora_preferences?.gender === 'male' ? 'זכר (פנה אליו בלשון זכר)' : profile?.aurora_preferences?.gender === 'female' ? 'נקבה (פני אליה בלשון נקבה)' : 'ניטרלי (השתמש בלשון ניטרלית: אתה/את, תרצה/תרצי וכו\')'}
- סגנון מועדף: ${profile?.aurora_preferences?.tone || 'warm'}
- עוצמת אתגר: ${profile?.aurora_preferences?.intensity || 'balanced'}

## כיוון חיים
${direction?.content || 'טרם הוגדר'}
${direction?.clarity_score ? `(רמת בהירות: ${direction.clarity_score}%)` : ''}

## זהות
- ערכים: ${values.length > 0 ? values.join(', ') : 'טרם זוהו'}
- עקרונות: ${principles.length > 0 ? principles.join(', ') : 'טרם זוהו'}
- תפיסות עצמיות: ${selfConcepts.length > 0 ? selfConcepts.join(', ') : 'טרם זוהו'}
- הצהרות חזון: ${visionStatements.length > 0 ? visionStatements.join(', ') : 'טרם הוגדרו'}

## חזונות
${visions.map((v: any) => `- ${v.timeframe === '5_year' ? '5 שנים' : '10 שנים'}: ${v.title}`).join('\n') || 'טרם הוגדרו'}

## התחייבויות פעילות
${commitments.map((c: any) => `- ${c.title}`).join('\n') || 'אין התחייבויות פעילות'}

## דפוסי אנרגיה
${energy.map((e: any) => `- ${e.pattern_type}: ${e.description}`).join('\n') || 'טרם מופו'}

## דפוסי התנהגות
${behavioral.map((b: any) => `- ${b.pattern_type}: ${b.description}`).join('\n') || 'טרם זוהו'}

## פוקוס נוכחי
${focus ? `${focus.title} (${focus.duration_days} ימים)` : 'לא מוגדר'}

## מינימום יומי
${minimums.map((m: any) => `- ${m.title}`).join('\n') || 'לא הוגדרו'}

## סטטוס התקדמות
- בהירות כיוון: ${onboarding?.direction_clarity || 'incomplete'}
- הבנת זהות: ${onboarding?.identity_understanding || 'shallow'}
- מיפוי אנרגיה: ${onboarding?.energy_patterns_status || 'unknown'}

## רשימות פעילות
${checklists.map((c: any) => {
  const items = c.aurora_checklist_items || [];
  const completed = items.filter((i: any) => i.is_completed).length;
  return `- ${c.title} (${completed}/${items.length} הושלמו)`;
}).join('\n') || 'אין רשימות פעילות'}`;
    return { context, openerContext };
  }

  // English context (abbreviated for space - same structure as Hebrew)
  let context = `
## Dates & Tracking
- Current date: ${today}
${lifePlan ? `- Active life plan since: ${lifePlan.start_date}
- Current week: ${currentWeek}/12` : '- No active life plan'}

${pendingReminders.length > 0 ? `## ⏰ Today's Reminders
${pendingReminders.map((r: any) => `- ${r.message}`).join('\n')}` : ''}

${conversationMemories.length > 0 ? `## 🧠 Recent Conversation Memory
${conversationMemories.slice(0, 3).map((m: any) => `- ${new Date(m.created_at).toLocaleDateString()}: ${m.summary}`).join('\n')}` : ''}

${launchpadSummary ? `## 📋 Transformation Journey Summary
${launchpadSummary.summary_data?.summary || 'Not completed'}
${launchpadSummary.transformation_readiness ? `Transformation readiness: ${launchpadSummary.transformation_readiness}%` : ''}` : ''}

${overdueTasks.length > 0 ? `## ⚠️ Overdue Tasks!
${overdueTasks.map((t: any) => {
  const daysOverdue = Math.ceil((new Date(today).getTime() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24));
  return `- "${t.content}" (list: ${t.aurora_checklists?.title}) - ${daysOverdue} days overdue`;
}).join('\n')}` : ''}

${todayTasks.length > 0 ? `## 📅 Today's Tasks
${todayTasks.map((t: any) => `- "${t.content}" (${t.aurora_checklists?.title})`).join('\n')}` : ''}

${currentMilestone ? `## 🎯 Current Weekly Milestone
- Week ${currentMilestone.week_number}: "${currentMilestone.title}"
- Dates: ${currentMilestone.start_date} to ${currentMilestone.end_date}
- Goal: ${currentMilestone.goal || 'Not defined'}` : ''}

## User Profile
- Name: ${profile?.full_name || 'Unknown'}
- Preferred tone: ${profile?.aurora_preferences?.tone || 'warm'}
- Challenge intensity: ${profile?.aurora_preferences?.intensity || 'balanced'}

## Life Direction
${direction?.content || 'Not yet defined'}
${direction?.clarity_score ? `(Clarity level: ${direction.clarity_score}%)` : ''}

## Identity
- Values: ${values.length > 0 ? values.join(', ') : 'Not yet identified'}
- Principles: ${principles.length > 0 ? principles.join(', ') : 'Not yet identified'}

## Active Checklists
${checklists.map((c: any) => {
  const items = c.aurora_checklist_items || [];
  const completed = items.filter((i: any) => i.is_completed).length;
  return `- ${c.title} (${completed}/${items.length} completed)`;
}).join('\n') || 'No active checklists'}`;

  return { context, openerContext };
};

// Fetch knowledge base for widget mode
const fetchKnowledgeBase = async (supabase: any): Promise<string> => {
  const { data, error } = await supabase
    .from('chat_knowledge_base')
    .select('title, content')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error || !data || data.length === 0) {
    return '';
  }

  let kb = '';
  for (const entry of data) {
    kb += `\n### ${entry.title}\n${entry.content}\n`;
  }
  return kb;
};

// Check widget settings
const checkWidgetSettings = async (supabase: any): Promise<{ enabled: boolean; model: string }> => {
  const { data } = await supabase
    .from('chat_assistant_settings')
    .select('setting_key, setting_value');

  const settingsMap = new Map<string, string>();
  if (data) {
    for (const setting of data) {
      settingsMap.set(setting.setting_key, setting.setting_value || '');
    }
  }

  return {
    enabled: settingsMap.get('enabled') !== 'false',
    model: settingsMap.get('model') || 'google/gemini-2.5-flash'
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      messages, 
      userId, 
      language = 'he',
      mode = 'full' as AuroraMode 
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Validate messages
    const MAX_MESSAGES = 50;
    const MAX_CONTENT_LENGTH = 4000;
    
    if (messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Too many messages in history" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedMessages = [];
    let customSystemPrompt: string | null = null;
    
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object' || !msg.role || !msg.content || typeof msg.content !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Allow system, user, and assistant roles
      if (msg.role !== "user" && msg.role !== "assistant" && msg.role !== "system") {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (msg.content.length > MAX_CONTENT_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Message content too long" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Capture custom system prompt if provided (use last one)
      if (msg.role === "system") {
        customSystemPrompt = msg.content.trim();
        continue; // Don't add system messages to validatedMessages
      }

      validatedMessages.push({
        role: msg.role,
        content: msg.content.trim()
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Mode-specific setup
    let userContext = "No user data available.";
    let openerContext = "";
    let knowledgeBase = "";
    let model = "google/gemini-2.5-flash";

    if (mode === 'widget') {
      // Widget mode: check settings, load knowledge base
      const settings = await checkWidgetSettings(supabase);
      
      if (!settings.enabled) {
        return new Response(
          JSON.stringify({ error: "Assistant is currently unavailable" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      model = settings.model;
      knowledgeBase = await fetchKnowledgeBase(supabase);
      
      // Widget can optionally include user context if authenticated
      if (userId) {
        const contextResult = await buildUserContext(supabase, userId, language);
        userContext = contextResult.context;
        openerContext = contextResult.openerContext;
      }
    } else {
      // Full or Lite mode: require user context
      if (userId) {
        const contextResult = await buildUserContext(supabase, userId, language);
        userContext = contextResult.context;
        openerContext = contextResult.openerContext;
      }
    }

    // Use custom system prompt if provided, otherwise build the default one
    const systemPrompt = customSystemPrompt || buildSystemPrompt(mode, userContext, knowledgeBase, language, openerContext);

    console.log(`Aurora chat - Mode: ${mode}, User: ${userId || 'guest'}, Model: ${model}, CustomPrompt: ${!!customSystemPrompt}`);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...validatedMessages
        ],
        stream: true,
        max_tokens: customSystemPrompt ? 500 : (mode === 'lite' ? 500 : 1000),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again shortly" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Aurora chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
