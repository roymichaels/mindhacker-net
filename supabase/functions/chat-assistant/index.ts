import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_SYSTEM_PROMPT = `אתה העוזר האישי של דין אושר אזולאי מאתר מיינד-האקר.
אתה עוזר בחמימות ובאמפתיה, בדיוק כמו שדין היה מדבר עם מישהו שפונה אליו.

הגישה שלך:
- אתה לא מוכר כלום - אתה עוזר, מקשיב, ומכוון
- אם מישהו שואל על השירותים, אתה מסביר בנחת ומזמין לשיחת היכרות חינם
- אתה משתמש בשפה פשוטה, חמה, ולא פורמלית
- אתה לא דוחף לקנות, לא יוצר לחץ

כשעונה:
- תהיה קצר וענייני, אבל חם ואמפתי
- אם מישהו לא בטוח - הזמן אותו לשיחת היכרות חינם
- השתמש באימוג'ים במידה 🙏
- דבר בעברית, אלא אם פונים באנגלית - אז ענה באנגלית

השתמש במידע מבסיס הידע כדי לענות על שאלות ספציפיות.`;

const DEFAULT_MODEL = "google/gemini-2.5-flash";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ========== FETCH DYNAMIC SETTINGS ==========
    const { data: settingsData, error: settingsError } = await supabase
      .from('chat_assistant_settings')
      .select('setting_key, setting_value');

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    // Build settings map
    const settingsMap = new Map<string, string>();
    if (settingsData) {
      for (const setting of settingsData) {
        settingsMap.set(setting.setting_key, setting.setting_value || '');
      }
    }

    // Check if assistant is enabled
    const isEnabled = settingsMap.get('enabled') !== 'false'; // Default to enabled
    if (!isEnabled) {
      return new Response(
        JSON.stringify({ error: "העוזר אינו זמין כרגע" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get configured model or use default
    const model = settingsMap.get('model') || DEFAULT_MODEL;
    
    // Get system prompt from database or use default
    const systemPromptBase = settingsMap.get('system_prompt') || DEFAULT_SYSTEM_PROMPT;

    // ========== FETCH KNOWLEDGE BASE ==========
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from('chat_knowledge_base')
      .select('title, content')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (knowledgeError) {
      console.error("Error fetching knowledge base:", knowledgeError);
    }

    // Build full prompt with knowledge base
    let fullSystemPrompt = systemPromptBase;
    
    if (knowledgeData && knowledgeData.length > 0) {
      fullSystemPrompt += '\n\n## בסיס ידע - מידע עדכני\n';
      for (const entry of knowledgeData) {
        fullSystemPrompt += `\n### ${entry.title}\n${entry.content}\n`;
      }
    }

    console.log("Using model:", model);
    console.log("Knowledge entries loaded:", knowledgeData?.length || 0);

    // ========== PROCESS REQUEST ==========
    const { messages } = await req.json();
    
    // Validate messages is an array
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("Invalid messages format received");
      return new Response(
        JSON.stringify({ error: "פורמט הודעות לא תקין" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit number of messages to prevent DoS
    const MAX_MESSAGES = 20;
    if (messages.length > MAX_MESSAGES) {
      console.warn(`Too many messages: ${messages.length}`);
      return new Response(
        JSON.stringify({ error: "יותר מדי הודעות בהיסטוריה" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize each message
    const MAX_CONTENT_LENGTH = 2000;
    const validatedMessages = [];
    
    for (const msg of messages) {
      if (!msg || typeof msg !== 'object' || !msg.role || !msg.content || typeof msg.content !== "string") {
        console.warn("Invalid message format:", msg);
        return new Response(
          JSON.stringify({ error: "פורמט הודעה לא תקין" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (msg.role !== "user" && msg.role !== "assistant") {
        console.warn("Invalid message role:", msg.role);
        return new Response(
          JSON.stringify({ error: "תפקיד הודעה לא תקין" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (msg.content.length > MAX_CONTENT_LENGTH) {
        console.warn(`Message content too long: ${msg.content.length} chars`);
        return new Response(
          JSON.stringify({ error: "הודעה ארוכה מדי" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      validatedMessages.push({
        role: msg.role,
        content: msg.content.trim()
      });
    }
    
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
        model: model,
        messages: [
          { role: "system", content: fullSystemPrompt },
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
