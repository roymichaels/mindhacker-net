/**
 * WorldGestureField — Phase 5C.6 "Gesture as Atmosphere".
 *
 * A transparent, world-scoped input layer that converts raw pointer/touch
 * activity into psychological gestures:
 *
 *   - dwell      ≥ 600ms hold        → first verb (contemplative)
 *   - swipe-up   ≥ 40px, fast        → second verb (lift)
 *   - swipe-down ≥ 40px, fast        → third verb (release)
 *   - swipe-h    ≥ 40px, fast        → fourth verb (connect)
 *   - pulse      3 taps within 800ms → last verb (name / create)
 *
 * Every gesture also bumps `gestureFieldStore` so the climate runtime
 * thickens / loosens / charges the atmosphere in response. There is NO
 * visible button. The world itself is the affordance.
 *
 * A faint ripple anchors at the touch point during a gesture, then
 * dissolves. Opacity ≤ 0.35 by design — peripheral, not foregrounded.
 */
import { useEffect, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestureFieldStore } from '@/worlds/gesture/gestureFieldStore';
import { resolveVerbForGesture } from '@/worlds/gesture/gestureBindings';
import { useGraphMutator, inferKindFromVerb } from '@/worlds/graph/useGraphMutator';
import { getAtmospherePreset } from '@/worlds/atmosphere/atmospherePresets';
import { dispatchPhysicsGesture } from '@/worlds/physics/dispatchGesture';
import type { CognitiveWorldId } from '@/worlds/types';
import type { GestureKind } from '@/worlds/gesture/types';

interface Props {
  worldId: CognitiveWorldId;
  verbs: { id: string; label: string }[];
}

const DWELL_MS = 600;
const SWIPE_PX = 40;
const SWIPE_MAX_MS = 600;
const TAP_WINDOW_MS = 800;
const TAP_THRESHOLD = 3;

