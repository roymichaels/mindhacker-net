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

interface PresenceVisual {
  hue: string;
  pulse: 'slow' | 'medium' | 'fast';
}

function visualForMode(mode: string | undefined, isStreaming: boolean): PresenceVisual {
  if (isStreaming) return { hue: 'hsl(var(--primary))', pulse: 'fast' };
  switch (mode) {
    case 'focus':
      return { hue: 'hsl(265 90% 65%)', pulse: 'medium' };
    case 'recovery':
      return { hue: 'hsl(20 85% 65%)', pulse: 'slow' };
    case 'flow':
      return { hue: 'hsl(180 80% 60%)', pulse: 'medium' };
    case 'overwhelmed':
      return { hue: 'hsl(350 85% 65%)', pulse: 'fast' };
    case 'hypnosis':
      return { hue: 'hsl(290 80% 65%)', pulse: 'slow' };
    case 'calm':
    case 'neutral':
    default:
      return { hue: 'hsl(var(--primary))', pulse: 'slow' };
  }
}

const PULSE_DURATION: Record<PresenceVisual['pulse'], number> = {
  slow: 4.5,
  medium: 2.6,
  fast: 1.4,
};

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

  const size = compact ? 32 : 36;

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
      {/* Outer pulse ring */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${visual.hue} 0%, transparent 70%)`,
          opacity: 0.5,
        }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0.15, 0.45] }}
        transition={{
          duration: PULSE_DURATION[visual.pulse],
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Core orb */}
      <span
        className="relative inline-block rounded-full ring-1 ring-white/25"
        style={{
          width: size - 14,
          height: size - 14,
          background: `radial-gradient(circle at 30% 30%, hsl(0 0% 100% / 0.6), ${visual.hue} 60%, hsl(0 0% 0% / 0.5) 100%)`,
          boxShadow: `0 0 18px ${visual.hue}`,
        }}
      />
    </button>
  );
}

export default AIONPresenceButton;
