import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthJourneyData {
  step_1_vision?: {
    health_vision?: string;
    ideal_feeling?: string;
    motivation?: string;
  };
  step_2_current_state?: {
    energy_level?: string;
    sleep_quality?: string;
    pain_areas?: string[];
    overall_health?: number;
  };
  step_3_nutrition?: {
    eating_habits?: string;
    water_intake?: string;
    diet_challenges?: string[];
  };
  step_4_exercise?: {
    current_activity?: string;
    preferred_exercise?: string[];
    frequency_goal?: string;
  };
  step_5_sleep?: {
    sleep_hours?: string;
    sleep_quality?: string;
    sleep_issues?: string[];
  };
  step_6_stress?: {
    stress_level?: number;
    stress_triggers?: string[];
    coping_methods?: string[];
  };
  step_7_beliefs?: {
    health_beliefs?: string[];
    limiting_patterns?: string;
    subconscious_blocks?: string[];
  };
  step_8_activation?: {
    commitment_level?: number;
    priority_area?: string;
    first_action?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { journeyData, userId } = await req.json() as {
      journeyData: HealthJourneyData;
      userId: string;
    };

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Generating health plan for user:', userId);
    console.log('Journey data:', JSON.stringify(journeyData));

    // Extract key information from journey data
    const priorityArea = journeyData.step_8_activation?.priority_area || 'nutrition';
    const stressLevel = journeyData.step_6_stress?.stress_level || 5;
    const overallHealth = journeyData.step_2_current_state?.overall_health || 5;
    const sleepIssues = journeyData.step_5_sleep?.sleep_issues || [];
    const dietChallenges = journeyData.step_3_nutrition?.diet_challenges || [];
    const exerciseGoal = journeyData.step_4_exercise?.frequency_goal || '2-3';
    const vision = journeyData.step_1_vision?.health_vision || '';

    // Generate 12 weekly milestones based on user's data
    const milestones = generateMilestones({
      priorityArea,
      stressLevel,
      overallHealth,
      sleepIssues,
      dietChallenges,
      exerciseGoal,
      vision
    });

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user already has a health plan (check summary_id or plan_data for health type)
    const { data: existingPlan } = await supabase
      .from('life_plans')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    let planId: string;

    if (existingPlan) {
      // Update existing plan
      planId = existingPlan.id;
      
      await supabase
        .from('life_plans')
        .update({
          plan_data: {
            title: 'תוכנית בריאות 90 יום',
            description: 'תוכנית מותאמת אישית לשיפור הבריאות',
            total_weeks: 12,
            current_week: 1,
            priority_area: priorityArea,
            journey_data: journeyData
          },
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      // Delete old milestones
      await supabase
        .from('life_plan_milestones')
        .delete()
        .eq('plan_id', planId);

    } else {
      // Create new plan
      const { data: newPlan, error: planError } = await supabase
        .from('life_plans')
        .insert({
          user_id: userId,
          plan_data: {
            title: 'תוכנית בריאות 90 יום',
            description: 'תוכנית מותאמת אישית לשיפור הבריאות',
            total_weeks: 12,
            current_week: 1,
            priority_area: priorityArea,
            journey_data: journeyData
          },
          status: 'active',
          duration_months: 3,
          progress_percentage: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (planError) {
        console.error('Error creating plan:', planError);
        throw planError;
      }

      planId = newPlan.id;
    }

    // Insert milestones
    const milestonesWithPlanId = milestones.map(m => ({
      ...m,
      plan_id: planId
    }));

    const { error: milestoneError } = await supabase
      .from('life_plan_milestones')
      .insert(milestonesWithPlanId);

    if (milestoneError) {
      console.error('Error creating milestones:', milestoneError);
      throw milestoneError;
    }

    console.log('Health plan created successfully:', planId);

    return new Response(
      JSON.stringify({
        success: true,
        planId,
        milestonesCount: milestones.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-health-plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

interface MilestoneInput {
  priorityArea: string;
  stressLevel: number;
  overallHealth: number;
  sleepIssues: string[];
  dietChallenges: string[];
  exerciseGoal: string;
  vision: string;
}

function generateMilestones(input: MilestoneInput) {
  const milestones = [];
  
  // Week 1-4: Foundation (Month 1)
  milestones.push({
    week_number: 1,
    title: 'יסודות השינה',
    description: 'בניית רוטינת שינה בריאה ויציבה',
    focus_area: 'sleep',
    tasks: JSON.stringify([
      { title: 'קביעת שעת שינה קבועה', completed: false },
      { title: 'הפסקת מסכים שעה לפני השינה', completed: false },
      { title: 'יצירת סביבת שינה אופטימלית', completed: false }
    ]),
    is_completed: false,
    xp_reward: 50
  });

  milestones.push({
    week_number: 2,
    title: 'הידרציה נכונה',
    description: 'שתיית 8 כוסות מים ביום',
    focus_area: 'nutrition',
    tasks: JSON.stringify([
      { title: 'שתיית כוס מים בבוקר', completed: false },
      { title: 'בקבוק מים זמין תמיד', completed: false },
      { title: 'הפחתת משקאות ממותקים', completed: false }
    ]),
    is_completed: false,
    xp_reward: 50
  });

  milestones.push({
    week_number: 3,
    title: 'תנועה יומית',
    description: 'הליכה של 20 דקות בכל יום',
    focus_area: 'physical',
    tasks: JSON.stringify([
      { title: 'הליכה בבוקר או בערב', completed: false },
      { title: 'שימוש במדרגות במקום מעלית', completed: false },
      { title: 'מעקב צעדים יומי', completed: false }
    ]),
    is_completed: false,
    xp_reward: 50
  });

  milestones.push({
    week_number: 4,
    title: 'ניהול מתח בסיסי',
    description: '5 דקות נשימות עמוקות ביום',
    focus_area: 'stress',
    tasks: JSON.stringify([
      { title: 'תרגול נשימות בבוקר', completed: false },
      { title: 'הפסקות קצרות במהלך היום', completed: false },
      { title: 'זיהוי טריגרים ללחץ', completed: false }
    ]),
    is_completed: false,
    xp_reward: 75
  });

  // Week 5-8: Building (Month 2)
  milestones.push({
    week_number: 5,
    title: 'שיפור איכות השינה',
    description: 'העמקת הרגלי השינה הבריאים',
    focus_area: 'sleep',
    tasks: JSON.stringify([
      { title: '7 שעות שינה לילה', completed: false },
      { title: 'מדיטציה לפני השינה', completed: false },
      { title: 'הימנעות מקפאין אחה"צ', completed: false }
    ]),
    is_completed: false,
    xp_reward: 75
  });

  milestones.push({
    week_number: 6,
    title: 'תזונה מודעת',
    description: 'הוספת ירקות לכל ארוחה',
    focus_area: 'nutrition',
    tasks: JSON.stringify([
      { title: 'ירק בכל ארוחה עיקרית', completed: false },
      { title: 'הכנת ארוחות מראש', completed: false },
      { title: 'אכילה איטית ומודעת', completed: false }
    ]),
    is_completed: false,
    xp_reward: 75
  });

  milestones.push({
    week_number: 7,
    title: 'הגברת הפעילות',
    description: 'אימון מובנה 3 פעמים בשבוע',
    focus_area: 'physical',
    tasks: JSON.stringify([
      { title: '3 אימונים בשבוע', completed: false },
      { title: 'מתיחות יומיות', completed: false },
      { title: 'הליכה של 30 דקות', completed: false }
    ]),
    is_completed: false,
    xp_reward: 75
  });

  milestones.push({
    week_number: 8,
    title: 'הרפיה עמוקה',
    description: '15 דקות מדיטציה יומית',
    focus_area: 'stress',
    tasks: JSON.stringify([
      { title: 'מדיטציה מודרכת יומית', completed: false },
      { title: 'טכניקות הרפיית שרירים', completed: false },
      { title: 'יומן רגשות', completed: false }
    ]),
    is_completed: false,
    xp_reward: 100
  });

  // Week 9-12: Momentum (Month 3)
  milestones.push({
    week_number: 9,
    title: 'שגרת שינה מיטבית',
    description: 'שינה איכותית קבועה',
    focus_area: 'sleep',
    tasks: JSON.stringify([
      { title: 'שמירה על שעות קבועות', completed: false },
      { title: 'סביבת שינה אופטימלית', completed: false },
      { title: 'התעוררות רעננה', completed: false }
    ]),
    is_completed: false,
    xp_reward: 100
  });

  milestones.push({
    week_number: 10,
    title: 'תזונה מאוזנת',
    description: 'ארוחות מתוכננות ובריאות',
    focus_area: 'nutrition',
    tasks: JSON.stringify([
      { title: 'תפריט שבועי', completed: false },
      { title: 'צמצום מזון מעובד', completed: false },
      { title: 'הקשבה לגוף', completed: false }
    ]),
    is_completed: false,
    xp_reward: 100
  });

  milestones.push({
    week_number: 11,
    title: 'כושר גופני',
    description: 'פעילות גופנית סדירה',
    focus_area: 'physical',
    tasks: JSON.stringify([
      { title: '4 אימונים בשבוע', completed: false },
      { title: 'שילוב אימון כוח', completed: false },
      { title: 'גמישות ויוגה', completed: false }
    ]),
    is_completed: false,
    xp_reward: 100
  });

  milestones.push({
    week_number: 12,
    title: 'איזון נפשי',
    description: 'ניהול מתח ורווחה רגשית',
    focus_area: 'stress',
    tasks: JSON.stringify([
      { title: 'שגרת הרפיה יומית', completed: false },
      { title: 'זמן איכות לעצמי', completed: false },
      { title: 'חגיגת ההישגים!', completed: false }
    ]),
    is_completed: false,
    xp_reward: 150
  });

  return milestones;
}
