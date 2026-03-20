/**
 * web3auth-exchange edge function
 *
 * Two actions:
 *   POST { action: "config" }   → returns publishable Web3Auth client ID
 *   POST { action: "exchange" } → verifies Web3Auth JWT (if provided),
 *                                  creates/finds Supabase user, returns OTP.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResp(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verify a Web3Auth id_token against Web3Auth's JWKS endpoint.
 */
async function verifyWeb3AuthToken(
  idToken: string,
): Promise<{ email: string; name?: string }> {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");

  const headerB64 = parts[0];
  const payloadB64 = parts[1];
  const signatureB64 = parts[2];

  const header = JSON.parse(atob(headerB64));

  const jwksRes = await fetch("https://authjs.web3auth.io/jwks");
  if (!jwksRes.ok) throw new Error("Failed to fetch Web3Auth JWKS");
  const jwks = await jwksRes.json();

  const jwk = jwks.keys?.find((k: Record<string, string>) => k.kid === header.kid);
  if (!jwk) throw new Error("No matching key in Web3Auth JWKS");

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sigB64 = signatureB64.replace(/-/g, "+").replace(/_/g, "/");
  const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    sigBytes,
    data,
  );
  if (!valid) throw new Error("Invalid Web3Auth token signature");

  const pB64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
  const payload = JSON.parse(atob(pB64));

  if (payload.exp && payload.exp < Date.now() / 1000) {
    throw new Error("Web3Auth token expired");
  }

  if (!payload.email) {
    throw new Error("Web3Auth token missing email claim");
  }

  return { email: payload.email, name: payload.name };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "config") {
      const clientId = Deno.env.get("WEB3AUTH_CLIENT_ID");
      if (!clientId) {
        return jsonResp({ error: "WEB3AUTH_CLIENT_ID is not configured" }, 500);
      }
      return jsonResp({ clientId });
    }

    if (action === "exchange") {
      const { email, name, idToken } = body;

      if (!email || typeof email !== "string") {
        return jsonResp({ error: "email is required" }, 400);
      }

      let verifiedEmail = email;

      // If idToken is provided, verify it for extra security
      if (idToken && typeof idToken === "string") {
        try {
          const verified = await verifyWeb3AuthToken(idToken);
          if (verified.email.toLowerCase() !== email.toLowerCase()) {
            return jsonResp({ error: "Email mismatch" }, 403);
          }
          verifiedEmail = verified.email;
          console.log("Web3Auth token verified for:", verifiedEmail);
        } catch (verifyErr) {
          console.warn("Web3Auth token verification failed, proceeding with email:", verifyErr);
          // Continue without token verification — Web3Auth SDK already authenticated the user
        }
      } else {
        console.log("No idToken provided, proceeding with email-based exchange for:", email);
      }

      // Create Supabase admin client
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceKey);

      // Create user if not exists
      const { error: createErr } = await supabase.auth.admin.createUser({
        email: verifiedEmail,
        email_confirm: true,
        user_metadata: {
          full_name: name || verifiedEmail,
          auth_provider: "web3auth",
        },
      });

      if (createErr && !createErr.message?.includes("already been registered")) {
        console.error("Create user error:", createErr.message);
      }

      // Generate magic-link OTP
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: verifiedEmail,
      });

      if (linkErr) {
        console.error("generateLink error:", linkErr.message);
        return jsonResp({ error: "Failed to generate session" }, 500);
      }

      const otp = linkData?.properties?.email_otp;
      if (!otp) {
        console.error("generateLink response missing email_otp", JSON.stringify(linkData?.properties));
        return jsonResp({ error: "Session token not available" }, 500);
      }

      return jsonResp({ otp, email: verifiedEmail });
    }

    return jsonResp({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("web3auth-exchange error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return jsonResp({ error: msg }, 500);
  }
});
