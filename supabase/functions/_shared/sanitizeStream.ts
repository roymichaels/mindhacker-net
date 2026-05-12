/**
 * Re-export of the AION SSE sanitizer so any edge function can import it
 * from `../_shared/sanitizeStream.ts` (single source of truth).
 * The original implementation lives in `aurora-chat/sanitizeStream.ts`.
 */
export {
  sanitizeDelta,
  sanitizeFinalText,
  sanitizeStream,
  newState,
  type SanitizerState,
} from "../aurora-chat/sanitizeStream.ts";