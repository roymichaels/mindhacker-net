import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface HypnosisRequest {
  action: 'suggest_goals' | 'personalize_segment' | 'analyze_progress';
  egoState?: string;
  context?: Record<string, unknown>;
  segment?: {
    id: string;
    text: string;
  };
  userHistory?: {
    sessions: number;
    streak: number;
    level: number;
    favoriteEgoState?: string;
  };
}

const SYSTEM_PROMPTS = {
  suggest_goals: `You are a hypnotherapy expert helping users identify meaningful goals for their hypnosis sessions.
Based on the user's chosen archetype and context, suggest 5 specific, achievable hypnosis goals.
Each goal should be transformative yet focused on a single outcome.
Respond in JSON format: { "goals": [{ "title": "...", "description": "..." }] }`,

  personalize_segment: `You are a master hypnotherapist personalizing hypnosis scripts.
Take the provided segment and personalize it based on the user's context while maintaining hypnotic flow.
Keep the same structure and length, but add personal touches and specific imagery.
Return only the personalized text.`,

  analyze_progress: `You are a hypnotherapy progress analyst.
Analyze the user's session history and provide insights about their journey.
Identify patterns, suggest focus areas, and celebrate achievements.
Respond in JSON format: { "insights": [...], "suggestions": [...], "celebration": "..." }`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: HypnosisRequest = await req.json();
    const { action, egoState, context, segment, userHistory } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let userPrompt = '';
    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS.suggest_goals;

    switch (action) {
      case 'suggest_goals':
        userPrompt = `Archetype: ${egoState || 'guardian'}
User Level: ${userHistory?.level || 1}
Sessions Completed: ${userHistory?.sessions || 0}
Current Streak: ${userHistory?.streak || 0} days
${context ? `Additional Context: ${JSON.stringify(context)}` : ''}

Suggest 5 hypnosis goals appropriate for this user.`;
        break;

      case 'personalize_segment':
        if (!segment) {
          return new Response(JSON.stringify({ error: 'Segment is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        userPrompt = `Segment ID: ${segment.id}
Original Text:
${segment.text}

User Context:
- Archetype: ${egoState || 'guardian'}
- Level: ${userHistory?.level || 1}
- Sessions: ${userHistory?.sessions || 0}

Personalize this segment while maintaining hypnotic flow and length.`;
        break;

      case 'analyze_progress':
        userPrompt = `User Progress Data:
- Total Sessions: ${userHistory?.sessions || 0}
- Current Streak: ${userHistory?.streak || 0} days
- Level: ${userHistory?.level || 1}
- Favorite Archetype: ${userHistory?.favoriteEgoState || 'none yet'}
${context ? `- Additional Data: ${JSON.stringify(context)}` : ''}

Analyze their hypnosis journey and provide insights.`;
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log('AI Hypnosis request:', { action, egoState });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('AI request failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Try to parse JSON response for structured actions
    let result;
    if (action === 'suggest_goals' || action === 'analyze_progress') {
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                          content.match(/```\s*([\s\S]*?)\s*```/) ||
                          [null, content];
        result = JSON.parse(jsonMatch[1] || content);
      } catch {
        result = { raw: content };
      }
    } else {
      result = { text: content };
    }

    console.log('AI Hypnosis success:', { action });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Hypnosis error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
