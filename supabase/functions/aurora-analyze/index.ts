import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Analysis prompt for extracting Life Model insights
const ANALYSIS_PROMPT = `You are an AI that extracts stable life insights from conversations.

Your job is to analyze a conversation and identify patterns, values, beliefs, and commitments that appear STABLE and CONSISTENT - not fleeting thoughts or momentary feelings.

## What to Extract

### Trigger Signals (SAVE these):
- "I am the kind of person who..."
- "What matters most to me is..."
- "I've decided to..."
- "I always / I never..."
- Consistent mention 3+ times across messages
- Strong emotional conviction
- Clear statements of identity

### Non-Trigger Signals (DO NOT save):
- "I'm not sure but..."
- "Maybe I should..."
- "I think perhaps..."
- Single mentions without conviction
- Contradictions in the same conversation
- Venting or complaining without insight
- Hypotheticals or "what ifs"

## Output Format

Return a JSON object with the following structure (only include fields where you found stable insights):

{
  "life_direction": {
    "content": "A clear statement of life direction (1-2 sentences)",
    "clarity_score": 0-100
  },
  "identity_elements": [
    { "element_type": "value", "content": "The value identified" },
    { "element_type": "principle", "content": "The principle identified" },
    { "element_type": "self_concept", "content": "How they see themselves" },
    { "element_type": "vision_statement", "content": "Their vision for life" }
  ],
  "energy_patterns": [
    { "pattern_type": "sleep|nutrition|movement|stress", "description": "Pattern description" }
  ],
  "behavioral_patterns": [
    { "pattern_type": "focus|avoidance|discipline|resistance|strength", "description": "Pattern description" }
  ],
  "commitments": [
    { "title": "Commitment title", "description": "What they're committing to" }
  ],
  "onboarding_update": {
    "direction_clarity": "incomplete|emerging|stable",
    "identity_understanding": "shallow|partial|clear",
    "energy_patterns_status": "unknown|partial|mapped"
  }
}

If you don't find any stable insights worth saving, return:
{ "no_insights": true }

Be CONSERVATIVE. Only extract what is clearly stable and meaningful. Quality over quantity.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, messages } = await req.json();

    if (!userId || !messages || !Array.isArray(messages)) {
      throw new Error("userId and messages array are required");
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Format messages for analysis
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Aurora'}: ${m.content}`)
      .join('\n\n');

    // Call Lovable AI Gateway for analysis
    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: ANALYSIS_PROMPT },
          { role: "user", content: `Analyze this conversation:\n\n${conversationText}` }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const analysisText = aiResult.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error("No analysis content returned");
    }

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.error("Failed to parse analysis JSON:", analysisText);
      throw new Error("Invalid JSON response from AI");
    }

    if (analysis.no_insights) {
      console.log("No stable insights found in this conversation");
      return new Response(
        JSON.stringify({ success: true, insights_saved: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let insightsSaved = 0;

    // Save life direction
    if (analysis.life_direction?.content) {
      const { error } = await supabase
        .from("aurora_life_direction")
        .upsert({
          user_id: userId,
          content: analysis.life_direction.content,
          clarity_score: analysis.life_direction.clarity_score || 50,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (!error) insightsSaved++;
    }

    // Save identity elements
    if (analysis.identity_elements?.length > 0) {
      for (const element of analysis.identity_elements) {
        // Check if similar element already exists
        const { data: existing } = await supabase
          .from("aurora_identity_elements")
          .select("id")
          .eq("user_id", userId)
          .eq("element_type", element.element_type)
          .eq("content", element.content)
          .single();
        
        if (!existing) {
          const { error } = await supabase
            .from("aurora_identity_elements")
            .insert({
              user_id: userId,
              element_type: element.element_type,
              content: element.content,
              metadata: element.metadata || {},
            });
          
          if (!error) insightsSaved++;
        }
      }
    }

    // Save energy patterns
    if (analysis.energy_patterns?.length > 0) {
      for (const pattern of analysis.energy_patterns) {
        const { error } = await supabase
          .from("aurora_energy_patterns")
          .upsert({
            user_id: userId,
            pattern_type: pattern.pattern_type,
            description: pattern.description,
          }, { onConflict: 'user_id,pattern_type' });
        
        if (!error) insightsSaved++;
      }
    }

    // Save behavioral patterns
    if (analysis.behavioral_patterns?.length > 0) {
      for (const pattern of analysis.behavioral_patterns) {
        const { error } = await supabase
          .from("aurora_behavioral_patterns")
          .upsert({
            user_id: userId,
            pattern_type: pattern.pattern_type,
            description: pattern.description,
          }, { onConflict: 'user_id,pattern_type' });
        
        if (!error) insightsSaved++;
      }
    }

    // Save commitments
    if (analysis.commitments?.length > 0) {
      for (const commitment of analysis.commitments) {
        // Check if similar commitment already exists
        const { data: existing } = await supabase
          .from("aurora_commitments")
          .select("id")
          .eq("user_id", userId)
          .eq("title", commitment.title)
          .single();
        
        if (!existing) {
          const { error } = await supabase
            .from("aurora_commitments")
            .insert({
              user_id: userId,
              title: commitment.title,
              description: commitment.description || '',
              status: 'active',
            });
          
          if (!error) insightsSaved++;
        }
      }
    }

    // Update onboarding progress
    if (analysis.onboarding_update) {
      const { error } = await supabase
        .from("aurora_onboarding_progress")
        .upsert({
          user_id: userId,
          ...analysis.onboarding_update,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error("Failed to update onboarding progress:", error);
      }
    }

    // Award XP for insights
    if (insightsSaved > 0) {
      await supabase.rpc('aurora_award_xp', {
        p_user_id: userId,
        p_amount: insightsSaved * 15,
        p_reason: `${insightsSaved} life model insights extracted`
      });
    }

    console.log(`Saved ${insightsSaved} insights for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, insights_saved: insightsSaved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Aurora analyze error:", error);
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
