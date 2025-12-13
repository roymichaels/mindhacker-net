import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { X, Bell, BellRing } from 'lucide-react';
import { toast } from 'sonner';

const DISMISSED_KEY = 'notification-prompt-dismissed';
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days

export const NotificationPermissionPrompt = () => {
  const { user } = useAuth();
  const { isStandalone, isIOS } = usePWA();
  const { 
    permission, 
    isSubscribed, 
    isSupported, 
    isPWA, 
    isLoading, 
    subscribe 
  } = usePushNotifications();

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Only show for logged-in users
    if (!user) return;

    // Don't show if already subscribed or permission denied
    if (isSubscribed || permission === 'denied') return;

    // Don't show if not supported
    if (!isSupported) return;

    // On iOS, only show if running as PWA
    if (isIOS && !isPWA && !isStandalone) return;

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        return;
      }
    }

    // Delay showing for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 50);
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, isSubscribed, permission, isSupported, isIOS, isPWA, isStandalone]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    }, 300);
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      toast.success('התראות הופעלו! תקבל עדכונים על תוכן חדש');
      setIsVisible(false);
    } else {
      toast.error('לא הצלחנו להפעיל התראות. נסה שוב מאוחר יותר');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-4 shadow-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 left-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex gap-3 pr-2">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">הפעל התראות</h3>
            <p className="text-xs text-muted-foreground mb-3">
              קבל עדכונים כשיש תוכן חדש, הודעות חשובות ותזכורות
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleEnable}
                disabled={isLoading}
                size="sm"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs h-8"
              >
                {isLoading ? (
                  <span className="animate-pulse">מפעיל...</span>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 ml-1.5" />
                    הפעל
                  </>
                )}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-xs h-8"
              >
                לא עכשיו
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
