/**
 * web3-wallet — Edge function for Soul Avatar wallet creation & minting.
 * Handles: create (persist wallet), mint (record NFT mint), status (check).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { action, wallet_address, provider, nft_metadata } = await req.json();

    if (action === "status") {
      const { data } = await supabase
        .from("soul_wallets")
        .select("*")
        .eq("user_id", auth.userId)
        .maybeSingle();

      return new Response(JSON.stringify({ success: true, wallet: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create") {
      if (!wallet_address) {
        return new Response(
          JSON.stringify({ error: "wallet_address required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("soul_wallets")
        .upsert({
          user_id: auth.userId,
          wallet_address,
          wallet_provider: provider || "web3auth",
        }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, wallet: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "mint") {
      // Get orb profile for NFT metadata
      const { data: orbProfile } = await supabase
        .from("orb_profiles")
        .select("*")
        .eq("user_id", auth.userId)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("level, experience")
        .eq("id", auth.userId)
        .single();

      const metadata = {
        ...nft_metadata,
        orb_colors: orbProfile ? {
          primary: orbProfile.primary_color,
          secondary: orbProfile.secondary_colors,
          accent: orbProfile.accent_color,
        } : null,
        geometry: orbProfile?.computed_from?.dominantArchetype || "explorer",
        level_at_mint: profile?.level || 1,
        xp_at_mint: profile?.experience || 0,
        minted_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("soul_wallets")
        .update({
          is_minted: true,
          minted_at: new Date().toISOString(),
          nft_metadata: metadata,
        })
        .eq("user_id", auth.userId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, wallet: data, metadata }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: status, create, mint" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
