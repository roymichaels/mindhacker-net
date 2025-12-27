import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationRequest {
  leadId: string;
  currentLifeSituation: string;
  whatFeelsStuck: string;
  whatToUnderstand: string;
  whyNow: string;
  opennessToProcess: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      leadId, 
      currentLifeSituation, 
      whatFeelsStuck, 
      whatToUnderstand, 
      whyNow, 
      opennessToProcess 
    }: ApplicationRequest = await req.json();

    if (!leadId || !currentLifeSituation || !whatFeelsStuck || 
        !whatToUnderstand || !whyNow || !opennessToProcess) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing consciousness leap application for lead: ${leadId}`);

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from("consciousness_leap_leads")
      .select("id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) {
      console.error("Lead not found:", leadError);
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if application already exists
    const { data: existingApp } = await supabase
      .from("consciousness_leap_applications")
      .select("id")
      .eq("lead_id", leadId)
      .maybeSingle();

    if (existingApp) {
      return new Response(
        JSON.stringify({ error: "Application already submitted" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert application
    const { data: application, error: insertError } = await supabase
      .from("consciousness_leap_applications")
      .insert({
        lead_id: leadId,
        current_life_situation: currentLifeSituation,
        what_feels_stuck: whatFeelsStuck,
        what_to_understand: whatToUnderstand,
        why_now: whyNow,
        openness_to_process: opennessToProcess,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error inserting application:", insertError);
      throw insertError;
    }

    // Update lead status
    await supabase
      .from("consciousness_leap_leads")
      .update({ status: "application_submitted" })
      .eq("id", leadId);

    console.log(`Application created with ID: ${application.id}`);

    // Create admin notification
    try {
      await supabase.rpc("create_admin_notification", {
        p_type: "new_user",
        p_priority: "high",
        p_title: "בקשה חדשה - קפיצה לתודעה חדשה",
        p_message: "התקבלה בקשה חדשה לתהליך קפיצה לתודעה חדשה",
        p_link: "/admin/consciousness-leap",
        p_metadata: { application_id: application.id, lead_id: leadId }
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't throw - application was still created
    }

    return new Response(
      JSON.stringify({ success: true, applicationId: application.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in submit-consciousness-leap-application:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
