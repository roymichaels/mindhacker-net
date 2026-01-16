// Email template utilities for consistent branding

export interface EmailTemplateData {
  recipientName?: string;
  language: 'he' | 'en';
}

const isRTL = (lang: 'he' | 'en') => lang === 'he';

export const getEmailStyles = (lang: 'he' | 'en') => `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #020c14;
    color: #e5e7eb;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  .logo {
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
  }
  .content {
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 16px;
    padding: 30px;
    direction: ${isRTL(lang) ? 'rtl' : 'ltr'};
    text-align: ${isRTL(lang) ? 'right' : 'left'};
  }
  h1 {
    color: #00f0ff;
    font-size: 24px;
    margin-bottom: 20px;
  }
  p {
    color: #9ca3af;
    line-height: 1.8;
    margin-bottom: 16px;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%);
    color: #000 !important;
    padding: 14px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    margin: 20px 0;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .unsubscribe {
    color: #6b7280;
    font-size: 12px;
    text-decoration: underline;
  }
`;

export interface EmailBrandSettings {
  brandName?: string;
  brandNameEn?: string;
  founderName?: string;
  founderNameEn?: string;
  founderShortName?: string;
  founderShortNameEn?: string;
  primaryColor?: string;
}

export const getEmailWrapper = (
  content: string, 
  lang: 'he' | 'en', 
  unsubscribeUrl?: string,
  brandSettings?: EmailBrandSettings
) => {
  const brandName = brandSettings?.brandName || 'מיינד האקר';
  const brandNameEn = brandSettings?.brandNameEn || 'Mind Hacker';
  const founderName = brandSettings?.founderName || 'דין אושר אזולאי';
  const founderNameEn = brandSettings?.founderNameEn || 'Dean Osher Azulay';
  const displayBrand = lang === 'he' ? brandName : brandNameEn;
  const displayFounder = lang === 'he' ? founderName : founderNameEn;
  const fullFooter = lang === 'he' ? `${brandName} - ${founderName}` : `${brandNameEn} - ${founderNameEn}`;
  
  return `
<!DOCTYPE html>
<html dir="${isRTL(lang) ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${getEmailStyles(lang)}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00f0ff, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⚡</span>
      </div>
      <h2 style="color: #00f0ff; margin: 0;">${displayBrand}</h2>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="color: #6b7280; font-size: 14px;">
        ${fullFooter}
      </p>
      ${unsubscribeUrl ? `
        <a href="${unsubscribeUrl}" class="unsubscribe">
          ${lang === 'he' ? 'להסרה מרשימת התפוצה' : 'Unsubscribe'}
        </a>
      ` : ''}
    </div>
  </div>
</body>
</html>
`;
};

export const welcomeEmailContent = {
  he: (name: string) => `
    <h1>ברוך הבא, ${name}! 🎉</h1>
    <p>שמח שהצטרפת למסע התודעה.</p>
    <p>עכשיו יש לך גישה לשלושה מסלולים שיכולים לשנות את החיים שלך:</p>
    <ul style="color: #9ca3af; line-height: 2;">
      <li><strong style="color: #00f0ff;">מסע התבוננות עמוק</strong> - מתנה חינמית להכרות עמוקה עם עצמך</li>
      <li><strong style="color: #8b5cf6;">סרטון היפנוזה אישי</strong> - הקלטה מותאמת אישית במיוחד בשבילך</li>
      <li><strong style="color: #f59e0b;">קפיצה לתודעה חדשה</strong> - תהליך טרנספורמציה מעמיק</li>
    </ul>
    <p>התחל היום עם המתנה החינמית:</p>
    <center>
      <a href="{{SITE_URL}}/form/{{FORM_TOKEN}}" class="cta-button">
        התחל את מסע ההתבוננות
      </a>
    </center>
    <p style="margin-top: 30px;">
      אני כאן בשבילך,<br/>
      <strong style="color: #00f0ff;">דין אושר אזולאי</strong>
    </p>
  `,
  en: (name: string) => `
    <h1>Welcome, ${name}! 🎉</h1>
    <p>I'm glad you joined the consciousness journey.</p>
    <p>You now have access to three paths that can change your life:</p>
    <ul style="color: #9ca3af; line-height: 2;">
      <li><strong style="color: #00f0ff;">Deep Introspection Journey</strong> - A free gift for deep self-discovery</li>
      <li><strong style="color: #8b5cf6;">Personal Hypnosis Video</strong> - A recording customized just for you</li>
      <li><strong style="color: #f59e0b;">Consciousness Leap</strong> - A deep transformation process</li>
    </ul>
    <p>Start today with the free gift:</p>
    <center>
      <a href="{{SITE_URL}}/form/{{FORM_TOKEN}}" class="cta-button">
        Start the Introspection Journey
      </a>
    </center>
    <p style="margin-top: 30px;">
      I'm here for you,<br/>
      <strong style="color: #00f0ff;">Dean Osher Azulay</strong>
    </p>
  `
};

