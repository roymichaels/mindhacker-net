import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, conversationId, messages } = await req.json();

    if (!userId || !conversationId || !messages || messages.length < 4) {
      return new Response(
        JSON.stringify({ error: "Insufficient data for summarization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we already have a recent memory for this conversation
    const { data: existingMemory } = await supabase
      .from("aurora_conversation_memory")
      .select("id, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Only summarize if last memory is older than 30 minutes or doesn't exist
    if (existingMemory) {
      const lastMemoryTime = new Date(existingMemory.created_at).getTime();
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      if (lastMemoryTime > thirtyMinutesAgo) {
        return new Response(
          JSON.stringify({ message: "Recent memory exists, skipping" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build conversation text for summarization
    const conversationText = messages
      .map((m: ChatMessage) => `${m.role === 'user' ? 'משתמש' : 'אורורה'}: ${m.content}`)
      .join('\n');

    // Call Lovable AI for summarization
    const summaryPrompt = `סכם את השיחה הבאה ב-2-3 משפטים קצרים בעברית.
זהה:
1. נושאים מרכזיים שנדונו
2. פעולות או החלטות שנקבעו (אם יש)
3. המצב הרגשי הכללי של המשתמש

החזר תשובה בפורמט JSON בלבד:
{
  "summary": "סיכום קצר של השיחה",
  "key_topics": ["נושא 1", "נושא 2"],
  "action_items": ["פעולה 1", "פעולה 2"],
  "emotional_state": "מילה אחת שמתארת את המצב הרגשי"
}

השיחה:
${conversationText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "user", content: summaryPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Parse the JSON response
    let summaryData: {
      summary: string;
      key_topics: string[];
      action_items: string[];
      emotional_state: string;
    };

    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summaryData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to basic summary
      summaryData = {
        summary: content.slice(0, 200),
        key_topics: [],
        action_items: [],
        emotional_state: 'unknown'
      };
    }

    // Save the memory to database
    const { error: insertError } = await supabase
      .from("aurora_conversation_memory")
      .insert({
        user_id: userId,
        conversation_id: conversationId,
        summary: summaryData.summary,
        key_topics: summaryData.key_topics,
        action_items: summaryData.action_items,
        emotional_state: summaryData.emotional_state,
      });

    if (insertError) {
      console.error("Failed to save conversation memory:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save memory" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Saved conversation memory for user ${userId}, conversation ${conversationId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: summaryData.summary 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Conversation summarization error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
