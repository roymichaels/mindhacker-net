import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, messages, language = 'he' } = await req.json();

    if (!conversationId || !messages || !Array.isArray(messages)) {
      throw new Error("conversationId and messages array are required");
    }

    // Take first 4 messages, truncate to 200 chars each
    const relevantMessages = messages.slice(0, 4).map(m => 
      m.content.substring(0, 200)
    ).join('\n');

    const isHebrew = language === 'he';
    const prompt = isHebrew 
      ? `בהתבסס על תחילת השיחה הזו, צור כותרת קצרה (3-6 מילים) שמתארת את הנושא המרכזי. רק הכותרת, ללא מרכאות או סימני פיסוק מיותרים.

שיחה:
${relevantMessages}`
      : `Based on the beginning of this conversation, create a short title (3-6 words) that describes the main topic. Just the title, no quotes or unnecessary punctuation.

Conversation:
${relevantMessages}`;

    // Call Lovable AI Gateway
    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    let title = aiResult.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean up the title
    title = title.replace(/^["']|["']$/g, '').trim();
    
    if (!title) {
      title = isHebrew ? 'שיחה חדשה' : 'New conversation';
    }

    // Update the conversation title
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from("conversations")
      .update({ 
        last_message_preview: title,
        updated_at: new Date().toISOString()
      })
      .eq("id", conversationId);

    if (error) {
      console.error("Failed to update conversation title:", error);
      throw error;
    }

    console.log(`Generated title for conversation ${conversationId}: ${title}`);

    return new Response(
      JSON.stringify({ success: true, title }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Aurora generate title error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
