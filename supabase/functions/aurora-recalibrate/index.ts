import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PulseLog {
  energy_rating: number;
  sleep_compliance: string;
  task_confidence: number;
  screen_discipline: boolean;
  mood_signal: string;
  log_date: string;
}

interface BehavioralRisk {
  risk: string;
  severity: string;
  action: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get last 7 days of pulse data
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const [pulseRes, planRes, intakeRes, prevRecalibRes] = await Promise.all([
      supabase.from('daily_pulse_logs').select('*').eq('user_id', user_id).gte('log_date', weekAgoStr).order('log_date', { ascending: true }),
      supabase.from('life_plans').select('id, start_date, duration_months').eq('user_id', user_id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('launchpad_progress').select('step_1_intention, step_2_profile_data').eq('user_id', user_id).maybeSingle(),
      supabase.from('recalibration_logs').select('compliance_score, week_number').eq('user_id', user_id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);

    const pulses: PulseLog[] = pulseRes.data || [];
    if (pulses.length === 0) {
      return new Response(JSON.stringify({ status: 'skipped', reason: 'no pulse data this week' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Compute scores ──────────────────────────────────
    const n = pulses.length;

    // Compliance Score (0-100)
    const sleepYes = pulses.filter(p => p.sleep_compliance === 'yes').length;
    const sleepPartial = pulses.filter(p => p.sleep_compliance === 'partial').length;
    const screenYes = pulses.filter(p => p.screen_discipline).length;
    const avgConfidence = pulses.reduce((s, p) => s + p.task_confidence, 0) / n;

    const sleepScore = ((sleepYes + sleepPartial * 0.5) / n) * 100;
    const screenScore = (screenYes / n) * 100;
    const confidenceScore = (avgConfidence / 5) * 100;
    const complianceScore = Math.round((sleepScore * 0.35 + screenScore * 0.25 + confidenceScore * 0.4));

    // Cognitive Load Score (0-100, higher = more overloaded)
    const avgEnergy = pulses.reduce((s, p) => s + p.energy_rating, 0) / n;
    const energyVariance = pulses.reduce((s, p) => s + Math.pow(p.energy_rating - avgEnergy, 2), 0) / n;
    const moodInstability = new Set(pulses.map(p => p.mood_signal)).size / 5;
    const intakeData = intakeRes.data?.step_2_profile_data as Record<string, unknown> | null;
    const workHours = Number(intakeData?.daily_work_hours || 8);
    const cognitiveLoadScore = Math.round(Math.min(100, (energyVariance * 15 + moodInstability * 30 + Math.max(0, workHours - 6) * 5)));

    // Recovery Debt Score (0-100, higher = more debt)
    const sleepMisses = pulses.filter(p => p.sleep_compliance !== 'yes').length;
    const lowEnergyDays = pulses.filter(p => p.energy_rating <= 2).length;
    const highScreenDays = pulses.filter(p => !p.screen_discipline).length;
    const recoveryDebtScore = Math.round(Math.min(100, ((sleepMisses + lowEnergyDays + highScreenDays) / (n * 3)) * 100));

    // ── Behavioral Risk Prediction ──────────────────────
    const risks: BehavioralRisk[] = [];
    const intentionData = intakeRes.data?.step_1_intention as Record<string, unknown> | null;
    const executionPattern = String(intentionData?.execution_pattern || '');
    const urgency = Number(intentionData?.urgency_scale || 5);
    const commitment = Number(intentionData?.restructure_willingness || 5);
    const prevCompliance = prevRecalibRes.data?.compliance_score || null;

    // Overtraining risk
    if (executionPattern === 'start_and_quit' && urgency >= 7 && prevCompliance !== null && complianceScore < prevCompliance - 10) {
      risks.push({ risk: 'Overtraining', severity: 'high', action: 'Reduce plan intensity, insert rest day' });
    }

    // Overcommitment trap
    if (executionPattern === 'burn_out_quickly' && lowEnergyDays >= 3) {
      risks.push({ risk: 'Overcommitment', severity: 'high', action: 'Pause secondary tasks, push hypnosis' });
    }

    // Avoidance spiral
    if (executionPattern === 'avoid_hard_tasks' && commitment <= 4) {
      const zeroConfDays = pulses.filter(p => p.task_confidence <= 1).length;
      if (zeroConfDays >= 3) {
        risks.push({ risk: 'Avoidance spiral', severity: 'medium', action: 'Aurora proactive nudge: micro-task' });
      }
    }

    // Boom-bust cycle
    if (executionPattern === 'intense_but_inconsistent' && energyVariance > 2) {
      risks.push({ risk: 'Boom-bust cycle', severity: 'medium', action: 'Stabilize with fixed anchor tasks' });
    }

    // Stagnation
    if (executionPattern === 'consistent_but_plateaued' && energyVariance < 0.5 && moodInstability < 0.3) {
      risks.push({ risk: 'Stagnation', severity: 'low', action: 'Inject challenge upgrade, new milestone' });
    }

    // ── Compute current week number ─────────────────────
    let weekNumber = 1;
    if (planRes.data?.start_date) {
      const startDate = new Date(planRes.data.start_date);
      const diffDays = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);
    }

    // ── Determine adjustments ───────────────────────────
    const adjustments: Record<string, unknown> = {};

    if (complianceScore < 40) {
      adjustments.action = 'reduce_intensity';
      adjustments.reason = 'Compliance below 40% — reducing task count and extending deadlines';
    } else if (complianceScore > 70 && commitment >= 7) {
      adjustments.action = 'increase_intensity';
      adjustments.reason = 'High compliance + high commitment — optionally increasing intensity';
    } else {
      adjustments.action = 'maintain';
      adjustments.reason = 'Compliance in normal range — maintaining current plan';
    }

    if (recoveryDebtScore > 60) {
      adjustments.recovery_action = 'inject_recovery';
      adjustments.recovery_reason = 'Recovery debt high — adding recovery blocks and reducing cognitive load';
    }

    adjustments.scores = { compliance: complianceScore, cognitive_load: cognitiveLoadScore, recovery_debt: recoveryDebtScore };
    adjustments.pulse_summary = { days_logged: n, avg_energy: Math.round(avgEnergy * 10) / 10, avg_confidence: Math.round(avgConfidence * 10) / 10 };

    // ── Save recalibration log ──────────────────────────
    const { error: insertError } = await supabase.from('recalibration_logs').upsert({
      user_id,
      week_number: weekNumber,
      compliance_score: complianceScore,
      cognitive_load_score: cognitiveLoadScore,
      recovery_debt_score: recoveryDebtScore,
      adjustments_made: adjustments,
      behavioral_risks: risks,
    }, { onConflict: 'user_id,week_number' });

    if (insertError) {
      console.error('Failed to save recalibration log:', insertError);
    }

    // ── Queue proactive notifications if risks detected ─
    if (risks.length > 0) {
      const highRisks = risks.filter(r => r.severity === 'high');
      if (highRisks.length > 0) {
        await supabase.from('aurora_proactive_queue').insert({
          user_id,
          trigger_type: 'risk_alert',
          title: `⚠️ Behavioral risk detected: ${highRisks[0].risk}`,
          body: highRisks[0].action,
          scheduled_for: new Date().toISOString(),
          priority: 2,
          trigger_data: { risks: highRisks },
          idempotency_key: `risk_alert_w${weekNumber}_${user_id}`,
        });
      }
    }

    return new Response(JSON.stringify({
      status: 'recalibrated',
      week: weekNumber,
      compliance_score: complianceScore,
      cognitive_load_score: cognitiveLoadScore,
      recovery_debt_score: recoveryDebtScore,
      behavioral_risks: risks,
      adjustments,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Recalibration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
