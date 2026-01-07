import { usePWA } from '@/hooks/usePWA';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Bell, Check, Smartphone, Share, MoreVertical, Plus, Zap, Wifi, BellRing } from 'lucide-react';

interface PWAInstallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PWAInstallModal = ({ open, onOpenChange }: PWAInstallModalProps) => {
  const { t, isRTL } = useTranslation();
  const { 
    isInstalled, 
    isInstallable, 
    isIOS, 
    isAndroid, 
    isStandalone,
    canPromptInstall, 
    promptInstall,
    getInstallInstructions 
  } = usePWA();
  
  const {
    permission,
    isSubscribed,
    subscribe,
    isLoading: isPushLoading
  } = usePushNotifications();

  const handleInstall = async () => {
    if (canPromptInstall) {
      const accepted = await promptInstall();
      if (accepted) {
        onOpenChange(false);
      }
    }
  };

  const handleEnableNotifications = async () => {
    await subscribe();
  };

  const instructions = getInstallInstructions();
  const isAppInstalled = isInstalled || isStandalone;

  const benefits = [
    { icon: Zap, title: t('pwa.quickAccess'), description: t('pwa.quickAccessDesc') },
    { icon: Wifi, title: t('pwa.worksOffline'), description: t('pwa.worksOfflineDesc') },
    { icon: BellRing, title: t('pwa.notifications'), description: t('pwa.notificationsDesc') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl text-center">{t('pwa.installTitle')}</DialogTitle>
          <DialogDescription className="sr-only">{t('pwa.installDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Installation Card */}
          <Card className="border-cyan-500/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">{t('pwa.deviceInstall')}</h3>
              </div>
              
              {isAppInstalled ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>{t('pwa.appInstalled')}</span>
                </div>
              ) : canPromptInstall ? (
                <Button 
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600"
                  size="sm"
                >
                  <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('pwa.installNow')}
                </Button>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground font-medium">{instructions.title}</p>
                  <ol className="space-y-1.5 text-muted-foreground">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {index === 0 && isIOS && <Share className="w-3.5 h-3.5" />}
                          {index === 0 && isAndroid && <MoreVertical className="w-3.5 h-3.5" />}
                          {index === 1 && <Plus className="w-3.5 h-3.5" />}
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="border-cyan-500/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold">{t('pwa.notifications')}</h3>
              </div>
              
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>{t('pwa.notificationsEnabled')}</span>
                </div>
              ) : permission === 'denied' ? (
                <p className="text-sm text-muted-foreground">
                  {t('pwa.notificationsBlocked')}
                </p>
              ) : (
                <Button 
                  onClick={handleEnableNotifications}
                  disabled={isPushLoading}
                  variant="outline"
                  size="sm"
                  className="w-full border-cyan-500/30"
                >
                  <Bell className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isPushLoading ? t('pwa.enabling') : t('pwa.enableNotifications')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-2 rounded-lg bg-muted/50">
                <benefit.icon className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                <p className="text-xs font-medium">{benefit.title}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};