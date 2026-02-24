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
      todayHabitsRes,
      weeklyStatsRes,
      recentRemindersRes,
      lastSessionRes,
      // Pulse data for adaptive hypnosis
      pulseYesterdayRes,
      pulseWeekRes,
      recalibRes,
    ] = await Promise.all([
      supabase.from('profiles').select('full_name, aurora_preferences').eq('id', user.id).single(),
      supabase.from('aurora_life_direction').select('content, clarity_score').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('aurora_identity_elements').select('element_type, content, metadata').eq('user_id', user.id),
      supabase.from('aurora_energy_patterns').select('pattern_type, description').eq('user_id', user.id),
      supabase.from('aurora_behavioral_patterns').select('pattern_type, description').eq('user_id', user.id),
      supabase.from('aurora_focus_plans').select('title, description').eq('user_id', user.id).eq('status', 'active').limit(1),
      supabase.from('launchpad_summaries').select('summary_data').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1),
      supabase.from('launchpad_progress').select('step_2_profile_data, step_3_lifestyle_data, step_5_blockers_data, step_10_final_notes').eq('user_id', user.id).single(),
      supabase.from('life_plans').select('id, title').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1),
      supabase.from('aurora_commitments').select('title, description').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('aurora_life_visions').select('title, description, timeframe, focus_areas').eq('user_id', user.id).limit(3),
      supabase.from('aurora_daily_minimums').select('title, category').eq('user_id', user.id).eq('is_active', true),
      supabase.from('aurora_checklists').select('title, aurora_checklist_items(content, is_completed)').eq('user_id', user.id).eq('status', 'active').limit(3),
      supabase.from('aurora_conversation_memory').select('summary, key_topics, emotional_state, action_items').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('hypnosis_sessions').select('goal_id, ego_state, duration_seconds, created_at, script_data').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('daily_habit_logs').select('habit_item_id, is_completed, aurora_checklist_items(content)').eq('user_id', user.id).gte('track_date', todayStart.toISOString().split('T')[0]),
      supabase.from('weekly_progress_stats').select('*').eq('user_id', user.id).order('week_start_date', { ascending: false }).limit(1),
      supabase.from('aurora_reminders').select('message, reminder_date, context').eq('user_id', user.id).eq('is_delivered', false).order('reminder_date', { ascending: true }).limit(3),
      supabase.from('hypnosis_sessions').select('ego_state, duration_seconds, created_at, script_data').eq('user_id', user.id).eq('completed_at', null).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(1),
      // Yesterday's pulse
      supabase.from('daily_pulse_logs').select('*').eq('user_id', user.id).eq('log_date', new Date(Date.now() - 86400000).toISOString().split('T')[0]).maybeSingle(),
      // Last 7 days pulse
      supabase.from('daily_pulse_logs').select('*').eq('user_id', user.id).gte('log_date', weekAgo.toISOString().split('T')[0]).order('log_date', { ascending: false }),
      // Latest recalibration
      supabase.from('recalibration_logs').select('compliance_score, behavioral_risks').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    ]);

    // ============================================
    // EXTRACT AND STRUCTURE USER DATA
    // ============================================
    
    const fullName = profileRes.data?.full_name as string | null;
    const userName = fullName ? fullName.split(' ')[0] : null;
    const userGender = (profileRes.data?.aurora_preferences as { gender?: string } | null)?.gender || 'neutral';
    
    const lifeDirection = directionRes.data?.[0]?.content || null;
    const clarityScore = directionRes.data?.[0]?.clarity_score || null;
    
    const identityElements = identityRes.data || [];
    const values = identityElements.filter(i => i.element_type === 'value').map(i => i.content);
    const principles = identityElements.filter(i => i.element_type === 'principle').map(i => i.content);
    const selfConcepts = identityElements.filter(i => i.element_type === 'self_concept').map(i => i.content);
    const identityTitle = identityElements.find(i => i.element_type === 'identity_title');
    const jobTitle = identityTitle?.content || null;
    const jobIcon = (identityTitle?.metadata as { icon?: string })?.icon || null;
    
    const energyPatterns = energyRes.data || [];
    const behavioralPatterns = behavioralRes.data || [];
    const currentFocus = focusRes.data?.[0] || null;
    
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
    
    const activeCommitments = commitmentsRes.data || [];
    const lifeVisions = visionsRes.data || [];
    const dailyHabits = dailyMinimumsRes.data || [];
    
    const conversationMemory = conversationMemoryRes.data || [];
    const recentEmotionalStates = conversationMemory
      .map(c => c.emotional_state)
      .filter(Boolean);
    const recentTopics = conversationMemory
      .flatMap(c => c.key_topics || [])
      .slice(0, 5);
    
    const previousHypnosisSessions = previousSessionsRes.data || [];

    // ============================================
    // ACTIVITY TRACKING
    // ============================================
    
    const todayHabits = todayHabitsRes.data || [];
    const completedHabitsToday = todayHabits.filter((h: { is_completed: boolean }) => h.is_completed).length;
    const totalHabitsToday = todayHabits.length;
    
    const weeklyStats = weeklyStatsRes.data?.[0] as {
      hypnosis_sessions?: number;
      aurora_chats?: number;
      insights_gained?: number;
      habits_completed?: number;
      streak_days?: number;
    } | null;
    
    const upcomingReminders = recentRemindersRes.data || [];
    
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
    // TIME AWARENESS
    // ============================================
    const currentMoment = new Date();
    const israelTime = new Date(currentMoment.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
    const currentHour = israelTime.getHours();
    const currentDay = israelTime.getDay();
    const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay];
    const hebrewDayName = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][currentDay];
    
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
    
    let dayContext: { en: string; he: string };
    if (currentDay === 5) {
      dayContext = {
        en: 'It\'s Friday - the week is ending. Good time for reflection on accomplishments and setting intentions for rest.',
        he: 'היום שישי - השבוע מסתיים. זמן טוב לרפלקציה על הישגים ולהצבת כוונות למנוחה.'
      };
    } else if (currentDay === 6) {
      dayContext = {
        en: 'It\'s Shabbat - a day of rest. Honor this with a more contemplative, restful session focused on being rather than doing.',
        he: 'היום שבת - יום של מנוחה. כבד זאת עם סשן מתבונן ורגוע יותר, ממוקד בהוויה ולא בעשייה.'
      };
    } else if (currentDay === 0) {
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
    
    personalizationContext += `\n=== TIME & MOMENT AWARENESS ===\n`;
    personalizationContext += `CURRENT TIME: ${israelTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} (Israel time)\n`;
    personalizationContext += `DAY: ${language === 'he' ? hebrewDayName : currentDayName}\n`;
    personalizationContext += `TIME OF DAY: ${timeOfDay}\n`;
    personalizationContext += `${language === 'he' ? timeContext.he : timeContext.en}\n`;
    personalizationContext += `${language === 'he' ? dayContext.he : dayContext.en}\n`;
    
    if (completedHabitsToday > 0 || totalHabitsToday > 0) {
      personalizationContext += `\n=== TODAY'S PROGRESS ===\n`;
      if (completedHabitsToday > 0) {
        personalizationContext += `TODAY'S WINS: Completed ${completedHabitsToday}/${totalHabitsToday} habits. Acknowledge their dedication!\n`;
      } else if (totalHabitsToday > 0) {
        personalizationContext += `HABITS PENDING: ${totalHabitsToday} habits waiting. Encourage without pressure.\n`;
      }
    }
    
    if (weeklyStats) {
      personalizationContext += `\n=== THIS WEEK'S ACTIVITY ===\n`;
      if (weeklyStats.hypnosis_sessions) {
        personalizationContext += `HYPNOSIS SESSIONS THIS WEEK: ${weeklyStats.hypnosis_sessions}\n`;
      }
      if (weeklyStats.habits_completed) {
        personalizationContext += `HABITS COMPLETED THIS WEEK: ${weeklyStats.habits_completed}\n`;
      }
      if (weeklyStats.streak_days) {
        personalizationContext += `CURRENT STREAK: ${weeklyStats.streak_days} days - acknowledge their consistency!\n`;
      }
    }
    
    if (timeSinceLastSession) {
      personalizationContext += `\nLAST HYPNOSIS SESSION: ${timeSinceLastSession}\n`;
      if (timeSinceLastSession.includes('week')) {
        personalizationContext += `Welcome them back warmly - it's been a while.\n`;
      }
    }
    
    if (upcomingReminders.length > 0) {
      personalizationContext += `\n=== AURORA'S REMINDERS (things on their mind) ===\n`;
      upcomingReminders.forEach((r: { message: string }) => {
        personalizationContext += `- ${r.message}\n`;
      });
    }
    
    if (userName) {
      personalizationContext += `\n=== USER IDENTITY ===\n`;
      personalizationContext += `NAME: ${userName} - Use their name naturally throughout the script (2-3 times, at key moments).\n`;
    }
    
    if (jobTitle) {
      personalizationContext += `IDENTITY/ROLE: ${jobTitle}${jobIcon ? ` ${jobIcon}` : ''} - Reference their professional identity when appropriate.\n`;
    }
    
    if (values.length > 0) {
      personalizationContext += `CORE VALUES: ${values.join(', ')} - These drive their decisions and can be woven into metaphors.\n`;
    }
    
    if (principles.length > 0) {
      personalizationContext += `GUIDING PRINCIPLES: ${principles.join(', ')}\n`;
    }
    
    if (selfConcepts.length > 0) {
      personalizationContext += `SELF-CONCEPTS: ${selfConcepts.join(', ')} - How they see themselves.\n`;
    }
    
    if (lifeDirection) {
      personalizationContext += `\n=== LIFE DIRECTION ===\n`;
      personalizationContext += `"${lifeDirection}"\n`;
      if (clarityScore) {
        personalizationContext += `CLARITY LEVEL: ${clarityScore}/100\n`;
      }
    }
    
    if (launchpadSummary) {
      personalizationContext += `\n=== CONSCIOUSNESS ANALYSIS ===\n`;
      if (launchpadSummary.consciousness_analysis) {
        const ca = launchpadSummary.consciousness_analysis;
        if (ca.current_state) personalizationContext += `CURRENT STATE: ${ca.current_state}\n`;
        if (ca.awareness_level) personalizationContext += `AWARENESS LEVEL: ${ca.awareness_level}\n`;
        if (ca.strengths?.length) personalizationContext += `STRENGTHS: ${ca.strengths.join(', ')} - Build on these.\n`;
        if (ca.blind_spots?.length) personalizationContext += `BLIND SPOTS: ${ca.blind_spots.join(', ')} - Address gently.\n`;
      }
      if (launchpadSummary.identity_profile) {
        const ip = launchpadSummary.identity_profile;
        if (ip.character_archetype) personalizationContext += `ARCHETYPE: ${ip.character_archetype}\n`;
        if (ip.core_values?.length) personalizationContext += `DISCOVERED VALUES: ${ip.core_values.join(', ')}\n`;
      }
      if (launchpadSummary.behavioral_insights) {
        const bi = launchpadSummary.behavioral_insights;
        if (bi.growth_areas?.length) personalizationContext += `GROWTH AREAS: ${bi.growth_areas.join(', ')}\n`;
        if (bi.triggers?.length) personalizationContext += `TRIGGERS: ${bi.triggers.join(', ')} - Be mindful of these.\n`;
      }
      if (launchpadSummary.life_direction) {
        const ld = launchpadSummary.life_direction;
        if (ld.central_aspiration) personalizationContext += `CENTRAL ASPIRATION: ${ld.central_aspiration}\n`;
        if (ld.life_mission) personalizationContext += `LIFE MISSION: ${ld.life_mission}\n`;
      }
    }
    
    if (blockersData) {
      personalizationContext += `\n=== INNER BARRIERS ===\n`;
      if (blockersData.limitingBeliefs?.length) {
        personalizationContext += `LIMITING BELIEFS: ${blockersData.limitingBeliefs.join(', ')} - These need gentle reframing.\n`;
      }
      if (blockersData.fears?.length) {
        personalizationContext += `FEARS: ${blockersData.fears.join(', ')} - Address with compassion.\n`;
      }
      if (blockersData.obstacles?.length) {
        personalizationContext += `OBSTACLES: ${blockersData.obstacles.join(', ')}\n`;
      }
    }
    
    if (energyPatterns.length > 0) {
      personalizationContext += `\n=== ENERGY PATTERNS ===\n`;
      energyPatterns.forEach((p: { pattern_type: string; description: string }) => {
        personalizationContext += `${p.pattern_type}: ${p.description}\n`;
      });
    }
    
    if (currentFocus) {
      personalizationContext += `\n=== CURRENT FOCUS ===\n`;
      personalizationContext += `FOCUS: "${currentFocus.title}"\n`;
      if (currentFocus.description) {
        personalizationContext += `DETAILS: ${currentFocus.description}\n`;
      }
    }
    
    if (activeCommitments.length > 0) {
      personalizationContext += `\n=== ACTIVE COMMITMENTS ===\n`;
      activeCommitments.forEach((c: { title: string }) => {
        personalizationContext += `- ${c.title}\n`;
      });
      personalizationContext += `Reinforce these commitments in the core work.\n`;
    }
    
    if (lifeVisions.length > 0) {
      personalizationContext += `\n=== LIFE VISIONS ===\n`;
      lifeVisions.forEach((v: { title: string; timeframe: string; focus_areas?: string[] }) => {
        personalizationContext += `${v.timeframe.toUpperCase()}: "${v.title}"`;
        if (v.focus_areas?.length) {
          personalizationContext += ` (Focus areas: ${v.focus_areas.join(', ')})`;
        }
        personalizationContext += `\n`;
      });
    }
    
    if (dailyHabits.length > 0) {
      personalizationContext += `\n=== DAILY HABITS (their commitments) ===\n`;
      dailyHabits.forEach((h: { title: string; category?: string }) => {
        personalizationContext += `- ${h.title}${h.category ? ` (${h.category})` : ''}\n`;
      });
    }
    
    if (finalNotes) {
      if (finalNotes.healthConstraints) {
        personalizationContext += `\n=== HEALTH CONSIDERATIONS ===\n`;
        personalizationContext += `${finalNotes.healthConstraints}\n`;
        personalizationContext += `IMPORTANT: Respect these constraints in any physical imagery or suggestions.\n`;
      }
      if (finalNotes.specialInstructions) {
        personalizationContext += `\n=== SPECIAL INSTRUCTIONS FROM USER ===\n`;
        personalizationContext += `${finalNotes.specialInstructions}\n`;
      }
    }
    
    if (currentMilestone) {
      personalizationContext += `\n=== 90-DAY TRANSFORMATION PLAN ===\n`;
      personalizationContext += `CURRENT WEEK: ${currentMilestone.week_number}\n`;
      personalizationContext += `WEEKLY GOAL: "${currentMilestone.title}"\n`;
      if (currentMilestone.description) {
        personalizationContext += `DETAILS: ${currentMilestone.description}\n`;
      }
      personalizationContext += `Weave progress toward this specific weekly goal into the core work.\n`;
    }
    
    if (recentEmotionalStates.length > 0) {
      personalizationContext += `\n=== RECENT EMOTIONAL CONTEXT ===\n`;
      personalizationContext += `RECENT EMOTIONAL STATES: ${recentEmotionalStates.join(', ')} - Meet them where they are emotionally.\n`;
    }
    if (recentTopics.length > 0) {
      personalizationContext += `RECENT TOPICS ON THEIR MIND: ${recentTopics.join(', ')}\n`;
    }
    
    if (previousHypnosisSessions.length > 0) {
      personalizationContext += `\n=== SESSION CONTINUITY ===\n`;
      personalizationContext += `This is session #${previousHypnosisSessions.length + 1}. Build on previous work. Reference their journey and progress.\n`;
    }
    
    if (isDailySession) {
      personalizationContext += `\nThis is their DAILY SESSION - make it feel personally crafted for today. Create a sense of ritual and consistency.\n`;
    }

    // ── Adaptive Pulse Data for Hypnosis Reinforcement Loop ──
    const yesterdayPulse = pulseYesterdayRes.data;
    const pulseWeekData = pulseWeekRes.data || [];
    const latestRecalib = recalibRes.data?.[0];

    if (yesterdayPulse || pulseWeekData.length > 0) {
      personalizationContext += `\n=== ADAPTIVE BEHAVIORAL STATE (from Daily Pulse) ===\n`;

      if (yesterdayPulse) {
        personalizationContext += `YESTERDAY: Energy=${yesterdayPulse.energy_rating}/5, Mood=${yesterdayPulse.mood_signal}, Sleep=${yesterdayPulse.sleep_compliance}, Tasks=${yesterdayPulse.task_confidence}/5, Screen=${yesterdayPulse.screen_discipline ? 'disciplined' : 'exceeded'}\n`;

        // Adaptive theme selection
        if (yesterdayPulse.energy_rating <= 2 && yesterdayPulse.task_confidence <= 2) {
          personalizationContext += `ADAPTIVE THEME: RECOVERY — Yesterday was tough. Focus on self-compassion, rebuilding energy, and gentle encouragement. No pressure.\n`;
        } else if (yesterdayPulse.sleep_compliance === 'no') {
          personalizationContext += `ADAPTIVE THEME: SLEEP RESET — Sleep was missed. Include sleep architecture suggestions and evening routine reinforcement.\n`;
        } else if (!yesterdayPulse.screen_discipline) {
          personalizationContext += `ADAPTIVE THEME: DIGITAL DETOX — Screen discipline failed. Reinforce mindful technology use and presence.\n`;
        }
      }

      // Win streak detection
      const recentGoodDays = pulseWeekData.filter((p: any) => p.energy_rating >= 4 && p.task_confidence >= 4).length;
      if (recentGoodDays >= 3) {
        personalizationContext += `ADAPTIVE THEME: MOMENTUM — ${recentGoodDays} strong days this week! Amplify momentum and build on success.\n`;
      }

      if (latestRecalib) {
        personalizationContext += `WEEKLY COMPLIANCE: ${latestRecalib.compliance_score}%\n`;
        const risks = (latestRecalib.behavioral_risks as any[]) || [];
        if (risks.length > 0) {
          personalizationContext += `ACTIVE RISKS: ${risks.map((r: any) => r.risk).join(', ')} — Address these subtly in suggestions.\n`;
        }
      }
    }

    // ============================================
    // BUILD 4-PHASE PARALLEL GENERATION
    // ============================================
    
    const wordsPerMinute = 130;
    // Target ~14 minutes total → ~1820 words at 130 WPM
    // Each phase gets ~450-500 words
    const wordsPerPhase = 500;

    const baseSystemContext = `You are a master hypnotherapist writing ONE PHASE of a 4-phase hypnosis session.
This session is deeply personalized. You have the user's complete psychological profile below.

${languageInstruction}

USER EXPERIENCE LEVEL:
${experienceContext}
${streakContext}

IMPORTANT: You are TIME-AWARE. Consider the current time of day and day of week.

You use Ericksonian techniques, embedded commands, metaphorical language, and utilize:
- Pacing and leading
- Yes sets
- Confusion techniques for deepening
- Future pacing tied to their specific goals
- Metaphors drawn from their life context and values
- Embedded commands using their name or identity
- Time-appropriate suggestions

============================================
COMPREHENSIVE USER PROFILE
============================================
${personalizationContext}
============================================

CRITICAL INSTRUCTIONS:
- Write as ONE FLOWING TEXT - no headers, no segment markers, no labels, no breaks
- This script must feel like it was written specifically for this ONE person
- Reference their name, values, identity naturally where appropriate
- Every metaphor should resonate with their psychological profile
- Make them feel truly SEEN and understood
- Respect any health constraints or special instructions
- DO NOT include markers like [WELCOME] or [INDUCTION] - just flowing text
- Write approximately ${wordsPerPhase} words for this phase`;

    const phases = [
      {
        name: 'Welcome & Induction',
        prompt: `Write PHASE 1 of 4 of a hypnosis session.
Goal: "${goal}"
${currentMilestone ? `Weekly Milestone: ${currentMilestone.title}` : ''}
${userName ? `User: ${userName}` : ''}
${jobTitle ? `Identity: ${jobTitle}` : ''}

This is the WELCOME & INDUCTION phase (~3.5 minutes).
- Greet the user warmly by name if available
- Establish safety and trust
- Introduce the session goal naturally
- Begin progressive relaxation (body scan, breathing guidance)
- Start inducing a hypnotic state with counting, breathing patterns
- End this phase with the user entering a comfortable trance

Write ~${wordsPerPhase} words. This text will flow directly into Phase 2 (Deepening), so end with a natural transition into deeper relaxation.`,
      },
      {
        name: 'Deepening',
        prompt: `Write PHASE 2 of 4 of a hypnosis session.
Goal: "${goal}"
${userName ? `User: ${userName}` : ''}

This is the DEEPENING phase (~3.5 minutes).
The user is already in a light trance from Phase 1 (progressive relaxation was done).
- Deepen the trance using staircase/elevator metaphors, counting down
- Use confusion techniques and embedded commands
- Introduce imagery that resonates with the user's values and life context
- Use yes-sets and pacing/leading patterns
- Reference their recent emotional states or life situation subtly
- Bring them to a deep, receptive state

Write ~${wordsPerPhase} words. This flows directly from Phase 1 and into Phase 3 (Core Therapeutic Work). End with a natural transition.`,
      },
      {
        name: 'Core Therapeutic Work',
        prompt: `Write PHASE 3 of 4 of a hypnosis session.
Goal: "${goal}"
${currentMilestone ? `Weekly Milestone: ${currentMilestone.title}` : ''}
${userName ? `User: ${userName}` : ''}
${jobTitle ? `Identity: ${jobTitle}` : ''}

This is the CORE THERAPEUTIC WORK phase (~3.5 minutes).
The user is in deep trance from Phase 2.
- This is the main therapeutic content targeting: "${goal}"
- Use metaphors deeply tied to their life direction, values, and identity
- Apply future pacing — have them vividly experience achieving the goal
- Address their specific blockers and limiting beliefs through metaphor
- Embed commands for behavioral change
- Reference their current milestone and commitments
- Tie the work to their 100-day transformation journey
- This is the most intense and transformative part

Write ~${wordsPerPhase} words. This flows from Phase 2 and into Phase 4 (Integration & Emergence). End with a transition toward integration.`,
      },
      {
        name: 'Integration & Emergence',
        prompt: `Write PHASE 4 of 4 of a hypnosis session.
Goal: "${goal}"
${userName ? `User: ${userName}` : ''}

This is the INTEGRATION & EMERGENCE phase (~3.5 minutes).
The user has completed deep therapeutic work in Phase 3.
- Lock in the changes made during core work
- Future pace: have them see themselves tomorrow/next week living the changes
- Create anchors they can use in daily life
- Acknowledge their commitment and progress (streak, level, etc.)
- Begin gently counting them back to awareness (1-5 or 1-10)
- Suggest they'll feel energized/calm (time-of-day appropriate)
- End with a warm, empowering closing that makes them feel ready for what's next
- The very last sentences should bring them fully back to awareness

Write ~${wordsPerPhase} words. This is the final phase — end the session completely.`,
      },
    ];

    console.log('Generating 4-phase hypnosis script:', { 
      goal, 
      language,
      wordsPerPhase,
      isDailySession,
      hasLaunchpadData: !!launchpadSummary,
      hasMilestone: !!currentMilestone,
      hasName: !!userName,
    });

    // Generate all 4 phases in parallel
    const generatePhase = async (phasePrompt: string, phaseName: string): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      try {
        const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: baseSystemContext },
              { role: 'user', content: phasePrompt },
            ],
            temperature: 0.85,
            max_tokens: 4000,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
          const errorText = await resp.text();
          console.error(`Phase "${phaseName}" AI error:`, resp.status, errorText);
          if (resp.status === 429) throw new Error('RATE_LIMIT');
          if (resp.status === 402) throw new Error('PAYMENT_REQUIRED');
          throw new Error(`Phase "${phaseName}" failed`);
        }

        const data = await resp.json();
        return data.choices?.[0]?.message?.content || '';
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
          throw new Error(`Phase "${phaseName}" timed out`);
        }
        throw err;
      }
    };

    let phaseResults: string[];
    try {
      phaseResults = await Promise.all(
        phases.map(p => generatePhase(p.prompt, p.name))
      );
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT') {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (err.message === 'PAYMENT_REQUIRED') {
          return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      throw err;
    }

    // Concatenate all phases into one flowing script
    const fullScript = phaseResults
      .map(text => text
        .replace(/\[WELCOME\]/gi, '')
        .replace(/\[INDUCTION\]/gi, '')
        .replace(/\[DEEPENING\]/gi, '')
        .replace(/\[CORE_WORK\]/gi, '')
        .replace(/\[INTEGRATION\]/gi, '')
        .replace(/\[EMERGENCE\]/gi, '')
        .replace(/---+/g, '')
        .replace(/\*\*\*+/g, '')
        .replace(/^#+\s.*/gm, '') // Remove markdown headers
        .trim()
      )
      .filter(t => t.length > 0)
      .join('\n\n');

    const totalWords = fullScript.split(/\s+/).length;

    const script = {
      title: goal,
      egoState: 'personalized',
      language,
      fullScript,
      metadata: {
        durationMinutes: Math.round(totalWords / 85), // 85 WPM hypnosis pace
        totalWords,
        wordsPerMinute,
        generatedAt: new Date().toISOString(),
        userLevel,
        isDailySession,
        phases: 4,
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

    console.log('4-phase script generated successfully:', {
      totalWords: script.metadata.totalWords,
      estimatedMinutes: script.metadata.durationMinutes,
      phases: 4,
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
