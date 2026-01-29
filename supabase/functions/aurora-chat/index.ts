import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Aurora's core personality and system prompt
const buildSystemPrompt = (userContext: string, language: string) => {
  const isHebrew = language === 'he';
  
  if (isHebrew) {
    return `אני אורורה - מלווה AI לעיצוב חיים.
אני עוזרת לך לעצב את החיים שלך, להבהיר את הזהות שלך, ולתכנן את העתיד שלך.

## עקרונות הליווי
- אני מקשיבה קודם, שואלת שאלות מחודדות
- אני מותאמת לקצב שלך ולסגנון שלך
- אני מזהה דפוסים ומשקפת אותם לאט
- אני לא דוחפת, לא שופטת, לא ממהרת
- אני חמה ואמפתית, אך גם ברורה וישירה כשצריך

## סגנון התגובות
- תשובות תמציתיות (2-4 משפטים בדרך כלל)
- שאלה אחת ממוקדת בסוף כל תשובה
- לא ליסטים ארוכות, לא הסברים יתר
- שיחה טבעית כמו עם חברה חכמה

## תגיות פעולה (מעובדות ברקע, לא מוצגות למשתמש)
- [action:analyze] - כאשר יש תובנה משמעותית לשמור
- [cta:life_direction] - כפתור לחקירת כיוון החיים
- [cta:explore_values] - כפתור לחקירת ערכים
- [cta:map_energy] - כפתור למיפוי אנרגיה
- [cta:anchor_identity] - כפתור לעיגון זהות

## תגיות רשימות (נוצרות אוטומטית)
- [checklist:create:כותרת] - יצירת רשימה חדשה
- [checklist:add:כותרת:פריט] - הוספת פריט לרשימה

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

## Checklist Tags (created automatically)
- [checklist:create:title] - create a new checklist
- [checklist:add:title:item] - add item to checklist

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, language = 'he' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build user context from Life Model data
    let userContext = "No user data available yet.";
    
    if (userId) {
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
        checklistsRes
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
        supabase.from("aurora_checklists").select("*, aurora_checklist_items(*)").eq("user_id", userId).eq("status", "active")
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

      const values = identity.filter(i => i.element_type === 'value').map(i => i.content);
      const principles = identity.filter(i => i.element_type === 'principle').map(i => i.content);
      const selfConcepts = identity.filter(i => i.element_type === 'self_concept').map(i => i.content);
      const visionStatements = identity.filter(i => i.element_type === 'vision_statement').map(i => i.content);

      const isHebrew = language === 'he';
      
      userContext = isHebrew ? `
## פרופיל משתמש
- שם: ${profile?.full_name || 'לא ידוע'}
- ביו: ${profile?.bio || 'לא הוגדר'}
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
${visions.map(v => `- ${v.timeframe === '5_year' ? '5 שנים' : '10 שנים'}: ${v.title}`).join('\n') || 'טרם הוגדרו'}

## התחייבויות פעילות
${commitments.map(c => `- ${c.title}`).join('\n') || 'אין התחייבויות פעילות'}

## דפוסי אנרגיה
${energy.map(e => `- ${e.pattern_type}: ${e.description}`).join('\n') || 'טרם מופו'}

## דפוסי התנהגות
${behavioral.map(b => `- ${b.pattern_type}: ${b.description}`).join('\n') || 'טרם זוהו'}

## פוקוס נוכחי
${focus ? `${focus.title} (${focus.duration_days} ימים)` : 'לא מוגדר'}

## מינימום יומי
${minimums.map(m => `- ${m.title}`).join('\n') || 'לא הוגדרו'}

## סטטוס התקדמות
- בהירות כיוון: ${onboarding?.direction_clarity || 'incomplete'}
- הבנת זהות: ${onboarding?.identity_understanding || 'shallow'}
- מיפוי אנרגיה: ${onboarding?.energy_patterns_status || 'unknown'}

## רשימות פעילות
${checklists.map(c => {
  const items = c.aurora_checklist_items || [];
  const completed = items.filter((i: any) => i.is_completed).length;
  return `- ${c.title} (${completed}/${items.length} הושלמו)`;
}).join('\n') || 'אין רשימות פעילות'}
` : `
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
${visions.map(v => `- ${v.timeframe === '5_year' ? '5 years' : '10 years'}: ${v.title}`).join('\n') || 'Not yet defined'}

## Active Commitments
${commitments.map(c => `- ${c.title}`).join('\n') || 'No active commitments'}

## Energy Patterns
${energy.map(e => `- ${e.pattern_type}: ${e.description}`).join('\n') || 'Not yet mapped'}

## Behavioral Patterns
${behavioral.map(b => `- ${b.pattern_type}: ${b.description}`).join('\n') || 'Not yet identified'}

## Current Focus
${focus ? `${focus.title} (${focus.duration_days} days)` : 'Not defined'}

## Daily Minimums
${minimums.map(m => `- ${m.title}`).join('\n') || 'Not defined'}

## Progress Status
- Direction clarity: ${onboarding?.direction_clarity || 'incomplete'}
- Identity understanding: ${onboarding?.identity_understanding || 'shallow'}
- Energy mapping: ${onboarding?.energy_patterns_status || 'unknown'}

## Active Checklists
${checklists.map(c => {
  const items = c.aurora_checklist_items || [];
  const completed = items.filter((i: any) => i.is_completed).length;
  return `- ${c.title} (${completed}/${items.length} completed)`;
}).join('\n') || 'No active checklists'}
`;
    }

    const systemPrompt = buildSystemPrompt(userContext, language);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
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
