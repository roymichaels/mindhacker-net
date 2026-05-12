/**
 * Production rules — hard guardrails to keep AION immersive.
 * These flags are read by client + edge layers so chain-of-thought,
 * tool calls, prompt internals, and memory inspection NEVER reach the user.
 */

export const PRODUCTION_RULES = {
  /** Strip <think>/<reasoning>/<analysis> blocks from any rendered text. */
  hideReasoning: true,
  /** Drop any "Okay let me…/Looking at the conversation…/As Aurora…" preambles. */
  hideSystemThinking: true,
  /** Never render system-prompt fragments echoed back by the model. */
  hidePromptParsing: true,
  /** Never render memory inspection meta lines ([Memory], [Plan], [Internal], etc). */
  hideMemoryInspection: true,
  /** Only render the final assistant answer — no scratchpad, no tool deltas. */
  streamOnlyFinalAnswer: true,
} as const;

export type ProductionRules = typeof PRODUCTION_RULES;
