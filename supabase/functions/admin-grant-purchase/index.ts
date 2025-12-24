import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Get the authorization header to verify the admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create client with user's token to verify they're admin
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized: Invalid user token");
    }

    // Create service role client for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Parse request body
    const body = await req.json();
    const {
      targetUserId,
      grantType,
      // Session fields
      packageType,
      sessionsTotal,
      price,
      // Content fields
      productId,
      // Subscription fields
      tierId,
      billingCycle,
      // Common
      notes,
    } = body;

    if (!targetUserId || !grantType) {
      throw new Error("Missing required fields: targetUserId and grantType");
    }

    console.log(`Admin ${user.id} granting ${grantType} to user ${targetUserId}`);

    let result;

    switch (grantType) {
      case "sessions": {
        // Create a purchase record for sessions
        const { data, error } = await supabase
          .from("purchases")
          .insert({
            user_id: targetUserId,
            package_type: packageType || "admin_grant",
            sessions_total: sessionsTotal || 1,
            sessions_remaining: sessionsTotal || 1,
            price: price || 0,
            payment_status: "completed",
            payment_method: "admin_grant",
            notes: notes || "הזמנה מנהלתית",
            payment_completed_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        result = { type: "sessions", purchase: data };
        console.log("Sessions purchase created:", data.id);
        break;
      }

      case "content": {
        if (!productId) {
          throw new Error("Missing productId for content grant");
        }

        // Get product details
        const { data: product, error: productError } = await supabase
          .from("content_products")
          .select("id, title, price")
          .eq("id", productId)
          .single();

        if (productError || !product) {
          throw new Error("Product not found");
        }

        // Create content purchase
        const { data: contentPurchase, error: purchaseError } = await supabase
          .from("content_purchases")
          .insert({
            user_id: targetUserId,
            product_id: productId,
            price_paid: price || 0,
            payment_status: "completed",
            access_granted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (purchaseError) throw purchaseError;

        // Get total episodes for this product
        const { count: episodeCount } = await supabase
          .from("content_episodes")
          .select("*", { count: "exact", head: true })
          .eq("product_id", productId);

        // Create course enrollment
        const { error: enrollmentError } = await supabase
          .from("course_enrollments")
          .upsert({
            user_id: targetUserId,
            product_id: productId,
            total_episodes: episodeCount || 0,
            progress_percentage: 0,
            completed_episodes: 0,
          }, {
            onConflict: "user_id,product_id",
            ignoreDuplicates: true,
          });

        if (enrollmentError) {
          console.error("Enrollment error (non-critical):", enrollmentError);
        }

        result = { type: "content", purchase: contentPurchase, product: product.title };
        console.log("Content purchase created:", contentPurchase.id);
        break;
      }

      case "subscription": {
        if (!tierId) {
          throw new Error("Missing tierId for subscription grant");
        }

        // Get tier details
        const { data: tier, error: tierError } = await supabase
          .from("subscription_tiers")
          .select("*")
          .eq("id", tierId)
          .single();

        if (tierError || !tier) {
          throw new Error("Subscription tier not found");
        }

        // Calculate end date based on billing cycle
        const now = new Date();
        let endDate: Date;
        switch (billingCycle) {
          case "quarterly":
            endDate = new Date(now.setMonth(now.getMonth() + 3));
            break;
          case "yearly":
            endDate = new Date(now.setFullYear(now.getFullYear() + 1));
            break;
          default: // monthly
            endDate = new Date(now.setMonth(now.getMonth() + 1));
        }

        // Check for existing active subscription
        const { data: existingSub } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", targetUserId)
          .eq("status", "active")
          .single();

        if (existingSub) {
          // Update existing subscription
          const { data: subscription, error: subError } = await supabase
            .from("user_subscriptions")
            .update({
              tier_id: tierId,
              billing_cycle: billingCycle || "monthly",
              end_date: endDate.toISOString(),
              next_billing_date: endDate.toISOString(),
            })
            .eq("id", existingSub.id)
            .select()
            .single();

          if (subError) throw subError;
          result = { type: "subscription", subscription, tier: tier.name, updated: true };
        } else {
          // Create new subscription
          const { data: subscription, error: subError } = await supabase
            .from("user_subscriptions")
            .insert({
              user_id: targetUserId,
              tier_id: tierId,
              status: "active",
              billing_cycle: billingCycle || "monthly",
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              next_billing_date: endDate.toISOString(),
            })
            .select()
            .single();

          if (subError) throw subError;
          result = { type: "subscription", subscription, tier: tier.name, created: true };
        }

        console.log("Subscription granted:", result);
        break;
      }

      default:
        throw new Error(`Invalid grant type: ${grantType}`);
    }

    // Create a notification for the user
    await supabase.rpc("create_user_notification", {
      p_user_id: targetUserId,
      p_type: "purchase_success",
      p_title: "קיבלת מתנה! 🎁",
      p_message: getNotificationMessage(grantType, result),
      p_link: getNotificationLink(grantType, result),
      p_metadata: { admin_grant: true, granted_by: user.id },
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin grant purchase error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getNotificationMessage(grantType: string, result: any): string {
  switch (grantType) {
    case "sessions":
      return `קיבלת ${result.purchase.sessions_total} מפגשים חדשים! היכנס לדשבורד שלך לראות את הפרטים.`;
    case "content":
      return `קיבלת גישה ל"${result.product}"! היכנס עכשיו וצפה בתוכן.`;
    case "subscription":
      return `המנוי שלך לרמת ${result.tier} הופעל! כל התכנים זמינים לך עכשיו.`;
    default:
      return "קיבלת הטבה חדשה! היכנס לדשבורד שלך לפרטים.";
  }
}

function getNotificationLink(grantType: string, result: any): string {
  switch (grantType) {
    case "sessions":
      return "/dashboard";
    case "content":
      return "/courses";
    case "subscription":
      return "/courses";
    default:
      return "/dashboard";
  }
}
