/**
 * Adaptive Orchestration Layer (AOL) — shared types.
 * See .lovable/plan.md for the full spec.
 */

export type EnvironmentMode =
  | 'calm'
  | 'focus'
  | 'execute'
  | 'reflect'
  | 'recover'
  | 'explore'
  | 'social'
  | 'sleep';

export type EnvironmentIntensity = 0 | 1 | 2 | 3;
export type EmotionalTone = 'low' | 'neutral' | 'charged';
export type CognitiveBudget = 'minimal' | 'normal' | 'expanded';

export type SurfaceId = string;

export type ChromeId =
  | 'header'
  | 'nav'
  | 'gamification'
  | 'aurora-dock'
  | 'notifications'
  | string;

export interface OrbState {
  size: 0.4 | 0.7 | 1.0 | 1.4;
  motion: 'still' | 'breath' | 'pulse' | 'kinetic';
  hue: number; // 0-360
  glow: 0 | 1 | 2;
}

export interface EnvironmentState {
  mode: EnvironmentMode;
  intensity: EnvironmentIntensity;
  emotionalTone: EmotionalTone;
  cognitiveBudget: CognitiveBudget;
  primarySurface: SurfaceId | null;
  secondarySurfaces: SurfaceId[];
  hidden: ChromeId[];
  orb: OrbState;
  reason: string;
  ttl: number; // ms
  source: 'default' | 'fast-tier' | 'slow-tier' | 'user';
  updatedAt: number;
  /**
   * Raw AION decision pass-through. When present, this is the authoritative
   * brain output (mode/tone/density/focus_target/suggestion) and overrides
   * fast-tier rule-derived fields above. Consumers that want the brain's
   * verbatim values should read this; consumers that just want a normalized
   * mode/intensity should keep using the top-level fields.
   */
  aionDecision?: {
    mode: 'flow' | 'focus' | 'recovery' | 'overwhelmed' | 'hypnosis' | 'calm' | 'neutral';
    tone: 'grounded' | 'energizing' | 'gentle' | 'direct';
    density: 'minimal' | 'standard' | 'rich';
    focusTarget: Record<string, unknown>;
    suggestion: Record<string, unknown>;
    reasoning: string | null;
  };
}

export interface SignalSnapshot {
  // Temporal
  localHour: number;
  dayPhase: 'dawn' | 'morning' | 'work' | 'evening' | 'night';
  // Intent
  lastIntentText?: string;
  lastIntentAt?: number;
  // Execution
  openLoops: number;
  // Affect proxies
  recentSentiment?: 'low' | 'neutral' | 'charged';
  // User overrides
  userOverrideMode?: EnvironmentMode;
}

export const DEFAULT_ENVIRONMENT: EnvironmentState = {
  mode: 'execute',
  intensity: 3,
  emotionalTone: 'neutral',
  cognitiveBudget: 'expanded',
  primarySurface: null,
  secondarySurfaces: [],
  hidden: [],
  orb: { size: 1.0, motion: 'breath', hue: 292, glow: 1 },
  reason: 'default',
  ttl: 60_000,
  source: 'default',
  updatedAt: 0,
};