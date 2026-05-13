/**
 * Hebrew text utilities for UI render-time sanitization.
 *
 * `stripNiqqud` removes Hebrew vowel/cantillation marks (U+0591–U+05C7)
 * so chat bubbles, summaries, and AI-generated text render in modern
 * spoken Hebrew without biblical pointing.
 *
 * Pure function. Safe to call on any string (including mixed Hebrew/English).
 */
const NIQQUD_RANGE = /[\u0591-\u05C7]/g;

export function stripNiqqud(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(NIQQUD_RANGE, '');
}
