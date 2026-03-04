import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Coach tier Stripe price IDs → tier mapping
const COACH_PRICE_TIER: Record<string, { tier: string; clientLimit: number }> = {
  "price_1T74WWL9lVJ44TbRziR03haW": { tier: "starter", clientLimit: 10 },
  "price_1T74WqL9lVJ44TbRx0uGMNOY": { tier: "growth", clientLimit: 100 },
  "price_1T74XEL9lVJ44TbR8R5h76R9": { tier: "scale", clientLimit: 500 },
};

const log = (step: string, details?: unknown) => {
  console.log(`[CHECK-COACH-SUB] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    log("Checking coach subscription", { userId: user.id });

    // Check coach_subscriptions table first
    const { data: coachSub } = await supabase
      .from("coach_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!coachSub) {
      log("No active coach subscription found");
      return new Response(JSON.stringify({ subscribed: false, tier: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    log("Active coach subscription found", { tier: coachSub.tier, clientLimit: coachSub.client_limit });

    return new Response(JSON.stringify({
      subscribed: true,
      tier: coachSub.tier,
      client_limit: coachSub.client_limit,
      current_period_end: coachSub.current_period_end,
      status: coachSub.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
