/**
 * Tiny non-React bridge from `WorldGestureField` → world physics → dream
 * field. Lives outside React so the gesture handler can stay synchronous.
 */
import type { CognitiveWorldId } from '../types';
import type { GestureKind } from '@/worlds/gesture/types';
import { useGestureFieldStore } from '@/worlds/gesture/gestureFieldStore';
import { useSubconsciousFieldStore } from '@/worlds/dreams/subconsciousField';
import { getWorldPhysics } from './worldPhysicsRegistry';
import { attentionBus } from '@/aion/presence/attentionBus';

export function dispatchPhysicsGesture(
  worldId: CognitiveWorldId,
  kind: GestureKind,
  intensity: number,
  angle: number | null,
  focal: { x: number; y: number } | null,
) {
  // 5L.4 — gesture-as-atmosphere. Every gesture pulls AION's attention
  // briefly toward the touch focal, regardless of whether physics emits
  // a dream event. TTL scales with intensity (200..900ms).
  if (focal) {
    const ttl = Math.max(200, Math.min(900, 200 + Math.round(intensity * 700)));
    attentionBus.notice('world-node', focal, ttl);
  }

  const physics = getWorldPhysics(worldId);
  if (!physics?.onGesture) return;
  const energy = useGestureFieldStore.getState().get(worldId);
  const ev = physics.onGesture({
    worldId,
    kind,
    intensity,
    angle,
    focal,
    at: Date.now(),
    energy,
  });
  if (!ev) return;
  // Avoid duplicate active events for the same kind in the same world.
  const events = useSubconsciousFieldStore.getState().events;
  if (events.some((e) => e.worldId === ev.worldId && e.kind === ev.kind)) return;
  useSubconsciousFieldStore.getState().pushEvent(ev);
}