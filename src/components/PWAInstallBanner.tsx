import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { PWAInstallModal } from './PWAInstallModal';

const DISMISSED_KEY = 'pwa-install-banner-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const PWAInstallBanner = () => {
  const { isInstalled, isInstallable, isIOS, isAndroid, canPromptInstall, promptInstall } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(true);
    }
  };

  if (!isVisible) return (
    <PWAInstallModal open={showModal} onOpenChange={setShowModal} />
  );

  return (
    <>
      <div 
        className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}
      >
        <div className="bg-background/95 backdrop-blur-xl border border-cyan-500/30 rounded-full px-3 py-2 shadow-lg shadow-cyan-500/10">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 text-white" />
            </div>
            
            <span className="text-xs font-medium flex-1 truncate">התקן כאפליקציה</span>
            
            <Button
              onClick={handleInstall}
              size="sm"
              className="h-6 px-2.5 text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 rounded-full"
            >
              <Download className="w-3 h-3 ml-1" />
              {canPromptInstall ? 'התקן' : 'הוראות'}
            </Button>
            
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full hover:bg-muted"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
      
      <PWAInstallModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
};