import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CORE_PILLARS = ["consciousness", "presence", "power", "vitality", "focus", "combat", "expansion"];
const ARENA_PILLARS = ["wealth", "influence", "relationships", "business", "projects", "play"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, hub } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isHe = language === "he";
    const pillars = hub === "core" ? CORE_PILLARS : ARENA_PILLARS;
    const pillarList = pillars.join(", ");

    const systemPrompt = isHe
      ? `אתה אורורה, מאמנת AI אישית. המשתמש רוצה להוסיף דבר חדש לחיים שלו (${hub === "core" ? "פיתוח אישי" : "זירה חיצונית"}).

המטרה שלך: לשאול 3-5 שאלות קצרות כדי להבין בדיוק מה הוא רוצה להוסיף, ואז ליצור אותו.

**חוקים:**
1. תשאל שאלה אחת בכל פעם, בקצרה ובישירות
2. תבין את סוג הפריט: project (פרויקט), business (עסק), goal (יעד), habit (הרגל), task (משימה)
3. תזהה לאיזה פילאר זה שייך: ${pillarList}
4. תבין מה הוא רוצה להשיג, למה זה חשוב, ומה הצעד הראשון
5. כשיש לך מספיק מידע — קרא לפונקציה create_plate_item
6. אל תשאל יותר מ-5 שאלות

**שאלה ראשונה:** שאל מה הוא רוצה להוסיף — פרויקט? עסק? יעד? הרגל? וספר בקצרה.`
      : `You are Aurora, a personal AI coach. The user wants to add something new to their life (${hub === "core" ? "personal development" : "external execution"}).

Your goal: Ask 3-5 short questions to understand exactly what they want to add, then create it.

**Rules:**
1. Ask ONE question at a time, keep it short and direct
2. Identify the item type: project, business, goal, habit, or task
3. Identify which pillar it belongs to: ${pillarList}
4. Understand what they want to achieve, why it matters, and the first step
5. When you have enough info — call create_plate_item
6. Don't ask more than 5 questions

**First question:** Ask what they want to add — a project? business? goal? habit? And briefly describe it.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "create_plate_item",
              description: "Create a new item on the user's plate after gathering enough information through conversation.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Clear, specific title for the item" },
                  description: { type: "string", description: "Brief description of what this item involves" },
                  type: { type: "string", enum: ["project", "business", "goal", "habit", "task"], description: "The type of item" },
                  pillar: { type: "string", enum: [...CORE_PILLARS, ...ARENA_PILLARS], description: "Which life pillar this belongs to" },
                  pillars: { type: "array", items: { type: "string" }, description: "All related pillars" },
                  priority: { type: "string", enum: ["low", "medium", "high", "critical"], description: "Priority level" },
                  vision: { type: "string", description: "What success looks like" },
                  why_it_matters: { type: "string", description: "Why this matters to the user" },
                  desired_outcome: { type: "string", description: "Specific desired outcome" },
                  category: { type: "string", description: "Category for projects" },
                  tags: { type: "array", items: { type: "string" }, description: "Relevant tags" },
                },
                required: ["title", "description", "type", "pillar"],
                additionalProperties: false,
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("add-plate-item error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
