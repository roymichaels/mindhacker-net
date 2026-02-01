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
    // Calculate date ranges for activity tracking
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

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
      // NEW: Activity tracking queries
      todayHabitsRes,
      weeklyStatsRes,
      recentRemindersRes,
      lastSessionRes,
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
      supabase.from('hypnosis_sessions').select('goal_id, ego_state, duration_seconds, created_at, script_data').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      // NEW: Today's completed habits
      supabase.from('daily_habit_logs').select('habit_item_id, is_completed, aurora_checklist_items(content)').eq('user_id', user.id).gte('track_date', todayStart.toISOString().split('T')[0]),
      // NEW: Weekly progress stats
      supabase.from('weekly_progress_stats').select('*').eq('user_id', user.id).order('week_start_date', { ascending: false }).limit(1),
      // NEW: Recent reminders from Aurora
      supabase.from('aurora_reminders').select('message, reminder_date, context').eq('user_id', user.id).eq('is_delivered', false).order('reminder_date', { ascending: true }).limit(3),
      // NEW: Most recent hypnosis session with its script for continuity
      supabase.from('hypnosis_sessions').select('ego_state, duration_seconds, created_at, script_data').eq('user_id', user.id).eq('completed_at', null).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(1),
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
    // ACTIVITY TRACKING - What the user has done
    // ============================================
    
    // Today's habits
    const todayHabits = todayHabitsRes.data || [];
    const completedHabitsToday = todayHabits.filter((h: { is_completed: boolean }) => h.is_completed).length;
    const totalHabitsToday = todayHabits.length;
    
    // Weekly stats
    const weeklyStats = weeklyStatsRes.data?.[0] as {
      hypnosis_sessions?: number;
      aurora_chats?: number;
      insights_gained?: number;
      habits_completed?: number;
      streak_days?: number;
    } | null;
    
    // Upcoming reminders (things Aurora reminded them about)
    const upcomingReminders = recentRemindersRes.data || [];
    
    // Time since last hypnosis session
    let timeSinceLastSession: string | null = null;
    const lastCompletedSession = previousHypnosisSessions.find((s: { created_at: string }) => s.created_at);
    if (lastCompletedSession) {
      const lastSessionDate = new Date(lastCompletedSession.created_at);
      const diffMs = now.getTime() - lastSessionDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        if (diffHours < 1) {
          timeSinceLastSession = 'less than an hour ago';
        } else {
          timeSinceLastSession = `${diffHours} hours ago today`;
        }
      } else if (diffDays === 1) {
        timeSinceLastSession = 'yesterday';
      } else if (diffDays < 7) {
        timeSinceLastSession = `${diffDays} days ago`;
      } else {
        timeSinceLastSession = `${Math.floor(diffDays / 7)} weeks ago`;
      }
    }

    // ============================================
    // TIME AWARENESS - Current moment context
    // ============================================
    const currentMoment = new Date();
    // Get Israel timezone offset (usually +2 or +3 for DST)
    const israelTime = new Date(currentMoment.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const currentHour = israelTime.getHours();
    const currentDay = israelTime.getDay(); // 0 = Sunday
    const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay];
    const hebrewDayName = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][currentDay];
    
    // Determine time of day context
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
    let timeContext: { en: string; he: string };
    
    if (currentHour >= 5 && currentHour < 12) {
      timeOfDay = 'morning';
      timeContext = {
        en: 'This is a morning session. Focus on energizing, setting intentions for the day, and activating their best self.',
        he: 'זו היא סשן בוקר. התמקד באנרגיה, בהצבת כוונות ליום ובהפעלת העצמי הטוב ביותר שלהם.'
      };
    } else if (currentHour >= 12 && currentHour < 17) {
      timeOfDay = 'afternoon';
      timeContext = {
        en: 'This is an afternoon session. Good for a reset, regaining focus, and overcoming the midday slump.',
        he: 'זו היא סשן אחר הצהריים. מתאים לאיפוס, להחזרת מיקוד ולהתגברות על עייפות אמצע היום.'
      };
    } else if (currentHour >= 17 && currentHour < 21) {
      timeOfDay = 'evening';
      timeContext = {
        en: 'This is an evening session. Focus on unwinding, reflecting on the day, and transitioning to personal time.',
        he: 'זו היא סשן ערב. התמקד בהרפיה, ברפלקציה על היום ובמעבר לזמן אישי.'
      };
    } else if (currentHour >= 21 && currentHour < 24) {
      timeOfDay = 'night';
      timeContext = {
        en: 'This is a night session. Focus on deep relaxation, releasing the day, and preparing for restful sleep.',
        he: 'זו היא סשן לילה. התמקד ברגיעה עמוקה, בשחרור היום ובהכנה לשינה משקמת.'
      };
    } else {
      timeOfDay = 'late_night';
      timeContext = {
        en: 'This is a late night/early morning session. Be extra gentle, focus on calm, and honor their need for rest or quiet reflection.',
        he: 'זו היא סשן לילה מאוחר/בוקר מוקדם. היה עדין במיוחד, התמקד ברוגע וכבד את הצורך שלהם במנוחה או רפלקציה שקטה.'
      };
    }
    
    // Day of week context
    let dayContext: { en: string; he: string };
    if (currentDay === 5) { // Friday
      dayContext = {
        en: 'It\'s Friday - the week is ending. Good time for reflection on accomplishments and setting intentions for rest.',
        he: 'היום שישי - השבוע מסתיים. זמן טוב לרפלקציה על הישגים ולהצבת כוונות למנוחה.'
      };
    } else if (currentDay === 6) { // Saturday/Shabbat
      dayContext = {
        en: 'It\'s Shabbat - a day of rest. Honor this with a more contemplative, restful session focused on being rather than doing.',
        he: 'היום שבת - יום של מנוחה. כבד זאת עם סשן מתבונן ורגוע יותר, ממוקד בהוויה ולא בעשייה.'
      };
    } else if (currentDay === 0) { // Sunday
      dayContext = {
        en: 'It\'s Sunday - a new week begins. Perfect for fresh starts, setting weekly intentions, and building momentum.',
        he: 'היום ראשון - שבוע חדש מתחיל. מושלם להתחלות חדשות, להצבת כוונות שבועיות ולבניית מומנטום.'
      };
    } else {
      dayContext = {
        en: `It's ${currentDayName} - mid-week. Focus on maintaining momentum and staying connected to their goals.`,
        he: `היום יום ${hebrewDayName} - אמצע השבוע. התמקד בשמירה על מומנטום ובשמירה על קשר עם המטרות שלהם.`
      };
    }

    // ============================================
    // BUILD COMPREHENSIVE PERSONALIZATION CONTEXT
    // ============================================
    
    let personalizationContext = '';
    
    // Time awareness section
    personalizationContext += `\n=== TIME & MOMENT AWARENESS ===\n`;
    personalizationContext += `CURRENT TIME: ${israelTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} (Israel time)\n`;
    personalizationContext += `TIME OF DAY: ${timeOfDay.toUpperCase()}\n`;
    personalizationContext += `${language === 'he' ? timeContext.he : timeContext.en}\n`;
    personalizationContext += `DAY: ${language === 'he' ? `יום ${hebrewDayName}` : currentDayName}\n`;
    personalizationContext += `${language === 'he' ? dayContext.he : dayContext.en}\n`;
    
    // Activity tracking section - what user has done
    personalizationContext += `\n=== TODAY'S ACTIVITY & PROGRESS ===\n`;
    
    if (timeSinceLastSession) {
      personalizationContext += `LAST HYPNOSIS SESSION: ${timeSinceLastSession}\n`;
      if (timeSinceLastSession === 'less than an hour ago' || timeSinceLastSession.includes('hours ago today')) {
        personalizationContext += `They're coming back for another session today - acknowledge their dedication and build on the previous session's work.\n`;
      }
    } else {
      personalizationContext += `FIRST SESSION: This is their first hypnosis session. Be extra welcoming and establish trust.\n`;
    }
    
    if (totalHabitsToday > 0) {
      personalizationContext += `TODAY'S HABITS: ${completedHabitsToday}/${totalHabitsToday} completed - `;
      if (completedHabitsToday === totalHabitsToday) {
        personalizationContext += `They completed ALL their daily habits! Celebrate this accomplishment.\n`;
      } else if (completedHabitsToday > totalHabitsToday / 2) {
        personalizationContext += `Good progress today. Reinforce their momentum.\n`;
      } else if (completedHabitsToday > 0) {
        personalizationContext += `They've started working on their habits. Encourage completion.\n`;
      } else {
        personalizationContext += `Habits not yet started today. Gently motivate without judgment.\n`;
      }
    }
    
    if (weeklyStats) {
      personalizationContext += `WEEKLY PROGRESS: `;
      const stats: string[] = [];
      if (weeklyStats.hypnosis_sessions) stats.push(`${weeklyStats.hypnosis_sessions} hypnosis sessions`);
      if (weeklyStats.aurora_chats) stats.push(`${weeklyStats.aurora_chats} Aurora conversations`);
      if (weeklyStats.habits_completed) stats.push(`${weeklyStats.habits_completed} habits completed`);
      if (weeklyStats.streak_days) stats.push(`${weeklyStats.streak_days}-day streak`);
      personalizationContext += stats.length > 0 ? stats.join(', ') + '\n' : 'Just getting started this week\n';
    }
    
    if (upcomingReminders.length > 0) {
      personalizationContext += `UPCOMING REMINDERS: ${upcomingReminders.map((r: { message: string }) => r.message).slice(0, 2).join('; ')}\n`;
      personalizationContext += `Consider weaving awareness of these upcoming items into the integration phase.\n`;
    }
    
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
    
    // Gender-specific Hebrew grammar - STRICT ENFORCEMENT
    let hebrewGrammarInstruction = '';
    if (userGender === 'male') {
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR REQUIREMENT (MANDATORY):
You MUST address the listener using ONLY MASCULINE singular forms (לשון זכר יחיד).

CORRECT FORMS TO USE:
- "אתה מרגיש" (NOT "את מרגישה" or "אתה/את")
- "אתה נושם" (NOT "את נושמת")
- "תן לעצמך" (NOT "תני לעצמך")
- "הרגש את" (NOT "הרגישי")
- "אתה יכול" (NOT "את יכולה")
- "שלך" (masculine possession)

STRICTLY FORBIDDEN:
- DO NOT use feminine forms
- DO NOT use combined forms like "אתה/את" or "מרגיש/ה"
- DO NOT use the word "את" as "you" - only "אתה"
- Every single verb and pronoun must be masculine`;
    } else if (userGender === 'female') {
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR REQUIREMENT (MANDATORY):
You MUST address the listener using ONLY FEMININE singular forms (לשון נקבה יחיד).

CORRECT FORMS TO USE:
- "את מרגישה" (NOT "אתה מרגיש" or "אתה/את")
- "את נושמת" (NOT "אתה נושם")
- "תני לעצמך" (NOT "תן לעצמך")
- "הרגישי את" (NOT "הרגש")
- "את יכולה" (NOT "אתה יכול")
- "שלך" (feminine possession)

STRICTLY FORBIDDEN:
- DO NOT use masculine forms
- DO NOT use combined forms like "אתה/את" or "מרגיש/ה"
- DO NOT use the word "אתה" as "you" - only "את"
- Every single verb and pronoun must be feminine`;
    } else {
      // Default to masculine in Hebrew (grammatical convention) when no preference set
      hebrewGrammarInstruction = `CRITICAL HEBREW GRAMMAR REQUIREMENT (MANDATORY):
The user hasn't set a gender preference. Use MASCULINE singular forms as Hebrew default.

CORRECT FORMS TO USE:
- "אתה מרגיש" (NOT "את מרגישה")
- "אתה נושם"
- "תן לעצמך"
- "הרגש את"
- "אתה יכול"

STRICTLY FORBIDDEN:
- DO NOT mix forms like "אתה/את" or "מרגיש/ה" - this sounds terrible in hypnosis
- DO NOT use the slash "/" character anywhere in the script
- Pick ONE consistent form (masculine) and use it throughout`;
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
You have access to the user's complete psychological profile, life context, transformation journey, AND current moment context.
Your scripts are warm, flowing, deeply relaxing, and feel like they were crafted specifically for this one person AT THIS EXACT MOMENT.

IMPORTANT: You are TIME-AWARE. Consider:
- The current time of day (morning energizing vs evening relaxation)
- The day of the week (Sunday fresh start vs Friday reflection)
- What the user has accomplished today and this week
- Their recent activity and engagement with the platform

You use Ericksonian techniques, embedded commands, metaphorical language, and utilize techniques like:
- Pacing and leading
- Yes sets
- Confusion techniques for deepening
- Future pacing tied to their specific goals
- Metaphors drawn from their life context and values
- Embedded commands using their name or identity
- Time-appropriate suggestions (morning activation vs night relaxation)

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
