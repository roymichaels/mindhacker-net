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
  autoGenerateGoal?: boolean;
  isDailySession?: boolean;
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
      goal,
      durationMinutes = 10,
      userLevel = 1,
      sessionStreak = 0,
      previousSessions = 0,
      language = 'he',
      isDailySession = false,
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

    // ============================================
    // COMPREHENSIVE USER PROFILE DATA LOADING
    // ============================================
    const [
      profileRes,
      directionRes,
      identityRes,
      energyRes,
      behavioralRes,
      focusRes,
      launchpadRes,
      launchpadProgressRes,
      milestoneRes,
      commitmentsRes,
      visionsRes,
      dailyMinimumsRes,
      checklistsRes,
      conversationMemoryRes,
      previousSessionsRes,
    ] = await Promise.all([
      // Basic profile with preferences
      supabase.from('profiles').select('full_name, aurora_preferences').eq('id', user.id).single(),
      // Life direction
      supabase.from('aurora_life_direction').select('content, clarity_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      // Identity elements (values, principles, self-concepts, job title)
      supabase.from('aurora_identity_elements').select('element_type, content, metadata').eq('user_id', user.id),
      // Energy patterns
      supabase.from('aurora_energy_patterns').select('pattern_type, description').eq('user_id', user.id),
      // Behavioral patterns
      supabase.from('aurora_behavioral_patterns').select('pattern_type, description').eq('user_id', user.id),
      // Active focus plan
      supabase.from('aurora_focus_plans').select('title, description').eq('user_id', user.id).eq('status', 'active').limit(1),
      // Launchpad AI Summary
      supabase.from('launchpad_summaries').select('summary_data').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      // Raw launchpad responses for deeper context
      supabase.from('launchpad_progress').select('step_2_profile_data, step_3_lifestyle_data, step_5_blockers_data, step_10_final_notes').eq('user_id', user.id).single(),
      // Active life plan for milestones
      supabase.from('life_plans').select('id, title').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1),
      // Active commitments
      supabase.from('aurora_commitments').select('title, description').eq('user_id', user.id).eq('status', 'active'),
      // Life visions
      supabase.from('aurora_life_visions').select('title, description, timeframe, focus_areas').eq('user_id', user.id).limit(3),
      // Daily minimums (habits user committed to)
      supabase.from('aurora_daily_minimums').select('title, category').eq('user_id', user.id).eq('is_active', true),
      // Active checklists and their items
      supabase.from('aurora_checklists').select('title, aurora_checklist_items(content, is_completed)').eq('user_id', user.id).eq('status', 'active').limit(3),
      // Recent conversation insights
      supabase.from('aurora_conversation_memory').select('summary, key_topics, emotional_state, action_items').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      // Previous hypnosis sessions for continuity
      supabase.from('hypnosis_sessions').select('goal_id, ego_state, duration_seconds, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]);

    // ============================================
    // EXTRACT AND STRUCTURE USER DATA
    // ============================================
    
    // User basics (extract first name from full_name)
    const fullName = profileRes.data?.full_name as string | null;
    const userName = fullName ? fullName.split(' ')[0] : null;
    const userGender = (profileRes.data?.aurora_preferences as { gender?: string } | null)?.gender || 'neutral';
    
    // Life direction
    const lifeDirection = directionRes.data?.[0]?.content || null;
    const clarityScore = directionRes.data?.[0]?.clarity_score || null;
    
    // Identity elements parsed by type
    const identityElements = identityRes.data || [];
    const values = identityElements.filter(i => i.element_type === 'value').map(i => i.content);
    const principles = identityElements.filter(i => i.element_type === 'principle').map(i => i.content);
    const selfConcepts = identityElements.filter(i => i.element_type === 'self_concept').map(i => i.content);
    const identityTitle = identityElements.find(i => i.element_type === 'identity_title');
    const jobTitle = identityTitle?.content || null;
    const jobIcon = (identityTitle?.metadata as { icon?: string })?.icon || null;
    
    // Patterns
    const energyPatterns = energyRes.data || [];
    const behavioralPatterns = behavioralRes.data || [];
    
    // Focus
    const currentFocus = focusRes.data?.[0] || null;
    
    // Launchpad summary
    const launchpadSummary = launchpadRes.data?.[0]?.summary_data as {
      consciousness_analysis?: {
        current_state?: string;
        patterns?: string[];
        strengths?: string[];
        blind_spots?: string[];
        awareness_level?: string;
      };
      identity_profile?: {
        suggested_ego_state?: string;
        core_values?: string[];
        character_archetype?: string;
      };
      behavioral_insights?: {
        dominant_patterns?: string[];
        growth_areas?: string[];
        triggers?: string[];
        coping_mechanisms?: string[];
      };
      life_direction?: {
        central_aspiration?: string;
        life_mission?: string;
      };
      recommended_focus?: {
        immediate?: string;
        short_term?: string;
        long_term?: string;
      };
    } | null;
    
    // Raw launchpad data for specific details
    const launchpadProgress = launchpadProgressRes.data;
    const profileData = launchpadProgress?.step_2_profile_data as {
      sleepTime?: string;
      wakeTime?: string;
      workHours?: string;
      energyPeaks?: string[];
    } | null;
    const lifestyleData = launchpadProgress?.step_3_lifestyle_data as Record<string, unknown> | null;
    const blockersData = launchpadProgress?.step_5_blockers_data as {
      fears?: string[];
      limitingBeliefs?: string[];
      obstacles?: string[];
    } | null;
    const finalNotes = launchpadProgress?.step_10_final_notes as {
      healthConstraints?: string;
      specialInstructions?: string;
    } | null;
    
    // Current milestone
    let currentMilestone: { title: string; description?: string | null; week_number: number } | null = null;
    if (milestoneRes.data?.[0]?.id) {
      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('title, description, week_number')
        .eq('plan_id', milestoneRes.data[0].id)
        .eq('is_completed', false)
        .order('week_number', { ascending: true })
        .limit(1);
      
      if (milestones && milestones.length > 0) {
        currentMilestone = milestones[0];
      }
    }
    
    // Commitments
    const activeCommitments = commitmentsRes.data || [];
    
    // Visions
    const lifeVisions = visionsRes.data || [];
    
    // Daily habits
    const dailyHabits = dailyMinimumsRes.data || [];
    
    // Recent conversation insights
    const conversationMemory = conversationMemoryRes.data || [];
    const recentEmotionalStates = conversationMemory
      .map(c => c.emotional_state)
      .filter(Boolean);
    const recentTopics = conversationMemory
      .flatMap(c => c.key_topics || [])
      .slice(0, 5);
    
    // Previous sessions
    const previousHypnosisSessions = previousSessionsRes.data || [];

    // ============================================
    // BUILD COMPREHENSIVE PERSONALIZATION CONTEXT
    // ============================================
    
    let personalizationContext = '';
    
    // Personal greeting context
    if (userName) {
      personalizationContext += `\nUSER'S NAME: ${userName} - Use their name naturally once or twice during the session to deepen the personal connection.\n`;
    }
    
    // Identity and role
    if (jobTitle) {
      personalizationContext += `\nIDENTITY ROLE: "${jobTitle}" ${jobIcon ? `(${jobIcon})` : ''} - This is who they are becoming. Reference this identity in suggestions and future pacing.\n`;
    }
    
    // Life direction and clarity
    if (lifeDirection) {
      personalizationContext += `\nLIFE DIRECTION: "${lifeDirection}"`;
      if (clarityScore) {
        personalizationContext += ` (Clarity: ${clarityScore}/10)`;
      }
      personalizationContext += ` - Weave this overarching direction into metaphors and the session's narrative arc.\n`;
    }
    
    // Core values
    if (values.length > 0) {
      personalizationContext += `\nCORE VALUES: ${values.slice(0, 5).join(', ')} - These are their compass. Anchor all suggestions to these values.\n`;
    }
    
    // Principles
    if (principles.length > 0) {
      personalizationContext += `\nGUIDING PRINCIPLES: ${principles.slice(0, 3).join('; ')} - Reference these as the rules they live by.\n`;
    }
    
    // Self-concepts
    if (selfConcepts.length > 0) {
      personalizationContext += `\nSELF-CONCEPTS: "${selfConcepts[0]}" - This is how they see themselves. Reinforce positive aspects, gently expand limiting ones.\n`;
    }
    
    // Current focus
    if (currentFocus) {
      personalizationContext += `\nACTIVE FOCUS PLAN: "${currentFocus.title}"${currentFocus.description ? ` - ${currentFocus.description}` : ''}\n`;
    }
    
    // Life visions
    if (lifeVisions.length > 0) {
      const visionsList = lifeVisions.map(v => `${v.timeframe}: ${v.title}`).join('; ');
      personalizationContext += `\nLIFE VISIONS: ${visionsList} - Use these for future pacing and visualization exercises.\n`;
    }
    
    // Commitments
    if (activeCommitments.length > 0) {
      const commitmentsList = activeCommitments.slice(0, 3).map(c => c.title).join(', ');
      personalizationContext += `\nACTIVE COMMITMENTS: ${commitmentsList} - Strengthen their resolve toward these commitments.\n`;
    }
    
    // Daily habits
    if (dailyHabits.length > 0) {
      const habitsList = dailyHabits.slice(0, 5).map(h => h.title).join(', ');
      personalizationContext += `\nDAILY HABITS: ${habitsList} - These are the building blocks of their transformation. Reinforce them.\n`;
    }
    
    // Energy patterns
    if (energyPatterns.length > 0) {
      const patterns = energyPatterns.map(e => `${e.pattern_type}: ${e.description}`).join('; ');
      personalizationContext += `\nENERGY PATTERNS: ${patterns} - Be mindful of these in pacing and timing suggestions.\n`;
    }
    
    // Behavioral patterns
    if (behavioralPatterns.length > 0) {
      const patterns = behavioralPatterns.map(b => `${b.pattern_type}: ${b.description}`).join('; ');
      personalizationContext += `\nBEHAVIORAL PATTERNS: ${patterns} - Gently work with these patterns in the core work.\n`;
    }

    // Launchpad AI insights
    if (launchpadSummary) {
      const consciousness = launchpadSummary.consciousness_analysis;
      const identity = launchpadSummary.identity_profile;
      const behavioral = launchpadSummary.behavioral_insights;
      const lifeDir = launchpadSummary.life_direction;
      const focus = launchpadSummary.recommended_focus;

      personalizationContext += `\n\n=== DEEP PSYCHOLOGICAL PROFILE ===\n`;
      
      if (consciousness?.current_state) {
        personalizationContext += `CONSCIOUSNESS STATE: "${consciousness.current_state}"\n`;
      }
      if (consciousness?.awareness_level) {
        personalizationContext += `AWARENESS LEVEL: ${consciousness.awareness_level}\n`;
      }
      if (consciousness?.patterns && consciousness.patterns.length > 0) {
        personalizationContext += `MENTAL PATTERNS: ${consciousness.patterns.join(', ')}\n`;
      }
      if (consciousness?.strengths && consciousness.strengths.length > 0) {
        personalizationContext += `CORE STRENGTHS (leverage these): ${consciousness.strengths.join(', ')}\n`;
      }
      if (consciousness?.blind_spots && consciousness.blind_spots.length > 0) {
        personalizationContext += `BLIND SPOTS (illuminate gently): ${consciousness.blind_spots.join(', ')}\n`;
      }
      
      if (identity?.character_archetype) {
        personalizationContext += `ARCHETYPE: ${identity.character_archetype} - Use imagery and metaphors fitting this archetype.\n`;
      }
      
      if (behavioral?.triggers && behavioral.triggers.length > 0) {
        personalizationContext += `EMOTIONAL TRIGGERS (handle with care): ${behavioral.triggers.join(', ')}\n`;
      }
      if (behavioral?.coping_mechanisms && behavioral.coping_mechanisms.length > 0) {
        personalizationContext += `COPING MECHANISMS: ${behavioral.coping_mechanisms.join(', ')}\n`;
      }
      if (behavioral?.growth_areas && behavioral.growth_areas.length > 0) {
        personalizationContext += `GROWTH AREAS: ${behavioral.growth_areas.join(', ')}\n`;
      }
      
      if (lifeDir?.life_mission) {
        personalizationContext += `LIFE MISSION: "${lifeDir.life_mission}"\n`;
      }
      
      if (focus) {
        if (focus.immediate) personalizationContext += `IMMEDIATE FOCUS: ${focus.immediate}\n`;
        if (focus.short_term) personalizationContext += `SHORT-TERM FOCUS: ${focus.short_term}\n`;
        if (focus.long_term) personalizationContext += `LONG-TERM FOCUS: ${focus.long_term}\n`;
      }
    }
    
    // Blockers and limiting beliefs
    if (blockersData) {
      personalizationContext += `\n=== TRANSFORMATION BLOCKERS ===\n`;
      if (blockersData.fears && blockersData.fears.length > 0) {
        personalizationContext += `FEARS: ${blockersData.fears.join(', ')} - Address with compassion and reframing.\n`;
      }
      if (blockersData.limitingBeliefs && blockersData.limitingBeliefs.length > 0) {
        personalizationContext += `LIMITING BELIEFS: ${blockersData.limitingBeliefs.join(', ')} - Use embedded commands and metaphors to dissolve these.\n`;
      }
      if (blockersData.obstacles && blockersData.obstacles.length > 0) {
        personalizationContext += `OBSTACLES: ${blockersData.obstacles.join(', ')} - Help them see pathways around/through these.\n`;
      }
    }
    
    // Lifestyle context
    if (profileData) {
      personalizationContext += `\n=== LIFESTYLE CONTEXT ===\n`;
      if (profileData.sleepTime) personalizationContext += `SLEEP TIME: ${profileData.sleepTime}\n`;
      if (profileData.wakeTime) personalizationContext += `WAKE TIME: ${profileData.wakeTime}\n`;
      if (profileData.energyPeaks && profileData.energyPeaks.length > 0) {
        personalizationContext += `ENERGY PEAKS: ${profileData.energyPeaks.join(', ')}\n`;
      }
    }
    
    // Health constraints and special instructions
    if (finalNotes) {
      personalizationContext += `\n=== SPECIAL CONSIDERATIONS ===\n`;
      if (finalNotes.healthConstraints) {
        personalizationContext += `HEALTH CONSTRAINTS: ${finalNotes.healthConstraints} - BE SENSITIVE to these in all suggestions.\n`;
      }
      if (finalNotes.specialInstructions) {
        personalizationContext += `SPECIAL INSTRUCTIONS: ${finalNotes.specialInstructions}\n`;
      }
    }
    
    // 90-day plan context
    if (currentMilestone) {
      personalizationContext += `\n=== 90-DAY TRANSFORMATION PLAN ===\n`;
      personalizationContext += `CURRENT WEEK: ${currentMilestone.week_number}\n`;
      personalizationContext += `WEEKLY GOAL: "${currentMilestone.title}"\n`;
      if (currentMilestone.description) {
        personalizationContext += `DETAILS: ${currentMilestone.description}\n`;
      }
      personalizationContext += `Weave progress toward this specific weekly goal into the core work and integration segments.\n`;
    }
    
    // Recent emotional states from conversations
    if (recentEmotionalStates.length > 0) {
      personalizationContext += `\n=== RECENT EMOTIONAL CONTEXT ===\n`;
      personalizationContext += `RECENT EMOTIONAL STATES: ${recentEmotionalStates.join(', ')} - Meet them where they are emotionally.\n`;
    }
    if (recentTopics.length > 0) {
      personalizationContext += `RECENT TOPICS ON THEIR MIND: ${recentTopics.join(', ')}\n`;
    }
    
    // Session continuity
    if (previousHypnosisSessions.length > 0) {
      personalizationContext += `\n=== SESSION CONTINUITY ===\n`;
      personalizationContext += `This is session #${previousHypnosisSessions.length + 1}. Build on previous work. Reference their journey and progress.\n`;
    }
    
    // Daily session context
    if (isDailySession) {
      personalizationContext += `\nThis is their DAILY SESSION - make it feel personally crafted for today. Create a sense of ritual and consistency.\n`;
    }

    // ============================================
    // BUILD THE PROMPT
    // ============================================
    
    const wordsPerMinute = 130;
    const totalWords = durationMinutes * wordsPerMinute;
    
    // Gender-specific Hebrew grammar
    let hebrewGrammarInstruction = '';
    if (userGender === 'male') {
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR: Address the listener using MASCULINE singular forms (לשון זכר יחיד). 
Use forms like: "אתה מרגיש", "אתה נושם", "תן לעצמך", "הרגש את", "אתה יכול".
Do NOT use feminine forms.`;
    } else if (userGender === 'female') {
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR: Address the listener using FEMININE singular forms (לשון נקבה יחיד). 
Use forms like: "את מרגישה", "את נושמת", "תני לעצמך", "הרגישי את", "את יכולה".
Do NOT use masculine forms.`;
    } else {
      // Default to masculine in Hebrew (grammatical convention) when no preference set
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR: The user hasn't set a gender preference. 
Use MASCULINE singular forms as the default Hebrew convention (לשון זכר יחיד).
Use forms like: "אתה מרגיש", "אתה נושם", "תן לעצמך", "הרגש את", "אתה יכול".
Do NOT mix forms like "אתה/את" - pick one consistent form.`;
    }

    const languageInstruction = language === 'he' 
      ? `Write the entire script in Hebrew. Use warm, flowing Hebrew that feels natural and poetic.
${hebrewGrammarInstruction}`
      : 'Write the entire script in English. Use warm, flowing language that feels natural and poetic.';

    const experienceContext = previousSessions === 0
      ? 'This is the user\'s first session. Be extra welcoming and gentle with explanations.'
      : userLevel >= 5
        ? 'This is an experienced user. You can use deeper hypnotic techniques and less explanation.'
        : 'This user has some experience. Balance guidance with deeper work.';

    const streakContext = sessionStreak >= 7
      ? `Acknowledge their ${sessionStreak}-day streak and commitment to daily practice.`
      : sessionStreak >= 3
        ? `Note their ${sessionStreak}-day streak - they're building momentum.`
        : '';

    const systemPrompt = `You are a master hypnotherapist creating HYPER-PERSONALIZED hypnosis scripts.
You have access to the user's complete psychological profile, life context, and transformation journey.
Your scripts are warm, flowing, deeply relaxing, and feel like they were crafted specifically for this one person.

You use Ericksonian techniques, embedded commands, metaphorical language, and utilize techniques like:
- Pacing and leading
- Yes sets
- Confusion techniques for deepening
- Future pacing tied to their specific goals
- Metaphors drawn from their life context and values
- Embedded commands using their name or identity

${languageInstruction}

USER EXPERIENCE LEVEL:
${experienceContext}
${streakContext}

============================================
COMPREHENSIVE USER PROFILE
============================================
${personalizationContext}
============================================

Create a hypnosis script with exactly these segments in order:

1. WELCOME (8% - ~${Math.round(totalWords * 0.08)} words)
   - Greet warmly, possibly using their name
   - Establish safety and trust
   - Reference their identity/role if available
   - Introduce the session goal: "${goal}"

2. INDUCTION (25% - ~${Math.round(totalWords * 0.25)} words)
   - Guide into hypnotic state with progressive relaxation
   - Use their preferred relaxation style based on their energy patterns
   - Create imagery that resonates with their values and life context

3. DEEPENING (20% - ~${Math.round(totalWords * 0.20)} words)
   - Deepen the trance with counting, stairs, or other techniques
   - Use metaphors drawn from their life experience
   - If they have a specific archetype, use fitting imagery

4. CORE_WORK (30% - ~${Math.round(totalWords * 0.30)} words)
   - The main therapeutic work addressing: "${goal}"
   - Leverage their strengths
   - Gently work with their blind spots and limiting beliefs
   - Connect to their weekly milestone if available
   - Use embedded commands to reinforce their commitments
   - Address any fears or blockers with reframing

5. INTEGRATION (12% - ~${Math.round(totalWords * 0.12)} words)
   - Lock in the changes
   - Future pacing tied to their 90-day plan and life visions
   - Connect to their daily habits and commitments
   - Positive suggestions for the coming days

6. EMERGENCE (5% - ~${Math.round(totalWords * 0.05)} words)
   - Gently bring back to full awareness
   - Leave them feeling empowered and clear
   - Brief acknowledgment of the work done

CRITICAL INSTRUCTIONS:
- This script should feel like it was written specifically for this ONE person
- Reference their name, values, identity, and specific life context naturally
- Every metaphor should resonate with their psychological profile
- The core work should address both the stated goal AND underlying patterns/beliefs
- Make them feel truly SEEN and understood
- Respect any health constraints or special instructions

Total target: approximately ${totalWords} words.
Mark each segment clearly with [SEGMENT_NAME] at the start.`;

    const userPrompt = `Create a ${durationMinutes}-minute hypnosis script for:
Goal: ${goal}
${currentMilestone ? `Weekly Milestone: ${currentMilestone.title}` : ''}
${userName ? `User: ${userName}` : ''}
${jobTitle ? `Identity: ${jobTitle}` : ''}

This should be a deeply personal, transformative experience based on their complete profile.

Mark segments with [WELCOME], [INDUCTION], [DEEPENING], [CORE_WORK], [INTEGRATION], [EMERGENCE].`;

    console.log('Generating hyper-personalized hypnosis script:', { 
      goal, 
      durationMinutes, 
      language,
      isDailySession,
      hasLaunchpadData: !!launchpadSummary,
      hasMilestone: !!currentMilestone,
      hasName: !!userName,
      hasJobTitle: !!jobTitle,
      valuesCount: values.length,
      commitmentsCount: activeCommitments.length,
      previousSessions: previousHypnosisSessions.length,
    });

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
        temperature: 0.85,
        max_tokens: 5000,
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
      egoState: 'personalized',
      language,
      segments,
      metadata: {
        durationMinutes,
        totalWords: fullScript.split(/\s+/).length,
        wordsPerMinute,
        generatedAt: new Date().toISOString(),
        userLevel,
        isDailySession,
        personalizationSources: {
          hasName: !!userName,
          hasJobTitle: !!jobTitle,
          hasLifeDirection: !!lifeDirection,
          valuesCount: values.length,
          hasMilestone: !!currentMilestone,
          hasLaunchpadData: !!launchpadSummary,
          hasBlockers: !!blockersData,
          commitmentsCount: activeCommitments.length,
          previousSessionsCount: previousHypnosisSessions.length,
        },
      },
    };

    console.log('Hyper-personalized script generated successfully:', {
      segmentCount: segments.length,
      totalWords: script.metadata.totalWords,
      personalizationDepth: Object.values(script.metadata.personalizationSources).filter(Boolean).length,
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
