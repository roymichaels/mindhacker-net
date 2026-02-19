import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_PRICES: Record<string, { priceId: string; trial?: number }> = {
  pro:      { priceId: "price_1T20nXL9lVJ44TbRUzy3AjEN", trial: 7 },
  coach:    { priceId: "price_1T20oXL9lVJ44TbR60Ny0vdt" },
  business: { priceId: "price_1T20nDL9lVJ44TbRJh4CiTNn" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Parse requested tier (default to pro)
    let requestedTier = "pro";
    try {
      const body = await req.json();
      if (body?.tier && TIER_PRICES[body.tier]) {
        requestedTier = body.tier;
      }
    } catch { /* no body = default pro */ }

    const tierConfig = TIER_PRICES[requestedTier];

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (stripeKey.startsWith("sk_live")) {
      console.warn("[STRIPE SAFETY] LIVE secret key detected in create-checkout-session. Ensure this is intentional.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "https://mind-os-space.lovable.app";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [{ price: tierConfig.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/success?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      metadata: { user_id: user.id },
    };

    if (tierConfig.trial) {
      sessionParams.subscription_data = { trial_period_days: tierConfig.trial };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
