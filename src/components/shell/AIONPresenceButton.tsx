/**
 * AIONPresenceButton — right-side presence chip.
 * Pulses based on the current brain decision; tap summons the AION dock/chat.
 * Replaces profile/avatar from the header.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useAionDecision } from '@/contexts/AionDecisionContext';
import { useTranslation } from '@/hooks/useTranslation';
import { recordSignal } from '@/services/aionSignals';
import { cn } from '@/lib/utils';
import { openInteractiveAION } from '@/components/aion/InteractiveAIONHost';
import OrbView, { type OrbViewState } from '@/components/orb/v2/OrbView';

interface PresenceVisual {
  hue: string;
  state: OrbViewState;
  pulseDuration: number;
}

function visualForMode(mode: string | undefined, isStreaming: boolean): PresenceVisual {
  if (isStreaming) return { hue: 'hsl(var(--primary))', state: 'responding', pulseDuration: 1.4 };
  switch (mode) {
    case 'focus':       return { hue: 'hsl(265 90% 65%)', state: 'focus',     pulseDuration: 2.6 };
    case 'recovery':    return { hue: 'hsl(20 85% 65%)',  state: 'recovery',  pulseDuration: 4.5 };
    case 'flow':        return { hue: 'hsl(180 80% 60%)', state: 'thinking',  pulseDuration: 2.6 };
    case 'overwhelmed': return { hue: 'hsl(350 85% 65%)', state: 'thinking',  pulseDuration: 1.4 };
    case 'hypnosis':    return { hue: 'hsl(290 80% 65%)', state: 'hypnosis',  pulseDuration: 4.5 };
    case 'calm':
    case 'neutral':
    default:            return { hue: 'hsl(var(--primary))', state: 'idle',   pulseDuration: 4.5 };
  }
}

export function AIONPresenceButton({ compact = false }: { compact?: boolean }) {
  const { language } = useTranslation();
  const { isStreaming } = useAuroraChatContext();
  const { decision } = useAionDecision();

  const visual = useMemo(
    () => visualForMode(decision?.mode, isStreaming),
    [decision?.mode, isStreaming],
  );

  const handleSummon = () => {
    void recordSignal('presence_summon', { mode: decision?.mode ?? 'neutral' });
    openInteractiveAION();
  };

  const size = compact ? 44 : 56;

  return (
    <button
      type="button"
      onClick={handleSummon}
      aria-label={language === 'he' ? 'AION נוכח' : 'AION presence'}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full focus:outline-none',
        'hover:scale-[1.06] active:scale-95 transition-transform',
      )}
      style={{ width: size, height: size }}
    >
      {/* Ambient halo — palette-matched, pulsing */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${visual.hue} 0%, transparent 70%)`,
          opacity: 0.45,
          filter: 'blur(2px)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
        transition={{
          duration: visual.pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Living core — real-time WebGL orb tunneled into shared stage */}
      <OrbView
        size={size - 8}
        state={visual.state}
        tintHue={visual.hue}
        className="relative"
      />
    </button>
  );
}

export default AIONPresenceButton;
