import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { businessId, journeyData, language = 'en' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract key business data for the prompt
    const businessName = journeyData?.business_name || 'New Business';
    const vision = journeyData?.step_1_vision;
    const businessModel = journeyData?.step_2_business_model;
    const targetAudience = journeyData?.step_3_target_audience;
    const valueProposition = journeyData?.step_4_value_proposition;
    const challenges = journeyData?.step_5_challenges;
    const resources = journeyData?.step_6_resources;
    const financial = journeyData?.step_7_financial;
    const marketing = journeyData?.step_8_marketing;
    const operations = journeyData?.step_9_operations;

    const isHebrew = language === 'he';

    const systemPrompt = isHebrew
      ? `אתה יועץ עסקי מומחה. צור תוכנית פעולה ל-90 יום (12 שבועות) עבור העסק. כל אבן דרך שבועית צריכה להיות ספציפית, מדידה וניתנת לביצוע. התמקד בצמיחה אמיתית ותוצאות מוחשיות.`
      : `You are an expert business consultant. Create a 90-day action plan (12 weeks) for the business. Each weekly milestone should be specific, measurable, and actionable. Focus on real growth and tangible results.`;

    const userPrompt = isHebrew
      ? `צור תוכנית 90 יום עבור העסק הבא:

שם העסק: ${businessName}
חזון: ${JSON.stringify(vision)}
מודל עסקי: ${JSON.stringify(businessModel)}
קהל יעד: ${JSON.stringify(targetAudience)}
הצעת ערך: ${JSON.stringify(valueProposition)}
אתגרים: ${JSON.stringify(challenges)}
משאבים: ${JSON.stringify(resources)}
תכנון פיננסי: ${JSON.stringify(financial)}
שיווק: ${JSON.stringify(marketing)}
תפעול: ${JSON.stringify(operations)}

החזר JSON בפורמט הבא:
{
  "title": "כותרת התוכנית",
  "description": "תיאור קצר",
  "milestones": [
    {
      "week_number": 1,
      "title": "כותרת אבן הדרך",
      "description": "תיאור מפורט",
      "focus_area": "תחום מיקוד (שיווק/מכירות/תפעול/מוצר)",
      "tasks": [
        {"title": "משימה ספציפית", "completed": false}
      ],
      "xp_reward": 50,
      "tokens_reward": 10
    }
  ]
}`
      : `Create a 90-day plan for the following business:

Business Name: ${businessName}
Vision: ${JSON.stringify(vision)}
Business Model: ${JSON.stringify(businessModel)}
Target Audience: ${JSON.stringify(targetAudience)}
Value Proposition: ${JSON.stringify(valueProposition)}
Challenges: ${JSON.stringify(challenges)}
Resources: ${JSON.stringify(resources)}
Financial Planning: ${JSON.stringify(financial)}
Marketing: ${JSON.stringify(marketing)}
Operations: ${JSON.stringify(operations)}

Return JSON in this format:
{
  "title": "Plan Title",
  "description": "Brief description",
  "milestones": [
    {
      "week_number": 1,
      "title": "Milestone title",
      "description": "Detailed description",
      "focus_area": "Focus area (marketing/sales/operations/product)",
      "tasks": [
        {"title": "Specific task", "completed": false}
      ],
      "xp_reward": 50,
      "tokens_reward": 10
    }
  ]
}`;

    console.log(`[generate-business-plan] Generating plan for business ${businessId}`);

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generate-business-plan] AI gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let planData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[generate-business-plan] Failed to parse AI response:", parseError);
      // Return a default structure if parsing fails
      planData = {
        title: isHebrew ? "תוכנית 90 יום" : "90-Day Business Plan",
        description: isHebrew ? "תוכנית פעולה מותאמת אישית" : "Personalized action plan",
        milestones: Array.from({ length: 12 }, (_, i) => ({
          week_number: i + 1,
          title: isHebrew ? `שבוע ${i + 1}` : `Week ${i + 1}`,
          description: isHebrew ? "אבן דרך לשבוע זה" : "Milestone for this week",
          focus_area: ["marketing", "sales", "operations", "product"][i % 4],
          tasks: [],
          xp_reward: 50,
          tokens_reward: 10,
        })),
      };
    }

    console.log(`[generate-business-plan] Successfully generated plan with ${planData.milestones?.length || 0} milestones`);

    return new Response(
      JSON.stringify(planData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-business-plan] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
