import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  getDefaultSummaryAndPlan, 
  type LaunchpadData, 
  type SummaryData, 
  type PlanData 
} from '../_shared/launchpad-defaults.ts';
import { LAUNCHPAD_SYSTEM_PROMPT } from '../_shared/launchpad-ai-prompt.ts';
import { createWeekOneChecklists, createChecklistsFromActions } from '../_shared/launchpad-checklist-helpers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // ========== CLEANUP OLD DATA BEFORE CREATING NEW ==========
    console.log('Cleaning up old launchpad-generated data...');
    
    // Clear old checklists created from launchpad
    await supabase
      .from('aurora_checklists')
      .delete()
      .eq('user_id', userId)
      .eq('origin', 'launchpad');

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
    
    // Create commitments from habits to build (selectedBuild key from FirstWeekStep)
    const habitsToBuilld = (step6Actions?.selectedBuild || step6Actions?.habits_to_build) as string[] || [];
    for (const habit of habitsToBuilld.slice(0, 5)) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId,
        title: habit,
        description: `הרגל חדש מתוך מסע הטרנספורמציה`,
        status: 'active',
      });
    }

    // Create commitment for career goal if exists (selectedCareerGoal key)
    const careerGoal = (step6Actions?.selectedCareerGoal || step6Actions?.career_goal) as string;
    if (careerGoal) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId,
        title: careerGoal,
        description: `יעד קריירה מתוך מסע הטרנספורמציה`,
        status: 'active',
      });
    }

    // Create commitments from habits to quit (selectedQuit key)
    const habitsToQuit = (step6Actions?.selectedQuit || step6Actions?.habits_to_quit) as string[] || [];
    for (const habit of habitsToQuit.slice(0, 3)) {
      await supabase.from('aurora_commitments').insert({
        user_id: userId,
        title: `להפסיק: ${habit}`,
        description: `הרגל להפסיק מתוך מסע הטרנספורמציה`,
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

  // Use AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite', // Faster model for quicker responses
        max_tokens: 4000, // Limit response size
        messages: [
          { role: 'system', content: LAUNCHPAD_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return getDefaultSummaryAndPlan(data);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    
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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('AI API request timed out after 120s');
    } else {
      console.error('Error in AI request:', error);
    }
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

// Checklist helper functions are imported from _shared/launchpad-checklist-helpers.ts
