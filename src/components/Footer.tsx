import { useState, useEffect } from "react";
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
    <footer className="relative py-12 md:py-20 px-4 border-t border-primary/20" style={{ zIndex: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Final CTA Section - More personal */}
        <div className="mb-12 glass-panel p-8 md:p-12 rounded-2xl">
          <p className="text-sm md:text-base text-secondary mb-2">{t('footer.firstStepNote')}</p>
          <p className="text-2xl md:text-4xl font-black mb-4 cyber-glow">
            {t('footer.ctaTitle')}
          </p>
          <p className="text-muted-foreground mb-6">
            {t('footer.ctaSubtitle')}
          </p>
          <p className="text-secondary italic mb-8 text-sm md:text-base">
            {t('footer.quote')}
          </p>
          <LeadCaptureDialog 
            source="footer_cta"
            triggerText={t('footer.ctaButton')}
            triggerIcon={<Sparkles className="w-5 h-5" />}
            triggerClassName="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg px-8 py-6 rounded-full cyber-border pulse-glow transition-all duration-300 transform hover:scale-105"
            showPreferredTime={true}
          />
        </div>

        <div className="flex justify-center gap-4 md:gap-8 mb-8 md:mb-12">
          {socialLinks.instagram_enabled && (
            <a
              href={socialLinks.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
            >
              <Instagram className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-primary-glow transition-colors" />
            </a>
          )}
          {socialLinks.telegram_enabled && (
            <a
              href={socialLinks.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-16 md:h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
            >
              <Send className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-primary-glow transition-colors" />
            </a>
          )}
          {socialLinks.email_enabled && (
            <a
              href={`mailto:${socialLinks.email}`}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
            >
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:text-primary-glow transition-colors" />
            </a>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute top-20 right-20 w-2 h-2 bg-secondary rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-primary-glow rounded-full animate-ping" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "3s" }} />
      </div>
    </footer>
  );
};

export default Footer;
