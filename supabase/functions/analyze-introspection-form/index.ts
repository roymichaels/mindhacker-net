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

interface AnalysisResult {
  summary: string;
  patterns: string[];
  transformation_potential: string;
  recommendation: string;
  recommended_product: "personal-hypnosis" | "consciousness-leap";
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

    // System prompt for consciousness analysis
    const systemPrompt = language === "he" 
      ? `אתה מומחה לניתוח תודעה ופסיכולוגיה עומקית. תפקידך הוא לנתח תשובות לשאלון התבוננות עצמית ולספק תובנות משמעותיות.

בהתבסס על תשובות המשתמש, ספק ניתוח מובנה בפורמט JSON עם המבנה הבא:
{
  "summary": "תקציר קצר של 2-3 משפטים על מצב התודעה הנוכחי של המשתמש",
  "patterns": ["דפוס 1", "דפוס 2", "דפוס 3"], // 3-5 דפוסים מרכזיים שזוהו
  "transformation_potential": "פסקה קצרה על האזורים עם הפוטנציאל הגבוה ביותר לשינוי",
  "recommendation": "המלצה אישית להמשך המסע",
  "recommended_product": "personal-hypnosis" // או "consciousness-leap" בהתאם לעומק ומוכנות
}

הנחיות:
- היה אמפתי ומעודד
- השתמש בשפה חיובית ומעצימה
- הימנע מאבחנות פסיכולוגיות או רפואיות
- התמקד בפוטנציאל ובאפשרויות
- אם התשובות מראות עומק ומוכנות גבוהה - המלץ על "consciousness-leap"
- אם התשובות בסיסיות יותר או המשתמש בתחילת דרכו - המלץ על "personal-hypnosis"`
      : `You are an expert in consciousness analysis and depth psychology. Your role is to analyze self-introspection questionnaire responses and provide meaningful insights.

Based on the user's responses, provide a structured analysis in JSON format:
{
  "summary": "A brief 2-3 sentence summary of the user's current consciousness state",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"], // 3-5 key patterns identified
  "transformation_potential": "A short paragraph about areas with highest transformation potential",
  "recommendation": "A personalized recommendation for continuing the journey",
  "recommended_product": "personal-hypnosis" // or "consciousness-leap" based on depth and readiness
}

Guidelines:
- Be empathetic and encouraging
- Use positive, empowering language
- Avoid psychological or medical diagnoses
- Focus on potential and possibilities
- If responses show depth and high readiness - recommend "consciousness-leap"
- If responses are more basic or user is at the beginning - recommend "personal-hypnosis"`;

    const userPrompt = language === "he"
      ? `נתח את התשובות הבאות לשאלון ההתבוננות העצמית:\n\n${formattedResponses}\n\nהחזר את הניתוח בפורמט JSON בלבד, ללא טקסט נוסף.`
      : `Analyze the following introspection questionnaire responses:\n\n${formattedResponses}\n\nReturn the analysis in JSON format only, without additional text.`;

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
    let analysis: AnalysisResult;
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
          ? "תודה על השיתוף העמוק. התשובות שלך מראות תחילת מסע של התבוננות עצמית."
          : "Thank you for your deep sharing. Your responses show the beginning of a self-introspection journey.",
        patterns: language === "he" 
          ? ["פתיחות לשינוי", "מודעות עצמית", "רצון לצמיחה"]
          : ["Openness to change", "Self-awareness", "Desire for growth"],
        transformation_potential: language === "he"
          ? "יש לך פוטנציאל משמעותי לשינוי. הכנות שלך לחקור את עצמך היא הצעד הראשון והחשוב ביותר."
          : "You have significant potential for transformation. Your willingness to explore yourself is the most important first step.",
        recommendation: language === "he"
          ? "אני ממליץ להתחיל עם סרטון היפנוזה אישי שייתן לך כלים ראשוניים לשינוי."
          : "I recommend starting with a personal hypnosis video that will give you initial tools for change.",
        recommended_product: "personal-hypnosis"
      };
    }

    // Store analysis in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: savedAnalysis, error: dbError } = await supabase
      .from("form_analyses")
      .insert({
        form_submission_id,
        analysis_summary: analysis.summary,
        patterns: analysis.patterns,
        transformation_potential: analysis.transformation_potential,
        recommendation: analysis.recommendation,
        recommended_product: analysis.recommended_product,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Still return analysis even if saving fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          id: savedAnalysis?.id,
          summary: analysis.summary,
          patterns: analysis.patterns,
          transformation_potential: analysis.transformation_potential,
          recommendation: analysis.recommendation,
          recommended_product: analysis.recommended_product,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing form:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});