/**
 * AmbientGesture — Phase 5C Wave 1.
 *
 * Replaces `WorldComposer` with a single ambient affordance: a faint
 * breathing glyph at the bottom edge of the world. Tap-and-hold = the
 * world responds (cycling through the world's verbs under the hood via
 * the existing mutation pipeline). Release = the response settles back
 * into the atmosphere.
 *
 * Verbs are gestures, not menu items. Names appear briefly during the
 * hold, then dissolve.
 */
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGraphMutator, inferKindFromVerb } from '@/worlds/graph/useGraphMutator';
import { getAtmospherePreset } from '@/worlds/atmosphere/atmospherePresets';
import type { CognitiveWorldId } from '@/worlds/types';

interface Verb { id: string; label: string }

interface Props {
  worldId: CognitiveWorldId;
  verbs: Verb[];
}

export default function AmbientGesture({ worldId, verbs }: Props) {
  const preset = getAtmospherePreset(worldId);
  const accent = `hsl(${preset.accentHsl})`;
  const mutate = useGraphMutator();
  const [holding, setHolding] = useState(false);
  const [activeVerb, setActiveVerb] = useState<Verb | null>(null);
  const cursorRef = useRef(0);

  if (!verbs?.length) return null;

  const begin = () => {
    const v = verbs[cursorRef.current % verbs.length];
    cursorRef.current = (cursorRef.current + 1) % verbs.length;
    setActiveVerb(v);
    setHolding(true);
  };

  const end = () => {
    if (activeVerb) {
      mutate({
        worldId,
        kind: inferKindFromVerb(activeVerb.id),
        verb: activeVerb.id,
        label: activeVerb.label,
        meaning: activeVerb.label,
      });
    }
    setHolding(false);
    // Let the verb name linger a beat, then dissolve.
    window.setTimeout(() => setActiveVerb(null), 700);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-center pb-[max(env(safe-area-inset-bottom),28px)]">
      <AnimatePresence>
        {activeVerb && (
          <motion.div
            key={activeVerb.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="mb-3 text-[11px] uppercase tracking-[0.32em] text-foreground/70"
          >
            {activeVerb.label}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="touch the world"
        onPointerDown={begin}
        onPointerUp={end}
        onPointerLeave={() => holding && end()}
        onPointerCancel={end}
        className="pointer-events-auto relative h-12 w-12 rounded-full"
        style={{ touchAction: 'none' }}
        animate={{ scale: holding ? 1.18 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Outer halo — breathes in the world's accent */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
          animate={{ opacity: holding ? [0.55, 0.85, 0.55] : [0.25, 0.5, 0.25] }}
          transition={{ duration: holding ? 1.2 : 3.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Core glyph */}
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
          animate={{ scale: holding ? [1, 1.6, 1] : [0.9, 1.1, 0.9] }}
          transition={{ duration: holding ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.button>
    </div>
  );
}