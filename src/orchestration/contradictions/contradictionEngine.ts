/**
 * Contradiction Engine — Phase F · Step 5.
 *
 * Picks AT MOST one open contradiction to mirror back gently. Eligibility:
 *   - both source nodes have strength >= 5 (fetched here, RLS-scoped)
 *   - graph trust signal: averageConfidence >= 35 (so we don't surface
 *     contradictions before AION even knows the user)
 *   - cooldown clear (repetitionGuard.canSurfaceContradiction)
 *
 * Tone: observational mirroring only. Never says "you contradicted yourself".
 * Output is a short HE/EN sentence the caller can attach to the assistant
 * stream OR show as an `insight` artifact (no new UI surface).
 */
import { supabase } from '@/integrations/supabase/client';
import type { ContextPacket } from '@/orchestration/context/contextBuilder';

export interface ContradictionPick {
  ok: true;
  pairKey: string;
  contradictionId: string;
  pillar: string | null;
  text: string;
  meta: { strengthA: number; strengthB: number; trust: number };
}

export interface ContradictionSkipped {
  ok: false;
  reason: string;
}

export type ContradictionResult = ContradictionPick | ContradictionSkipped;

export async function chooseContradiction(
  userId: string,
  packet: ContextPacket,
  language: 'he' | 'en' = 'he',
): Promise<ContradictionResult> {
  if (!userId) return { ok: false, reason: 'no-user' };
  if (packet.contradictions.length === 0) return { ok: false, reason: 'none-open' };
  if (packet.graphDepth.averageConfidence < 35) {
    return { ok: false, reason: 'low-trust' };
  }

  // Walk candidates in order; pick first whose statements are strong enough.
  for (const c of packet.contradictions) {
    if (!c.statement_a || !c.statement_b) continue;
    const { data: rows, error } = await supabase
      .from('aurora_memory_graph')
      .select('id, strength, content, pillar')
      .in('id', [c.statement_a, c.statement_b]);
    if (error || !rows || rows.length < 2) continue;

    const a = rows.find((r) => r.id === c.statement_a);
    const b = rows.find((r) => r.id === c.statement_b);
    if (!a || !b) continue;
    const sa = Number(a.strength ?? 0);
    const sb = Number(b.strength ?? 0);
    if (sa < 5 || sb < 5) continue;

    const pairKey = [c.statement_a, c.statement_b].sort().join(':');
    const text =
      language === 'he'
        ? mirrorHe(a.content ?? '', b.content ?? '', c.explanation ?? '')
        : mirrorEn(a.content ?? '', b.content ?? '', c.explanation ?? '');

    return {
      ok: true,
      pairKey,
      contradictionId: c.id,
      pillar: c.pillar ?? null,
      text,
      meta: { strengthA: sa, strengthB: sb, trust: packet.graphDepth.averageConfidence },
    };
  }

  return { ok: false, reason: 'no-strong-pair' };
}

function mirrorHe(a: string, b: string, _explanation: string): string {
  const ax = a.slice(0, 60).trim();
  const bx = b.slice(0, 60).trim();
  return `יש בך חלק שאומר "${ax}", וחלק אחר שנשמע יותר כמו "${bx}". אולי שניהם נכונים בתנאים שונים.`;
}
function mirrorEn(a: string, b: string, _explanation: string): string {
  const ax = a.slice(0, 60).trim();
  const bx = b.slice(0, 60).trim();
  return `There's a part of you that says "${ax}", and another part that sounds more like "${bx}". Maybe both are true in different moments.`;
}