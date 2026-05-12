/**
 * Client-side last line of defence against AION chain-of-thought leaks.
 * Mirrors `supabase/functions/_shared/sanitizeStream.ts` (filterVisible) but
 * runs on a complete message string before render. Used by chat bubbles
 * regardless of which edge function produced the text.
 */

const THINK_BLOCK = /<\s*(think|reasoning|analysis|internal|scratchpad)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const ORPHAN_OPEN = /<\s*(think|reasoning|analysis|internal|scratchpad)\b[^>]*>[\s\S]*$/i;
const META_LINE = /^\s*\[(reasoning|plan|analysis|internal|debug|scratch)\b[^\]]*\]\s*:?.*$/i;

const PREAMBLES: RegExp[] = [
  /^\s*okay,?\s+let me\b.*$/i,
  /^\s*let me (check|think|see|inspect|look at|analyze|reason)\b.*$/i,
  /^\s*looking at the (conversation|history|log|context|system)\b.*$/i,
  /^\s*the system (says|message|prompt)\b.*$/i,
  /^\s*as aurora\b.*$/i,
  /^\s*as aion\b.*$/i,
  /^\s*now,?\s+for my response\b.*$/i,
  /^\s*i should (respond|answer|reply|now)\b.*$/i,
  /^\s*my plan is\b.*$/i,
  /^\s*first,?\s+i'?ll\b.*$/i,
  /^\s*step\s*\d+\s*:.*$/i,
  /^\s*system message\b.*$/i,
  /^\s*developer message\b.*$/i,
  /^\s*conversation log\b.*$/i,
  /^\s*chain of thought\b.*$/i,
  /^\s*בואו? (לחשוב|לבדוק|נחשוב|נבדוק)\b.*$/,
  /^\s*המערכת אומרת\b.*$/,
  /^\s*כאורורה\b.*$/,
];

export function stripReasoning(text: string | null | undefined): string {
  if (!text) return '';
  let out = text.replace(THINK_BLOCK, '').replace(ORPHAN_OPEN, '');

  const lines = out.split(/\r?\n/);
  const kept: string[] = [];
  let realStarted = false;
  for (const raw of lines) {
    const line = raw;
    if (META_LINE.test(line)) continue;
    if (!realStarted) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (PREAMBLES.some((re) => re.test(trimmed))) continue;
      realStarted = true;
    }
    kept.push(line);
  }
  return kept.join('\n').trim();
}