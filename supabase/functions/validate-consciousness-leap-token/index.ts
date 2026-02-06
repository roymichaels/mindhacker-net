import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isCorsPreFlight, handleCorsPreFlight } from "../_shared/cors.ts";
import { jsonResponse, badRequestResponse, errorResponse } from "../_shared/responses.ts";
import { logError } from "../_shared/errorHandling.ts";

serve(async (req: Request): Promise<Response> => {
  if (isCorsPreFlight(req)) {
    return handleCorsPreFlight();
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token) {
      return jsonResponse({ valid: false, error: "Missing token" }, 400);
    }

    console.log("[validate-token] Validating consciousness leap token");

    // Find lead by application token
    const { data: lead, error } = await supabase
      .from("consciousness_leap_leads")
      .select("id, name, status")
      .eq("application_token", token)
      .maybeSingle();

    if (error) {
      logError("validate-consciousness-leap-token", error);
      throw error;
    }

    if (!lead) {
      console.log("[validate-token] Token not found");
      return jsonResponse({ valid: false, error: "Token not found" });
    }

    // Check if application already exists for this lead
    const { data: existingApplication } = await supabase
      .from("consciousness_leap_applications")
      .select("id")
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (existingApplication) {
      console.log("[validate-token] Application already submitted for this token");
      return jsonResponse({ valid: false, error: "Application already submitted" });
    }

    console.log(`[validate-token] Token valid for lead: ${lead.id}`);

    return jsonResponse({ 
      valid: true, 
      leadId: lead.id,
      name: lead.name
    });

  } catch (error: any) {
    logError("validate-consciousness-leap-token", error);
    return jsonResponse({ valid: false, error: error.message }, 500);
  }
});
