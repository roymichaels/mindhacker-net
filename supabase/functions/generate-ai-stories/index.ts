import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MINDOS_TOPICS = [
  { pillar: "consciousness", theme_en: "expanding awareness", theme_he: "הרחבת מודעות" },
  { pillar: "presence", theme_en: "mindful presence", theme_he: "נוכחות מודעת" },
  { pillar: "power", theme_en: "inner strength", theme_he: "כוח פנימי" },
  { pillar: "vitality", theme_en: "energy and vitality", theme_he: "אנרגיה וחיוניות" },
  { pillar: "focus", theme_en: "deep focus", theme_he: "מיקוד עמוק" },
  { pillar: "combat", theme_en: "resilience and discipline", theme_he: "חוסן ומשמעת" },
  { pillar: "expansion", theme_en: "cognitive expansion", theme_he: "הרחבה קוגניטיבית" },
  { pillar: "wealth", theme_en: "abundance mindset", theme_he: "חשיבה של שפע" },
  { pillar: "influence", theme_en: "leadership and impact", theme_he: "מנהיגות והשפעה" },
  { pillar: "relationships", theme_en: "deep connections", theme_he: "קשרים עמוקים" },
  { pillar: "business", theme_en: "business mastery", theme_he: "מצוינות עסקית" },
  { pillar: "projects", theme_en: "execution and shipping", theme_he: "ביצוע ויצירה" },
  { pillar: "play", theme_en: "joy and play", theme_he: "שמחה ומשחק" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Verify admin
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Admin access required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure storage bucket
    await serviceClient.storage.createBucket("ai-stories", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });

    const results: any[] = [];

    // Pick a random topic for variety
    const topic = MINDOS_TOPICS[Math.floor(Math.random() * MINDOS_TOPICS.length)];

    // Generate 2 stories: 1 MindOS + 1 Aurora
    const storyPrompts = [
      {
        source: "mindos",
        systemPrompt: `You are MindOS — a gamified personal development operating system. Generate a powerful, concise daily insight story card.
Return ONLY valid JSON with this structure:
{
  "title_en": "Short powerful title (max 6 words)",
  "title_he": "Hebrew title",
  "body_en": "A compelling 1-2 sentence insight about ${topic.theme_en}. Make it actionable and profound. Max 30 words.",
  "body_he": "Hebrew version of the body",
  "subtitle_en": "One-liner tagline or stat (max 8 words)",
  "subtitle_he": "Hebrew subtitle",
  "image_prompt": "A cinematic, moody, abstract background image for a story about ${topic.theme_en}. Dark atmospheric, glowing accents, no text, editorial quality, 9:16 vertical."
}`,
        pillar: topic.pillar,
      },
      {
        source: "aurora",
        systemPrompt: `You are Aurora — an advanced AI life coach with deep emotional intelligence. Generate a personal coaching story card.
Return ONLY valid JSON with this structure:
{
  "title_en": "Short coaching title (max 6 words)",
  "title_he": "Hebrew title",
  "body_en": "A warm, personal coaching message about ${topic.theme_en}. Speak directly to the reader with 'you'. Max 30 words.",
  "body_he": "Hebrew version",
  "subtitle_en": "An inspiring one-liner (max 8 words)",
  "subtitle_he": "Hebrew subtitle",
  "image_prompt": "A dreamy, ethereal abstract background with violet and cyan holographic light, cosmic depth, no text, 9:16 vertical format."
}`,
        pillar: topic.pillar,
      },
    ];

    for (const sp of storyPrompts) {
      try {
        // Step 1: Generate text content
        const textRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: sp.systemPrompt },
              { role: "user", content: `Generate a daily story card about: ${topic.theme_en}` },
            ],
          }),
        });

        if (!textRes.ok) {
          console.error(`Text gen failed for ${sp.source}: ${textRes.status}`);
          continue;
        }

        const textData = await textRes.json();
        let raw = textData.choices?.[0]?.message?.content || "";
        raw = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) raw = jsonMatch[0];

        let storyContent;
        try {
          storyContent = JSON.parse(raw);
        } catch {
          raw = raw.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
          storyContent = JSON.parse(raw);
        }

        // Step 2: Generate background image
        let imageUrl: string | null = null;
        if (storyContent.image_prompt) {
          try {
            const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [{ role: "user", content: storyContent.image_prompt }],
                modalities: ["image", "text"],
              }),
            });

            if (imgRes.ok) {
              const imgData = await imgRes.json();
              const b64 = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              if (b64) {
                const bytes = Uint8Array.from(
                  atob(b64.replace(/^data:image\/\w+;base64,/, "")),
                  (c) => c.charCodeAt(0)
                );
                const fileName = `stories/${sp.source}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.png`;
                const { error: upErr } = await serviceClient.storage
                  .from("ai-stories")
                  .upload(fileName, bytes, { contentType: "image/png", upsert: true });
                if (!upErr) {
                  const { data: urlData } = serviceClient.storage.from("ai-stories").getPublicUrl(fileName);
                  imageUrl = urlData.publicUrl;
                }
              }
            }
          } catch (imgErr) {
            console.error("Image gen failed (non-fatal):", imgErr);
          }
        }

        // Step 3: Save as community_post (story type)
        const content = JSON.stringify({
          source: sp.source,
          title_en: storyContent.title_en,
          title_he: storyContent.title_he,
          body_en: storyContent.body_en,
          body_he: storyContent.body_he,
          subtitle_en: storyContent.subtitle_en,
          subtitle_he: storyContent.subtitle_he,
        });

        const { data: post, error: postErr } = await serviceClient
          .from("community_posts")
          .insert({
            user_id: user.id,
            content,
            pillar: sp.pillar,
            media_urls: imageUrl ? [imageUrl] : [],
            status: "approved",
            post_type: "story",
            is_system: true,
          })
          .select("id")
          .single();

        if (postErr) {
          console.error("Insert failed:", postErr);
          continue;
        }

        results.push({ source: sp.source, id: post?.id, pillar: sp.pillar });
      } catch (err) {
        console.error(`Story generation failed for ${sp.source}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, stories: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ai-stories error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
