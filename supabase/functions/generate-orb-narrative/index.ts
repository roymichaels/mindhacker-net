import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { language = "he" } = await req.json();

    // Gather user context
    const [profileRes, orbRes, gameRes, plansRes, domainsRes] = await Promise.all([
      supabase.from("profiles").select("full_name, experience, level").eq("id", user.id).maybeSingle(),
      supabase.from("orb_profiles").select("primary_color, computed_from").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("experience, level, streak_count").eq("id", user.id).maybeSingle(),
      supabase.from("life_plans").select("title, status, created_at").eq("user_id", user.id).eq("status", "active").maybeSingle(),
      supabase.from("life_domains").select("domain_id, domain_config, status").eq("user_id", user.id),
    ]);

    const profile = profileRes.data;
    const orb = orbRes.data;
    const computed = (orb?.computed_from || {}) as Record<string, any>;
    const domains = domainsRes.data || [];

    const activeDomains = domains
      .filter((d: any) => d.status === "configured" || d.status === "active")
      .map((d: any) => d.domain_id);

    const level = gameRes.data?.level || 1;
    const xp = gameRes.data?.experience || 0;
    const streak = gameRes.data?.streak_count || 0;

    const isHe = language === "he";

    const prompt = isHe
      ? `אתה כותב סיפורי פנטזיה קצרים ומסתוריים עבור אורב (Orb) — ישות אנרגטית דיגיטלית שמייצגת את הנפש של המשתמש.

נתוני האורב:
- שם המשתמש: ${profile?.full_name || "נוסע"}
- רמה: ${level}, XP: ${xp}, רצף: ${streak}
- ארכיטיפ דומיננטי: ${computed.dominantArchetype || "guardian"}
- ארכיטיפ משני: ${computed.secondaryArchetype || "unknown"}
- משפחה גיאומטרית: ${computed.geometryFamily || "sphere"}
- סוג חומר: ${computed.visualDNA?.materialType || "glass"}
- תחומי חיים פעילים: ${activeDomains.join(", ") || "אין עדיין"}
- צבע ראשי: ${orb?.primary_color || "unknown"}

כתוב סיפור לור קצר (3-4 פסקאות) בעברית שמתאר:
1. את לידת האורב — כיצד הוא נוצר מתוך זהות המשתמש
2. את הצורה הנוכחית שלו — מה היא משקפת על המסע
3. מה הצורה הבאה שלו תהיה — רמז מסתורי לעתיד

השתמש בסגנון פנטזיה מיסטי אבל אישי. אל תכתוב כותרות.`
      : `You write short, mystical fantasy lore for an Orb — a digital energy entity representing the user's psyche.

Orb data:
- User name: ${profile?.full_name || "Traveler"}
- Level: ${level}, XP: ${xp}, Streak: ${streak}
- Dominant archetype: ${computed.dominantArchetype || "guardian"}
- Secondary archetype: ${computed.secondaryArchetype || "unknown"}
- Geometry family: ${computed.geometryFamily || "sphere"}
- Material type: ${computed.visualDNA?.materialType || "glass"}
- Active life domains: ${activeDomains.join(", ") || "none yet"}
- Primary color: ${orb?.primary_color || "unknown"}

Write a short lore story (3-4 paragraphs) describing:
1. The orb's birth — how it emerged from the user's identity
2. Its current form — what it reflects about the journey
3. Its next evolution — a mysterious hint of what's to come

Use a mystical fantasy style but keep it personal. No headings.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: isHe ? "אתה מספר סיפורים מיסטיים." : "You are a mystical storyteller." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const narrative = aiData.choices?.[0]?.message?.content || "";

    // Save to ai_generations table
    await supabase.from("ai_generations").insert({
      user_id: user.id,
      generation_type: "orb_narrative",
      language,
      content: narrative,
      metadata: { level, xp, streak, archetype: computed.dominantArchetype },
    });

    return new Response(JSON.stringify({ narrative }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
