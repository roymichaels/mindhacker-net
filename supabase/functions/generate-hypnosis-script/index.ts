import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ScriptRequest {
  egoState: string;
  goal: string;
  durationMinutes: number;
  userLevel?: number;
  sessionStreak?: number;
  previousSessions?: number;
  language?: 'he' | 'en';
}

interface ScriptSegment {
  id: string;
  text: string;
  mood: string;
  durationPercent: number;
}

const SEGMENT_STRUCTURE = [
  { id: 'welcome', percent: 8, mood: 'warm' },
  { id: 'induction', percent: 25, mood: 'calming' },
  { id: 'deepening', percent: 20, mood: 'deepening' },
  { id: 'core_work', percent: 30, mood: 'transformative' },
  { id: 'integration', percent: 12, mood: 'integrating' },
  { id: 'emergence', percent: 5, mood: 'energizing' },
];

const EGO_STATE_PROMPTS: Record<string, string> = {
  guardian: 'Focus on building inner strength, protection, and secure boundaries. Use metaphors of shields, fortresses, and protective light.',
  rebel: 'Focus on breaking free from limitations, embracing authenticity, and finding personal power. Use metaphors of breaking chains, fire, and liberation.',
  healer: 'Focus on self-compassion, emotional healing, and nurturing the inner self. Use metaphors of healing waters, gentle light, and growing gardens.',
  explorer: 'Focus on curiosity, discovery, and expanding horizons. Use metaphors of journeys, maps, and undiscovered territories.',
  mystic: 'Focus on connecting to deeper wisdom, intuition, and spiritual insight. Use metaphors of stars, cosmic connection, and ancient knowledge.',
  creator: 'Focus on imagination, creative potential, and manifesting vision. Use metaphors of blank canvases, clay, and infinite possibilities.',
  sage: 'Focus on wisdom, clarity, and understanding. Use metaphors of clear skies, mountain peaks, and illuminating light.',
  lover: 'Focus on connection, self-love, and opening the heart. Use metaphors of warmth, embrace, and blooming flowers.',
  warrior: 'Focus on courage, determination, and taking action. Use metaphors of paths, strength, and overcoming obstacles.',
  innocent: 'Focus on wonder, trust, and seeing fresh perspectives. Use metaphors of sunrise, dewdrops, and playful exploration.',
  jester: 'Focus on lightness, joy, and releasing heavy patterns. Use metaphors of laughter, dancing, and colorful celebrations.',
  ruler: 'Focus on self-mastery, order, and taking charge of life. Use metaphors of thrones, kingdoms, and commanding presence.',
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

    const body: ScriptRequest = await req.json();
    const {
      egoState = 'guardian',
      goal,
      durationMinutes = 10,
      userLevel = 1,
      sessionStreak = 0,
      previousSessions = 0,
      language = 'he',
    } = body;

    if (!goal) {
      return new Response(JSON.stringify({ error: 'Goal is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Load Aurora Life Model data for personalization
    const [
      directionRes,
      identityRes,
      energyRes,
      focusRes,
    ] = await Promise.all([
      supabase.from('aurora_life_direction').select('content, clarity_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('aurora_identity_elements').select('element_type, content').eq('user_id', user.id),
      supabase.from('aurora_energy_patterns').select('pattern_type, description').eq('user_id', user.id),
      supabase.from('aurora_focus_plans').select('title').eq('user_id', user.id).eq('status', 'active').limit(1),
    ]);

    const lifeDirection = directionRes.data?.[0]?.content || null;
    const values = (identityRes.data || []).filter((i: { element_type: string }) => i.element_type === 'value').map((i: { content: string }) => i.content);
    const energyPatterns = energyRes.data || [];
    const currentFocus = focusRes.data?.[0]?.title || null;

    // Build personalization context
    let personalizationContext = '';
    if (lifeDirection) {
      personalizationContext += `\nLife Direction: "${lifeDirection}" - weave this into the session's metaphors and suggestions.`;
    }
    if (values.length > 0) {
      personalizationContext += `\nCore Values: ${values.join(', ')} - anchor suggestions to these values.`;
    }
    if (currentFocus) {
      personalizationContext += `\nCurrent Focus: "${currentFocus}" - connect the goal to this focus area.`;
    }
    if (energyPatterns.length > 0) {
      const patterns = energyPatterns.map((e: { pattern_type: string; description: string }) => `${e.pattern_type}: ${e.description}`).join('; ');
      personalizationContext += `\nEnergy Patterns: ${patterns} - be mindful of these in pacing and suggestions.`;
    }

    const wordsPerMinute = 130;
    const totalWords = durationMinutes * wordsPerMinute;
    const egoStateContext = EGO_STATE_PROMPTS[egoState] || EGO_STATE_PROMPTS.guardian;

    const languageInstruction = language === 'he' 
      ? 'Write the entire script in Hebrew. Use warm, flowing Hebrew that feels natural and poetic.'
      : 'Write the entire script in English. Use warm, flowing language that feels natural and poetic.';

    const experienceContext = previousSessions === 0
      ? 'This is the user\'s first session. Be extra welcoming and gentle with explanations.'
      : userLevel >= 5
        ? 'This is an experienced user. You can use deeper hypnotic techniques and less explanation.'
        : 'This user has some experience. Balance guidance with deeper work.';

    const streakContext = sessionStreak >= 7
      ? 'Acknowledge their commitment to daily practice.'
      : '';

    const systemPrompt = `You are a master hypnotherapist creating personalized hypnosis scripts.
Your scripts are warm, flowing, and deeply relaxing.
You use Ericksonian techniques, embedded commands, and metaphorical language.
${languageInstruction}

${egoStateContext}

${experienceContext}
${streakContext}
${personalizationContext}

Create a hypnosis script with exactly these segments in order:
1. WELCOME (8%) - Greet warmly, establish safety, introduce the session goal
2. INDUCTION (25%) - Guide into hypnotic state with progressive relaxation
3. DEEPENING (20%) - Deepen the trance with counting, stairs, or other deepening techniques
4. CORE_WORK (30%) - The main therapeutic work addressing the goal
5. INTEGRATION (12%) - Lock in changes, future pacing, positive suggestions
6. EMERGENCE (5%) - Gently bring back to full awareness

Total target: approximately ${totalWords} words.
Mark each segment clearly with [SEGMENT_NAME] at the start.`;

    const userPrompt = `Create a ${durationMinutes}-minute hypnosis script for:
Goal: ${goal}
Archetype: ${egoState}
User Level: ${userLevel}

Remember to mark each segment with [WELCOME], [INDUCTION], [DEEPENING], [CORE_WORK], [INTEGRATION], [EMERGENCE].`;

    console.log('Generating hypnosis script for:', { egoState, goal, durationMinutes, language });

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
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again' }), {
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
      
      throw new Error('Failed to generate script');
    }

    const aiResponse = await response.json();
    const fullScript = aiResponse.choices?.[0]?.message?.content || '';

    // Parse segments from the generated script
    const segments: ScriptSegment[] = [];
    const segmentPatterns = [
      { id: 'welcome', pattern: /\[WELCOME\]([\s\S]*?)(?=\[INDUCTION\]|$)/i },
      { id: 'induction', pattern: /\[INDUCTION\]([\s\S]*?)(?=\[DEEPENING\]|$)/i },
      { id: 'deepening', pattern: /\[DEEPENING\]([\s\S]*?)(?=\[CORE_WORK\]|$)/i },
      { id: 'core_work', pattern: /\[CORE_WORK\]([\s\S]*?)(?=\[INTEGRATION\]|$)/i },
      { id: 'integration', pattern: /\[INTEGRATION\]([\s\S]*?)(?=\[EMERGENCE\]|$)/i },
      { id: 'emergence', pattern: /\[EMERGENCE\]([\s\S]*?)$/i },
    ];

    for (const { id, pattern } of segmentPatterns) {
      const match = fullScript.match(pattern);
      const structureInfo = SEGMENT_STRUCTURE.find(s => s.id === id);
      
      segments.push({
        id,
        text: match ? match[1].trim() : '',
        mood: structureInfo?.mood || 'neutral',
        durationPercent: structureInfo?.percent || 0,
      });
    }

    const script = {
      title: goal,
      egoState,
      language,
      segments,
      metadata: {
        durationMinutes,
        totalWords: fullScript.split(/\s+/).length,
        wordsPerMinute,
        generatedAt: new Date().toISOString(),
        userLevel,
      },
    };

    console.log('Script generated successfully:', {
      segmentCount: segments.length,
      totalWords: script.metadata.totalWords,
    });

    return new Response(JSON.stringify(script), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generate script error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
