import React from 'react';
import { useEnvironment } from './EnvironmentProvider';

/**
 * MotionLayer applies global motion characteristics derived from the
 * current environment intensity. Phase 0: lightweight CSS variable injection
 * so child components can opt-in (`var(--aol-motion-scale)`).
 */
export function MotionLayer({ children }: { children: React.ReactNode }) {
  const { state, enabled } = useEnvironment();
  if (!enabled) return <>{children}</>;

  const scale = state.intensity === 0 ? 0.4
    : state.intensity === 1 ? 0.7
    : state.intensity === 2 ? 1.0
    : 1.0;
  const calmness = state.intensity <= 1 ? 1.6 : 1.0;

  return (
    <div
      data-aol-mode={state.mode}
      data-aol-intensity={state.intensity}
      style={{
        // Components can multiply their durations by this scale.
        ['--aol-motion-scale' as any]: String(scale),
        ['--aol-motion-calm' as any]: String(calmness),
      }}
    >
      {children}
    </div>
  );
}