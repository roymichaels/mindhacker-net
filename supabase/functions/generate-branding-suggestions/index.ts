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

    // Extract key business data
    const businessName = journeyData?.business_name || 'New Business';
    const vision = journeyData?.step_1_vision;
    const businessModel = journeyData?.step_2_business_model;
    const targetAudience = journeyData?.step_3_target_audience;
    const valueProposition = journeyData?.step_4_value_proposition;

    const isHebrew = language === 'he';

    const systemPrompt = isHebrew
      ? `אתה מומחה מיתוג ועיצוב. צור המלצות מיתוג מותאמות לעסק על בסיס הנתונים שקיבלת.`
      : `You are a branding and design expert. Create tailored branding recommendations for the business based on the data provided.`;

    const userPrompt = isHebrew
      ? `צור המלצות מיתוג עבור העסק הבא:

שם העסק: ${businessName}
חזון: ${JSON.stringify(vision)}
מודל עסקי: ${JSON.stringify(businessModel)}
קהל יעד: ${JSON.stringify(targetAudience)}
הצעת ערך: ${JSON.stringify(valueProposition)}

החזר JSON בפורמט הבא:
{
  "tagline_suggestions": ["הצעה 1", "הצעה 2", "הצעה 3"],
  "color_palette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "reasoning": "הסבר לבחירת הצבעים"
  },
  "brand_voice": {
    "tone": "רשמי/ידידותי/מקצועי/וכו'",
    "keywords": ["מילות מפתח", "שמאפיינות", "את המותג"],
    "description": "תיאור קול המותג"
  },
  "typography_suggestions": {
    "heading_style": "סגנון כותרות מומלץ",
    "body_style": "סגנון טקסט גוף"
  },
  "brand_personality": {
    "traits": ["תכונה 1", "תכונה 2", "תכונה 3"],
    "archetype": "ארכיטיפ המותג"
  },
  "target_emotions": ["רגש 1", "רגש 2", "רגש 3"],
  "mission_suggestion": "הצעה להצהרת משימה",
  "vision_suggestion": "הצעה לחזון"
}`
      : `Create branding recommendations for the following business:

Business Name: ${businessName}
Vision: ${JSON.stringify(vision)}
Business Model: ${JSON.stringify(businessModel)}
Target Audience: ${JSON.stringify(targetAudience)}
Value Proposition: ${JSON.stringify(valueProposition)}

Return JSON in this format:
{
  "tagline_suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "color_palette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "reasoning": "Explanation for color choices"
  },
  "brand_voice": {
    "tone": "formal/friendly/professional/etc",
    "keywords": ["brand", "keywords", "here"],
    "description": "Description of brand voice"
  },
  "typography_suggestions": {
    "heading_style": "Recommended heading style",
    "body_style": "Recommended body text style"
  },
  "brand_personality": {
    "traits": ["Trait 1", "Trait 2", "Trait 3"],
    "archetype": "Brand archetype"
  },
  "target_emotions": ["Emotion 1", "Emotion 2", "Emotion 3"],
  "mission_suggestion": "Suggested mission statement",
  "vision_suggestion": "Suggested vision statement"
}`;

    console.log(`[generate-branding-suggestions] Generating branding for business ${businessId}`);

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
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[generate-branding-suggestions] AI gateway error: ${response.status}`, errorText);
      
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
    let brandingData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandingData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("[generate-branding-suggestions] Failed to parse AI response:", parseError);
      // Return default structure
      brandingData = {
        tagline_suggestions: [],
        color_palette: { primary: "#f59e0b", secondary: "#eab308", accent: "#d97706" },
        brand_voice: { tone: "professional", keywords: [], description: "" },
        typography_suggestions: {},
        brand_personality: { traits: [], archetype: "" },
        target_emotions: [],
        mission_suggestion: "",
        vision_suggestion: "",
      };
    }

    console.log(`[generate-branding-suggestions] Successfully generated branding suggestions`);

    return new Response(
      JSON.stringify(brandingData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-branding-suggestions] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
