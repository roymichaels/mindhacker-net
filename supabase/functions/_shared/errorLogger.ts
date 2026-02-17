/**
 * Central Error Logger for Edge Functions
 * 
 * Fire-and-forget error logging to edge_function_errors table.
 * All edge functions should use this for persistent error tracking.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ErrorLogEntry {
  functionName: string;
  error: unknown;
  userId?: string | null;
  requestContext?: Record<string, unknown>;
}

/**
 * Log an error to the edge_function_errors table (fire-and-forget).
 * Uses service role key so RLS doesn't block inserts.
 */
export function logEdgeFunctionError(entry: ErrorLogEntry): void {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const errorMessage = entry.error instanceof Error ? entry.error.message : String(entry.error);
    const errorStack = entry.error instanceof Error ? entry.error.stack || null : null;

    supabase.from("edge_function_errors").insert({
      function_name: entry.functionName,
      error_message: errorMessage,
      error_stack: errorStack,
      user_id: entry.userId || null,
      request_context: entry.requestContext || null,
    }).then(() => {}).catch(e => console.error("Failed to log error:", e));
  } catch (e) {
    // If logging itself fails, just console.error — never throw
    console.error("Error logger failed:", e);
  }
}
