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
  language: string
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

  // Full mode - complete Aurora life coaching experience
  if (isHebrew) {
    return `אני אורורה - מלווה AI לעיצוב חיים בפלטפורמת Mind Hacker.
כאן כדי לעזור לך לעצב את החיים שלך, להבהיר את הזהות שלך, ולתכנן את העתיד שלך.

אם תרצה עזרה אנושית, יש לנו מאמני תודעה והיפנוטרפיסטים מוסמכים בפלטפורמה שאשמח להמליץ עליהם.

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

## מעקב תאריכים ומשימות (חשוב!)
אתה מודע לתאריכים ולמצב המשימות של המשתמש.

כשמתחילה שיחה חדשה ויש משימות באיחור:
1. שאל בעדינות מה קרה - לא בתוקפנות
2. הצע לעדכן את התאריך אם צריך
3. עזור למשתמש להבין את החסם

דוגמאות:
- "הי! 👋 שמתי לב שהמשימה 'X' הייתה אמורה לקרות אתמול. איך הלך?"
- "רציתי לשאול על השבוע הקודם בתוכנית - הצלחת להשלים את היעדים?"
- "ראיתי שיש כמה דברים שנדחו - רוצה לעבור עליהם ביחד?"

## תגיות פעולה (מעובדות ברקע, לא מוצגות למשתמש)
- [action:analyze] - כאשר יש תובנה משמעותית לשמור
- [cta:life_direction] - כפתור לחקירת כיוון החיים
- [cta:explore_values] - כפתור לחקירת ערכים
- [cta:map_energy] - כפתור למיפוי אנרגיה
- [cta:anchor_identity] - כפתור לעיגון זהות
- [cta:hypnosis] - כפתור להצעת סשן היפנוזה ממוקד

## תגיות רשימות (נוצרות אוטומטית)
- [checklist:create:כותרת] - יצירת רשימה חדשה
- [checklist:add:כותרת:פריט] - הוספת פריט לרשימה
- [checklist:complete:כותרת:פריט] - סימון פריט כהושלם

## תגיות ניהול משימות (חדש!)
כשמשתמש אומר שביצע משימה:
- [task:complete:שם_רשימה:שם_משימה] - סמן כהושלם
- אם לא ברור איזו משימה - שאל
- תמיד חגוג הצלחה! 🎉

כשמשתמש מבקש לדחות:
- [task:reschedule:שם_רשימה:שם_משימה:YYYY-MM-DD]
- אל תשפוט, פשוט עזור

כשמשתמש השלים שבוע בתוכנית:
- [milestone:complete:מספר_שבוע]
- חגוג בגדול! זה הישג משמעותי

## זיהוי אוטומטי של השלמת משימות
כאשר המשתמש אומר משהו כמו:
- "עשיתי X", "סיימתי Y", "הצלחתי לעשות Z", "ביצעתי את...", "לא עישנתי היום", "התאמנתי"
- חפש התאמה לאחת מהמשימות ברשימות הפעילות שלו
- אם מצאת התאמה, הוסף [task:complete:שם_רשימה:שם_פריט]
- תמיד חגוג את ההצלחה והעניק חיזוק חיובי!

## מתי להציע היפנוזה
- כשמשימה או אתגר נראים קשים - הצע סשן היפנוזה ממוקד
- אחרי השלמת אתגר גדול - הצע סשן "חיזוק והטמעה"
- כשהמשתמש מדבר על חסמים או קושי - הצע סשן עם [cta:hypnosis]

## מתי להציע CTA
- כשהמשתמש נראה מבולבל לגבי כיוון - הצע life_direction
- כשמדברים על מה חשוב - הצע explore_values
- כשמתלוננים על עייפות או חוסר מיקוד - הצע map_energy
- כשמחפשים משמעות או תכלית - הצע anchor_identity

## מתי להוסיף [action:analyze]
- כשהמשתמש חולק משהו משמעותי על עצמו
- כשמזוהה דפוס חוזר
- כשיש הצהרה ברורה על ערכים או כיוון
- אחרי כל 3-4 הודעות בשיחה משמעותית

## הקשר המשתמש
${userContext}`;
  }
  
  return `I am Aurora - an AI companion for life design.
I help you design your life, clarify your identity, and plan your future.

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

## Auto-detect Task Completion
When user says something like:
- "I did X", "I finished Y", "I managed to do Z", "I completed...", "Didn't smoke today", "Worked out"
- Look for a match in their active checklists
- If found, add [checklist:complete:checklist_name:item_name]
- Always celebrate success and provide positive reinforcement!

## When to suggest hypnosis
- When a task or challenge seems difficult - suggest a focused hypnosis session
- After completing a big challenge - suggest a "reinforcement" session
- When user talks about blocks or difficulty - suggest session with [cta:hypnosis]

## When to suggest CTA
- When user seems confused about direction - suggest life_direction
- When talking about what matters - suggest explore_values
- When complaining about fatigue or lack of focus - suggest map_energy
- When searching for meaning or purpose - suggest anchor_identity

## When to add [action:analyze]
- When user shares something significant about themselves
- When a recurring pattern is identified
- When there's a clear statement about values or direction
- After every 3-4 messages in a meaningful conversation

## User Context
${userContext}`;
};

