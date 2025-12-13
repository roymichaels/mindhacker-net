import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISMISSED_KEY = 'pwa-install-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const PWAInstallBanner = () => {
  const navigate = useNavigate();
  const { isInstalled, isInstallable, isIOS, isAndroid, canPromptInstall, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return; // Still within dismiss period
      }
    }

    // Show banner if not installed and either installable or iOS/Android
    if (!isInstalled && (isInstallable || isIOS || isAndroid)) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstalled, isInstallable, isIOS, isAndroid]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    }, 300);
  };

  const handleInstall = async () => {
    if (canPromptInstall) {
      const accepted = await promptInstall();
      if (accepted) {
        setIsVisible(false);
      }
    } else {
      navigate('/install');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-4 shadow-xl shadow-cyan-500/10">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">התקן כאפליקציה</h3>
            <p className="text-xs text-muted-foreground mb-3">
              גישה מהירה מהמסך הראשי + התראות על תוכן חדש
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-xs h-8"
              >
                <Download className="w-3.5 h-3.5 ml-1.5" />
                {canPromptInstall ? 'התקן' : 'הוראות'}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
