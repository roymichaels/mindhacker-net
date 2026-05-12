/**
 * StateTransition — soft cinematic cross-fade overlay played whenever the
 * active consciousness state changes. Replaces "navigation" feel with
 * "I just moved through something" feel.
 */
import { useEffect, useState } from 'react';
import { useActiveState } from './useActiveState';

export default function StateTransition() {
  const state = useActiveState();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (state.source === 'boot') return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 900);
    return () => window.clearTimeout(t);
  }, [state.changedAt, state.source]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-30 bg-foreground/5 backdrop-blur-md transition-opacity duration-700 ease-out ${
        pulse ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
}