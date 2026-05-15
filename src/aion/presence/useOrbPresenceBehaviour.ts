/**
 * useOrbPresenceBehaviour — Phase 5D.1.
 *
 * AION presence becomes behavioural, not just rendered. Reads:
 *   - active ViewIdentity anchor (5C.8) → base position
 *   - AION presence state (listening/forming/etc) → scale bias
 *   - pointer position (when present) → small "anticipate" drift
 *   - last-route-change timestamp → "precede" lift on entry
 *   - long idleness → "observe" still + breath
 *
 * Output: lerp-smoothed CSS variables published to <html>:
 *   --aion-orb-cx, --aion-orb-cy   (vh/vw normalised, 0..100)
 *   --aion-orb-scale               (multiplier, default 1)
 *   --aion-orb-mood                ('anticipate' | 'observe' | 'precede' | 'rest')
 *
 * Surfaces and primitives can read these vars without coupling to the
 * orb's render path. The orb itself is positioned by its host today;
 * this hook does not move it directly — it broadcasts an *intent* the
 * future orb-host can subscribe to (and that scene primitives can use
 * for parallax-style attentional pull).
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAionPresence } from '@/aion/presenceState';
import { useActiveViewIdentity } from '@/viewIdentity';
import { BEHAVIOR_PROFILE, behaviorFromPresence } from '@/aion/presence/orbBehavior';
import { attentionBus } from '@/aion/presence/attentionBus';
import { realmTransitionBus } from '@/shellv2/transitions/realmTransitionBus';
import { moodForPath } from '@/aion/realms/realmMood';
import { aionPresenceBus } from '@/aion/presenceState';

const PRESENCE_SCALE: Record<string, number> = {
  listening: 1.00,
  noticing: 1.04,
  forming: 1.08,
  manifesting: 1.12,
  resting: 0.92,
  evolving: 1.06,
};

const IDLE_MS = 12000;

function reducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function useOrbPresenceBehaviour(): void {
  const view = useActiveViewIdentity();
  const presence = useAionPresence();
  const location = useLocation();

  const cx = useRef(view.spatial.orbX * 100);
  const cy = useRef(view.spatial.orbY * 100);
  const sc = useRef(view.spatial.orbScale);
  const targetCx = useRef(view.spatial.orbX * 100);
  const targetCy = useRef(view.spatial.orbY * 100);
  const targetSc = useRef(view.spatial.orbScale);
  const moodRef = useRef<'anticipate' | 'observe' | 'precede' | 'rest'>('rest');

  const lastRouteChange = useRef<number>(Date.now());
  const lastActivity = useRef<number>(Date.now());
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number | null>(null);

  // Update targets when view or presence changes.
  useEffect(() => {
    targetCx.current = view.spatial.orbX * 100;
    targetCy.current = view.spatial.orbY * 100;
    targetSc.current = view.spatial.orbScale * (PRESENCE_SCALE[presence] ?? 1);
  }, [view, presence]);

  // Mark route entry — triggers "precede" mood briefly.
  useEffect(() => {
    lastRouteChange.current = Date.now();
    moodRef.current = 'precede';
    // Lift slightly above resting Y so AION arrives first.
    targetCy.current = Math.max(8, view.spatial.orbY * 100 - 6);
    const t = window.setTimeout(() => {
      targetCy.current = view.spatial.orbY * 100;
      moodRef.current = 'rest';
    }, 1400);
    return () => window.clearTimeout(t);
  }, [location.pathname, view]);

  // 5N.3 — orb continuity across realm transitions.
  // departing → guiding, arriving → resonating, idle → realm default mood.
  useEffect(() => {
    return realmTransitionBus.subscribe((frame) => {
      if (frame.phase === 'departing') {
        aionPresenceBus.set('manifesting'); // maps to 'guiding' behavior
      } else if (frame.phase === 'arriving') {
        aionPresenceBus.set('noticing');    // brief resonant lean
      } else if (frame.phase === 'idle') {
        const mood = moodForPath(location.pathname);
        if (!mood) return;
        // Map realm default behavior back through presence vocabulary.
        const map: Record<string, Parameters<typeof aionPresenceBus.set>[0]> = {
          listening: 'listening',
          noticing: 'noticing',
          thinking: 'forming',
          guiding: 'manifesting',
          resonating: 'noticing',
          evolving: 'evolving',
          resting: 'resting',
          hesitating: 'resting',
          dreaming: 'resting',
        };
        aionPresenceBus.set(map[mood.presence] ?? 'listening');
      }
    });
  }, [location.pathname]);

  // Pointer + activity tracking.
  useEffect(() => {
    if (reducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      lastActivity.current = Date.now();
    };
    const onLeave = () => { pointer.current = null; };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  // RAF loop — lerp toward targets and write CSS vars.
  useEffect(() => {
    const root = document.documentElement;
    const tick = () => {
      const now = Date.now();
      const idleFor = now - lastActivity.current;

      // Mood resolution (precede has its own timer above).
      if (moodRef.current !== 'precede') {
        if (idleFor > IDLE_MS) moodRef.current = 'observe';
        else if (pointer.current) moodRef.current = 'anticipate';
        else moodRef.current = 'rest';
      }

      // Anticipate drift — pull ~6% of the viewport toward the pointer's
      // cardinal direction relative to the base anchor.
      let extraX = 0;
      let extraY = 0;
      if (moodRef.current === 'anticipate' && pointer.current) {
        const w = window.innerWidth || 1;
        const h = window.innerHeight || 1;
        extraX = ((pointer.current.x / w) - view.spatial.orbX) * 6;
        extraY = ((pointer.current.y / h) - view.spatial.orbY) * 4;
      } else if (moodRef.current === 'observe') {
        // Slight breath — ±0.3vh sinusoid handled below via scale, position stays.
      }

      const desiredCx = targetCx.current + extraX;
      const desiredCy = targetCy.current + extraY;
      const desiredSc = targetSc.current + (moodRef.current === 'observe'
        ? Math.sin(now / 1800) * 0.015
        : 0);

      const lerp = 0.05;
      cx.current += (desiredCx - cx.current) * lerp;
      cy.current += (desiredCy - cy.current) * lerp;
      sc.current += (desiredSc - sc.current) * lerp;

      root.style.setProperty('--aion-orb-cx', cx.current.toFixed(2));
      root.style.setProperty('--aion-orb-cy', cy.current.toFixed(2));
      root.style.setProperty('--aion-orb-scale', sc.current.toFixed(3));
      root.style.setProperty('--aion-orb-mood', moodRef.current);

      // 5L.1 — publish behavioural profile so atmosphere/shaders/surfaces
      // can read drift / pulse / glow / influence without per-state branches.
      const profile = BEHAVIOR_PROFILE[behaviorFromPresence(presence)];
      root.style.setProperty('--aion-orb-drift', profile.drift.toFixed(3));
      root.style.setProperty('--aion-orb-pulse-rate', profile.pulseRate.toFixed(3));
      root.style.setProperty('--aion-orb-glow', profile.glow.toFixed(3));
      root.style.setProperty('--aion-orb-influence', profile.influence.toFixed(3));

      raf.current = window.requestAnimationFrame(tick);
    };
    raf.current = window.requestAnimationFrame(tick);
    return () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [view, presence]);

  // 5L.2 — attention pull. When the bus carries a focal point, bias the
  // base target by up to ±6vw / ±4vh toward it (clamped). Reuses the same
  // RAF loop above through targetCx/targetCy state mutation.
  useEffect(() => {
    return attentionBus.subscribe((frame) => {
      if (!frame.focal || frame.target === 'idle') {
        // Restore base anchor.
        targetCx.current = view.spatial.orbX * 100;
        targetCy.current = view.spatial.orbY * 100;
        return;
      }
      const baseX = view.spatial.orbX * 100;
      const baseY = view.spatial.orbY * 100;
      const dx = (frame.focal.x * 100 - baseX) * 0.10;
      const dy = (frame.focal.y * 100 - baseY) * 0.08;
      // Clamp tug.
      targetCx.current = baseX + Math.max(-6, Math.min(6, dx));
      targetCy.current = baseY + Math.max(-4, Math.min(4, dy));
    });
  }, [view]);
}

/** Mountable bridge — drop into ShellV2 to activate behaviour globally. */
import type { FC } from 'react';
export const OrbPresenceBridge: FC = () => {
  useOrbPresenceBehaviour();
  return null;
};