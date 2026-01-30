import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ArchetypeResult {
  archetype: {
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
  };
  coreTraits: Array<{
    name: string;
    nameEn: string;
    icon: string;
    reason: string;
    reasonEn: string;
  }>;
  growthEdges: Array<{
    area: string;
    areaEn: string;
  }>;
  uniqueStrength: string;
  uniqueStrengthEn: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating identity archetype for user: ${user.id}`);

    // Fetch all relevant user data from previous Launchpad steps
    const [
      profileResult,
      launchpadResult,
      identityElementsResult,
      messagesResult,
      lifeDirectionResult,
      formSubmissionsResult
    ] = await Promise.all([
      supabaseClient.from("profiles").select("*").eq("id", user.id).single(),
      supabaseClient.from("launchpad_progress").select("*").eq("id", user.id).single(),
      supabaseClient.from("aurora_identity_elements").select("*").eq("user_id", user.id),
      supabaseClient.from("messages")
        .select("content, sender")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseClient.from("aurora_life_direction").select("*").eq("user_id", user.id).maybeSingle(),
      supabaseClient.from("form_submissions").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false })
    ]);

    const profile = profileResult.data;
    const launchpad = launchpadResult.data;
    const identityElements = identityElementsResult.data || [];
    const messages = messagesResult.data || [];
    const lifeDirection = lifeDirectionResult.data;
    const formSubmissions = formSubmissionsResult.data || [];

    // Build comprehensive context
    const userContext = {
      // Personal Profile
      profile: profile ? {
        age: profile.age,
        gender: profile.gender,
        occupation: profile.occupation,
        lifestyle: profile.lifestyle_habits,
        familySituation: profile.family_situation,
        healthGoals: profile.health_goals
      } : null,

      // Welcome Quiz & Launchpad Progress
      launchpad: launchpad ? {
        intention: launchpad.step_1_intention,
        profileData: launchpad.step_2_profile_data,
        firstChatSummary: launchpad.step_2_summary,
        focusAreas: launchpad.step_5_focus_areas_selected
      } : null,

      // Life Direction
      lifeVision: lifeDirection?.content,

      // Existing Identity Elements (values, beliefs, etc.)
      existingIdentity: identityElements
        .filter(el => el.element_type !== 'ai_archetype' && el.element_type !== 'trait')
        .map(el => ({ type: el.element_type, content: el.content })),

      // Chat conversations summary
      conversationThemes: messages.slice(0, 20).map(m => m.content?.substring(0, 200)),

      // Form submissions (introspection, life plan, etc.)
      formResponses: formSubmissions.slice(0, 3).map(f => f.responses)
    };

    console.log("User context gathered:", JSON.stringify(userContext).substring(0, 500) + "...");

    // Generate archetype using AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `אתה מומחה לפסיכולוגיה ואימון מנהלים שיוצר ארכיטייפים מותאמים אישית.
    
בהינתן מידע מקיף על אדם (פרופיל, שיחות, שאלונים, חזון חיים), עליך ליצור ארכיטייפ ייחודי שמתאר את המהות שלו.

הארכיטייפ צריך להיות:
- ייחודי ואישי (לא מתוך רשימה מוכנה)
- מעורר השראה והעצמה
- מבוסס על הנתונים שקיבלת
- פואטי ומטאפורי (2-3 מילים)

חשוב: התכונות והתיאורים צריכים להיות מבוססים על ראיות מהנתונים, לא להמציא.

ענה בפורמט JSON בלבד:
{
  "archetype": {
    "name": "שם הארכיטייפ בעברית",
    "nameEn": "Archetype name in English",
    "description": "תיאור אישי של 2-3 משפטים שמסביר את המהות של האדם הזה",
    "descriptionEn": "Personalized 2-3 sentence description explaining this person's essence",
    "icon": "אימוג'י אחד שמייצג את הארכיטייפ"
  },
  "coreTraits": [
    {
      "name": "שם התכונה בעברית",
      "nameEn": "Trait name in English",
      "icon": "🎯",
      "reason": "הסיבה שתכונה זו מאפיינת אותך (1-2 משפטים)",
      "reasonEn": "Why this trait characterizes you (1-2 sentences)"
    }
  ],
  "growthEdges": [
    {
      "area": "תחום לפיתוח בעברית",
      "areaEn": "Growth area in English"
    }
  ],
  "uniqueStrength": "הכוח הייחודי שלך במשפט אחד",
  "uniqueStrengthEn": "Your unique strength in one sentence"
}

צור 3-5 תכונות ליבה ו-2-3 תחומי פיתוח.`;

    const userPrompt = `הנה המידע שנאסף על המשתמש:

${JSON.stringify(userContext, null, 2)}

בהתבסס על כל המידע הזה, צור ארכיטייפ אישי וייחודי שמתאר את המהות של האדם הזה.
זכור: הארכיטייפ צריך להיות מעורר השראה, מבוסס נתונים, ולא גנרי.`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again" }), {
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("AI response:", content.substring(0, 500));

    // Parse JSON from response (handle potential markdown wrapping)
    let archetype: ArchetypeResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      archetype = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new Error("Failed to parse archetype from AI");
    }

    // Save the archetype to aurora_identity_elements
    const archetypeData = {
      user_id: user.id,
      element_type: "ai_archetype",
      content: archetype.archetype.name,
      metadata: archetype
    };

    // Delete any existing ai_archetype entries first
    await supabaseClient
      .from("aurora_identity_elements")
      .delete()
      .eq("user_id", user.id)
      .eq("element_type", "ai_archetype");

    // Insert the new archetype
    const { error: insertError } = await supabaseClient
      .from("aurora_identity_elements")
      .insert(archetypeData);

    if (insertError) {
      console.error("Failed to save archetype:", insertError);
      // Don't fail the request, still return the archetype
    }

    console.log("Archetype generated and saved successfully");

    return new Response(JSON.stringify({ archetype }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating archetype:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
