/**
 * SSE sanitizer for the AION chat stream.
 * - Strips <think>…</think> / <reasoning>…</reasoning> blocks across chunk boundaries.
 * - Drops obvious chain-of-thought preambles ("Okay, let me…", "As Aurora…", etc.)
 *   until the first real user-facing token has been emitted.
 * - Drops standalone meta lines anywhere ([Reasoning], [Plan], [Analysis], [Internal]).
 */

const THINK_OPEN = /<\s*(think|reasoning|analysis|internal|scratchpad)\b[^>]*>/i;
const THINK_CLOSE = /<\s*\/\s*(think|reasoning|analysis|internal|scratchpad)\s*>/i;

const META_LINE = /^\s*\[(reasoning|plan|analysis|internal|debug|scratch)\b/i;

const PREAMBLE_PATTERNS: RegExp[] = [
  /\bokay,?\s+let me\b/i,
  /\blet me (check|think|see|inspect|look at|analyze|reason)\b/i,
  /\blooking at the (conversation|history|log|context|system)/i,
  /\bthe system (says|message|prompt)\b/i,
  /\bas aurora\b/i,
  /\bnow,?\s+for my response\b/i,
  /\bi should (respond|answer|reply|now)\b/i,
  /\bmy plan is\b/i,
  /\bfirst,?\s+i'?ll\b/i,
  /\bstep\s*\d+\s*:/i,
  /\bsystem message\b/i,
  /\bdeveloper message\b/i,
  /\bconversation log\b/i,
  /\bchain of thought\b/i,
  /\bבואו? (לחשוב|לבדוק|נחשוב|נבדוק)\b/,
  /\bהמערכת אומרת\b/,
  /\bכאורורה\b/,
];

export interface SanitizerState {
  insideThink: boolean;
  emittedReal: boolean;
  buffer: string;
}

export function newState(): SanitizerState {
  return { insideThink: false, emittedReal: false, buffer: "" };
}

/**
 * Sanitize a content delta. Returns the cleaned text (may be empty).
 * Stateful — caller must reuse the same SanitizerState across chunks.
 */
export function sanitizeDelta(delta: string, state: SanitizerState): string {
  if (!delta) return "";
  let out = "";
  let work = state.buffer + delta;
  state.buffer = "";

  while (work.length > 0) {
    if (state.insideThink) {
      const close = work.match(THINK_CLOSE);
      if (!close) {
        // Wait for closer; everything stays swallowed.
        return out;
      }
      work = work.slice((close.index ?? 0) + close[0].length);
      state.insideThink = false;
      continue;
    }

    const open = work.match(THINK_OPEN);
    if (open) {
      const before = work.slice(0, open.index);
      out += filterVisible(before, state);
      work = work.slice((open.index ?? 0) + open[0].length);
      state.insideThink = true;
      continue;
    }

    // Possible partial opener at end (e.g. "<thi"). Hold tail in buffer.
    const lt = work.lastIndexOf("<");
    if (lt >= 0 && work.length - lt < 24 && /^<\s*[a-z\/]*$/i.test(work.slice(lt))) {
      out += filterVisible(work.slice(0, lt), state);
      state.buffer = work.slice(lt);
      return out;
    }

    out += filterVisible(work, state);
    work = "";
  }

  return out;
}

function filterVisible(text: string, state: SanitizerState): string {
  if (!text) return "";

  // Drop meta lines anywhere.
  const lines = text.split(/(\r?\n)/);
  const kept: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (line === "\n" || line === "\r\n") {
      kept.push(line);
      continue;
    }
    if (META_LINE.test(line)) continue;

    if (!state.emittedReal) {
      // Strip leading reasoning preamble until we hit a real sentence.
      const trimmed = line.trimStart();
      if (!trimmed) continue;
      const matchesPreamble = PREAMBLE_PATTERNS.some((re) => re.test(trimmed));
      if (matchesPreamble) continue;
      state.emittedReal = true;
    }

    kept.push(line);
  }

  return kept.join("");
}

/** One-shot sanitizer for non-streamed text (and tests). */
export function sanitizeFinalText(text: string): string {
  const s = newState();
  const cleaned = sanitizeDelta(text, s);
  // Flush any held buffer (e.g. unclosed <think… at the very end → drop).
  return cleaned.trim();
}

/**
 * Pipe an SSE response body through the sanitizer.
 * Re-emits SSE lines unchanged except for `data:` JSON whose
 * choices[0].delta.content has been cleaned. If a delta becomes empty after
 * cleaning, the SSE event is dropped to avoid empty render churn.
 */
export function sanitizeStream(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const state = newState();
  let pending = "";
  let droppedChars = 0;

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      pending += decoder.decode(chunk, { stream: true });

      let nl: number;
      while ((nl = pending.indexOf("\n")) !== -1) {
        let line = pending.slice(0, nl);
        pending = pending.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);

        const out = sanitizeSseLine(line, state);
        if (out === null) {
          droppedChars += line.length;
          continue;
        }
        controller.enqueue(encoder.encode(out + "\n"));
      }
    },
    flush(controller) {
      if (pending) {
        const out = sanitizeSseLine(pending, state);
        if (out !== null) controller.enqueue(encoder.encode(out));
      }
      if (droppedChars > 0) {
        console.log(`[aurora-chat] sanitizer dropped ${droppedChars} chars`);
      }
    },
  });
}

function sanitizeSseLine(line: string, state: SanitizerState): string | null {
  if (!line.startsWith("data:")) return line;
  const payload = line.slice(5).trim();
  if (!payload || payload === "[DONE]") return line;

  try {
    const obj = JSON.parse(payload);
    const choice = obj?.choices?.[0];
    const delta = choice?.delta;
    if (delta && typeof delta.content === "string") {
      const cleaned = sanitizeDelta(delta.content, state);
      if (cleaned.length === 0) {
        // Skip empty deltas entirely (only emit when finish_reason fires).
        if (!choice.finish_reason) return null;
        delta.content = "";
      } else {
        delta.content = cleaned;
      }
      // Strip any `reasoning` / `thinking` field that some providers add.
      if (delta.reasoning) delete delta.reasoning;
      if (delta.thinking) delete delta.thinking;
      return `data: ${JSON.stringify(obj)}`;
    }
    // Non-delta event (role-only, finish_reason only) — pass through.
    return line;
  } catch {
    return line;
  }
}