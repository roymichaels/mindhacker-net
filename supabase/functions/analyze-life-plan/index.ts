import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormResponse {
  question: string;
  answer: string | string[];
}

interface LifePlanAnalysis {
  summary: string;
  vision_clarity: string;
  action_readiness: string;
  key_goals: string[];
  potential_blockers: string[];
  next_steps: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { form_submission_id, responses, language = "he" } = await req.json();

    if (!form_submission_id || !responses) {
      return new Response(
        JSON.stringify({ error: "Missing form_submission_id or responses" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare the responses for analysis
    const formattedResponses = responses
      .map((r: FormResponse, i: number) => {
        const answer = Array.isArray(r.answer) ? r.answer.join(", ") : r.answer;
        return `${i + 1}. ${r.question}\nתשובה: ${answer || "לא נענה"}`;
      })
      .join("\n\n");

    // System prompt for life plan analysis
    const systemPrompt = language === "he" 
      ? `אתה מאמן חיים מומחה. תפקידך הוא לנתח תוכנית חיים ולספק תובנות משמעותיות.

בהתבסס על תשובות המשתמש, ספק ניתוח מובנה בפורמט JSON עם המבנה הבא:
{
  "summary": "תקציר קצר של 2-3 משפטים על תוכנית החיים והחזון",
  "vision_clarity": "נמוכה/בינונית/גבוהה - עד כמה החזון ברור ומוגדר",
  "action_readiness": "בהתחלה/מתקדם/מוכן לפעולה - עד כמה המשתמש מוכן ליישום",
  "key_goals": ["מטרה 1", "מטרה 2", "מטרה 3"], // 3-5 מטרות מפתח
  "potential_blockers": ["מכשול 1", "מכשול 2"], // 2-3 חסמים פוטנציאליים
  "next_steps": ["צעד 1", "צעד 2", "צעד 3"] // 3 צעדים קונקרטיים להתחלה
}

הנחיות:
- היה מעודד ומעצים
- זהה מטרות ספציפיות ומדידות
- הדגש את החוזקות בתוכנית
- הצע צעדים קונקרטיים וישימים`
      : `You are an expert life coach. Your role is to analyze a life plan and provide meaningful insights.

Based on the user's responses, provide a structured analysis in JSON format:
{
  "summary": "A brief 2-3 sentence summary of the life plan and vision",
  "vision_clarity": "Low/Medium/High - how clear and defined the vision is",
  "action_readiness": "Starting/Progressing/Ready for action - how ready for implementation",
  "key_goals": ["goal 1", "goal 2", "goal 3"], // 3-5 key goals
  "potential_blockers": ["blocker 1", "blocker 2"], // 2-3 potential obstacles
  "next_steps": ["step 1", "step 2", "step 3"] // 3 concrete steps to start
}

Guidelines:
- Be encouraging and empowering
- Identify specific, measurable goals
- Highlight strengths in the plan
- Suggest concrete, actionable steps`;

    const userPrompt = language === "he"
      ? `נתח את תוכנית החיים הבאה:\n\n${formattedResponses}\n\nהחזר את הניתוח בפורמט JSON בלבד, ללא טקסט נוסף.`
      : `Analyze the following life plan:\n\n${formattedResponses}\n\nReturn the analysis in JSON format only, without additional text.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_completion_tokens: 1500,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response (handle markdown code blocks)
    let analysis: LifePlanAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Provide fallback analysis
      analysis = {
        summary: language === "he" 
          ? "תודה על בניית תוכנית החיים שלך! יש לך חזון ברור עם מטרות מוגדרות."
          : "Thank you for building your life plan! You have a clear vision with defined goals.",
        vision_clarity: language === "he" ? "בינונית" : "Medium",
        action_readiness: language === "he" ? "מתקדם" : "Progressing",
        key_goals: language === "he" 
          ? ["בניית חזון ארוך טווח", "הגדרת יעדים ל-90 ימים", "יצירת שגרה יומית"]
          : ["Build long-term vision", "Define 90-day goals", "Create daily routine"],
        potential_blockers: language === "he"
          ? ["חוסר עקביות", "הסחות דעת"]
          : ["Lack of consistency", "Distractions"],
        next_steps: language === "he"
          ? ["הגדר 3 פעולות לשבוע הקרוב", "בחר עוגן יומי", "קבע זמן סקירה שבועי"]
          : ["Define 3 actions for next week", "Choose a daily anchor", "Set weekly review time"],
      };
    }

    // Store analysis in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase
      .from("form_analyses")
      .insert({
        form_submission_id,
        analysis_summary: analysis.summary,
        patterns: analysis.key_goals,
        transformation_potential: `${analysis.vision_clarity} | ${analysis.action_readiness}`,
        recommendation: analysis.next_steps.join("; "),
        recommended_product: null,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      // Still return analysis even if saving fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing life plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
