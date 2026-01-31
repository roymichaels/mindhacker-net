import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LaunchpadData {
  welcomeQuiz: any;
  personalProfile: any;
  lifestyleRoutine: any;  // NEW: Step 3 - sleep/work/meals/energy data
  identityBuilding: any;
  growthDeepDive: any;
  firstChat: any;
  firstChatTranscript: any;  // From step_2_summary - full conversation
  introspection: any;
  lifePlan: any;
  focusAreas: any;
  selectedFocusAreas: any;   // From step_5_focus_areas_selected
  firstWeek: any;
  firstWeekActions: any;     // From step_6_actions
  finalNotes: string | null; // NEW: Step 10 - free text notes
}

interface SummaryData {
  consciousness_analysis: {
    current_state: string;
    dominant_patterns: string[];
    blind_spots: string[];
    strengths: string[];
    growth_edges: string[];
  };
  life_direction: {
    core_aspiration: string;
    clarity_score: number;
    vision_summary: string;
  };
  identity_profile: {
    dominant_traits: string[];
    suggested_ego_state: string;
    values_hierarchy: string[];
    identity_title: {
      title: string;
      title_en: string;
      icon: string;
    };
  };
  behavioral_insights: {
    habits_to_transform: string[];
    habits_to_cultivate: string[];
    resistance_patterns: string[];
  };
  career_path: {
    current_status: string;
    aspiration: string;
    key_steps: string[];
  };
  transformation_potential: {
    readiness_score: number;
    primary_focus: string;
    secondary_focus: string;
  };
}

