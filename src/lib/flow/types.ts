/**
 * FlowSpec Engine — Type Definitions
 * 
 * Generic config-driven flow system for one-question-per-screen UX.
 * Used by Core Launchpad and Pillar Quests.
 */

// ─── Option for select-type inputs ───
export interface FlowOption {
  value: string;
  label_he: string;
  label_en: string;
  icon?: string;
}

// ─── Validation rules for a mini-step ───
export interface FlowValidation {
  required: boolean;
  minSelected?: number;
  maxSelected?: number;
  minChars?: number;
}

// ─── Branching logic — show/hide based on previous answers ───
export interface FlowBranching {
  showIf: (answers: FlowAnswers) => boolean;
}

// ─── Where to persist the answer ───
export interface FlowDbPath {
  table: string;        // e.g. 'launchpad_progress'
  column: string;       // e.g. 'step_2_profile_data'
  jsonPath?: string;    // e.g. 'deep_dive' (nested key within JSON column)
}

// ─── A single question screen ───
export interface MiniStep {
  id: string;
  title_he: string;
  title_en: string;
  prompt_he?: string;
  prompt_en?: string;
  inputType: 'single_select' | 'multi_select' | 'slider' | 'time_picker' | 'textarea' | 'chat';
  options?: FlowOption[];
  validation: FlowValidation;
  branching?: FlowBranching;
  dbPath: FlowDbPath;
  // Slider-specific
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  // Time-picker specific
  minHour?: number;
  maxHour?: number;
}

// ─── A macro step containing one or more mini-steps ───
export type StepRenderer = 'card' | 'custom';

export interface FlowStep {
  id: number;
  title_he: string;
  title_en: string;
  renderer: StepRenderer;
  miniSteps: MiniStep[];
  /** For 'custom' renderer — the component key to render */
  customComponent?: string;
}

// ─── Top-level flow definition ───
export interface FlowSpec {
  id: string;
  title_he: string;
  title_en: string;
  description_he?: string;
  description_en?: string;
  steps: FlowStep[];
  /** Which launchpad step number each FlowStep maps to (for DB compat) */
  stepMapping?: Record<number, number>;
}

// ─── Runtime state ───
export type FlowAnswers = Record<string, string | string[] | number>;

export interface FlowState {
  currentStepIndex: number;
  currentMiniStepIndex: number;
  answers: FlowAnswers;
  completedSteps: number[];
}

// ─── Callbacks ───
export interface FlowCallbacks {
  onAutoSave: (stepNumber: number, data: Record<string, unknown>) => void;
  onStepComplete: (stepNumber: number, collectedData: Record<string, unknown>) => void;
  onFlowComplete: (allData: FlowAnswers) => void;
  getSavedData: (stepNumber: number) => Record<string, unknown> | null | undefined;
}
