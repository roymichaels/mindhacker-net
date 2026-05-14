/**
 * useWorldAion — exposes AION's world-scoped framing.
 *
 * The visual orb stays canonical (CanonicalAionModel everywhere); only
 * the surrounding language and quick verbs shift per world.
 */
import { useMemo } from 'react';
import { useAionPresence } from '@/aion/presenceState';
import { useTranslation } from '@/hooks/useTranslation';
import { getWorld } from '../registry';
import { useWorldState } from '../state/useWorldState';
import { useAionContinuity } from '../continuity/useAionContinuity';
import type { CognitiveWorldId } from '../types';

const HE_PRESENCE: Record<string, string> = {
  resting: 'נמצא איתך',
  listening: 'מקשיב',
  noticing: 'שם לב',
  forming: 'מעבד מחשבה',
  manifesting: 'מתגלם',
  evolving: 'מתפתח איתך',
};
const EN_PRESENCE: Record<string, string> = {
  resting: 'is here with you',
  listening: 'is listening',
  noticing: 'is noticing',
  forming: 'is forming a thought',
  manifesting: 'is manifesting',
  evolving: 'is evolving with you',
};

export function useWorldAion(worldId: CognitiveWorldId) {
  const presence = useAionPresence();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const world = getWorld(worldId);
  const state = useWorldState(worldId);
  const continuity = useAionContinuity();

  return useMemo(() => {
    if (!world) return null;
    const presenceLine = (isHe ? HE_PRESENCE : EN_PRESENCE)[presence] ?? '';
    const baseLine = isHe ? world.aionLineHe : world.aionLineEn;

    // Continuity-aware coloring — AION sounds aware of recurring themes,
    // unresolved loops, and the dominant climate as state accumulates.
    let awareness = '';
    const recurringHere = continuity.recurringThemes.find((t) => t.worlds.includes(worldId));
    const tensionHere = continuity.unresolvedLoops.find((l) => l.worldId === worldId);
    if (recurringHere && recurringHere.count >= 3) {
      awareness = isHe
        ? `שמתי לב שאתה חוזר ל"${recurringHere.label}"`
        : `I notice you keep returning to “${recurringHere.label}”`;
    } else if (tensionHere) {
      awareness = isHe
        ? 'משהו פה עוד לא נפתר'
        : 'something here is still unresolved';
    } else if (state.climate === 'turbulent') {
      awareness = isHe ? 'יש פה תנועה חזקה כרגע' : 'there is strong motion here right now';
    } else if (state.climate === 'heavy') {
      awareness = isHe ? 'יש פה כובד' : 'there is weight here';
    } else if (state.climate === 'open') {
      awareness = isHe ? 'משהו פה נפתח' : 'something here is opening';
    }

    const composed = [baseLine, awareness, presenceLine ? `AION ${presenceLine}` : null]
      .filter(Boolean)
      .join(' · ');

    return {
      role: world.aionRole,
      verbs: world.interaction.verbs.map((v) => ({
        id: v.id,
        label: isHe ? v.labelHe : v.labelEn,
      })),
      presence,
      /** Composed line: world tagline + continuity awareness + presence. */
      line: composed,
      shortLine: baseLine,
      awareness,
      climate: state.climate,
      momentum: state.momentum,
      continuity,
    };
  }, [world, presence, isHe, state.climate, state.momentum, continuity, worldId]);
}
