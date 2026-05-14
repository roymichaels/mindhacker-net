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

  return useMemo(() => {
    if (!world) return null;
    const presenceLine = (isHe ? HE_PRESENCE : EN_PRESENCE)[presence] ?? '';
    const baseLine = isHe ? world.aionLineHe : world.aionLineEn;
    return {
      role: world.aionRole,
      verbs: world.interaction.verbs.map((v) => ({
        id: v.id,
        label: isHe ? v.labelHe : v.labelEn,
      })),
      presence,
      /** Composed line: world tagline + presence state. */
      line: presenceLine ? `${baseLine} · AION ${presenceLine}` : baseLine,
      shortLine: baseLine,
    };
  }, [world, presence, isHe]);
}
