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
import { pickLang } from '@/lib/i18nPick';

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
const ES_PRESENCE: Record<string, string> = {
  resting: 'está contigo',
  listening: 'está escuchando',
  noticing: 'está observando',
  forming: 'está formando un pensamiento',
  manifesting: 'se está manifestando',
  evolving: 'evoluciona contigo',
};

export function useWorldAion(worldId: CognitiveWorldId) {
  const presence = useAionPresence();
  const { language } = useTranslation();
  const world = getWorld(worldId);
  const state = useWorldState(worldId);
  const continuity = useAionContinuity();

  return useMemo(() => {
    if (!world) return null;
    const presenceMap =
      language === 'he' ? HE_PRESENCE : language === 'es' ? ES_PRESENCE : EN_PRESENCE;
    const presenceLine = presenceMap[presence] ?? '';
    const baseLine = pickLang(language, {
      he: world.aionLineHe,
      en: world.aionLineEn,
      // World definitions only carry he/en today; Spanish falls back to en.
      es: world.aionLineEn,
    });

    // Continuity-aware coloring — AION sounds aware of recurring themes,
    // unresolved loops, and the dominant climate as state accumulates.
    let awareness = '';
    const recurringHere = continuity.recurringThemes.find((t) => t.worlds.includes(worldId));
    const tensionHere = continuity.unresolvedLoops.find((l) => l.worldId === worldId);
    if (recurringHere && recurringHere.count >= 3) {
      awareness = pickLang(language, {
        he: `שמתי לב שאתה חוזר ל"${recurringHere.label}"`,
        en: `I notice you keep returning to “${recurringHere.label}”`,
        es: `Noto que sigues volviendo a "${recurringHere.label}"`,
      });
    } else if (tensionHere) {
      awareness = pickLang(language, {
        he: 'משהו פה עוד לא נפתר',
        en: 'something here is still unresolved',
        es: 'algo aquí aún no está resuelto',
      });
    } else if (state.climate === 'turbulent') {
      awareness = pickLang(language, {
        he: 'יש פה תנועה חזקה כרגע',
        en: 'there is strong motion here right now',
        es: 'hay un movimiento fuerte aquí ahora mismo',
      });
    } else if (state.climate === 'heavy') {
      awareness = pickLang(language, {
        he: 'יש פה כובד',
        en: 'there is weight here',
        es: 'hay peso aquí',
      });
    } else if (state.climate === 'open') {
      awareness = pickLang(language, {
        he: 'משהו פה נפתח',
        en: 'something here is opening',
        es: 'algo aquí se está abriendo',
      });
    }

    const composed = [baseLine, awareness, presenceLine ? `AION ${presenceLine}` : null]
      .filter(Boolean)
      .join(' · ');

    return {
      role: world.aionRole,
      verbs: world.interaction.verbs.map((v) => ({
        id: v.id,
        label: pickLang(language, { he: v.labelHe, en: v.labelEn, es: v.labelEn }),
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
  }, [world, presence, language, state.climate, state.momentum, continuity, worldId]);
}
