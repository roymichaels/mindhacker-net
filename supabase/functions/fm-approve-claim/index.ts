import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is authenticated
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { claim_id, action } = await req.json();

    if (!claim_id || !["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "claim_id and action (approve|reject) required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for admin operations
    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch claim with bounty info
    const { data: claim, error: claimErr } = await admin
      .from("fm_bounty_claims")
      .select("*, fm_bounties(*)")
      .eq("id", claim_id)
      .single();

    if (claimErr || !claim) {
      return new Response(JSON.stringify({ error: "Claim not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (claim.status !== "pending") {
      return new Response(
        JSON.stringify({ error: `Claim already ${claim.status}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reject") {
      await admin
        .from("fm_bounty_claims")
        .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq("id", claim_id);

      return new Response(JSON.stringify({ success: true, action: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Approve: pay MOS via fm_post_transaction
    const bounty = claim.fm_bounties;
    const idempotencyKey = `bounty_claim_${claim_id}`;

    const { data: txResult, error: txErr } = await admin.rpc("fm_post_transaction", {
      p_user_id: claim.user_id,
      p_type: "earn_bounty",
      p_amount: bounty.reward_mos,
      p_description: `Bounty: ${bounty.title}`,
      p_reference_type: "bounty_claim",
      p_reference_id: claim_id,
      p_idempotency_key: idempotencyKey,
    });

    if (txErr) {
      return new Response(JSON.stringify({ error: txErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = typeof txResult === "string" ? JSON.parse(txResult) : txResult;

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update claim status
    await admin
      .from("fm_bounty_claims")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        transaction_id: result.transaction_id,
      })
      .eq("id", claim_id);

    // Update bounty completed_claims count
    await admin
      .from("fm_bounties")
      .update({ completed_claims: (bounty.completed_claims || 0) + 1 })
      .eq("id", bounty.id);

    return new Response(
      JSON.stringify({
        success: true,
        action: "approved",
        mos_paid: bounty.reward_mos,
        new_balance: result.new_balance,
        transaction_id: result.transaction_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
