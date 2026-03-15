import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCorsPreFlight } from "../_shared/cors.ts";

/**
 * daily-priority-rebalance
 * 
 * Runs once per day per user. Recalculates priority_score for all
 * open action_items based on:
 *  - Overdue status (highest boost)
 *  - Task urgency (due_at proximity)
 *  - Pillar balance (underrepresented pillars get boosted)
 *  - Habit streaks (recurring tasks with recent completions)
 *  - Energy phase alignment
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') return handleCorsPreFlight();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get target user_id from body, or rebalance ALL users (for cron)
    let targetUserId: string | null = null;
    try {
      const body = await req.json();
      targetUserId = body.user_id || null;
    } catch { /* no body = cron mode */ }

    // Get users who have open action items
    let userQuery = supabase
      .from('action_items')
      .select('user_id')
      .in('status', ['todo', 'doing'])
      .limit(500);

    if (targetUserId) {
      userQuery = userQuery.eq('user_id', targetUserId);
    }

    const { data: userRows } = await userQuery;
    const userIds = [...new Set((userRows || []).map((r: any) => r.user_id))];

    const today = new Date().toISOString().slice(0, 10);
    let totalUpdated = 0;

    for (const userId of userIds) {
      // Fetch all open items for this user
      const { data: items } = await supabase
        .from('action_items')
        .select('id, title, type, status, due_at, pillar, tags, recurrence_rule, order_index, priority_score, scheduled_date, time_block, energy_phase, metadata, xp_reward')
        .eq('user_id', userId)
        .in('status', ['todo', 'doing'])
        .in('type', ['task', 'habit', 'session'])
        .limit(100);

      if (!items || items.length === 0) continue;

      // Count completions per pillar in last 7 days
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: recentDone } = await supabase
        .from('action_items')
        .select('pillar')
        .eq('user_id', userId)
        .eq('status', 'done')
        .gte('completed_at', weekAgo);

      const pillarCounts: Record<string, number> = {};
      for (const d of (recentDone || [])) {
        if (d.pillar) pillarCounts[d.pillar] = (pillarCounts[d.pillar] || 0) + 1;
      }

      // Find underrepresented pillars
      const allPillars = [...new Set(items.map(i => i.pillar).filter(Boolean))];
      const avgCount = allPillars.length > 0
        ? Object.values(pillarCounts).reduce((a, b) => a + b, 0) / Math.max(1, allPillars.length)
        : 0;

      // Score each item
      const scored = items.map(item => {
        let score = 50; // base

        // Overdue boost
        if (item.due_at) {
          const dueDate = item.due_at.slice(0, 10);
          if (dueDate < today) {
            const daysOverdue = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
            score += Math.min(40, 15 + daysOverdue * 5); // up to +40
          } else if (dueDate === today) {
            score += 20; // due today
          } else {
            const daysUntil = Math.floor((new Date(dueDate).getTime() - Date.now()) / 86400000);
            score += Math.max(0, 10 - daysUntil * 2); // closer = higher
          }
        }

        // Scheduled for today
        if (item.scheduled_date === today) {
          score += 15;
        }

        // Pillar balance — boost underrepresented
        if (item.pillar) {
          const count = pillarCounts[item.pillar] || 0;
          if (count < avgCount * 0.5) {
            score += 15; // significantly underrepresented
          } else if (count < avgCount) {
            score += 8;
          }
        }

        // Habit continuity bonus
        if (item.type === 'habit' && item.recurrence_rule) {
          score += 10;
        }

        // Daily priority tag boost
        const tags = item.tags || [];
        if (tags.includes('daily_priority')) {
          score += 12;
        }

        // XP reward as tiebreaker
        score += Math.min(5, (item.xp_reward || 0) / 10);

        // Time block alignment with current energy
        const hour = new Date().getHours();
        if (item.energy_phase === 'morning' && hour < 12) score += 5;
        else if (item.energy_phase === 'evening' && hour >= 18) score += 5;

        return { id: item.id, priority_score: Math.round(score) };
      });

      // Batch update
      for (const s of scored) {
        await supabase
          .from('action_items')
          .update({ priority_score: s.priority_score })
          .eq('id', s.id);
      }

      totalUpdated += scored.length;
    }

    return new Response(
      JSON.stringify({ success: true, users: userIds.length, items_updated: totalUpdated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('daily-priority-rebalance error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
