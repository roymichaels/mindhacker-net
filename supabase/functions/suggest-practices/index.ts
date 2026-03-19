import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    // Get user from token
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    const db = createClient(supabaseUrl, supabaseKey);

    // Fetch all relevant user data in parallel
    const [
      practicesLibRes,
      existingRes,
      profileRes,
      launchpadRes,
      memoryRes,
      plansRes,
      identityRes,
    ] = await Promise.all([
      db.from("practices").select("id, name, name_he, category, pillar, default_duration, energy_type").eq("is_active", true),
      db.from("user_practices").select("practice_id").eq("user_id", user.id).eq("is_active", true),
      db.from("profiles").select("selected_pillars, display_name").eq("id", user.id).single(),
      db.from("launchpad_progress").select("step_2_profile_data, step_3_lifestyle_data, step_4_goals_data").eq("user_id", user.id).maybeSingle(),
      db.from("aurora_memory_graph").select("content, node_type, pillar").eq("user_id", user.id).eq("is_active", true).limit(50),
      db.from("life_plans").select("vision, focus_pillars").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      db.from("aurora_identity_elements").select("content, element_type").eq("user_id", user.id).limit(20),
    ]);

    const library = practicesLibRes.data || [];
    const existingIds = new Set((existingRes.data || []).map((r: any) => r.practice_id));
    const availablePractices = library.filter(p => !existingIds.has(p.id));

    if (availablePractices.length === 0) {
      return new Response(JSON.stringify({ suggestions: [], message: "All practices already added" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context for AI
    const profileData = launchpadRes.data?.step_2_profile_data as Record<string, any> | null;
    const lifestyleData = launchpadRes.data?.step_3_lifestyle_data as Record<string, any> | null;
    const goalsData = launchpadRes.data?.step_4_goals_data as Record<string, any> | null;
    const selectedPillars = profileRes.data?.selected_pillars as Record<string, string[]> | null;
    const memories = (memoryRes.data || []).map((m: any) => `[${m.node_type}/${m.pillar || "general"}] ${m.content}`).join("\n");
    const identityElements = (identityRes.data || []).map((e: any) => `[${e.element_type}] ${e.content}`).join("\n");
    const planVision = plansRes.data?.[0]?.vision || "";
    const focusPillars = plansRes.data?.[0]?.focus_pillars || [];

    const prompt = `You are Aurora, an AI life coach. Analyze the user's profile and suggest missing practices they should add.

USER CONTEXT:
- Selected pillars: ${JSON.stringify(selectedPillars)}
- Focus pillars in plan: ${JSON.stringify(focusPillars)}
- Plan vision: ${planVision}
- Exercise types from onboarding: ${JSON.stringify(profileData?.exercise_types || [])}
- Willing to do: ${JSON.stringify(profileData?.willing_to_do || [])}
- Hobbies: ${JSON.stringify(profileData?.hobbies || [])}
- Meditation experience: ${profileData?.meditation_experience || "unknown"}
- Goals data: ${JSON.stringify(goalsData || {})}
- Lifestyle data: ${JSON.stringify(lifestyleData || {})}
- Identity elements: ${identityElements || "none"}
- Memory graph excerpts: ${memories || "none"}

CURRENTLY ACTIVE PRACTICE IDS (already added — do NOT suggest these):
${Array.from(existingIds).join(", ")}

AVAILABLE PRACTICES TO CHOOSE FROM (NOT yet added):
${availablePractices.map(p => `- ID: ${p.id} | Name: ${p.name} (${p.name_he || ""}) | Pillar: ${p.pillar} | Category: ${p.category} | Duration: ${p.default_duration}min`).join("\n")}

RULES:
1. Only suggest practices from the AVAILABLE list above (use exact IDs).
2. Suggest 3-8 practices that make sense based on the user's profile, goals, hobbies, training preferences, and identity.
3. For each, decide: is_core (true if it directly maps to their focus pillars/goals), frequency_per_week (1-7), preferred_duration (use the default or adjust).
4. Provide a brief reason for each suggestion.

Return suggestions using the suggest_practices tool.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are Aurora, an intelligent life coaching AI. Suggest relevant practices based on user data." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_practices",
            description: "Return practice suggestions for the user",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      practice_id: { type: "string", description: "ID from available practices list" },
                      is_core: { type: "boolean" },
                      frequency_per_week: { type: "number", minimum: 1, maximum: 7 },
                      preferred_duration: { type: "number" },
                      reason_en: { type: "string", description: "Brief English reason" },
                      reason_he: { type: "string", description: "Brief Hebrew reason" },
                    },
                    required: ["practice_id", "is_core", "frequency_per_week", "preferred_duration", "reason_en", "reason_he"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["suggestions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_practices" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);
    const suggestions = parsed.suggestions || [];

    // Validate suggestions against available practices
    const validSuggestions = suggestions.filter((s: any) => 
      availablePractices.some(p => p.id === s.practice_id)
    ).map((s: any) => {
      const practice = availablePractices.find(p => p.id === s.practice_id)!;
      return {
        ...s,
        practice_name: practice.name,
        practice_name_he: practice.name_he,
        pillar: practice.pillar,
        category: practice.category,
        energy_type: practice.energy_type,
      };
    });

    return new Response(JSON.stringify({ suggestions: validSuggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-practices error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
