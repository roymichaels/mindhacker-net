import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || "" } } }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, action, pageId, coachProfile, currentContent, editPrompt } = await req.json();

    // Action: edit — Aurora modifies existing landing page content based on a prompt
    if (action === "edit") {
      if (!currentContent || !editPrompt) {
        return new Response(JSON.stringify({ error: "Missing currentContent or editPrompt" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const editSystemPrompt = `You are Aurora, an expert landing page editor. You will receive the current landing page JSON content and a user instruction. Apply the requested changes and return the COMPLETE updated JSON.

IMPORTANT: Return ONLY raw JSON, no markdown, no explanations. Keep the same structure. Only modify what the user asked for, preserve everything else.

Current page content:
${JSON.stringify(currentContent, null, 2)}

Coach profile context:
${coachProfile ? JSON.stringify(coachProfile) : "Not provided"}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: editSystemPrompt },
            { role: "user", content: editPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${status}`);
      }

      const aiData = await response.json();
      let raw = aiData.choices?.[0]?.message?.content || "";
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      let updatedContent;
      try { updatedContent = JSON.parse(raw); } catch {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          updatedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI edit response as JSON");
        }
      }

      return new Response(JSON.stringify({ success: true, content: updatedContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: generate — Aurora builds the landing page from conversation
    if (action === "generate") {
      const systemPrompt = `You are Aurora, an expert landing page architect for coaches. Based on the conversation, generate a complete landing page in JSON format.

Return a JSON object with this EXACT structure (no markdown, just raw JSON):
{
  "title": "Page title",
  "slug": "url-friendly-slug",
  "template_id": "one of: lead-capture, webinar, program-launch, free-resource, consultation",
  "meta_title": "SEO title under 60 chars",
  "meta_description": "SEO description under 160 chars",
  "content": {
    "hero": {
      "headline": "Main headline",
      "subheadline": "Supporting text",
      "cta_text": "Button text",
      "cta_url": "#signup"
    },
    "benefits": [
      { "icon": "star", "title": "Benefit 1", "description": "..." },
      { "icon": "heart", "title": "Benefit 2", "description": "..." },
      { "icon": "target", "title": "Benefit 3", "description": "..." }
    ],
    "about": {
      "headline": "About the coach",
      "text": "Bio paragraph",
      "credentials": ["Credential 1", "Credential 2"]
    },
    "testimonials": [
      { "name": "Client Name", "text": "Testimonial text", "role": "Role" }
    ],
    "offer": {
      "headline": "What you get",
      "items": ["Item 1", "Item 2", "Item 3"],
      "price_text": "Price or CTA text"
    },
    "faq": [
      { "question": "FAQ question", "answer": "Answer" }
    ],
    "cta_final": {
      "headline": "Final CTA headline",
      "text": "Urgency text",
      "button_text": "Sign up now"
    }
  }
}

Coach profile context:
${coachProfile ? JSON.stringify(coachProfile) : "Not provided"}

Generate content in the same language the coach used in the conversation. Make it compelling, specific to their niche, and conversion-optimized.`;

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
            ...messages,
            { role: "user", content: "Based on our conversation, generate the complete landing page JSON now." }
          ],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiData = await response.json();
      let raw = aiData.choices?.[0]?.message?.content || "";
      
      // Strip markdown code fences if present
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      
      let pageContent;
      try { pageContent = JSON.parse(raw); } catch {
        // Try to extract JSON from the response
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          pageContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      return new Response(JSON.stringify({ success: true, page: pageContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: chat — Aurora asks questions to understand needs (streaming)
    const systemPrompt = `You are Aurora, a warm and strategic AI assistant helping a coach create the perfect landing page.

Your goal: Through 3-5 focused questions, understand exactly what landing page to build. Ask one question at a time.

Questions to explore (adapt based on answers):
1. What's the goal? (lead capture, webinar signup, sell a program, free resource, book a consultation)
2. Who's the target audience? (demographics, pain points)
3. What's the main offer/transformation they provide?
4. What tone/style? (professional, warm, bold, minimal)
5. Any specific elements they want? (testimonials, FAQ, pricing, video)

Keep responses short (2-3 sentences + question). Use the coach's language.
After gathering enough info (3-5 exchanges), say "✨ אני מוכנה לבנות את הדף!" or "✨ I'm ready to build your page!" and summarize what you'll create.

${coachProfile ? `Coach context: ${JSON.stringify(coachProfile)}` : ""}`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("generate-landing-page error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
