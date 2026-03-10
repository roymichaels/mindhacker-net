/**
 * Shared Authentication Utilities for Edge Functions
 * 
 * Validates JWT tokens from the Authorization header using getClaims().
 * All sensitive edge functions should use requireAuth() or optionalAuth().
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

export interface AuthResult {
  userId: string;
  claims: Record<string, unknown>;
}

/**
 * Extract and validate JWT from Authorization header.
 * Returns user info or null if not authenticated.
 */
export async function optionalAuth(req: Request): Promise<AuthResult | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) return null;

  return {
    userId: data.claims.sub as string,
    claims: data.claims as Record<string, unknown>,
  };
}

/**
 * Require valid JWT. Returns AuthResult or a 401 Response.
 */
export async function requireAuth(req: Request): Promise<AuthResult | Response> {
  const auth = await optionalAuth(req);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return auth;
}

/**
 * Check if user has admin role using the has_role database function.
 */
export async function requireAdmin(req: Request): Promise<AuthResult | Response> {
  const authResult = await requireAuth(req);
  if (authResult instanceof Response) return authResult;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data } = await supabase.rpc("has_role", {
    _user_id: authResult.userId,
    _role: "admin",
  });

  if (!data) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return authResult;
}
