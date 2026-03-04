import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Send, Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import { useTranslation } from "@/hooks/useTranslation";

const Footer = () => {
  const { t, isRTL } = useTranslation();
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: "https://instagram.com",
    instagram_enabled: true,
    telegram_url: "https://t.me",
    telegram_enabled: true,
    email: "contact@consciousness-hacker.com",
    email_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["instagram_url", "instagram_enabled", "telegram_url", "telegram_enabled", "email", "email_enabled"]);

      if (!error && data) {
        const settings = data.reduce((acc: any, item) => {
          // Handle boolean values for enabled fields
          if (item.setting_key.endsWith('_enabled')) {
            acc[item.setting_key] = item.setting_value === 'true';
          } else {
            acc[item.setting_key] = item.setting_value;
          }
          return acc;
        }, {});
        setSocialLinks({ ...socialLinks, ...settings });
      }
      setLoading(false);
    };

    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=in.(instagram_url,instagram_enabled,telegram_url,telegram_enabled,email,email_enabled)'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  return (
    <footer className="relative py-12 md:py-20 px-4 border-t border-border/30" style={{ zIndex: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto text-center">

        {/* Legal Links */}
        <div className="flex justify-center gap-4 md:gap-6 mb-4 text-sm">
          <Link 
            to="/privacy-policy" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {t('legal.privacy.title')}
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <Link 
            to="/terms-of-service" 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {t('legal.terms.title')}
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
