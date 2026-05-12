/**
 * Pillar → Room mapping.
 *
 * Phase 2: the 14 legacy life pillars (defined in `src/flows/pillarSpecs/index.ts`
 * as `PILLAR_QUESTS`) federate into the 6 canonical rooms. This file is the
 * single source of truth for that mapping. Do NOT scatter pillar-to-room
 * assignments elsewhere.
 *
 * Reading direction:
 *   pillarId  → roomId            (forward, used by old surfaces being lifted)
 *   roomId    → pillarId[]        (reverse, used by RoomEnvironment to list
 *                                  the federated quests inside a room)
 */
import type { RoomId } from './types';

/** Canonical mapping. Every pillar must appear in exactly one room. */
export const PILLAR_TO_ROOM: Readonly<Record<string, RoomId>> = {
  consciousness: 'beliefs',
  spirituality: 'beliefs',

  mind: 'emotions',

  combat: 'parts',
  romantics: 'parts',
  relationships: 'parts',
  social: 'parts',

  order: 'time',
  career: 'time',
  money: 'time',

  presence: 'identity',

  health: 'body',
  play: 'body',
  creativity: 'body',
} as const;

export function roomForPillar(pillarId: string | null | undefined): RoomId | null {
  if (!pillarId) return null;
  return PILLAR_TO_ROOM[pillarId] ?? null;
}

export function pillarsForRoom(roomId: RoomId): string[] {
  return Object.entries(PILLAR_TO_ROOM)
    .filter(([, r]) => r === roomId)
    .map(([p]) => p);
}