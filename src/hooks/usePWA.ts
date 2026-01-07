import { useState, useEffect, useCallback } from 'react';
import { debug } from '@/lib/debug';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Detect standalone mode (PWA installed)
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    // Listen for beforeinstallprompt event (Chrome/Edge/Samsung)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      debug.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      debug.log('No install prompt available');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
      return outcome === 'accepted';
    } catch (error) {
      debug.error('Error prompting install:', error);
      return false;
    }
  }, [deferredPrompt]);

  const getInstallInstructions = useCallback(() => {
    if (isIOS) {
      return {
        title: 'התקנה באייפון',
        steps: [
          'לחץ על כפתור השיתוף (📤) בתחתית הדפדפן',
          'גלול למטה ובחר "הוסף למסך הבית"',
          'לחץ "הוסף" בפינה הימנית העליונה',
          'האפליקציה תופיע במסך הבית שלך!'
        ]
      };
    }
    
    if (isAndroid) {
      return {
        title: 'התקנה באנדרואיד',
        steps: [
          'לחץ על שלוש הנקודות (⋮) בפינה הימנית העליונה',
          'בחר "התקן אפליקציה" או "הוסף למסך הבית"',
          'לחץ "התקן"',
          'האפליקציה תופיע במסך הבית שלך!'
        ]
      };
    }

    return {
      title: 'התקנה במחשב',
      steps: [
        'לחץ על האייקון בשורת הכתובת (⊕)',
        'או לחץ על שלוש הנקודות בתפריט הדפדפן',
        'בחר "התקן את מיינד האקר"',
        'האפליקציה תיפתח בחלון נפרד!'
      ]
    };
  }, [isIOS, isAndroid]);

  return {
    isInstalled,
    isInstallable,
    isIOS,
    isAndroid,
    isStandalone,
    promptInstall,
    getInstallInstructions,
    canPromptInstall: !!deferredPrompt
  };
};
