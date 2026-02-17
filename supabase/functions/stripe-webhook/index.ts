import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const PRO_TIER_ID = "85d62654-8a60-4c75-bb74-2f559be31aef";
const FREE_TIER_ID = "f319507f-6a45-453f-a959-c72f98f18956";
const PRO_PRODUCT_ID = "prod_TzbSX1sFG1woDZ";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Stripe sends the raw body; we need it for signature verification
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // If STRIPE_WEBHOOK_SECRET is set, verify signature
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Signature verified", { type: event.type });
    } else {
      // Fallback: parse without signature (dev mode)
      event = JSON.parse(body) as Stripe.Event;
      logStep("Parsed without signature verification", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Signature verification failed", { error: msg });
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }

  // Helper: find user_id from Stripe customer email
  const getUserIdByEmail = async (email: string): Promise<string | null> => {
    const { data } = await supabase.auth.admin.listUsers({ perPage: 1, page: 1 });
    // Search through users for matching email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email === email);
    return user?.id ?? null;
  };

  // Helper: find user_id from Stripe customer ID
  const getUserIdByCustomer = async (customerId: string): Promise<string | null> => {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || !("email" in customer) || !customer.email) return null;
    return getUserIdByEmail(customer.email);
  };

  // Helper: upsert user_subscriptions
  const upsertSubscription = async (
    userId: string,
    sub: Stripe.Subscription,
    customerId: string
  ) => {
    const productId = sub.items.data[0]?.price?.product;
    const isPro = productId === PRO_PRODUCT_ID;
    const tierId = isPro ? PRO_TIER_ID : FREE_TIER_ID;
    const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
    const cancelledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;

    // Map Stripe status to our enum
    let status: string;
    switch (sub.status) {
      case "active":
      case "trialing":
        status = "active";
        break;
      case "past_due":
        status = "past_due";
        break;
      case "canceled":
      case "unpaid":
        status = "cancelled";
        break;
      default:
        status = "cancelled";
    }

    // Check if subscription record exists
    const { data: existing } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", sub.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_subscriptions")
        .update({
          status,
          tier_id: tierId,
          end_date: periodEnd,
          trial_ends_at: trialEnd,
          cancelled_at: cancelledAt,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
      logStep("Updated subscription record", { id: existing.id, status });
    } else {
      await supabase.from("user_subscriptions").insert({
        user_id: userId,
        tier_id: tierId,
        status,
        billing_cycle: "monthly",
        start_date: new Date(sub.start_date * 1000).toISOString(),
        end_date: periodEnd,
        trial_ends_at: trialEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
      });
      logStep("Created subscription record", { userId, status });
    }

    return { isPro, status };
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("checkout.session.completed", { sessionId: session.id, customerId: session.customer });

        if (session.mode !== "subscription" || !session.subscription || !session.customer) {
          logStep("Not a subscription checkout, skipping");
          break;
        }

        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
        const userId = await getUserIdByCustomer(customerId);
        if (!userId) {
          logStep("No user found for customer", { customerId });
          break;
        }

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await upsertSubscription(userId, sub, customerId);
        logStep("Checkout processed", { userId });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        logStep(event.type, { subId: sub.id, status: sub.status, customerId });

        const userId = await getUserIdByCustomer(customerId);
        if (!userId) {
          logStep("No user found for customer", { customerId });
          break;
        }

        await upsertSubscription(userId, sub, customerId);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        logStep("customer.subscription.deleted", { subId: sub.id, customerId });

        // Mark subscription as cancelled
        await supabase
          .from("user_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        logStep("Subscription cancelled in DB");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription;
        logStep("invoice.payment_failed", { invoiceId: invoice.id, subId });

        if (subId) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", typeof subId === "string" ? subId : subId.id);
          logStep("Marked subscription as past_due");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing webhook", { error: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
