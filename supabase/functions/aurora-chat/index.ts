/**
 * Layer 3: Aurora Chat Handler (thin orchestrator)
 * 
 * ~80 lines. Parses request, calls contextBuilder + orchestrator,
 * streams LLM response, logs tracing metadata.
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildContext } from "./contextBuilder.ts";
import { validateRequest, getWidgetSettings, getKnowledgeBase, prepare } from "./orchestrator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Parse & validate request
    const raw = await req.json();
    const parsed = validateRequest(raw);

    if ("error" in parsed) {
      return new Response(JSON.stringify({ error: parsed.error }), {
        status: parsed.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, customSystemPrompt, userId, language, mode } = parsed;

    // 2. Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Build context (Layer 1 - deterministic)
    let knowledgeBase = "";
    let widgetModel = "google/gemini-2.5-flash";

    if (mode === "widget") {
      const settings = await getWidgetSettings(supabase);
      if (!settings.enabled) {
        return new Response(JSON.stringify({ error: "Assistant is currently unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      widgetModel = settings.model;
      knowledgeBase = await getKnowledgeBase(supabase);
    }

    const context = userId ? await buildContext(supabase, userId, language) : await buildContext(supabase, "", language);

    // 4. Orchestrate (Layer 2 - policy + routing)
    const orchestrated = prepare(mode, context, language, knowledgeBase, customSystemPrompt);
    const model = mode === "widget" ? widgetModel : orchestrated.model;

    console.log(`Aurora chat - Mode: ${mode}, User: ${userId || "guest"}, Model: ${model}, Version: ${orchestrated.promptVersion}, ContextHash: ${context.context_hash.slice(0, 8)}`);

    // 5. Call LLM (Layer 3 - model call)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: orchestrated.systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: orchestrated.maxTokens,
        temperature: orchestrated.temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    // 6. Log tracing metadata (fire-and-forget)
    if (userId) {
      supabase.from("ai_response_logs").insert({
        user_id: userId,
        prompt_version: orchestrated.promptVersion,
        context_hash: context.context_hash,
        model,
        mode,
      }).then(() => {}).catch(e => console.error("Log error:", e));
    }

    // 7. Stream response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("Aurora chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
