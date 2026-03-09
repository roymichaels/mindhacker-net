import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get requesting user's location
    const { data: myLocation } = await supabase
      .from("user_locations")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (!myLocation) {
      return new Response(JSON.stringify({ error: "Location not set" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get user's profile + pillar data
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("full_name, bio")
      .eq("id", user_id)
      .single();

    // Get user's active pillars from launchpad_progress
    const { data: myProgress } = await supabase
      .from("launchpad_progress")
      .select("step_2_profile_data")
      .eq("user_id", user_id)
      .maybeSingle();

    const myPillars = myProgress?.step_2_profile_data
      ? Object.keys((myProgress.step_2_profile_data as any)?.pillar_quests || {})
      : [];

    // 3. Find nearby users (within ~50km using simple distance calc)
    const { data: nearbyLocations } = await supabase
      .from("user_locations")
      .select("user_id, latitude, longitude, city, country")
      .neq("user_id", user_id);

    if (!nearbyLocations?.length) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Simple distance filter (Haversine approximation)
    const R = 6371; // Earth radius in km
    const MAX_DISTANCE_KM = 50;
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const nearby = nearbyLocations.filter((loc) => {
      const dLat = toRad(loc.latitude - myLocation.latitude);
      const dLon = toRad(loc.longitude - myLocation.longitude);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(myLocation.latitude)) *
          Math.cos(toRad(loc.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= MAX_DISTANCE_KM;
    });

    if (!nearby.length) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Get profiles + pillar data for nearby users
    const nearbyIds = nearby.map((n) => n.user_id);
    const { data: nearbyProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, bio")
      .in("id", nearbyIds);

    const { data: nearbyProgress } = await supabase
      .from("launchpad_progress")
      .select("user_id, step_2_profile_data")
      .in("user_id", nearbyIds);

    // Build candidate list
    const candidates = nearbyIds.map((id) => {
      const profile = nearbyProfiles?.find((p) => p.id === id);
      const progress = nearbyProgress?.find((p) => p.user_id === id);
      const pillars = progress?.step_2_profile_data
        ? Object.keys((progress.step_2_profile_data as any)?.pillar_quests || {})
        : [];
      const loc = nearby.find((n) => n.user_id === id);
      return { id, name: profile?.full_name || "Player", bio: profile?.bio || "", pillars, city: loc?.city || "" };
    });

    // 5. Use AI to score and rank matches
    if (lovableKey && candidates.length > 0) {
      try {
        const prompt = `You are Aurora, an AI life coach. Analyze compatibility between the requesting user and candidates for real-life collaboration.

Requesting user:
- Name: ${myProfile?.full_name || "Unknown"}
- Bio: ${myProfile?.bio || "N/A"}
- Active pillars: ${myPillars.join(", ") || "none yet"}
- City: ${myLocation.city || "Unknown"}

Candidates:
${candidates.map((c, i) => `${i + 1}. ${c.name} | Pillars: ${c.pillars.join(", ") || "none"} | City: ${c.city} | Bio: ${c.bio}`).join("\n")}

For each candidate, provide a match score (0-100) and a one-sentence reason why they'd be a good training/collaboration partner. Focus on shared pillars and complementary strengths.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "Return JSON only. No markdown." },
              { role: "user", content: prompt },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "return_matches",
                  description: "Return scored match results",
                  parameters: {
                    type: "object",
                    properties: {
                      matches: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            candidate_index: { type: "number" },
                            score: { type: "number" },
                            reason: { type: "string" },
                            shared_pillars: { type: "array", items: { type: "string" } },
                          },
                          required: ["candidate_index", "score", "reason", "shared_pillars"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["matches"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "return_matches" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          if (toolCall?.function?.arguments) {
            const parsed = JSON.parse(toolCall.function.arguments);
            const aiMatches = parsed.matches || [];

            // Save matches to database
            const matchRows = aiMatches
              .filter((m: any) => m.score >= 30 && m.candidate_index >= 1 && m.candidate_index <= candidates.length)
              .map((m: any) => {
                const candidate = candidates[m.candidate_index - 1];
                return {
                  user_id,
                  matched_user_id: candidate.id,
                  match_score: Math.min(100, Math.max(0, m.score)),
                  match_reason: m.reason,
                  shared_pillars: m.shared_pillars || [],
                  status: "pending",
                };
              });

            if (matchRows.length > 0) {
              // Delete old matches first
              await supabase.from("ai_matches").delete().eq("user_id", user_id);

              const { error: insertError } = await supabase.from("ai_matches").insert(matchRows);
              if (insertError) console.error("Insert matches error:", insertError);
            }

            return new Response(JSON.stringify({ matches: matchRows.length }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          const errText = await aiResponse.text();
          console.error("AI gateway error:", aiResponse.status, errText);

          if (aiResponse.status === 429) {
            return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (aiResponse.status === 402) {
            return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } catch (aiErr) {
        console.error("AI matching error:", aiErr);
      }
    }

    // Fallback: simple pillar-overlap scoring without AI
    const fallbackMatches = candidates
      .map((c) => {
        const shared = myPillars.filter((p) => c.pillars.includes(p));
        const score = Math.round((shared.length / Math.max(myPillars.length, 1)) * 80 + Math.random() * 20);
        return {
          user_id,
          matched_user_id: c.id,
          match_score: Math.min(100, score),
          match_reason: shared.length > 0
            ? `Shares ${shared.length} pillar(s): ${shared.join(", ")}`
            : "Nearby player — connect and discover shared interests",
          shared_pillars: shared,
          status: "pending",
        };
      })
      .filter((m) => m.match_score >= 20)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);

    if (fallbackMatches.length > 0) {
      await supabase.from("ai_matches").delete().eq("user_id", user_id);
      await supabase.from("ai_matches").insert(fallbackMatches);
    }

    return new Response(JSON.stringify({ matches: fallbackMatches.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-match error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
