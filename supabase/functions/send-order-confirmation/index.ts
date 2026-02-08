import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  userEmail: string;
  userName?: string;
  productName: string;
  amount: number;
  language?: 'he' | 'en';
}

const getEmailStyles = (isRTL: boolean) => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #020c14; color: #e5e7eb; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .content { background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; padding: 30px; direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}; }
  h1 { color: #00f0ff; font-size: 24px; margin-bottom: 20px; }
  h2 { color: #f59e0b; font-size: 18px; margin-bottom: 16px; }
  p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
  .highlight { color: #00f0ff; font-weight: bold; }
  .amount { color: #22c55e; font-size: 28px; font-weight: bold; }
  .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .step-number { width: 28px; height: 28px; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000; font-weight: bold; font-size: 14px; flex-shrink: 0; }
  .step-content { flex: 1; }
  .info-box { background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
  .warning-box { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 16px; margin: 16px 0; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); color: #000 !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  td { padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
  td:first-child { color: #9ca3af; }
  td:last-child { color: #e5e7eb; text-align: ${isRTL ? 'left' : 'right'}; }
`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, userEmail, userName, productName, amount, language = 'he' }: OrderConfirmationRequest = await req.json();

    if (!orderId || !userEmail || !productName || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isRTL = language === 'he';
    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";
    const displayName = userName || userEmail.split('@')[0];

    // Get WhatsApp number from site settings
    const { data: whatsappSetting } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "whatsapp_number")
      .maybeSingle();

    const whatsappNumber = whatsappSetting?.setting_value || "972543456789";
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(isRTL ? `שלום, ביצעתי הזמנה (${orderId.substring(0, 8)}) ואשמח לקבל הוראות תשלום` : `Hi, I placed an order (${orderId.substring(0, 8)}) and would like payment instructions`)}`;

    // Hebrew content
    const hebrewContent = `
      <h1>תודה על ההזמנה, ${displayName}! 🎉</h1>
      <p>ההזמנה שלך התקבלה בהצלחה ומחכה לאישור תשלום.</p>
      
      <div class="info-box">
        <table>
          <tr>
            <td>מספר הזמנה</td>
            <td><span class="highlight">${orderId.substring(0, 8)}...</span></td>
          </tr>
          <tr>
            <td>מוצר</td>
            <td><strong>${productName}</strong></td>
          </tr>
          <tr>
            <td>סכום לתשלום</td>
            <td><span class="amount">₪${amount}</span></td>
          </tr>
        </table>
      </div>
      
      <h2>📋 מה הלאה?</h2>
      
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">העבר את התשלום</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">צור איתי קשר בוואטסאפ לקבלת פרטי תשלום (ביט / העברה בנקאית)</p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">אישור התשלום</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">לאחר קבלת התשלום, תקבל אישור במייל</p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">יצירת הסרטון</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">תוך 2 ימי עסקים הסרטון האישי שלך יהיה מוכן!</p>
        </div>
      </div>
      
      <center>
        <a href="${whatsappLink}" class="cta-button">💬 שלח הודעה בוואטסאפ</a>
      </center>
      
      <div class="warning-box">
        <p style="margin: 0; color: #f59e0b;"><strong>שים לב:</strong> ההזמנה תישמר ל-7 ימים. אם לא התקבל תשלום, ההזמנה תבוטל אוטומטית.</p>
      </div>
      
      <p style="margin-top: 30px;">מחכים לשמוע ממך,<br/><strong style="color: #00f0ff;">צוות Mind OS</strong></p>
    `;

    // English content
    const englishContent = `
      <h1>Thank you for your order, ${displayName}! 🎉</h1>
      <p>Your order has been received and is awaiting payment confirmation.</p>
      
      <div class="info-box">
        <table>
          <tr>
            <td>Order Number</td>
            <td><span class="highlight">${orderId.substring(0, 8)}...</span></td>
          </tr>
          <tr>
            <td>Product</td>
            <td><strong>${productName}</strong></td>
          </tr>
          <tr>
            <td>Amount Due</td>
            <td><span class="amount">$${Math.round(amount / 3.7)}</span></td>
          </tr>
        </table>
      </div>
      
      <h2>📋 What's Next?</h2>
      
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">Complete Your Payment</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">Contact me on WhatsApp to receive payment details (PayPal / Bank Transfer)</p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">Payment Confirmation</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">Once payment is received, you'll get a confirmation email</p>
        </div>
      </div>
      
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <strong style="color: #e5e7eb;">Video Creation</strong>
          <p style="margin-top: 8px; margin-bottom: 0;">Within 2 business days, your personal video will be ready!</p>
        </div>
      </div>
      
      <center>
        <a href="${whatsappLink}" class="cta-button">💬 Message on WhatsApp</a>
      </center>
      
      <div class="warning-box">
        <p style="margin: 0; color: #f59e0b;"><strong>Note:</strong> Your order will be held for 7 days. If payment is not received, it will be automatically cancelled.</p>
      </div>
      
      <p style="margin-top: 30px;">Looking forward to hearing from you,<br/><strong style="color: #00f0ff;">Mind OS Team</strong></p>
    `;

    const emailContent = isRTL ? hebrewContent : englishContent;
    const subject = isRTL 
      ? `✅ ההזמנה שלך התקבלה - ${productName}` 
      : `✅ Your Order Received - Personal Hypnosis Video`;

    const emailHtml = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles(isRTL)}</style>
      </head>
      <body>
        <div class="container">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00f0ff, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">✅</span>
            </div>
            <h2 style="color: #00f0ff; margin: 0;">Mind OS</h2>
          </div>
          <div class="content">${emailContent}</div>
          <div class="footer">
            <p style="color: #6b7280; font-size: 14px;">${isRTL ? 'Mind OS - פלטפורמת התפתחות אישית' : 'Mind OS - Personal Development Platform'}</p>
            <p style="color: #6b7280; font-size: 12px;">
              <a href="${siteUrl}/dashboard" style="color: #00f0ff;">${isRTL ? 'צפה בהזמנות שלי' : 'View My Orders'}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Mind OS <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html: emailHtml,
    });

    console.log("Order confirmation email sent:", emailResponse);

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: userEmail,
      email_type: "order_confirmation",
      subject,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
      metadata: { orderId, productName, amount, language }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-order-confirmation:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});