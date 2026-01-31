import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendNewsletterRequest {
  campaignId: string;
}

const getEmailStyles = (isRTL: boolean) => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #020c14; color: #e5e7eb; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .content { background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; padding: 30px; direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}; }
  h1 { color: #00f0ff; font-size: 24px; margin-bottom: 20px; }
  p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); color: #000 !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
  .unsubscribe { color: #6b7280; font-size: 12px; text-decoration: underline; }
`;

// Send emails in batches to avoid rate limits
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1000;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";

    const { campaignId }: SendNewsletterRequest = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Missing campaign ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (campaign.status === "sent") {
      return new Response(
        JSON.stringify({ error: "Campaign already sent" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update campaign status to sending
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("status", "active");

    if (subscribersError) {
      throw subscribersError;
    }

    const stats = { total: subscribers?.length || 0, sent: 0, failed: 0 };

    // Process subscribers in batches
    for (let i = 0; i < (subscribers?.length || 0); i += BATCH_SIZE) {
      const batch = subscribers?.slice(i, i + BATCH_SIZE) || [];
      
      const emailPromises = batch.map(async (subscriber) => {
        try {
          const isRTL = subscriber.language === 'he';
          const subject = isRTL ? campaign.subject_he : (campaign.subject_en || campaign.subject_he);
          const content = isRTL ? campaign.content_html_he : (campaign.content_html_en || campaign.content_html_he);
          
          // Personalize content
          const personalizedContent = content
            .replace(/\{\{name\}\}/g, subscriber.name || (isRTL ? 'חבר/ה' : 'Friend'))
            .replace(/\{\{email\}\}/g, subscriber.email);
          
          const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${subscriber.unsubscribe_token}`;
          
          const emailHtml = `
            <!DOCTYPE html>
            <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${subscriber.language || 'he'}">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>${getEmailStyles(isRTL)}</style>
            </head>
            <body>
              <div class="container">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00f0ff, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 28px;">⚡</span>
                  </div>
                  <h2 style="color: #00f0ff; margin: 0;">Mind Hacker</h2>
                </div>
                <div class="content">${personalizedContent}</div>
                <div class="footer">
                  <p style="color: #6b7280; font-size: 14px;">${isRTL ? 'Mind Hacker - פלטפורמת התפתחות אישית' : 'Mind Hacker - Personal Development Platform'}</p>
                  <a href="${unsubscribeUrl}" class="unsubscribe">${isRTL ? 'להסרה מרשימת התפוצה' : 'Unsubscribe'}</a>
                </div>
              </div>
            </body>
            </html>
          `;

          const emailResponse = await resend.emails.send({
            from: "Mind Hacker <onboarding@resend.dev>",
            to: [subscriber.email],
            subject,
            html: emailHtml,
          });

          // Log email
          await supabase.from("email_logs").insert({
            recipient_email: subscriber.email,
            recipient_user_id: subscriber.user_id || null,
            email_type: "newsletter",
            subject,
            status: "sent",
            resend_id: emailResponse.data?.id || null,
            metadata: { campaignId, language: subscriber.language }
          });

          stats.sent++;
        } catch (error) {
          console.error(`Error sending to ${subscriber.email}:`, error);
          stats.failed++;
        }
      });

      await Promise.all(emailPromises);
      
      // Wait between batches
      if (i + BATCH_SIZE < (subscribers?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    // Update campaign status
    await supabase
      .from("newsletter_campaigns")
      .update({ 
        status: "sent",
        sent_at: new Date().toISOString(),
        stats: { ...stats, opened: 0, clicked: 0, bounced: 0 }
      })
      .eq("id", campaignId);

    console.log(`Newsletter campaign ${campaignId} sent:`, stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-newsletter:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
