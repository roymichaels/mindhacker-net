import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderId: string;
  userEmail: string;
  userName?: string;
  productName: string;
  amount: number;
}

const getEmailStyles = () => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #020c14; color: #e5e7eb; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .content { background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; padding: 30px; }
  h1 { color: #00f0ff; font-size: 24px; margin-bottom: 20px; }
  h2 { color: #f59e0b; font-size: 18px; margin-bottom: 16px; }
  p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
  .highlight { color: #00f0ff; font-weight: bold; }
  .amount { color: #22c55e; font-size: 28px; font-weight: bold; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); color: #000 !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  .info-box { background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  td { padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
  td:first-child { color: #9ca3af; }
  td:last-child { color: #e5e7eb; text-align: right; }
`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, userEmail, userName, productName, amount }: OrderNotificationRequest = await req.json();

    if (!orderId || !userEmail || !productName || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin email from site_settings
    const { data: emailSetting } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "email")
      .maybeSingle();

    const adminEmail = emailSetting?.setting_value || "dean@mind-hacker.net";
    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";
    const orderDate = new Date().toLocaleString("he-IL", { 
      timeZone: "Asia/Jerusalem",
      dateStyle: "full",
      timeStyle: "short"
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00f0ff, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🛒</span>
            </div>
            <h2 style="color: #00f0ff; margin: 0;">New Order Received!</h2>
          </div>
          
          <div class="content">
            <h1>📦 New Order Alert</h1>
            <p>A new order has been placed and is awaiting payment approval.</p>
            
            <div class="info-box">
              <table>
                <tr>
                  <td>Order ID</td>
                  <td><span class="highlight">${orderId.substring(0, 8)}...</span></td>
                </tr>
                <tr>
                  <td>Product</td>
                  <td><strong>${productName}</strong></td>
                </tr>
                <tr>
                  <td>Amount</td>
                  <td><span class="amount">₪${amount}</span></td>
                </tr>
                <tr>
                  <td>Customer</td>
                  <td>${userName || userEmail}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td><a href="mailto:${userEmail}" style="color: #00f0ff;">${userEmail}</a></td>
                </tr>
                <tr>
                  <td>Date</td>
                  <td>${orderDate}</td>
                </tr>
              </table>
            </div>
            
            <h2>⚡ Action Required</h2>
            <p>Please review this order and send payment instructions to the customer.</p>
            
            <center>
              <a href="${siteUrl}/admin/products" class="cta-button">Review Order in Admin Panel</a>
            </center>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              This is an automated notification from Mind Hacker order system.
            </p>
          </div>
          
          <div class="footer">
            <p style="color: #6b7280; font-size: 14px;">Mind Hacker - Personal Development Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const subject = `🛒 New Order: ${productName} - ₪${amount}`;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Mind Hacker <onboarding@resend.dev>",
      to: [adminEmail],
      subject,
      html: emailHtml,
    });

    console.log("Order notification email sent:", emailResponse);

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: adminEmail,
      email_type: "order_notification",
      subject,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
      metadata: { orderId, userEmail, productName, amount }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-order-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});