import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { trackWhatsAppClick } from "@/hooks/useAnalytics";
import { useLocation } from "react-router-dom";

// Context-aware message generator
const getContextMessage = (pathname: string, isRTL: boolean): string => {
  const messages = {
    // Homepage sections
    '/': isRTL 
      ? 'היי דין, גיליתי את מיינד האקר ואני סקרן לשמוע עוד...'
      : 'Hi Dean, I just discovered Mind Hacker and I\'m curious to learn more...',
    
    // Personal Hypnosis
    '/personal-hypnosis': isRTL
      ? 'היי, אני מתעניין/ת בסרטון ההיפנוזה האישי. אשמח לשמוע פרטים...'
      : 'Hi, I\'m interested in the Personal Hypnosis Video. I\'d love to learn more...',
    
    // Consciousness Leap
    '/consciousness-leap': isRTL
      ? 'היי דין, קראתי על תהליך קפיצה לתודעה חדשה ואני רוצה לבדוק אם זה מתאים לי...'
      : 'Hi Dean, I read about the Consciousness Leap process and want to check if it\'s right for me...',
    
    // Form/Introspection
    '/form': isRTL
      ? 'היי, סיימתי את שאלון ההתבוננות ואשמח לדבר על מה שעלה...'
      : 'Hi, I completed the introspection questionnaire and would love to discuss what came up...',
    
    // Courses
    '/courses': isRTL
      ? 'היי, אני מתעניין/ת במוצרים הדיגיטליים שלך. אשמח לשמוע המלצה...'
      : 'Hi, I\'m interested in your digital products. I\'d appreciate a recommendation...',
    
    // Dashboard
    '/dashboard': isRTL
      ? 'היי דין, יש לי שאלה לגבי הרכישה שלי...'
      : 'Hi Dean, I have a question about my purchase...',
  };

  // Check for partial matches (for dynamic routes like /form/:token)
  for (const [path, message] of Object.entries(messages)) {
    if (pathname.startsWith(path) && path !== '/') {
      return message;
    }
  }

  // Default fallback
  return messages['/'];
};

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const { t, isRTL } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["whatsapp_number", "whatsapp_enabled"]);

      if (!error && data) {
        const settings = data.reduce((acc: Record<string, string>, item) => {
          acc[item.setting_key] = item.setting_value || "";
          return acc;
        }, {});
        
        setWhatsappNumber(settings.whatsapp_number || "");
        setIsEnabled(settings.whatsapp_enabled === "true");
      }
    };

    fetchSettings();
  }, []);

  if (!isEnabled || !whatsappNumber) return null;

  // Get context-aware message based on current page
  const message = getContextMessage(location.pathname, isRTL);
  const cleanedNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track analytics with context
    trackWhatsAppClick();
    // Use window.open to avoid iframe navigation issues and always open a new tab
    e.preventDefault();
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-4 right-4 md:bottom-8 md:right-28 z-50 w-12 h-12 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group"
      aria-label={t('whatsapp.ariaLabel')}
    >
      <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
    </a>
  );
};

export default WhatsAppButton;
