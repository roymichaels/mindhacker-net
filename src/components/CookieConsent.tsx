import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

const CookieConsent = () => {
  const { t, isRTL } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already accepted cookies
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasAccepted) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setShowBanner(false);
  };

  const handleDismiss = () => {
    // Just hide for this session, will show again next visit
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-20 md:bottom-24 left-0 right-0 z-40 p-4 animate-in slide-in-from-bottom-5 duration-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-4 md:p-6 rounded-xl border border-primary/20 flex flex-col md:flex-row items-center gap-4">
          <Cookie className="w-8 h-8 text-primary flex-shrink-0 hidden md:block" />
          
          <div className="flex-1 text-center md:text-start">
            <p className="text-sm md:text-base text-muted-foreground">
              {t('legal.cookies.message')}{' '}
              <Link 
                to="/privacy-policy" 
                className="text-primary hover:underline"
              >
                {t('legal.cookies.learnMore')}
              </Link>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-primary hover:bg-primary-glow"
            >
              {t('legal.cookies.accept')}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="p-2"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