interface PlanData {
  months: Array<{
    number: number;
    title: string;
    title_he: string;
    focus: string;
    milestone: string;
    weeks: Array<{
      number: number;
      title: string;
      description: string;
      tasks: string[];
      goal: string;
      challenge: string;
      hypnosis_recommendation: string;
    }>;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    
    // Check for guest mode
    if (body.mode === 'guest' && body.guestData) {
      console.log('Processing guest mode request');
      
      // Convert guest data to LaunchpadData format
      const launchpadData: LaunchpadData = {
        welcomeQuiz: body.guestData.welcomeQuiz || {},
        personalProfile: body.guestData.personalProfile || {},
        lifestyleRoutine: body.guestData.lifestyleRoutine || {},  // NEW
        identityBuilding: { elements: [], traits: [], values: [], principles: [] },
        growthDeepDive: body.guestData.personalProfile?.deep_dive?.answers || {},
        firstChat: null,
        firstChatTranscript: body.guestData.firstChatTranscript || null,
        introspection: body.guestData.introspection || {},
        lifePlan: body.guestData.lifePlan || {},
        focusAreas: { plans: [], dailyMinimums: [], commitments: [] },
        selectedFocusAreas: body.guestData.selectedFocusAreas || [],
        firstWeek: { checklists: [], stepData: body.guestData.firstWeekActions || {} },
        firstWeekActions: body.guestData.firstWeekActions || {},
        finalNotes: body.guestData.finalNotes || null,  // NEW
      };

      // Generate AI summary and plan (no DB saves)
      const { summary, plan, scores } = await generateAISummaryAndPlan(launchpadData, '');
      console.log('Guest AI analysis complete');

      // Return results directly without saving to DB
      return new Response(JSON.stringify({
        success: true,
        mode: 'guest',
        summary,
        plan,
        scores,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Regular authenticated flow
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    console.log(`Generating launchpad summary for user: ${userId}`);

    // Gather all Launchpad data
    const launchpadData = await gatherLaunchpadData(supabase, userId);
    console.log('Launchpad data gathered successfully');

    // Generate AI summary and plan
    const { summary, plan, scores } = await generateAISummaryAndPlan(launchpadData, user.email || '');
    console.log('AI analysis complete');

    // Save summary to database
    const { data: summaryRecord, error: summaryError } = await supabase
      .from('launchpad_summaries')
      .upsert({
        user_id: userId,
        summary_data: summary,
        consciousness_score: scores.consciousness,
        transformation_readiness: scores.readiness,
        clarity_score: scores.clarity,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (summaryError) {
      console.error('Error saving summary:', summaryError);
      throw summaryError;
    }

    console.log('Summary saved:', summaryRecord.id);

    // Create life plan
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const { data: planRecord, error: planError } = await supabase
      .from('life_plans')
      .insert({
        user_id: userId,
        summary_id: summaryRecord.id,
        duration_months: 3,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        plan_data: plan,
        status: 'active',
      })
      .select()
      .single();

    if (planError) {
      console.error('Error saving plan:', planError);
      throw planError;
    }

    console.log('Life plan saved:', planRecord.id);

    // Create milestones for each week
    const milestones = [];
    for (const month of plan.months) {
      for (const week of month.weeks) {
        milestones.push({
          plan_id: planRecord.id,
          week_number: week.number,
          month_number: month.number,
          title: week.title,
          description: week.description,
          focus_area: month.focus,
          tasks: week.tasks,
          goal: week.goal,
          challenge: week.challenge,
          hypnosis_recommendation: week.hypnosis_recommendation,
          xp_reward: 50,
          tokens_reward: 5,
        });
      }
    }

    const { error: milestonesError } = await supabase
      .from('life_plan_milestones')
      .insert(milestones);

    if (milestonesError) {
      console.error('Error saving milestones:', milestonesError);
      throw milestonesError;
    }

    console.log(`Created ${milestones.length} milestones`);

    // Create checklists for week 1
    await createWeekOneChecklists(supabase, userId, plan.months[0]?.weeks[0]);
    
    // Create additional checklists from step 6 actions
    const { data: step6Progress } = await supabase
      .from('launchpad_progress')
      .select('step_6_actions')
      .eq('user_id', userId)
      .single();
    
    if (step6Progress?.step_6_actions) {
      await createChecklistsFromActions(supabase, userId, step6Progress.step_6_actions);
    }

    // Award XP for completing launchpad
    await supabase.rpc('increment_user_xp', { user_id: userId, xp_amount: 100 });
    await supabase.rpc('increment_user_tokens', { user_id: userId, token_amount: 15 });

    // ========== POPULATE LIFE MODEL TABLES ==========
    
    // 1. Create life_direction from summary
    console.log('Populating aurora_life_direction...');
    await supabase
      .from('aurora_life_direction')
      .upsert({
        user_id: userId,
        content: summary.life_direction?.core_aspiration || 'בניית מודל חיים משמעותי',
        clarity_score: summary.life_direction?.clarity_score || scores.clarity,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    // 2. Create identity elements from summary (traits, values)
    console.log('Populating aurora_identity_elements...');
    
    // Clear existing launchpad-generated elements to avoid duplicates
    await supabase
      .from('aurora_identity_elements')
      .delete()
      .eq('user_id', userId)
      .like('metadata->source', '%launchpad%');

    // Insert dominant traits (using 'character_trait' as per constraint)
    if (summary.identity_profile?.dominant_traits?.length) {
      for (const trait of summary.identity_profile.dominant_traits) {
        await supabase.from('aurora_identity_elements').insert({
          user_id: userId,
          element_type: 'character_trait',
          content: trait,
          metadata: { source: 'launchpad_summary' },
        });
      }
    }

    // Insert values hierarchy
    if (summary.identity_profile?.values_hierarchy?.length) {
      for (const value of summary.identity_profile.values_hierarchy) {
        await supabase.from('aurora_identity_elements').insert({
          user_id: userId,
          element_type: 'value',
          content: value,
          metadata: { source: 'launchpad_summary' },
        });
      }
    }

    // Insert identity title as a special identity element
    if (summary.identity_profile?.identity_title) {
      const identityTitle = summary.identity_profile.identity_title;
      await supabase.from('aurora_identity_elements').insert({
        user_id: userId,
        element_type: 'identity_title',
        content: identityTitle.title,
        metadata: { 
          source: 'launchpad_summary',
          title_en: identityTitle.title_en,
          icon: identityTitle.icon || '🎯',
        },
      });
    }

    // Insert behavioral insights as principles
    if (summary.behavioral_insights?.habits_to_cultivate?.length) {
      for (const habit of summary.behavioral_insights.habits_to_cultivate) {
        await supabase.from('aurora_identity_elements').insert({
          user_id: userId,
          element_type: 'principle',
          content: habit,
          metadata: { source: 'launchpad_summary' },
        });
      }
    }

    // Insert self-concepts from strengths and growth edges
    console.log('Populating self_concepts...');
    const selfConceptSources = [
      ...(summary.consciousness_analysis?.strengths || []).slice(0, 2),
      ...(summary.consciousness_analysis?.growth_edges || []).slice(0, 1),
    ];
    for (const concept of selfConceptSources) {
      await supabase.from('aurora_identity_elements').insert({
        user_id: userId,
        element_type: 'self_concept',
        content: concept,
        metadata: { source: 'launchpad_summary' },
      });
    }

    // 3. Create life vision from the analysis
    console.log('Populating aurora_life_visions...');
    
    // Clear existing launchpad-generated visions
    await supabase
      .from('aurora_life_visions')
      .delete()
      .eq('user_id', userId)
      .contains('focus_areas', ['launchpad_generated']);

    // Create a 5-year vision from the summary
    if (summary.life_direction?.vision_summary) {
      await supabase.from('aurora_life_visions').insert({
        user_id: userId,
        timeframe: '5_year',
        title: summary.transformation_potential?.primary_focus || summary.life_direction?.core_aspiration?.slice(0, 50) || 'חזון אישי',
        description: summary.life_direction.vision_summary,
        focus_areas: ['launchpad_generated', summary.transformation_potential?.primary_focus, summary.transformation_potential?.secondary_focus].filter(Boolean),
      });
    }

    // 4. Create commitments from first week actions  
    console.log('Populating aurora_commitments...');
    
    // Clear existing launchpad-generated commitments
    await supabase
      .from('aurora_commitments')
      .delete()
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get the first week actions from launchpad progress
    const { data: progressData } = await supabase
      .from('launchpad_progress')
      .select('step_6_actions')
      .eq('user_id', userId)
      .single();

    const step6Actions = progressData?.step_6_actions as Record<string, unknown> | null;
    
    // Create commitments from habits to build
    const habitsToBuilld = step6Actions?.habits_to_build as string[] || [];
    for (const habit of habitsToBuilld.slice(0, 3)) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId,
        title: habit,
        description: `הרגל חדש מתוך מסע הטרנספורמציה`,
        status: 'active',
      });
    }

    // Create commitment for career goal if exists
    const careerGoal = step6Actions?.career_goal as string;
    if (careerGoal) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId,
        title: careerGoal,
        description: `יעד קריירה מתוך מסע הטרנספורמציה`,
        status: 'active',
      });
    }

    // 5. Create daily anchors from habits to cultivate
    console.log('Populating aurora_daily_minimums...');
    
    // Clear existing launchpad-generated anchors
    await supabase
      .from('aurora_daily_minimums')
      .delete()
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create daily anchors from habits to cultivate
    const habitsToCultivate = summary.behavioral_insights?.habits_to_cultivate || [];
    for (const habit of habitsToCultivate.slice(0, 3)) {
      await supabase.from('aurora_daily_minimums').insert({
        user_id: userId,
        title: habit,
        category: 'habit',
        is_active: true,
      });
    }

    // 6. Mark launchpad as complete with PROPER scores
    console.log('Updating aurora_onboarding_progress...');
    await supabase
      .from('aurora_onboarding_progress')
      .upsert({
        user_id: userId,
        onboarding_complete: true,
        direction_clarity: scores.clarity >= 70 ? 'stable' : 'emerging',
        identity_understanding: scores.consciousness >= 70 ? 'clear' : 'partial',
        energy_patterns_status: scores.readiness >= 70 ? 'mapped' : 'partial',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log('Life Model tables fully populated!');

    return new Response(JSON.stringify({
      success: true,
      summary_id: summaryRecord.id,
      plan_id: planRecord.id,
      milestones_count: milestones.length,
      scores,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherLaunchpadData(supabase: any, userId: string): Promise<LaunchpadData> {
  // Get launchpad progress
  const { data: progress } = await supabase
    .from('launchpad_progress')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get form submissions (introspection and life plan)
  const { data: formSubmissions } = await supabase
    .from('form_submissions')
    .select('*, custom_forms!inner(title)')
    .eq('user_id', userId);

  // Get identity elements
  const { data: identityElements } = await supabase
    .from('aurora_identity_elements')
    .select('*')
    .eq('user_id', userId);

  // Get life direction
  const { data: lifeDirection } = await supabase
    .from('aurora_life_direction')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get focus plans
  const { data: focusPlans } = await supabase
    .from('aurora_focus_plans')
    .select('*')
    .eq('user_id', userId);

  // Get daily minimums
  const { data: dailyMinimums } = await supabase
    .from('aurora_daily_minimums')
    .select('*')
    .eq('user_id', userId);

  // Get commitments
  const { data: commitments } = await supabase
    .from('aurora_commitments')
    .select('*')
    .eq('user_id', userId);

  // Get visions
  const { data: visions } = await supabase
    .from('aurora_life_visions')
    .select('*')
    .eq('user_id', userId);

  // Get checklists
  const { data: checklists } = await supabase
    .from('aurora_checklists')
    .select('*, aurora_checklist_items(*)')
    .eq('user_id', userId);

  // Get form analyses
  const { data: formAnalyses } = await supabase
    .from('form_analyses')
    .select('*')
    .eq('user_id', userId);

  // Get conversation messages for first chat summary
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', userId)
    .eq('type', 'aurora')
    .limit(1)
    .single();

  let firstChatSummary = null;
  if (conversations) {
    const { data: messages } = await supabase
      .from('messages')
      .select('content, sender_type')
      .eq('conversation_id', conversations.id)
      .order('created_at', { ascending: true })
      .limit(20);
    firstChatSummary = messages;
  }

  // Parse step_1_intention - can be string or JSON
  let welcomeQuiz: any = {};
  if (progress?.step_1_intention) {
    if (typeof progress.step_1_intention === 'string') {
      try {
        welcomeQuiz = JSON.parse(progress.step_1_intention);
      } catch {
        welcomeQuiz = { intention: progress.step_1_intention };
      }
    } else {
      welcomeQuiz = progress.step_1_intention;
    }
  }

  // Parse step_2_summary (first chat transcript)
  let firstChatTranscript: any = null;
  if (progress?.step_2_summary) {
    if (typeof progress.step_2_summary === 'string') {
      try {
        firstChatTranscript = JSON.parse(progress.step_2_summary);
      } catch {
        firstChatTranscript = { summary: progress.step_2_summary };
      }
    } else {
      firstChatTranscript = progress.step_2_summary;
    }
  }

  // Get deep dive from step_2_profile_data
  const personalProfile = progress?.step_2_profile_data || {};
  const growthDeepDive = (personalProfile as any)?.deep_dive?.answers || {};

  // NEW: Get lifestyle routine from step_3_lifestyle_data
  const lifestyleRoutine = progress?.step_3_lifestyle_data || {};

  // Get selected focus areas from step_5
  const selectedFocusAreas = progress?.step_5_focus_areas_selected || [];

  // Get first week actions from step_6
  const firstWeekActions = progress?.step_6_actions || {};

  // NEW: Get final notes from step_10
  const finalNotes = progress?.step_10_final_notes || null;

  console.log('Data mapping summary:', {
    hasWelcomeQuiz: Object.keys(welcomeQuiz).length > 0,
    hasPersonalProfile: Object.keys(personalProfile).length > 0,
    hasLifestyleRoutine: Object.keys(lifestyleRoutine).length > 0,  // NEW
    hasDeepDive: Object.keys(growthDeepDive).length > 0,
    hasFirstChatTranscript: !!firstChatTranscript,
    selectedFocusAreasCount: Array.isArray(selectedFocusAreas) ? selectedFocusAreas.length : 0,
    hasFirstWeekActions: Object.keys(firstWeekActions).length > 0,
    hasFinalNotes: !!finalNotes,  // NEW
  });

  return {
    welcomeQuiz,
    personalProfile,
    lifestyleRoutine,  // NEW
    identityBuilding: {
      elements: identityElements || [],
      traits: identityElements?.filter((e: any) => e.element_type === 'trait' || e.element_type === 'character_trait') || [],
      values: identityElements?.filter((e: any) => e.element_type === 'value') || [],
      principles: identityElements?.filter((e: any) => e.element_type === 'principle') || [],
    },
    growthDeepDive,
    firstChat: firstChatSummary,
    firstChatTranscript,
    introspection: {
      submissions: formSubmissions?.filter((f: any) => 
        f.custom_forms?.title?.toLowerCase().includes('introspection')
      ) || [],
      analyses: formAnalyses?.filter((a: any) => 
        a.form_type === 'introspection'
      ) || [],
    },
    lifePlan: {
      direction: lifeDirection,
      visions: visions || [],
      submissions: formSubmissions?.filter((f: any) => 
        f.custom_forms?.title?.toLowerCase().includes('life') || 
        f.custom_forms?.title?.toLowerCase().includes('plan')
      ) || [],
      analyses: formAnalyses?.filter((a: any) => 
        a.form_type === 'life_plan'
      ) || [],
    },
    focusAreas: {
      plans: focusPlans || [],
      dailyMinimums: dailyMinimums || [],
      commitments: commitments || [],
    },
    selectedFocusAreas,
    firstWeek: {
      checklists: checklists || [],
      stepData: firstWeekActions,
    },
    firstWeekActions,
    finalNotes,  // NEW
  };
}

async function generateAISummaryAndPlan(data: LaunchpadData, userEmail: string): Promise<{
  summary: SummaryData;
  plan: PlanData;
  scores: { consciousness: number; readiness: number; clarity: number };
}> {
  const prompt = buildAnalysisPrompt(data);
  
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return getDefaultSummaryAndPlan(data);
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: `You are an elite life transformation coach and consciousness analyst. You specialize in deep psychological analysis and creating actionable transformation plans.

Your task is to analyze comprehensive data from a user who completed a Launchpad onboarding process. Based on this data, create:
1. A deep consciousness analysis
2. A personalized 90-day transformation plan with weekly milestones

**CRITICAL RULES:**

**1. ALL TEXT CONTENT MUST BE IN HEBREW (עברית)**
- All analysis text, descriptions, tasks, and insights must be written in Hebrew
- Names/titles should have both Hebrew and English versions where specified
- Be direct and challenging, not coddling
- Focus on results and action
- Identify the gap between where the user is and where they need to go
- Suggest challenges that push for growth

**2. RESPECT THE USER'S SCHEDULE (VERY IMPORTANT!)**
- Pay close attention to Step 3 (Lifestyle & Routine) data
- If the user wakes up at 3-5 AM for work, do NOT recommend sleeping until 23:00!
- Adjust ALL time-based recommendations to their actual schedule
- For shift workers or early risers, calculate sleep times backwards from wake time (7-8 hours before)
- Consider their peak productivity times when scheduling important tasks
- If they have family commitments, factor those into the plan

**3. INCORPORATE USER'S FINAL NOTES**
- Step 10 contains the user's own notes and special requests
- These may include health conditions, constraints, or specific wishes
- Honor these notes when creating recommendations

Respond ONLY with valid JSON matching this exact structure:
{
  "summary": {
    "consciousness_analysis": {
      "current_state": "2-3 פסקאות ניתוח של המצב הנפשי והרגשי הנוכחי של המשתמש - בעברית",
      "dominant_patterns": ["דפוס 1", "דפוס 2", "דפוס 3"],
      "blind_spots": ["נקודה עיוורת 1", "נקודה עיוורת 2"],
      "strengths": ["חוזק 1", "חוזק 2", "חוזק 3"],
      "growth_edges": ["קצה צמיחה 1", "קצה צמיחה 2"]
    },
    "life_direction": {
      "core_aspiration": "משפט אחד שמזהה את מה שהמשתמש באמת רוצה",
      "clarity_score": 75,
      "vision_summary": "2-3 משפטים שמסכמים את החזון שלו"
    },
    "identity_profile": {
      "dominant_traits": ["תכונה 1", "תכונה 2", "תכונה 3"],
      "suggested_ego_state": "warrior|guardian|creator|seeker|sage",
      "values_hierarchy": ["ערך 1", "ערך 2", "ערך 3"],
      "identity_title": {
        "title": "כותרת זהות קצרה 1-3 מילים בעברית - משהו משחקי ומעורר השראה שמסכם מי המשתמש בחר להיות (לדוגמה: נינג'ה של הביצוע, ארכיטקט החלומות, לוחם האור, מעצב המציאות)",
        "title_en": "Short 1-3 word identity title in English (e.g., Execution Ninja, Dream Architect, Light Warrior, Reality Shaper)",
        "icon": "אימוג'י אחד שמייצג את הזהות"
      }
    },
    "behavioral_insights": {
      "habits_to_transform": ["הרגל לשנות 1", "הרגל לשנות 2"],
      "habits_to_cultivate": ["הרגל לפתח 1", "הרגל לפתח 2", "הרגל לפתח 3"],
      "resistance_patterns": ["דפוס התנגדות 1", "דפוס התנגדות 2"]
    },
    "career_path": {
      "current_status": "מצב עבודה נוכחי",
      "aspiration": "שאיפה מקצועית",
      "key_steps": ["צעד 1", "צעד 2", "צעד 3"]
    },
    "transformation_potential": {
      "readiness_score": 80,
      "primary_focus": "תחום מיקוד עיקרי",
      "secondary_focus": "תחום מיקוד משני"
    }
  },
  "plan": {
    "months": [
      {
        "number": 1,
        "title": "Foundations",
        "title_he": "יסודות",
        "focus": "בניית הרגלי בסיס",
        "milestone": "3 הרגלים חדשים מבוססים",
        "weeks": [
          {
            "number": 1,
            "title": "שבוע 1: נקודת התחלה",
            "description": "תיאור מיקוד השבוע - בעברית",
            "tasks": ["משימה 1", "משימה 2", "משימה 3", "משימה 4", "משימה 5"],
            "goal": "יעד מדיד לשבוע",
            "challenge": "משימה מאתגרת אחת",
            "hypnosis_recommendation": "סוג סשן היפנוזה מומלץ"
          }
        ]
      }
    ]
  },
  "scores": {
    "consciousness": 72,
    "readiness": 85,
    "clarity": 78
  }
}

Include exactly 3 months with 4 weeks each (12 weeks total). Each week should have 3-5 specific, actionable tasks IN HEBREW.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    console.error('AI API error:', response.status);
    // Return default structure if AI fails
    return getDefaultSummaryAndPlan(data);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || '';
  
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary,
        plan: parsed.plan,
        scores: parsed.scores,
      };
    }
    throw new Error('No valid JSON found in response');
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    return getDefaultSummaryAndPlan(data);
  }
}

function buildAnalysisPrompt(data: LaunchpadData): string {
  const sections: string[] = [];

  // Step 1: Initial Intention
  sections.push('## Step 1: Initial Intention (Welcome Quiz)');
  sections.push(JSON.stringify(data.welcomeQuiz, null, 2));

  // Step 2: Personal Profile
  sections.push('\n## Step 2: Personal Profile');
  sections.push(JSON.stringify(data.personalProfile, null, 2));

  // NEW: Step 3: Lifestyle & Routine (CRITICAL for schedule-aware recommendations)
  sections.push('\n## Step 3: Lifestyle & Daily Routine');
  sections.push('**IMPORTANT: Use this data to tailor ALL time-based recommendations!**');
  if (data.lifestyleRoutine && Object.keys(data.lifestyleRoutine).length > 0) {
    sections.push(JSON.stringify(data.lifestyleRoutine, null, 2));
    // Highlight key schedule info
    if (data.lifestyleRoutine.wake_time) {
      sections.push(`Wake time: ${data.lifestyleRoutine.wake_time}`);
    }
    if (data.lifestyleRoutine.sleep_time) {
      sections.push(`Sleep time: ${data.lifestyleRoutine.sleep_time}`);
    }
    if (data.lifestyleRoutine.shift_work && data.lifestyleRoutine.shift_work !== 'no') {
      sections.push(`⚠️ SHIFT WORKER: ${data.lifestyleRoutine.shift_work}`);
    }
    if (data.lifestyleRoutine.peak_productivity) {
      sections.push(`Peak productivity: ${data.lifestyleRoutine.peak_productivity}`);
    }
  } else {
    sections.push('No lifestyle routine data provided');
  }

  // Step 4: Deep Dive Answers (was step 3)
  sections.push('\n## Step 4: Growth Deep Dive Answers');
  sections.push(JSON.stringify(data.growthDeepDive, null, 2));

  // Step 5: First Chat Transcript with Aurora (was step 4)
  if (data.firstChatTranscript) {
    sections.push('\n## Step 5: First Chat with Aurora (Full Transcript)');
    if (data.firstChatTranscript.messages && Array.isArray(data.firstChatTranscript.messages)) {
      sections.push('Conversation:');
      data.firstChatTranscript.messages.forEach((msg: any) => {
        sections.push(`${msg.role === 'user' ? 'User' : 'Aurora'}: ${msg.content}`);
      });
      if (data.firstChatTranscript.answers && Array.isArray(data.firstChatTranscript.answers)) {
        sections.push(`\nUser's answers summary: ${data.firstChatTranscript.answers.join(' | ')}`);
      }
    } else {
      sections.push(JSON.stringify(data.firstChatTranscript, null, 2));
    }
  }

  // Also include messages table data if available
  if (data.firstChat && Array.isArray(data.firstChat) && data.firstChat.length > 0) {
    sections.push('\n## Aurora Conversation Messages (from database)');
    sections.push(data.firstChat.map((m: any) => `${m.sender_type}: ${m.content}`).slice(0, 15).join('\n'));
  }

  // Step 8: Selected Focus Areas (was step 5)
  sections.push('\n## Step 8: Selected Focus Areas');
  if (Array.isArray(data.selectedFocusAreas) && data.selectedFocusAreas.length > 0) {
    sections.push(`Selected areas: ${data.selectedFocusAreas.join(', ')}`);
  } else {
    sections.push('No focus areas selected yet');
  }

  // Step 9: First Week Actions (was step 6)
  sections.push('\n## Step 9: First Week Actions & Goals');
  sections.push(JSON.stringify(data.firstWeekActions, null, 2));

  // NEW: Step 10: Final Notes from User
  sections.push('\n## Step 10: User\'s Final Notes & Special Requests');
  if (data.finalNotes && data.finalNotes.trim()) {
    sections.push('**User wrote:**');
    sections.push(data.finalNotes);
    sections.push('**⚠️ IMPORTANT: Consider these notes when creating recommendations!**');
  } else {
    sections.push('No additional notes provided');
  }

  // Identity Building (from aurora tables)
  sections.push('\n## Identity Building Elements');
  sections.push(`Traits: ${data.identityBuilding.traits.map((t: any) => t.content).join(', ') || 'None defined'}`);
  sections.push(`Values: ${data.identityBuilding.values.map((v: any) => v.content).join(', ') || 'None defined'}`);
  sections.push(`Principles: ${data.identityBuilding.principles.map((p: any) => p.content).join(', ') || 'None defined'}`);

  // Introspection Form (Step 5 form submission)
  sections.push('\n## Introspection Form Responses');
  if (data.introspection.analyses?.[0]) {
    sections.push(JSON.stringify(data.introspection.analyses[0].analysis_result, null, 2));
  } else if (data.introspection.submissions?.[0]) {
    sections.push(JSON.stringify(data.introspection.submissions[0].responses, null, 2));
  } else {
    sections.push('No introspection form data');
  }

  // Life Plan Form (Step 6 form submission)
  sections.push('\n## Life Plan');
  if (data.lifePlan.direction) {
    sections.push(`Life Direction: ${data.lifePlan.direction.content}`);
    sections.push(`Clarity Score: ${data.lifePlan.direction.clarity_score}`);
  }
  if (data.lifePlan.visions?.length > 0) {
    sections.push('Visions:');
    data.lifePlan.visions.forEach((v: any) => {
      sections.push(`- ${v.timeframe}: ${v.title} - ${v.description || ''}`);
    });
  }
  if (data.lifePlan.analyses?.[0]) {
    sections.push(JSON.stringify(data.lifePlan.analyses[0].analysis_result, null, 2));
  }

  // Focus Plans
  sections.push('\n## Focus Plans & Commitments');
  if (data.focusAreas.plans?.length > 0) {
    sections.push('Active Plans:');
    data.focusAreas.plans.forEach((p: any) => {
      sections.push(`- ${p.title}: ${p.description || ''}`);
    });
  }
  if (data.focusAreas.dailyMinimums?.length > 0) {
    sections.push('Daily Minimums:');
    data.focusAreas.dailyMinimums.forEach((m: any) => {
      sections.push(`- ${m.title} (${m.category || 'general'})`);
    });
  }
  if (data.focusAreas.commitments?.length > 0) {
    sections.push('Commitments:');
    data.focusAreas.commitments.forEach((c: any) => {
      sections.push(`- ${c.title}: ${c.description || ''}`);
    });
  }

  // Existing checklists
  sections.push('\n## Existing Checklists');
  if (data.firstWeek.checklists?.length > 0) {
    sections.push('Checklists created:');
    data.firstWeek.checklists.forEach((c: any) => {
      sections.push(`- ${c.title}: ${c.aurora_checklist_items?.length || 0} items`);
    });
  } else {
    sections.push('No checklists yet');
  }

  console.log('Built analysis prompt with sections:', sections.length);
  
  return sections.join('\n');
}

function getDefaultSummaryAndPlan(data: LaunchpadData): {
  summary: SummaryData;
  plan: PlanData;
  scores: { consciousness: number; readiness: number; clarity: number };
} {
  // Extract what we can from the data
  const traits = data.identityBuilding.traits.map((t: any) => t.content).slice(0, 3);
  const values = data.identityBuilding.values.map((v: any) => v.content).slice(0, 3);
  const lifeDirection = data.lifePlan.direction?.content || 'Building a meaningful life';

  return {
    summary: {
      consciousness_analysis: {
        current_state: 'Based on the information provided, you are at a pivotal moment in your life journey. You have taken the important step of self-reflection and commitment to growth.',
        dominant_patterns: ['Self-improvement focused', 'Goal-oriented thinking'],
        blind_spots: ['May need to work on consistency', 'Balance between ambition and self-care'],
        strengths: traits.length > 0 ? traits : ['Self-awareness', 'Willingness to grow'],
        growth_edges: ['Daily discipline', 'Emotional resilience'],
      },
      life_direction: {
        core_aspiration: lifeDirection,
        clarity_score: data.lifePlan.direction?.clarity_score || 60,
        vision_summary: 'You are working towards a life of purpose and fulfillment, focusing on personal growth and meaningful achievements.',
      },
      identity_profile: {
        dominant_traits: traits.length > 0 ? traits : ['Determined', 'Thoughtful', 'Growing'],
        suggested_ego_state: 'guardian',
        values_hierarchy: values.length > 0 ? values : ['Growth', 'Authenticity', 'Success'],
        identity_title: {
          title: 'מעצב מודע',
          title_en: 'Conscious Shaper',
          icon: '🎯',
        },
      },
      behavioral_insights: {
        habits_to_transform: ['Procrastination', 'Self-doubt'],
        habits_to_cultivate: ['Morning routine', 'Daily reflection', 'Consistent action'],
        resistance_patterns: ['Fear of failure', 'Perfectionism'],
      },
      career_path: {
        current_status: 'In transition or growth phase',
        aspiration: 'Greater autonomy and impact',
        key_steps: ['Define clear goals', 'Build key skills', 'Take consistent action'],
      },
      transformation_potential: {
        readiness_score: 75,
        primary_focus: 'Establishing daily habits',
        secondary_focus: 'Career development',
      },
    },
    plan: {
      months: [
        {
          number: 1,
          title: 'Foundations',
          title_he: 'יסודות',
          focus: 'Building core habits and routines',
          milestone: '3 new habits established',
          weeks: [
            { number: 1, title: 'Week 1: Starting Strong', description: 'Establish your morning routine and daily reflection practice', tasks: ['Wake up at consistent time', 'Morning mindfulness 10min', 'Evening reflection 5min', 'Define 3 daily priorities', 'Track habits'], goal: 'Complete morning routine 5/7 days', challenge: 'No phone for first hour after waking', hypnosis_recommendation: 'Motivation and clarity session' },
            { number: 2, title: 'Week 2: Building Momentum', description: 'Add physical activity and consolidate habits', tasks: ['Continue morning routine', 'Add 20min exercise', 'Plan weekly goals Sunday', 'Review progress daily', 'Connect with accountability partner'], goal: 'Exercise 4 times this week', challenge: 'Complete a difficult task first thing each day', hypnosis_recommendation: 'Energy and vitality session' },
            { number: 3, title: 'Week 3: Deepening Practice', description: 'Deepen mindfulness and add learning time', tasks: ['Extend meditation to 15min', 'Add 30min daily learning', 'Practice gratitude journaling', 'Review and adjust habits', 'Meal prep for week'], goal: 'Complete full routine 6/7 days', challenge: 'Digital detox evening', hypnosis_recommendation: 'Focus and concentration session' },
            { number: 4, title: 'Week 4: Integration', description: 'Integrate habits and prepare for next phase', tasks: ['Assess habit progress', 'Identify what works', 'Adjust routine as needed', 'Plan month 2 focus', 'Celebrate wins'], goal: 'All 3 core habits established', challenge: 'Share progress with someone', hypnosis_recommendation: 'Confidence building session' },
          ],
        },
        {
          number: 2,
          title: 'Building',
          title_he: 'בנייה',
          focus: 'Career focus and skill development',
          milestone: 'First career step completed',
          weeks: [
            { number: 5, title: 'Week 5: Career Clarity', description: 'Define career goals and action steps', tasks: ['Write career vision', 'Research opportunities', 'Identify skill gaps', 'Plan learning path', 'Network outreach'], goal: 'Career action plan complete', challenge: 'Reach out to mentor or expert', hypnosis_recommendation: 'Career success visualization' },
            { number: 6, title: 'Week 6: Skill Building', description: 'Focus on developing key skills', tasks: ['Start online course', 'Practice 1 hour daily', 'Document learnings', 'Apply to small project', 'Seek feedback'], goal: '7 hours of focused learning', challenge: 'Teach something you learned', hypnosis_recommendation: 'Learning acceleration session' },
            { number: 7, title: 'Week 7: Application', description: 'Apply skills to real projects', tasks: ['Start personal project', 'Contribute to community', 'Build portfolio piece', 'Get external feedback', 'Iterate and improve'], goal: 'Complete one project milestone', challenge: 'Present work to others', hypnosis_recommendation: 'Creativity and flow session' },
            { number: 8, title: 'Week 8: Expansion', description: 'Expand network and opportunities', tasks: ['Attend event or webinar', 'Connect with 5 new people', 'Share expertise online', 'Explore opportunities', 'Update professional presence'], goal: 'Network expanded by 5 connections', challenge: 'Public share of work or insights', hypnosis_recommendation: 'Social confidence session' },
          ],
        },
        {
          number: 3,
          title: 'Momentum',
          title_he: 'תנופה',
          focus: 'Scaling and sustainable success',
          milestone: 'Transformation plan proven',
          weeks: [
            { number: 9, title: 'Week 9: Acceleration', description: 'Increase pace and ambition', tasks: ['Set bigger goals', 'Increase focused work time', 'Tackle major challenge', 'Strengthen weak areas', 'Celebrate progress'], goal: 'Complete major milestone', challenge: 'Do something that scares you', hypnosis_recommendation: 'Breakthrough barriers session' },
            { number: 10, title: 'Week 10: Optimization', description: 'Optimize systems and routines', tasks: ['Audit time usage', 'Eliminate time wasters', 'Automate repetitive tasks', 'Delegate where possible', 'Focus on high impact'], goal: 'Save 5 hours through optimization', challenge: 'Say no to 3 low-priority requests', hypnosis_recommendation: 'Efficiency and productivity session' },
            { number: 11, title: 'Week 11: Mastery', description: 'Deepen expertise and impact', tasks: ['Create valuable content', 'Help others with expertise', 'Document your journey', 'Plan next phase', 'Strengthen key habits'], goal: 'Share expertise with 10 people', challenge: 'Lead a session or workshop', hypnosis_recommendation: 'Mastery and excellence session' },
            { number: 12, title: 'Week 12: Celebration', description: 'Review journey and plan next chapter', tasks: ['Complete 90-day review', 'Document all achievements', 'Plan next 90 days', 'Celebrate transformation', 'Set new ambitious goals'], goal: 'Complete review and new plan', challenge: 'Share full transformation story', hypnosis_recommendation: 'Integration and celebration session' },
          ],
        },
      ],
    },
    scores: {
      consciousness: 70,
      readiness: 75,
      clarity: data.lifePlan.direction?.clarity_score || 65,
    },
  };
}

async function createWeekOneChecklists(supabase: any, userId: string, weekData: any) {
  if (!weekData?.tasks?.length) return;

  try {
    // Create week 1 checklist
    const { data: checklist } = await supabase
      .from('aurora_checklists')
      .insert({
        user_id: userId,
        title: '📅 שבוע 1 - Week 1',
        origin: 'aurora',  // Fixed: 'launchpad_summary' was invalid, using 'aurora' instead
        context: 'Auto-generated from 90-day transformation plan',
        status: 'active',
      })
      .select()
      .single();

    if (checklist) {
      const items = weekData.tasks.map((task: string, index: number) => ({
        checklist_id: checklist.id,
        content: task,
        order_index: index,
        is_completed: false,
      }));

      await supabase.from('aurora_checklist_items').insert(items);
    }
  } catch (error) {
    console.error('Error creating week 1 checklists:', error);
  }
}

// Create additional checklists from step 6 actions (habits, career goals)
async function createChecklistsFromActions(supabase: any, userId: string, actions: any) {
  if (!actions) return;

  try {
    // Parse actions if it's a string
    const parsedActions = typeof actions === 'string' ? JSON.parse(actions) : actions;
    
    // Create checklist for habits to quit
    const habitsToQuit = parsedActions?.habits_to_quit || parsedActions?.habitsToQuit || [];
    if (Array.isArray(habitsToQuit) && habitsToQuit.length > 0) {
      const { data: quitChecklist } = await supabase
        .from('aurora_checklists')
        .insert({
          user_id: userId,
          title: '🚫 הרגלים להפסיק',
          origin: 'aurora',
          context: 'Generated from transformation journey - habits to quit',
          status: 'active',
        })
        .select()
        .single();

      if (quitChecklist) {
        const items = habitsToQuit.slice(0, 5).map((habit: string, index: number) => ({
          checklist_id: quitChecklist.id,
          content: typeof habit === 'string' ? habit : String(habit),
          order_index: index,
          is_completed: false,
        }));
        await supabase.from('aurora_checklist_items').insert(items);
      }
    }

    // Create checklist for habits to build
    const habitsToBuild = parsedActions?.habits_to_build || parsedActions?.habitsToBuild || [];
    if (Array.isArray(habitsToBuild) && habitsToBuild.length > 0) {
      const { data: buildChecklist } = await supabase
        .from('aurora_checklists')
        .insert({
          user_id: userId,
          title: '🏗️ הרגלים לבנות',
          origin: 'aurora',
          context: 'Generated from transformation journey - habits to build',
          status: 'active',
        })
        .select()
        .single();

      if (buildChecklist) {
        const items = habitsToBuild.slice(0, 5).map((habit: string, index: number) => ({
          checklist_id: buildChecklist.id,
          content: typeof habit === 'string' ? habit : String(habit),
          order_index: index,
          is_completed: false,
        }));
        await supabase.from('aurora_checklist_items').insert(items);
      }
    }

    // Create checklist for career goals
    const careerGoal = parsedActions?.career_goal || parsedActions?.careerGoal;
    const nextSteps = parsedActions?.next_steps || parsedActions?.nextSteps || [];
    if (careerGoal || (Array.isArray(nextSteps) && nextSteps.length > 0)) {
      const { data: careerChecklist } = await supabase
        .from('aurora_checklists')
        .insert({
          user_id: userId,
          title: '💼 יעדי קריירה',
          origin: 'aurora',
          context: 'Generated from transformation journey - career goals',
          status: 'active',
        })
        .select()
        .single();

      if (careerChecklist) {
        const items = [];
        if (careerGoal) {
          items.push({
            checklist_id: careerChecklist.id,
            content: typeof careerGoal === 'string' ? careerGoal : String(careerGoal),
            order_index: 0,
            is_completed: false,
          });
        }
        if (Array.isArray(nextSteps)) {
          nextSteps.slice(0, 4).forEach((step: string, index: number) => {
            items.push({
              checklist_id: careerChecklist.id,
              content: typeof step === 'string' ? step : String(step),
              order_index: items.length,
              is_completed: false,
            });
          });
        }
        if (items.length > 0) {
          await supabase.from('aurora_checklist_items').insert(items);
        }
      }
    }
    
    console.log('Created additional checklists from step 6 actions');
  } catch (error) {
    console.error('Error creating checklists from actions:', error);
  }
}
