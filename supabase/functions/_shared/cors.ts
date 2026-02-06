/**
 * Shared CORS Configuration for Edge Functions
 * 
 * Provides standardized CORS headers that all edge functions should use.
 * This ensures consistent handling of cross-origin requests.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Handle CORS preflight request
 * Use at the start of your edge function to handle OPTIONS requests
 * 
 * @example
 * ```ts
 * if (req.method === 'OPTIONS') {
 *   return handleCorsPreFlight();
 * }
 * ```
 */
export const handleCorsPreFlight = (): Response => {
  return new Response('ok', { headers: corsHeaders });
};

/**
 * Check if request is a CORS preflight
 */
export const isCorsPreFlight = (req: Request): boolean => {
  return req.method === 'OPTIONS';
};
