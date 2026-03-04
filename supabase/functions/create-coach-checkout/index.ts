import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { priceId, couponCode } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Handle coupon code — validate and get Stripe coupon
    let stripeCouponId: string | undefined;
    if (couponCode) {
      // Validate our internal coupon
      const { data: coupon } = await supabaseClient
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (!coupon) throw new Error("Invalid or expired coupon code");

      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        throw new Error("Coupon usage limit reached");
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("Coupon has expired");
      }

      // Check if user already used this coupon
      const { data: existing } = await supabaseClient
        .from("coupon_usages")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) throw new Error("You have already used this coupon");

      // Create a Stripe coupon on the fly
      try {
        const stripeCoupon = await stripe.coupons.create(
          coupon.discount_type === "percent"
            ? { percent_off: coupon.discount_value, duration: "once" }
            : { amount_off: Math.round(coupon.discount_value * 100), currency: "usd", duration: "once" }
        );
        stripeCouponId = stripeCoupon.id;
      } catch (e) {
        console.error("Stripe coupon creation failed:", e);
      }

      // Record usage
      await supabaseClient.from("coupon_usages").insert({
        coupon_id: coupon.id,
        user_id: user.id,
      });

      // Increment usage count
      await supabaseClient.rpc("use_coupon", {
        p_code: couponCode.toUpperCase(),
        p_user_id: user.id,
      });
    }

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/coaches?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/coaches?tab=pricing`,
      metadata: { user_id: user.id },
    };

    if (stripeCouponId) {
      sessionParams.discounts = [{ coupon: stripeCouponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
