import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { prompt, language = "both", generateImage = true } = await req.json();
    if (!prompt) throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Step 1: Generate article content
    const systemPrompt = `You are an expert SEO content writer and digital strategist for MindOS (https://mindos.space) — a gamified personal development platform that uses AI coaching, orb-based digital identity, and neuroscience-backed tools.

Write a complete, high-quality blog article based on the user's prompt.

CRITICAL RULES:
- Return a valid JSON object ONLY, no markdown fences
- The article must be genuinely valuable, not generic fluff
- Use engaging, conversational tone that's SEO-optimized
- Include semantic HTML in content (h2, h3, p, ul, li, strong, em, blockquote)
- Naturally weave in keywords without stuffing
- Write at least 1200 words per language version

═══ MINDOS PRODUCT REFERENCES (MANDATORY) ═══
Every article MUST naturally reference and link to at least 3 MindOS features. Weave them as real solutions, not ads:

1. **Aurora AI Coach** — 24/7 personalized AI life coach. Link: <a href="https://mindos.space/">Try Aurora free →</a>
2. **The Orb** — Living 3D digital identity avatar that evolves with growth. Link: <a href="https://mindos.space/">Explore Orb Gallery →</a>
3. **Hypnosis Sessions** — Guided subconscious reprogramming with ego-state targeting. Link: <a href="https://mindos.space/">Start a session →</a>
4. **Life Plan System** — AI-generated strategic plans with milestones and XP. Link: <a href="https://mindos.space/">Create your Life Plan →</a>
5. **14-Pillar Assessment** — Comprehensive consciousness diagnostic. Link: <a href="https://mindos.space/">Take the assessment →</a>
6. **Gamification** — XP, levels, streaks, tokens, loot drops. Link: <a href="https://mindos.space/">Level up →</a>
7. **Community** — Orb-based identity community. Link: <a href="https://mindos.space/">Join →</a>
8. **Coach OS** — White-label platform for coaches. Link: <a href="https://mindos.space/coaches">Learn more →</a>

INTEGRATION RULES:
- Include a "How MindOS Approaches This" H2 section near the end
- Final CTA: "Ready to [benefit]? <a href="https://mindos.space/">Start your free MindOS journey →</a>"
- Hebrew version uses same URLs with Hebrew CTA text

JSON structure:
{
  "title": "English title (60 chars max, keyword-rich)",
  "title_he": "Hebrew title",
  "slug": "url-friendly-slug-with-keywords",
  "excerpt": "English excerpt (160 chars, compelling)",
  "excerpt_he": "Hebrew excerpt",
  "content": "Full English article with MindOS product references in semantic HTML",
  "content_he": "Full Hebrew article with MindOS product references in semantic HTML",
  "meta_title": "SEO title (60 chars)",
  "meta_description": "Meta description (160 chars)",
  "meta_keywords": "comma,separated,keywords,MindOS,AI coaching",
  "tags": ["tag1", "tag2", "tag3"],
  "reading_time_minutes": 7,
  "image_prompt": "A vivid, detailed prompt for generating a cover image that matches the article theme. Modern, editorial style. No text."
}`;

    const articleResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Write an article about: ${prompt}\n\nLanguage: ${language === "both" ? "Generate both English AND Hebrew versions" : language === "he" ? "Generate Hebrew version (leave English fields empty)" : "Generate English version (leave Hebrew fields empty)"}`,
            },
          ],
        }),
      }
    );

    if (!articleResponse.ok) {
      if (articleResponse.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (articleResponse.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted, please add credits" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${articleResponse.status}`);
    }

    const articleData = await articleResponse.json();
    let rawContent = articleData.choices?.[0]?.message?.content || "";
    
    // Clean up potential markdown fences
    rawContent = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Extract JSON object if surrounded by other text
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      rawContent = jsonMatch[0];
    }

    // Sanitize control characters inside JSON string values
    rawContent = rawContent.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === '\n') return '\\n';
      if (ch === '\r') return '\\r';
      if (ch === '\t') return '\\t';
      return '';
    });

    let article;
    try {
      article = JSON.parse(rawContent);
    } catch (parseErr) {
      console.error("JSON parse failed, attempting recovery. Error:", parseErr);
      try {
        const repaired = rawContent
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        article = JSON.parse(repaired);
      } catch {
        throw new Error("Failed to parse AI response as JSON after sanitization");
      }
    }

    // Step 2: Generate cover image if requested
    let coverImageUrl: string | null = null;
    if (generateImage && article.image_prompt) {
      try {
        const imageResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: `Create a professional, modern editorial blog cover image: ${article.image_prompt}. Style: clean, high-quality, vibrant colors, no text overlay.`,
                },
              ],
              modalities: ["image", "text"],
            }),
          }
        );

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64Image) {
            // Upload to storage
            const imageBytes = Uint8Array.from(
              atob(base64Image.replace(/^data:image\/\w+;base64,/, "")),
              (c) => c.charCodeAt(0)
            );

            const fileName = `blog/${article.slug}-${Date.now()}.png`;
            const serviceClient = createClient(
              Deno.env.get("SUPABASE_URL")!,
              Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );

            // Ensure bucket exists
            await serviceClient.storage.createBucket("blog-images", {
              public: true,
              allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
            });

            const { error: uploadError } = await serviceClient.storage
              .from("blog-images")
              .upload(fileName, imageBytes, {
                contentType: "image/png",
                upsert: true,
              });

            if (!uploadError) {
              const { data: urlData } = serviceClient.storage
                .from("blog-images")
                .getPublicUrl(fileName);
              coverImageUrl = urlData.publicUrl;
            }
          }
        }
      } catch (imgErr) {
        console.error("Image generation failed (non-fatal):", imgErr);
      }
    }

    // Step 3: Save to database
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure unique slug by appending timestamp suffix
    const baseSlug = (article.slug || `post-${Date.now()}`).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    const { data: post, error: insertError } = await serviceClient
      .from("blog_posts")
      .insert({
        title: article.title || "Untitled",
        title_he: article.title_he || null,
        slug: uniqueSlug,
        excerpt: article.excerpt || null,
        excerpt_he: article.excerpt_he || null,
        content: article.content || "",
        content_he: article.content_he || null,
        cover_image_url: coverImageUrl,
        meta_title: article.meta_title || article.title,
        meta_description: article.meta_description || article.excerpt,
        meta_keywords: article.meta_keywords || "",
        tags: article.tags || [],
        reading_time_minutes: article.reading_time_minutes || 5,
        author_id: user.id,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-article error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
