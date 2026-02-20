/**
 * @module lib/presence/types
 * @purpose All Presence Coach Engine types — assessment, scores, levers, routines.
 */

// ── Assessment ──

export type AssessmentMode = 'quick' | 'full' | 'deep';
export type ConfidenceLevel = 'low' | 'med' | 'high';
export type Gender = 'male' | 'female' | 'other';
export type StylePreference = 'minimal' | 'classic' | 'street' | 'athletic' | 'formal';
export type RoutineIntensity = 'minimal' | 'standard' | 'full';

export type PresenceGoal =
  | 'jawline'
  | 'skin'
  | 'hair'
  | 'leanness'
  | 'style'
  | 'posture'
  | 'grooming';

export interface PresencePreferences {
  gender: Gender;
  age_bracket: string;
  height_cm?: number;
  weight_kg?: number;
  body_fat_range?: string;
  activity_level?: string;
  daily_steps?: string;
  style_preference: StylePreference;
  grooming_baseline: {
    has_beard?: boolean;
    hair_length?: string;
    skincare_routine?: string;
  };
  posture_self_check: {
    neck_forward?: boolean;
    rounded_shoulders?: boolean;
    low_back_pain?: boolean;
  };
  goals: PresenceGoal[];
}

// ── Sub-Scores ──

export type SubScoreKey =
  | 'face_structure'
  | 'posture_frame'
  | 'body_composition'
  | 'skin_routine'
  | 'hair_grooming'
  | 'style_fit'
  | 'dental_smile';

export interface SubScore {
  score: number;
  confidence: ConfidenceLevel;
  keyObservations: string[];
  topLevers: LeverRecommendation[];
}

export interface LeverRecommendation {
  leverId: string;
  title: string;
  impact: number; // 1-5
  effort: number; // 1-5
  why: string;
  steps: string[];
}

export type PresenceScores = Record<SubScoreKey, SubScore>;

// ── Assessment Result ──

export interface PresenceDiagnosisActions {
  today: string[];
  this_week: string[];
  ninety_day_phases: {
    phase1: { label: string; weeks: string; actions: string[] };
    phase2: { label: string; weeks: string; actions: string[] };
    phase3: { label: string; weeks: string; actions: string[] };
  };
}

export interface PresenceAssessmentResult {
  mode: AssessmentMode;
  scores: PresenceScores;
  total_score: number;
  confidence: ConfidenceLevel;
  top_levers: LeverRecommendation[];
  diagnosis: PresenceDiagnosisActions;
  assessed_at: string;
}

// ── Routine ──

export interface RoutineItem {
  id: string;
  leverId: string;
  title: string;
  block: 'morning' | 'daytime' | 'evening';
  duration_min: number;
  instructions: string;
}

export interface ActiveRoutine {
  intensity: RoutineIntensity;
  levers: string[];
  items: RoutineItem[];
}

export interface RoutineLog {
  date: string;
  completed_items: string[];
  completion_rate: number;
}

// ── Domain Config Shape ──

export interface PresenceDomainConfig {
  latest_assessment?: PresenceAssessmentResult;
  history?: PresenceAssessmentResult[];
  active_routine?: ActiveRoutine;
  routine_logs?: RoutineLog[];
  preferences?: PresencePreferences;
  next_reassess?: string;
  reassess_cadence?: 7 | 14 | 30;
}