export default function WorldGestureField({ worldId, verbs }: Props) {
  const preset = getAtmospherePreset(worldId);
  const accent = `hsl(${preset.accentHsl})`;
  const mutate = useGraphMutator();
  const pushDwell = useGestureFieldStore((s) => s.pushDwell);
  const pushSwipe = useGestureFieldStore((s) => s.pushSwipe);
  const pushPulse = useGestureFieldStore((s) => s.pushPulse);

  const fireRef = useRef((kind: GestureKind) => {
    const verbId = resolveVerbForGesture(worldId, kind, verbs);
    if (!verbId) return;
    const v = verbs.find((x) => x.id === verbId);
    if (!v) return;
    mutate({
      worldId,
      kind: inferKindFromVerb(v.id),
      verb: v.id,
      label: v.label,
      meaning: v.label,
    });
  });

  // Keep latest fire closure (verbs/worldId can change).
  useEffect(() => {
    fireRef.current = (kind: GestureKind) => {
      const verbId = resolveVerbForGesture(worldId, kind, verbs);
      if (!verbId) return;
      const v = verbs.find((x) => x.id === verbId);
      if (!v) return;
      mutate({
        worldId,
        kind: inferKindFromVerb(v.id),
        verb: v.id,
        label: v.label,
        meaning: v.label,
      });
    };
  }, [worldId, verbs, mutate]);

  // Pointer + tap state held in refs so React re-renders stay rare.
  const stateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    dwellTimer: 0 as number,
    dwellFired: false,
    tapTimes: [] as number[],
    focal: { x: 0.5, y: 0.5 },
    rippleSeq: 0,
  });

  // Force re-render only when ripple changes.
  const rippleRef = useRef<{ id: number; x: number; y: number; kind: GestureKind } | null>(null);
  const [, forceTick] = useReducerTick();

  useEffect(() => {
    const handleStart = (e: PointerEvent) => {
      if (!isFromField(e)) return;
      const s = stateRef.current;
      const now = performance.now();
      s.active = true;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.startTime = now;
      s.dwellFired = false;
      s.focal = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };
      window.clearTimeout(s.dwellTimer);
      s.dwellTimer = window.setTimeout(() => {
        if (!s.active || s.dwellFired) return;
        s.dwellFired = true;
        pushDwell(worldId, 0.55, s.focal);
        showRipple('dwell', s.focal);
        fireRef.current('dwell');
        dispatchPhysicsGesture(worldId, 'dwell', 0.55, null, s.focal);
      }, DWELL_MS);
    };

    const handleMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.active) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      // Cancel dwell once finger drifts.
      if (Math.hypot(dx, dy) > 12 && !s.dwellFired) {
        window.clearTimeout(s.dwellTimer);
      }
    };

    const handleEnd = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.active) return;
      s.active = false;
      window.clearTimeout(s.dwellTimer);
      const now = performance.now();
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      const dt = now - s.startTime;
      const dist = Math.hypot(dx, dy);
      const focal = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight };

      // Swipe?
      if (dist >= SWIPE_PX && dt <= SWIPE_MAX_MS) {
        const angle = Math.atan2(dy, dx);
        const speed = Math.min(1, dist / 240);
        const intensity = 0.4 + speed * 0.5;
        pushSwipe(worldId, intensity, angle, focal);
        const kind: GestureKind =
          Math.abs(dy) > Math.abs(dx)
            ? dy < 0 ? 'swipe-up' : 'swipe-down'
            : 'swipe-h';
        showRipple(kind, focal);
        fireRef.current(kind);
        dispatchPhysicsGesture(worldId, kind, intensity, angle, focal);
        return;
      }

      // Tap (short, low distance, dwell didn't fire).
      if (!s.dwellFired && dt < DWELL_MS && dist < 12) {
        s.tapTimes = [...s.tapTimes, now].filter((t) => now - t <= TAP_WINDOW_MS);
        if (s.tapTimes.length >= TAP_THRESHOLD) {
          pushPulse(worldId, 0.7, focal);
          showRipple('pulse', focal);
          fireRef.current('pulse');
          dispatchPhysicsGesture(worldId, 'pulse', 0.7, null, focal);
          s.tapTimes = [];
        } else {
          // Single tap = a whisper to the field. No verb.
          pushDwell(worldId, 0.12, focal);
          showRipple('tap', focal);
          dispatchPhysicsGesture(worldId, 'tap', 0.12, null, focal);
        }
      }
    };

    const handleCancel = () => {
      const s = stateRef.current;
      s.active = false;
      window.clearTimeout(s.dwellTimer);
    };

    function showRipple(kind: GestureKind, focal: { x: number; y: number }) {
      const s = stateRef.current;
      s.rippleSeq += 1;
      rippleRef.current = { id: s.rippleSeq, x: focal.x, y: focal.y, kind };
      forceTick();
      const myId = s.rippleSeq;
      window.setTimeout(() => {
        if (rippleRef.current?.id === myId) {
          rippleRef.current = null;
          forceTick();
        }
      }, kind === 'dwell' ? 1400 : 900);
    }

    function isFromField(e: PointerEvent): boolean {
      // Ignore events that started on interactive elements that opted out
      // by setting `data-no-gesture-field` somewhere in their ancestry.
      const target = e.target as Element | null;
      return !target?.closest?.('[data-no-gesture-field], button, a, input, textarea, [role="button"]');
    }

    const el = document.getElementById(`world-gesture-field-${worldId}`);
    if (!el) return;
    el.addEventListener('pointerdown', handleStart as EventListener);
    el.addEventListener('pointermove', handleMove as EventListener);
    el.addEventListener('pointerup', handleEnd as EventListener);
    el.addEventListener('pointercancel', handleCancel as EventListener);
    el.addEventListener('pointerleave', handleCancel as EventListener);
    return () => {
      el.removeEventListener('pointerdown', handleStart as EventListener);
      el.removeEventListener('pointermove', handleMove as EventListener);
      el.removeEventListener('pointerup', handleEnd as EventListener);
      el.removeEventListener('pointercancel', handleCancel as EventListener);
      el.removeEventListener('pointerleave', handleCancel as EventListener);
    };
  }, [worldId, pushDwell, pushSwipe, pushPulse]);

  const ripple = rippleRef.current;

  return (
    <div
      id={`world-gesture-field-${worldId}`}
      className="absolute inset-0 z-[5]"
      style={{ touchAction: 'pan-y', background: 'transparent' }}
      aria-hidden
      data-no-gesture-field-passthrough
    >
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: ripple.kind === 'dwell' ? 0.32 : 0.22, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: ripple.kind === 'dwell' ? 1.2 : 0.8, ease: 'easeOut' }}
            className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
            style={{
              left: `${ripple.x * 100}%`,
              top: `${ripple.y * 100}%`,
              background: `radial-gradient(circle, ${accent}, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tiny re-render trigger without bringing a state library along. */
function useReducerTick() {
  return useReducer((n: number) => (n + 1) % 1_000_000, 0);
}
