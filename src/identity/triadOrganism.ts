/**
 * triadOrganism — Phase 5L.7.
 *
 * AION + DNA + Avatar behave as one reactive organism. This hook reads
 * the three identities and writes a small set of CSS variables on
 * `<html>` so any surface (orb shader, atmosphere, avatar posture)
 * can react without coupling to identity hooks directly.
 *
 * Output:
 *   --aion-orb-material-tint     hue degrees, 0..360 (DNA-driven)
 *   --aion-avatar-posture-bias   -1..1 (presence-driven; lean / settle)
 *   --aion-resonance-tendency    0..1 (DNA × presence)
 *
 * One useEffect, no RAF.
 */
import { useEffect } from 'react';
import { useAionPresence } from '@/aion/presenceState';
import { BEHAVIOR_PROFILE, behaviorFromPresence } from '@/aion/presence/orbBehavior';

/** Heuristic: read DNA hue from theme settings if present, else fall back. */
function readDnaHue(): number {
  if (typeof document === 'undefined') return 292;
  const css = getComputedStyle(document.documentElement);
  const raw = css.getPropertyValue('--aion-dna-hue').trim();
  const n = Number.parseFloat(raw);
  if (Number.isFinite(n)) return n;
  // Fall back to brand purple (hue 292).
  return 292;
}

const PRESENCE_POSTURE: Record<string, number> = {
  resting: -0.4,
  listening: 0.0,
  noticing: 0.3,
  thinking: -0.1,
  guiding: 0.5,
  resonating: 0.2,
  hesitating: -0.2,
  dreaming: -0.5,
  evolving: 0.6,
};

export function useTriadOrganism(): void {
  const presence = useAionPresence();
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const behavior = behaviorFromPresence(presence);
    const profile = BEHAVIOR_PROFILE[behavior];
    const hue = readDnaHue();
    const posture = PRESENCE_POSTURE[behavior] ?? 0;
    // Resonance tendency = DNA stability proxy (constant for now) × current
    // behavioural influence. Bounded 0..1.
    const tendency = Math.max(0, Math.min(1, profile.influence));
    root.style.setProperty('--aion-orb-material-tint', hue.toFixed(1));
    root.style.setProperty('--aion-avatar-posture-bias', posture.toFixed(2));
    root.style.setProperty('--aion-resonance-tendency', tendency.toFixed(3));
  }, [presence]);
}

/** Mountable bridge — drop into ShellV2 to activate the triad. */
import type { FC } from 'react';
export const TriadOrganismBridge: FC = () => {
  useTriadOrganism();
  return null;
};