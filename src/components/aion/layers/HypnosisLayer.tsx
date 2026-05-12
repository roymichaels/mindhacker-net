/**
 * HypnosisLayer — immersive modifier for Interactive AION Mode.
 *
 * Phase 7 of Interactive AION (see `.lovable/plan.md`). Wraps the surface
 * with:
 *   - dimmed backdrop (additional dark veil)
 *   - slow breathing radial pulse synced to a 4s-in / 6s-out cadence
 *   - cycling guided caption ("שאף... עצור... נשוף...")
 *   - soft "exit" affordance
 *
 * Visual-only — does NOT invoke `generate-hypnosis-script` or `ai-hypnosis`
 * edge functions. Audio playback / scripted induction lives in
 * `src/pages/HypnosisPage.tsx` and `src/services/hypnosis.ts`.
 *
 * Toggle via the global `aion:hypnosis` event:
 *   window.dispatchEvent(new CustomEvent('aion:hypnosis', { detail: { active: true } }))
 *
 * When active, callers should set AION live state to `immersive`.
 */
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const PHASES = [
  { label: 'שאף', duration: 4000 },
  { label: 'עצור', duration: 2000 },
  { label: 'נשוף', duration: 6000 },
] as const;

type HypnosisLayerProps = {
  active: boolean;
  onExit: () => void;
};

export default function HypnosisLayer({ active, onExit }: HypnosisLayerProps) {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (!active) return;
    setPhaseIdx(0);
    let i = 0;
    const tick = () => {
      i = (i + 1) % PHASES.length;
      setPhaseIdx(i);
    };
    let t = window.setTimeout(function loop() {
      tick();
      t = window.setTimeout(loop, PHASES[i].duration);
    }, PHASES[0].duration);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!active) return null;

  const phase = PHASES[phaseIdx];

  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      {/* Dim veil */}
      <div className="absolute inset-0 bg-background/60 transition-opacity duration-1000" />

      {/* Breathing radial pulse — synced to phase duration */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(45% 35% at 50% 38%, hsl(var(--primary) / 0.35), transparent 70%)',
          animation: `aion-breath ${PHASES.reduce((s, p) => s + p.duration, 0)}ms ease-in-out infinite`,
        }}
      />

      {/* Phase caption */}
      <div
        className="absolute inset-x-0 top-[68%] text-center text-foreground/85 text-3xl font-light tracking-widest transition-opacity duration-700"
        key={phaseIdx}
      >
        {phase.label}
      </div>

      {/* Exit affordance */}
      <button
        type="button"
        onClick={onExit}
        aria-label="צא ממצב היפנוזה"
        className="pointer-events-auto absolute bottom-[calc(env(safe-area-inset-bottom)+24px)] left-1/2 -translate-x-1/2 h-10 px-4 rounded-full bg-card/60 backdrop-blur-md border border-white/10 text-xs text-foreground/80 flex items-center gap-2"
      >
        <X className="h-3.5 w-3.5" />
        צא
      </button>

      <style>{`
        @keyframes aion-breath {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          33%      { opacity: 0.9;  transform: scale(1.06); }
          50%      { opacity: 0.85; transform: scale(1.04); }
          83%      { opacity: 0.4;  transform: scale(0.96); }
        }
      `}</style>
    </div>
  );
}