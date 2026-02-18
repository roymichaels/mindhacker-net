import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRO_TIER_ID = "85d62654-8a60-4c75-bb74-2f559be31aef";

// Product ID → tier mapping
const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_U00p6Sl2YSs5vQ": "pro",
  "prod_TzbSX1sFG1woDZ": "pro",      // legacy pro product
  "prod_U00qb2VULzdvYx": "coach",
  "prod_TzsD5sivmfnEeC": "coach",     // legacy coach product
  "prod_U00oHca1mJzxl1": "business",
};

const log = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) return new Response("Server misconfigured", { status: 500 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      log("Signature verified", { type: event.type });
    } else {
      event = JSON.parse(body) as Stripe.Event;
      log("WARNING: No webhook secret, parsing raw body", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("Signature verification failed", { error: msg });
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  // ── User Resolution ────────────────────────────────────────────

  async function resolveUserFromSession(
    session: Stripe.Checkout.Session,
    customerId: string | null
  ): Promise<string | null> {
    if (session.metadata?.user_id) {
      log("Resolved via metadata.user_id", { userId: session.metadata.user_id });
      return session.metadata.user_id;
    }
    if (session.client_reference_id) {
      log("Resolved via client_reference_id", { userId: session.client_reference_id });
      return session.client_reference_id;
    }
    if (customerId) {
      const found = await resolveUserFromCustomerId(customerId);
      if (found) return found;
    }
    const email = session.customer_email || session.customer_details?.email;
    if (email) return await resolveUserByEmail(email);
    return null;
  }

  async function resolveUserFromCustomerId(customerId: string): Promise<string | null> {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data?.id) {
      log("Resolved via profiles.stripe_customer_id", { userId: data.id });
      return data.id;
    }
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted && "email" in customer && customer.email) {
        return await resolveUserByEmail(customer.email);
      }
    } catch { /* ignore */ }
    return null;
  }

  async function resolveUserByEmail(email: string): Promise<string | null> {
    const { data } = await supabase.auth.admin.listUsers();
    const user = data?.users?.find((u: { email?: string }) => u.email === email);
    if (user) {
      log("Resolved via email", { userId: user.id, email });
      return user.id;
    }
    return null;
  }

  // ── Subscription Upsert ────────────────────────────────────────

  function getTier(productId: string | null): string {
    if (!productId) return "free";
    return PRODUCT_TIER_MAP[productId] || "free";
  }

  async function upsertSub(sub: Stripe.Subscription, userId: string) {
    const item = sub.items.data[0];
    const productId = typeof item?.price?.product === "string" ? item.price.product : null;
    const priceId = item?.price?.id ?? null;
    const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
    const tier = getTier(productId);

    const statusMap: Record<string, string> = {
      active: "active",
      trialing: "trialing",
      past_due: "past_due",
      canceled: "cancelled",
      unpaid: "unpaid",
      incomplete: "cancelled",
      incomplete_expired: "cancelled",
      paused: "paused",
    };
    const dbStatus = statusMap[sub.status] || "cancelled";
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    const cancelledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;

    const { data: existing } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", sub.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_subscriptions")
        .update({
          status: dbStatus,
          tier_id: PRO_TIER_ID,
          price_id: priceId,
          product_id: productId,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          end_date: periodEnd,
          trial_ends_at: trialEnd,
          cancelled_at: cancelledAt,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      log("Updated subscription", { id: existing.id, status: dbStatus });
    } else {
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        tier_id: PRO_TIER_ID,
        status: dbStatus,
        billing_cycle: "monthly",
        price_id: priceId,
        product_id: productId,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        start_date: new Date(sub.start_date * 1000).toISOString(),
        end_date: periodEnd,
        trial_ends_at: trialEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
      });
      log("Created subscription", { userId, status: dbStatus });
    }

    // Sync profiles
    await supabase
      .from("profiles")
      .update({
        subscription_tier: ["active", "trialing"].includes(dbStatus) ? tier : "free",
        stripe_customer_id: customerId,
      })
      .eq("id", userId);

    log("Synced profiles", { userId, tier: ["active", "trialing"].includes(dbStatus) ? tier : "free" });
  }

  // ── Event Handlers ─────────────────────────────────────────────

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        log("checkout.session.completed", { sessionId: session.id, mode: session.mode });

        if (session.mode !== "subscription" || !session.subscription || !session.customer) {
          log("Not a subscription checkout, skipping");
          break;
        }

        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
        const userId = await resolveUserFromSession(session, customerId);
        if (!userId) { log("User not resolved"); break; }

        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);

        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSub(sub, userId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        log(event.type, { subId: sub.id, status: sub.status });

        const { data: existingSub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();

        const userId = existingSub?.user_id || await resolveUserFromCustomerId(customerId);
        if (!userId) { log("User not resolved", { customerId }); break; }

        await upsertSub(sub, userId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        log("customer.subscription.deleted", { subId: sub.id });

        const { data: existingSub } = await supabase
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();

        if (existingSub?.user_id) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", sub.id);
          await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", existingSub.user_id);
          log("Subscription cancelled", { userId: existingSub.user_id });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!subId) break;
        log("invoice.paid", { subId });

        const { data } = await supabase
          .from("user_subscriptions")
          .select("user_id, product_id")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();

        if (data) {
          await supabase
            .from("user_subscriptions")
            .update({ status: "active", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
          await supabase
            .from("profiles")
            .update({ subscription_tier: getTier(data.product_id) })
            .eq("id", data.user_id);
          log("Reactivated via invoice.paid", { userId: data.user_id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (!subId) break;
        log("invoice.payment_failed", { subId });

        await supabase
          .from("user_subscriptions")
          .update({ status: "past_due", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subId);
        break;
      }

      default:
        log("Unhandled event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
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
