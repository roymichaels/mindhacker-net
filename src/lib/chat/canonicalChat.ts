/**
 * Canonical AION chat pipeline (Phase 1.1 — chat consolidation).
 *
 * AION has ONE streaming chat endpoint: the Supabase edge function
 * `aurora-chat`. Its response body is sanitized server-side via
 * `supabase/functions/_shared/sanitizeStream.ts` (single sanitizer, single
 * source of truth). On the client, all rendered chat text additionally passes
 * through `stripReasoning` (`src/lib/stripReasoning.ts`) as defense in depth.
 *
 * Other chat-style edge functions (`work-chat`, `onboarding-chat`) reuse the
 * same `sanitizeStream` transform — they are domain-specific surfaces of the
 * same pipeline, NOT alternative AION conversations.
 *
 * Do NOT add new chat entry points. Do NOT call AI providers directly from
 * Vercel functions or the browser. The Vercel `api/aurora-chat` and
 * `api/mindos-chat` routes were deleted because they bypassed the sanitizer.
 */
export const AION_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aurora-chat`;

/**
 * Marker constant — import this in any new chat surface to make the
 * dependency on the canonical pipeline explicit and grep-able.
 */
export const CANONICAL_CHAT_PIPELINE = 'aurora-chat@v1' as const;