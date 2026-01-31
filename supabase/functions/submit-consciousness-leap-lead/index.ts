import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadRequest {
  name: string;
  email: string;
  whatResonated?: string;
  affiliateCode?: string;
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

    const { name, email, whatResonated, affiliateCode }: LeadRequest = await req.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing consciousness leap lead: ${email}${affiliateCode ? ` (via affiliate: ${affiliateCode})` : ''}`);

    // Insert lead and get the application token
    const { data: lead, error: insertError } = await supabase
      .from("consciousness_leap_leads")
      .insert({
        name,
        email,
        what_resonated: whatResonated || null,
        affiliate_code: affiliateCode || null,
      })
      .select("id, application_token")
      .single();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      throw insertError;
    }

    console.log(`Lead created with ID: ${lead.id}`);

    // Build the application form URL
    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";
    const applicationUrl = `${siteUrl}/consciousness-leap/apply/${lead.application_token}`;

    // Send email
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">
          היי ${name}
        </h1>
        
        <p style="color: #555; font-size: 16px; line-height: 1.8;">
          לפני שנדבר, חשוב לי שתמלאו טופס קצר.
        </p>
        
        <p style="color: #555; font-size: 16px; line-height: 1.8;">
          זה לא מבחן.<br/>
          זה לא אבחון.<br/>
          וזה לא התחייבות.
        </p>
        
        <p style="color: #555; font-size: 16px; line-height: 1.8;">
          הטופס עוזר לי להבין איפה אתם נמצאים,<br/>
          והאם התהליך הזה באמת מתאים לכם.
        </p>
        
        <div style="margin: 30px 0;">
          <a href="${applicationUrl}" 
             style="display: inline-block; background-color: #00f0ff; color: #000; 
                    padding: 15px 30px; text-decoration: none; border-radius: 8px;
                    font-weight: bold; font-size: 16px;">
            למילוי הטופס
          </a>
        </div>
        
        <p style="color: #777; font-size: 14px; line-height: 1.8; margin-top: 30px;">
          חשוב להבהיר:<br/>
          • מילוי הטופס הוא חלק מהתהליך<br/>
          • לא כולם ימשיכו לשיחה<br/>
          • אני עובר אישית על כל טופס<br/>
          • אחזור אליכם אם זה מרגיש מדויק לשני הצדדים
        </p>
        
        <p style="color: #555; font-size: 16px; margin-top: 30px;">
          צוות Mind Hacker
        </p>
      </div>
    `;

    try {
      const emailResponse = await resend.emails.send({
        from: "מיינד-האקר <onboarding@resend.dev>",
        to: [email],
        subject: "הצעד הבא - קפיצה לתודעה חדשה",
        html: emailHtml,
      });

      console.log("Email sent successfully:", emailResponse);

      // Update lead with email sent timestamp
      await supabase
        .from("consciousness_leap_leads")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", lead.id);

    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't throw - lead was still created successfully
    }

    return new Response(
      JSON.stringify({ success: true, leadId: lead.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in submit-consciousness-leap-lead:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