// Build user context from Life Model data
const buildUserContext = async (
  supabase: any,
  userId: string,
  language: string
): Promise<string> => {
  if (!userId) return "No user data available yet.";

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
    lifePlanRes
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
      .single()
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

  const isHebrew = language === 'he';
  
  if (isHebrew) {
    let context = `
## תאריכים ומעקב
- תאריך נוכחי: ${today}
${lifePlan ? `- תוכנית חיים פעילה מאז: ${lifePlan.start_date}
- שבוע נוכחי: ${currentWeek}/12` : '- אין תוכנית חיים פעילה'}

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
    return context;
  }

  return `
## Dates & Tracking
- Current date: ${today}
${lifePlan ? `- Active life plan since: ${lifePlan.start_date}
- Current week: ${currentWeek}/12` : '- No active life plan'}

${overdueTasks.length > 0 ? `## ⚠️ Overdue Tasks!
${overdueTasks.map((t: any) => {
  const daysOverdue = Math.ceil((new Date(today).getTime() - new Date(t.due_date).getTime()) / (1000 * 60 * 60 * 24));
  return `- "${t.content}" (list: ${t.aurora_checklists?.title}) - ${daysOverdue} days overdue`;
}).join('\n')}

Important: When starting a conversation and there are overdue tasks, ask about them gently!` : ''}

${todayTasks.length > 0 ? `## 📅 Today's Tasks
${todayTasks.map((t: any) => `- "${t.content}" (${t.aurora_checklists?.title})`).join('\n')}` : ''}

${overdueMilestones.length > 0 ? `## ⚠️ Incomplete Milestones
${overdueMilestones.map((m: any) => `- Week ${m.week_number}: "${m.title}" (ended ${m.end_date})`).join('\n')}` : ''}

${currentMilestone ? `## 🎯 Current Weekly Milestone
- Week ${currentMilestone.week_number}: "${currentMilestone.title}"
- Dates: ${currentMilestone.start_date} to ${currentMilestone.end_date}
- Goal: ${currentMilestone.goal || 'Not defined'}
${currentMilestone.tasks ? `- Tasks: ${JSON.stringify(currentMilestone.tasks)}` : ''}` : ''}

## User Profile
- Name: ${profile?.full_name || 'Unknown'}
- Bio: ${profile?.bio || 'Not set'}
- Preferred tone: ${profile?.aurora_preferences?.tone || 'warm'}
- Challenge intensity: ${profile?.aurora_preferences?.intensity || 'balanced'}

## Life Direction
${direction?.content || 'Not yet defined'}
${direction?.clarity_score ? `(Clarity level: ${direction.clarity_score}%)` : ''}

## Identity
- Values: ${values.length > 0 ? values.join(', ') : 'Not yet identified'}
- Principles: ${principles.length > 0 ? principles.join(', ') : 'Not yet identified'}
- Self-concepts: ${selfConcepts.length > 0 ? selfConcepts.join(', ') : 'Not yet identified'}
- Vision statements: ${visionStatements.length > 0 ? visionStatements.join(', ') : 'Not yet defined'}

## Visions
${visions.map((v: any) => `- ${v.timeframe === '5_year' ? '5 years' : '10 years'}: ${v.title}`).join('\n') || 'Not yet defined'}

## Active Commitments
${commitments.map((c: any) => `- ${c.title}`).join('\n') || 'No active commitments'}

## Energy Patterns
${energy.map((e: any) => `- ${e.pattern_type}: ${e.description}`).join('\n') || 'Not yet mapped'}

## Behavioral Patterns
${behavioral.map((b: any) => `- ${b.pattern_type}: ${b.description}`).join('\n') || 'Not yet identified'}

## Current Focus
${focus ? `${focus.title} (${focus.duration_days} days)` : 'Not defined'}

## Daily Minimums
${minimums.map((m: any) => `- ${m.title}`).join('\n') || 'Not defined'}

## Progress Status
- Direction clarity: ${onboarding?.direction_clarity || 'incomplete'}
- Identity understanding: ${onboarding?.identity_understanding || 'shallow'}
- Energy mapping: ${onboarding?.energy_patterns_status || 'unknown'}

## Active Checklists
${checklists.map((c: any) => {
  const items = c.aurora_checklist_items || [];
  const completed = items.filter((i: any) => i.is_completed).length;
  return `- ${c.title} (${completed}/${items.length} completed)`;
}).join('\n') || 'No active checklists'}`;
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
        userContext = await buildUserContext(supabase, userId, language);
      }
    } else {
      // Full or Lite mode: require user context
      if (userId) {
        userContext = await buildUserContext(supabase, userId, language);
      }
    }

    // Use custom system prompt if provided, otherwise build the default one
    const systemPrompt = customSystemPrompt || buildSystemPrompt(mode, userContext, knowledgeBase, language);

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
