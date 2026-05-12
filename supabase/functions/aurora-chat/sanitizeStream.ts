// Moved to ../_shared/sanitizeStream.ts. Re-export for backward compatibility
// with this function's own files (test + index.ts + orchestrator.ts).
export {
  sanitizeDelta,
  sanitizeFinalText,
  sanitizeStream,
  newState,
  type SanitizerState,
} from "../_shared/sanitizeStream.ts";
