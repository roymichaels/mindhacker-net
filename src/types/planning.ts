/**
 * Planning & Execution Types — Shared across the entire pipeline.
 * 
 * Pipeline layers:
 * 1. Strategy (100-day) → pillars, traits, missions, milestones
 * 2. Phase Engine → current phase + active milestones
 * 3. Weekly Tactical Planner → structured weekly plan
 * 4. Daily Queue → today's actions (SSOT)
 * 5. Now Execution → live step-by-step guidance
 */

// ── Execution Templates ──
export type ExecutionTemplate =
  | 'tts_guided'
  | 'video_embed'
  | 'sets_reps_timer'
  | 'step_by_step'
  | 'timer_focus'
  | 'social_checklist';

// ── Execution Steps (used by Now Engine) ──
export interface ExecutionStep {
  label: string;
  detail?: string;
  durationSec: number;
}

// ── Daily Queue Item (output of Daily Queue layer, input to Now Execution) ──
export interface NowQueueItem {
  pillarId: string;
  hub: 'core' | 'arena';
  actionType: string;
  title: string;
  titleEn: string;
  durationMin: number;
  isTimeBased?: boolean;
  urgencyScore: number;
  reason: string;
  sourceType: 'milestone' | 'mini_milestone' | 'habit' | 'overdue' | 'template' | 'plan' | 'assessment' | 'practice';
  sourceId?: string;
  // Lineage: trace back to strategy
  missionId?: string;
  missionTitle?: string;
  milestoneId?: string;
  milestoneTitle?: string;
  traitName?: string;
  // Execution guidance
  executionSteps?: ExecutionStep[];
  executionTemplate?: ExecutionTemplate;
  // Energy phase awareness
  energyPhase?: 'morning' | 'day' | 'evening';
  // Practice reference (if from practice library)
  practiceId?: string;
}

// ── Energy Phases ──
export type EnergyPhase = 'morning' | 'day' | 'evening';

// ── Time Blocks (used by schedule UI) ──
export type TimeBlock = 'morning' | 'midday' | 'evening' | 'deepwork' | 'training' | 'recovery' | 'admin' | 'social' | 'play';
