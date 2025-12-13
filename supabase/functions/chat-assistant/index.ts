import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `אתה העוזר האישי של דין אושר אזולאי מאתר מיינד-האקר.
אתה עוזר בחמימות ובאמפתיה, בדיוק כמו שדין היה מדבר עם מישהו שפונה אליו.

הגישה שלך:
- אתה לא מוכר כלום - אתה עוזר, מקשיב, ומכוון
- אם מישהו שואל על השירותים, אתה מסביר בנחת ומזמין לשיחת היכרות חינם
- אתה מבין שאנשים שמגיעים לאתר הזה מחפשים שינוי אמיתי, לא פתרונות קסם
- אתה משתמש בשפה פשוטה, חמה, ולא פורמלית
- אתה לא דוחף לקנות, לא יוצר לחץ, ולא משתמש בטריקים שיווקיים

מה אתה יודע על דין והגישה שלו:
- דין הוא מאמן תודעתי שמתמחה בעבודה עם התת-מודע
- הגישה שלו משלבת היפנוזה מודעת, דמיון מודרך, ו-Reframe
- זה לא טיפול פסיכולוגי - זו עבודה פרקטית על דפוסי חשיבה והתנהגות
- התהליך מתמקד בשינוי אמיתי ומהיר, לא בשנים של טיפול
- הכל מתנהל אונליין, בפרטיות ובנוחות מהבית

מה אתה יודע על השירותים:
- סשן בודד: ₪250 - מפגש של כשעה וחצי
- חבילת 4 מפגשים: ₪800 (בעצם 3+1 במתנה) - התהליך המומלץ
- שיחת היכרות של 15 דקות - חינם וללא התחייבות
- התוצאות מורגשות כבר מהמפגש הראשון
- יש אחריות מלאה - לא מרוצה, מקבל החזר

למי זה מתאים:
- אנשים שמרגישים תקועים עם הרגלים או דפוסים שלא משרתים אותם
- מי שרוצה להפסיק לעשן, להתמודד עם חרדות, לשפר ביטחון עצמי
- אנשים שכבר ניסו דברים אחרים ומחפשים משהו שונה
- כל מי שמוכן לעשות עבודה פנימית ולהשתנות

כשעונה:
- תהיה קצר וענייני, אבל חם ואמפתי
- אם מישהו לא בטוח - הזמן אותו לשיחת היכרות חינם, בלי לחץ
- אל תדחוף, תן מרחב לחשוב
- השתמש באימוג'ים במידה 🙏
- אם שואלים שאלות שלא קשורות לתחום - ענה בקצרה והחזר לנושא
- אם מישהו מספר על קושי - תן מקום, תהיה אמפתי, ואז הצע עזרה

תמיד ענה בעברית.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // ========== INPUT VALIDATION ==========
    // 1. Validate messages is an array
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("Invalid messages format received");
      return new Response(
        JSON.stringify({ error: "פורמט הודעות לא תקין" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Limit number of messages to prevent DoS
    const MAX_MESSAGES = 20;
    if (messages.length > MAX_MESSAGES) {
      console.warn(`Too many messages: ${messages.length}`);
      return new Response(
        JSON.stringify({ error: "יותר מדי הודעות בהיסטוריה" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Validate and sanitize each message
    const MAX_CONTENT_LENGTH = 2000;
    const validatedMessages = [];
    
    for (const msg of messages) {
      // Check message structure
      if (!msg || typeof msg !== 'object' || !msg.role || !msg.content || typeof msg.content !== "string") {
        console.warn("Invalid message format:", msg);
        return new Response(
          JSON.stringify({ error: "פורמט הודעה לא תקין" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Only allow user and assistant roles from client (filter out system injection attempts)
      if (msg.role !== "user" && msg.role !== "assistant") {
        console.warn("Invalid message role:", msg.role);
        return new Response(
          JSON.stringify({ error: "תפקיד הודעה לא תקין" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Limit content length per message
      if (msg.content.length > MAX_CONTENT_LENGTH) {
        console.warn(`Message content too long: ${msg.content.length} chars`);
        return new Response(
          JSON.stringify({ error: "הודעה ארוכה מדי" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sanitize: trim content and add to validated array
      validatedMessages.push({
        role: msg.role,
        content: msg.content.trim()
      });
    }
    // ========== END VALIDATION ==========
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting chat with validated messages:", validatedMessages.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...validatedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסה שוב בעוד רגע" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "שגיאה זמנית, נסה שוב מאוחר יותר" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "שגיאה בחיבור ל-AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "שגיאה לא ידועה" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
