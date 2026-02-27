/**
 * Canonical Execution Templates — SSOT catalog.
 * 
 * Every action_item MUST have metadata.execution_template from this list.
 * The DB trigger `enforce_execution_template` auto-fills on INSERT if missing.
 * 
 * NORMALIZATION RULE: These are the ONLY valid template strings.
 * When creating action_items from any source (plan gen, coach, Aurora, user),
 * always use inferTemplate() or set explicitly from this list.
 */

export const EXECUTION_TEMPLATES = {
  // ── Guided Audio ──
  tts_guided: 'tts_guided',           // Meditation, breathwork, body scan, visualization
  
  // ── Video Follow-Along ──
  video_embed: 'video_embed',         // Yoga, tai chi, stretching, pilates, mobility
  
  // ── Physical Training ──
  sets_reps_timer: 'sets_reps_timer', // Combat, strength, HIIT, calisthenics
  
  // ── Deep Work / Focus ──
  timer_focus: 'timer_focus',         // Business, wealth, projects, study, deep work
  
  // ── Sequential Steps ──
  step_by_step: 'step_by_step',       // Cooking, skincare, journaling, routines, cleaning
  
  // ── Social / Relational ──
  social_checklist: 'social_checklist', // Networking, calls, meetings, outreach
} as const;

export type ExecutionTemplate = keyof typeof EXECUTION_TEMPLATES;

/**
 * Pillar → default template mapping.
 * Used when no explicit template is provided.
 */
export const PILLAR_DEFAULT_TEMPLATE: Record<string, ExecutionTemplate> = {
  vitality:       'step_by_step',
  power:          'sets_reps_timer',
  combat:         'sets_reps_timer',
  focus:          'timer_focus',
  consciousness:  'tts_guided',
  expansion:      'timer_focus',
  wealth:         'timer_focus',
  influence:      'social_checklist',
  relationships:  'social_checklist',
  business:       'timer_focus',
  projects:       'timer_focus',
  play:           'step_by_step',
  presence:       'tts_guided',
  order:          'step_by_step',
};

/**
 * Infer execution template from pillar + optional action type keywords.
 * Matches the logic in generate-today-queue's inferExecutionTemplate().
 */
export function inferTemplate(pillar?: string | null, actionType?: string | null): ExecutionTemplate {
  const combined = `${actionType || ''} ${pillar || ''}`.toLowerCase();

  // Specific keyword matches (highest priority)
  if (/meditation|breathwork|body.?scan|visualization|mindful|breathing|relaxation/.test(combined)) return 'tts_guided';
  if (/yoga|tai.?chi|qigong|pilates|stretching|mobility|foam.?rolling/.test(combined)) return 'video_embed';
  if (/combat|shadow|boxing|strength|hiit|calisthenics|push.?up|pull.?up|squat|plank/.test(combined) && !/influence/.test(combined)) return 'sets_reps_timer';
  if (/relation|networking|social|outreach|call|meeting|dating/.test(combined) && pillar !== 'business') return 'social_checklist';
  if (/deep.?work|sprint|revenue|content.?creation|study|learn|course/.test(combined)) return 'timer_focus';
  if (/skin|cook|clean|journal|read|routine|morning|evening|sleep|nutrition/.test(combined)) return 'step_by_step';

  // Pillar fallback
  return PILLAR_DEFAULT_TEMPLATE[pillar || ''] || 'step_by_step';
}