export const formResultsEmailContent = {
  he: (name: string, formTitle: string) => `
    <h1>תוצאות המסע שלך 📜</h1>
    <p>היי ${name},</p>
    <p>מצורף כאן קובץ PDF עם התשובות שלך ל"${formTitle}".</p>
    <p>זה הזמן להתבונן בתשובות שלך, לקרוא אותן שוב, ולתת להן לשקוע.</p>
    <p>כשתרגיש מוכן/ה לצעד הבא במסע התודעה:</p>
    <center>
      <a href="{{SITE_URL}}/consciousness-leap" class="cta-button">
        גלה את קפיצה לתודעה חדשה
      </a>
    </center>
    <p style="margin-top: 30px;">
      במחויבות למסע שלך,<br/>
      <strong style="color: #00f0ff;">דין אושר אזולאי</strong>
    </p>
  `,
  en: (name: string, formTitle: string) => `
    <h1>Your Journey Results 📜</h1>
    <p>Hi ${name},</p>
    <p>Attached is a PDF with your answers to "${formTitle}".</p>
    <p>Take time to reflect on your responses, read them again, and let them sink in.</p>
    <p>When you feel ready for the next step in your consciousness journey:</p>
    <center>
      <a href="{{SITE_URL}}/consciousness-leap" class="cta-button">
        Discover Consciousness Leap
      </a>
    </center>
    <p style="margin-top: 30px;">
      Committed to your journey,<br/>
      <strong style="color: #00f0ff;">Dean Osher Azulay</strong>
    </p>
  `
};

export const newsletterWelcomeContent = {
  he: (name?: string) => `
    <h1>${name ? `היי ${name}` : 'היי'}, ברוכים הבאים! ✨</h1>
    <p>תודה שהצטרפת לניוזלטר של Mind Hacker.</p>
    <p>מעכשיו תקבל/י:</p>
    <ul style="color: #9ca3af; line-height: 2;">
      <li>תובנות שבועיות על תודעה ושינוי</li>
      <li>טיפים מעשיים שאפשר ליישם מיד</li>
      <li>עדכונים על תכנים חדשים והזדמנויות מיוחדות</li>
    </ul>
    <p style="margin-top: 20px;">
      להתראות במייל הבא,<br/>
      <strong style="color: #00f0ff;">דין</strong>
    </p>
  `,
  en: (name?: string) => `
    <h1>${name ? `Hi ${name}` : 'Hi there'}, welcome! ✨</h1>
    <p>Thank you for joining the Mind Hacker newsletter.</p>
    <p>From now on you'll receive:</p>
    <ul style="color: #9ca3af; line-height: 2;">
      <li>Weekly insights on consciousness and change</li>
      <li>Practical tips you can apply immediately</li>
      <li>Updates about new content and special opportunities</li>
    </ul>
    <p style="margin-top: 20px;">
      See you in the next email,<br/>
      <strong style="color: #00f0ff;">Dean</strong>
    </p>
  `
};
