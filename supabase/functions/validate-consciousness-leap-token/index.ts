import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Validating consciousness leap token`);

    // Find lead by application token
    const { data: lead, error } = await supabase
      .from("consciousness_leap_leads")
      .select("id, name, status")
      .eq("application_token", token)
      .maybeSingle();

    if (error) {
      console.error("Error finding lead:", error);
      throw error;
    }

    if (!lead) {
      console.log("Token not found");
      return new Response(
        JSON.stringify({ valid: false, error: "Token not found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if application already exists for this lead
    const { data: existingApplication } = await supabase
      .from("consciousness_leap_applications")
      .select("id")
      .eq("lead_id", lead.id)
      .maybeSingle();

    if (existingApplication) {
      console.log("Application already submitted for this token");
      return new Response(
        JSON.stringify({ valid: false, error: "Application already submitted" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Token valid for lead: ${lead.id}`);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        leadId: lead.id,
        name: lead.name
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in validate-consciousness-leap-token:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
