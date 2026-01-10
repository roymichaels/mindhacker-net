import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FormPdfEmailRequest {
  email: string;
  name?: string;
  formTitle: string;
  pdfBase64: string;
  language?: 'he' | 'en';
  submissionId?: string;
}

const getEmailStyles = (isRTL: boolean) => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; padding: 0; background-color: #020c14; color: #e5e7eb; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .content { background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; padding: 30px; direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}; }
  h1 { color: #00f0ff; font-size: 24px; margin-bottom: 20px; }
  p { color: #9ca3af; line-height: 1.8; margin-bottom: 16px; }
  .cta-button { display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%); color: #000 !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
`;

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, name, formTitle, pdfBase64, language = 'he', submissionId }: FormPdfEmailRequest = await req.json();

    if (!email || !formTitle || !pdfBase64) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";
    const isRTL = language === 'he';
    const displayName = name || (isRTL ? 'חבר/ה יקר/ה' : 'Friend');

    // Hebrew email content
    const hebrewContent = `
      <h1>תוצאות המסע שלך 📜</h1>
      <p>היי ${displayName},</p>
      <p>מצורף כאן קובץ PDF עם התשובות שלך ל"${formTitle}".</p>
      <p>זה הזמן להתבונן בתשובות שלך, לקרוא אותן שוב, ולתת להן לשקוע.</p>
      <p>התשובות שלך מספרות סיפור. קרא/י אותו בתשומת לב.</p>
      <p>כשתרגיש/י מוכן/ה לצעד הבא במסע התודעה:</p>
      <center>
        <a href="${siteUrl}/consciousness-leap" class="cta-button">גלה את קפיצה לתודעה חדשה</a>
      </center>
      <p style="margin-top: 30px;">במחויבות למסע שלך,<br/><strong style="color: #00f0ff;">דין אושר אזולאי</strong></p>
    `;

    // English email content
    const englishContent = `
      <h1>Your Journey Results 📜</h1>
      <p>Hi ${displayName},</p>
      <p>Attached is a PDF with your answers to "${formTitle}".</p>
      <p>Take time to reflect on your responses, read them again, and let them sink in.</p>
      <p>Your answers tell a story. Read it with attention.</p>
      <p>When you feel ready for the next step in your consciousness journey:</p>
      <center>
        <a href="${siteUrl}/consciousness-leap" class="cta-button">Discover Consciousness Leap</a>
      </center>
      <p style="margin-top: 30px;">Committed to your journey,<br/><strong style="color: #00f0ff;">Dean Osher Azulay</strong></p>
    `;

    const emailContent = isRTL ? hebrewContent : englishContent;
    const subject = isRTL ? `תוצאות ${formTitle} שלך` : `Your ${formTitle} Results`;

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
              <span style="font-size: 28px;">📜</span>
            </div>
            <h2 style="color: #00f0ff; margin: 0;">Mind Hacker</h2>
          </div>
          <div class="content">${emailContent}</div>
          <div class="footer">
            <p style="color: #6b7280; font-size: 14px;">${isRTL ? 'מיינד האקר - דין אושר אזולאי' : 'Mind Hacker - Dean Osher Azulay'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Decode base64 PDF
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: "Mind Hacker <onboarding@resend.dev>",
      to: [email],
      subject,
      html: emailHtml,
      attachments: [
        {
          filename: `${formTitle.replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, '_')}.pdf`,
          content: pdfBuffer,
        }
      ]
    });

    console.log("Form PDF email sent:", emailResponse);

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: email,
      email_type: "form_pdf",
      subject,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
      metadata: { language, formTitle, submissionId }
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-form-pdf-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
