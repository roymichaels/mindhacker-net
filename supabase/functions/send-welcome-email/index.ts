import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  language?: 'he' | 'en';
  subscribeNewsletter?: boolean;
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

    const { userId, email, fullName, language = 'he', subscribeNewsletter = false }: WelcomeEmailRequest = await req.json();

    if (!email || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://tsvfsbluyuaajqmkpzdv.lovable.app";
    const isRTL = language === 'he';
    
    // Get the introspection form token
    const { data: formData } = await supabase
      .from("custom_forms")
      .select("access_token")
      .eq("status", "published")
      .limit(1)
      .single();
    
    const formToken = formData?.access_token || "";

    // Hebrew email content
    const hebrewContent = `
      <h1>ברוך הבא, ${fullName}! 🎉</h1>
      <p>שמח שהצטרפת למסע התודעה.</p>
      <p>עכשיו יש לך גישה לשלושה מסלולים שיכולים לשנות את החיים שלך:</p>
      <ul style="color: #9ca3af; line-height: 2;">
        <li><strong style="color: #00f0ff;">מסע התבוננות עמוק</strong> - מתנה חינמית להכרות עמוקה עם עצמך</li>
        <li><strong style="color: #8b5cf6;">סרטון היפנוזה אישי</strong> - הקלטה מותאמת אישית במיוחד בשבילך</li>
        <li><strong style="color: #f59e0b;">קפיצה לתודעה חדשה</strong> - תהליך טרנספורמציה מעמיק</li>
      </ul>
      ${formToken ? `
        <p>התחל היום עם המתנה החינמית:</p>
        <center>
          <a href="${siteUrl}/form/${formToken}" class="cta-button">התחל את מסע ההתבוננות</a>
        </center>
      ` : ''}
      <p style="margin-top: 30px;">אני כאן בשבילך,<br/><strong style="color: #00f0ff;">דין אושר אזולאי</strong></p>
    `;

    // English email content
    const englishContent = `
      <h1>Welcome, ${fullName}! 🎉</h1>
      <p>I'm glad you joined the consciousness journey.</p>
      <p>You now have access to three paths that can change your life:</p>
      <ul style="color: #9ca3af; line-height: 2;">
        <li><strong style="color: #00f0ff;">Deep Introspection Journey</strong> - A free gift for deep self-discovery</li>
        <li><strong style="color: #8b5cf6;">Personal Hypnosis Video</strong> - A recording customized just for you</li>
        <li><strong style="color: #f59e0b;">Consciousness Leap</strong> - A deep transformation process</li>
      </ul>
      ${formToken ? `
        <p>Start today with the free gift:</p>
        <center>
          <a href="${siteUrl}/form/${formToken}" class="cta-button">Start the Introspection Journey</a>
        </center>
      ` : ''}
      <p style="margin-top: 30px;">I'm here for you,<br/><strong style="color: #00f0ff;">Dean Osher Azulay</strong></p>
    `;

    const emailContent = isRTL ? hebrewContent : englishContent;
    const subject = isRTL ? "ברוך הבא למסע התודעה 🧠" : "Welcome to Your Consciousness Journey 🧠";

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
              <span style="font-size: 28px;">⚡</span>
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

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Mind Hacker <onboarding@resend.dev>",
      to: [email],
      subject,
      html: emailHtml,
    });

    console.log("Welcome email sent:", emailResponse);

    // Log email
    await supabase.from("email_logs").insert({
      recipient_email: email,
      recipient_user_id: userId || null,
      email_type: "welcome",
      subject,
      status: "sent",
      resend_id: emailResponse.data?.id || null,
      metadata: { language, fullName }
    });

    // Subscribe to newsletter if opted in
    if (subscribeNewsletter) {
      await supabase.from("newsletter_subscribers").upsert({
        email,
        name: fullName,
        user_id: userId || null,
        source: "signup",
        language,
        status: "active"
      }, { onConflict: "email" });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-welcome-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
