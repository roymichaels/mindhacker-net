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
      className="fixed left-0 right-0 z-40 px-3 pb-3 md:px-4 md:pb-4 animate-in slide-in-from-bottom-5 duration-300 pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)" }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-3 md:p-6 rounded-2xl border border-primary/20 shadow-[0_18px_50px_rgba(0,0,0,0.28)] flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 pointer-events-auto">
          <Cookie className="w-7 h-7 text-primary flex-shrink-0 hidden md:block" />
          
          <div className="flex-1 text-center md:text-start min-w-0">
            <p className="text-sm leading-6 md:text-base text-muted-foreground">
              {t('legal.cookies.message')}{' '}
              <Link 
                to="/privacy-policy" 
                className="text-primary hover:underline whitespace-nowrap"
              >
                {t('legal.cookies.learnMore')}
              </Link>
            </p>
          </div>

          <div className="flex w-full md:w-auto items-center justify-center gap-2">
            <Button
              onClick={handleAccept}
              size="sm"
              className="bg-primary hover:bg-primary-glow min-w-[112px]"
            >
              {t('legal.cookies.accept')}
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 shrink-0"
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
