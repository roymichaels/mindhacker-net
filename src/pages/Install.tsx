import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Bell, Check, Smartphone, Monitor, Share2, MoreVertical, Plus, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSEO } from '@/hooks/useSEO';

const Install = () => {
  const navigate = useNavigate();
  const { 
    isInstalled, 
    isInstallable, 
    isIOS, 
    isAndroid, 
    isStandalone, 
    promptInstall, 
    getInstallInstructions,
    canPromptInstall 
  } = usePWA();
  
  const { 
    permission, 
    isSubscribed, 
    isSupported, 
    isPWA, 
    isLoading, 
    subscribe 
  } = usePushNotifications();

  const [showInstructions, setShowInstructions] = useState(false);
  const instructions = getInstallInstructions();

  useSEO({
    title: 'התקן את האפליקציה | מיינד האקר',
    description: 'התקן את אפליקציית מיינד האקר במכשיר שלך וקבל התראות על תוכן חדש',
  });

  const handleInstall = async () => {
    if (canPromptInstall) {
      const accepted = await promptInstall();
      if (accepted) {
        toast.success('האפליקציה הותקנה בהצלחה!');
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      toast.success('התראות הופעלו בהצלחה!');
    } else {
      toast.error('לא הצלחנו להפעיל התראות');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6 shadow-lg shadow-primary/25">
            <span className="text-3xl font-bold text-primary-foreground">מ</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">מיינד האקר</h1>
          <p className="text-muted-foreground text-lg">
            התקן כאפליקציה וקבל חוויה מושלמת
          </p>
        </div>

        {/* Status Cards */}
        <div className="space-y-6">
          {/* Installation Card */}
          <Card className="border-2 border-border/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isIOS ? (
                    <Smartphone className="w-6 h-6 text-primary" />
                  ) : isAndroid ? (
                    <Smartphone className="w-6 h-6 text-green-400" />
                  ) : (
                    <Monitor className="w-6 h-6 text-primary" />
                  )}
                  <CardTitle className="text-xl">התקנת האפליקציה</CardTitle>
                </div>
                {isInstalled && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="w-3 h-3 ml-1" />
                    מותקן
                  </Badge>
                )}
              </div>
              <CardDescription>
                {isInstalled 
                  ? 'האפליקציה מותקנת במכשיר שלך'
                  : 'התקן את האפליקציה לגישה מהירה מהמסך הראשי'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isInstalled ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>מעולה! האפליקציה מותקנת ופועלת</span>
                </div>
              ) : (
                <>
                  {canPromptInstall ? (
                    <Button 
                      onClick={handleInstall} 
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-5 h-5 ml-2" />
                      התקן עכשיו
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setShowInstructions(!showInstructions)} 
                        variant="outline"
                        size="lg"
                        className="w-full"
                      >
                        {showInstructions ? 'הסתר הוראות' : 'הצג הוראות התקנה'}
                      </Button>
                      
                      {showInstructions && (
                        <div className="bg-muted/50 rounded-lg p-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                          <h3 className="font-semibold text-lg">{instructions.title}</h3>
                          <ol className="space-y-3">
                            {instructions.steps.map((step, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </span>
                                <span className="text-muted-foreground pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                          
                          {/* Visual Guide for iOS */}
                          {isIOS && (
                            <div className="mt-6 p-4 bg-background rounded-lg border">
                              <div className="flex items-center justify-center gap-6 text-4xl">
                                <div className="flex flex-col items-center gap-1">
                                  <Share2 className="w-8 h-8 text-primary" />
                                  <span className="text-xs text-muted-foreground">שתף</span>
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <div className="flex flex-col items-center gap-1">
                                  <Plus className="w-8 h-8 text-primary" />
                                  <span className="text-xs text-muted-foreground">הוסף</span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Visual Guide for Android */}
                          {isAndroid && (
                            <div className="mt-6 p-4 bg-background rounded-lg border">
                              <div className="flex items-center justify-center gap-6 text-4xl">
                                <div className="flex flex-col items-center gap-1">
                                  <MoreVertical className="w-8 h-8 text-gray-400" />
                                  <span className="text-xs text-muted-foreground">תפריט</span>
                                </div>
                                <span className="text-muted-foreground">→</span>
                                <div className="flex flex-col items-center gap-1">
                                  <Download className="w-8 h-8 text-green-400" />
                                  <span className="text-xs text-muted-foreground">התקן</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Notifications Card */}
          <Card className="border-2 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BellRing className="w-6 h-6 text-accent" />
                  <CardTitle className="text-xl">התראות Push</CardTitle>
                </div>
                {isSubscribed && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Check className="w-3 h-3 ml-1" />
                    פעיל
                  </Badge>
                )}
              </div>
              <CardDescription>
                קבל התראות על תוכן חדש, עדכונים ותזכורות
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSupported ? (
                <div className="text-accent flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>הדפדפן שלך לא תומך בהתראות Push</span>
                </div>
              ) : isSubscribed ? (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>התראות פעילות - תקבל עדכונים חדשים</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {isIOS && !isPWA && (
                    <div className="text-accent text-sm bg-accent/10 rounded-lg p-3 border border-accent/20">
                      <strong>שים לב:</strong> באייפון, יש להתקין את האפליקציה למסך הבית לפני הפעלת התראות
                    </div>
                  )}
                  
                  {permission === 'denied' ? (
                    <div className="text-red-400 text-sm">
                      התראות חסומות. יש לאפשר התראות בהגדרות הדפדפן/מכשיר
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEnableNotifications}
                      disabled={isLoading || (isIOS && !isPWA)}
                      size="lg"
                      variant="outline"
                      className="w-full border-accent/30 hover:bg-accent/10"
                    >
                      {isLoading ? (
                        <span className="animate-pulse">מפעיל...</span>
                      ) : (
                        <>
                          <Bell className="w-5 h-5 ml-2" />
                          הפעל התראות
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
            <h3 className="font-semibold mb-4 text-lg">למה להתקין?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">גישה מהירה מהמסך הראשי - בלחיצה אחת</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">חוויה מלאה במסך מלא - בלי סרגלי דפדפן</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">טעינה מהירה יותר - גם כשהאינטרנט איטי</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">התראות על תוכן חדש - לא תפספס עדכונים</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full"
          >
            חזור לאתר
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
