import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/lib/errorHandling";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";

interface PackageData {
  id: "single" | "package_4";
  sessions: number;
  price: number;
}

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageData | null;
}

const CheckoutDialog = ({ isOpen, onClose, packageData }: CheckoutDialogProps) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [calendlyLink, setCalendlyLink] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      checkAuth();
      fetchCalendlyLink();
    }
  }, [isOpen]);

  const fetchCalendlyLink = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["calendly_link", "calendly_enabled"]);
      
      if (data) {
        const settings = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});
        
        // Only set calendly link if it's enabled
        if (settings.calendly_enabled === 'true' && settings.calendly_link) {
          setCalendlyLink(settings.calendly_link);
        }
      }
    } catch (error) {
      handleError(error, t('success.calendlyLoadError'), "CheckoutDialog.fetchCalendlyLink", t('common.error'));
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      handleError(error, t('messages.authCheckError'), "CheckoutDialog", t('common.error'));
    } finally {
      setCheckingAuth(false);
    }
  };

  const handlePurchase = async () => {
    if (!packageData || !user) return;

    setIsProcessing(true);

    try {
      const { data: purchase, error } = await supabase
        .from("purchases")
        .insert({
          user_id: user.id,
          package_type: packageData.id,
          sessions_total: packageData.sessions,
          sessions_remaining: packageData.sessions,
          price: packageData.price,
          payment_status: "pending_session",
          payment_method: null,
          booking_link: calendlyLink || null,
          booking_status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: t('success.congratulations'),
        description: t('success.firstStep'),
      });

      setTimeout(() => {
        navigate(`/success?purchaseId=${purchase.id}`);
        onClose();
        setIsProcessing(false);
      }, 500);
    } catch (error: any) {
      handleError(error, t('messages.unexpectedError'), "CheckoutDialog", t('common.error'));
      setIsProcessing(false);
    }
  };

  if (!packageData) return null;

  const packageLabel = packageData.sessions === 1 
    ? t('sessions.singleSession') 
    : `${t('sessions.packageOf4')}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] glass-panel" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center cyber-glow">
            {language === 'he' 
              ? "אתה עומד לקחת את הצעד הכי חשוב בחיים שלך"
              : "You're about to take the most important step in your life"
            }
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-4 space-y-2">
            {user ? (
              <>
                <p className="text-lg font-semibold">
                  {language === 'he' 
                    ? "זוהי השקעה שתחזיר את עצמה פי כמה וכמה"
                    : "This is an investment that will pay for itself many times over"
                  }
                </p>
                <p>
                  {language === 'he'
                    ? "אנשים ששינו את חייהם התחילו בדיוק כאן"
                    : "People who changed their lives started right here"
                  }
                </p>
              </>
            ) : (
              language === 'he' 
                ? "נדרשת התחברות להשלמת הרכישה"
                : "Login required to complete purchase"
            )}
          </DialogDescription>
        </DialogHeader>

        {checkingAuth ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="space-y-6 py-4">
            <div className="glass-panel p-4 border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">
                  {language === 'he' ? 'חבילה:' : 'Package:'}
                </span>
                <span className="font-bold">{packageLabel}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">
                  {language === 'he' ? 'מפגשים:' : 'Sessions:'}
                </span>
                <span className="font-bold">{packageData.sessions}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">
                  {language === 'he' ? 'סה"כ לתשלום:' : 'Total:'}
                </span>
                <span className="font-black cyber-glow">{formatPrice(packageData.price, language)}</span>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                {language === 'he'
                  ? "כדי להשלים את הרכישה, עליך להתחבר או ליצור חשבון"
                  : "To complete the purchase, you need to login or create an account"
                }
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    onClose();
                    const redirectUrl = encodeURIComponent(`/?package=${packageData.id}`);
                    navigate(`/login?redirect=${redirectUrl}`);
                  }}
                  size="lg"
                  className="w-full"
                >
                  <LogIn className="ml-2 h-4 w-4" />
                  {t('common.login')}
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    const redirectUrl = encodeURIComponent(`/?package=${packageData.id}`);
                    navigate(`/signup?redirect=${redirectUrl}`);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <UserPlus className="ml-2 h-4 w-4" />
                  {t('auth.signupNow')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4 mb-6">
              <div className="bg-primary/10 p-6 rounded-lg space-y-3">
                <h3 className="text-xl font-bold">
                  {language === 'he' ? 'פרטי החבילה' : 'Package Details'}
                </h3>
                <div className="flex justify-center items-baseline gap-2">
                  <span className="text-4xl font-black cyber-glow">
                    {formatPrice(packageData.price, language)}
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  {packageData.sessions === 1 
                    ? (language === 'he' ? 'פגישה בודדת' : 'Single Session')
                    : (language === 'he' ? `חבילת ${packageData.sessions} פגישות` : `${packageData.sessions} Sessions Package`)
                  }
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">{t('success.paymentInfo')}</p>
                <p>{t('success.paymentAfterSession')}</p>
                <p>{t('success.paymentMethods')}</p>
                <p className="text-xs text-muted-foreground">{t('success.paymentDetailsSent')}</p>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground bg-accent/10 p-3 rounded-lg">
              {language === 'he' 
                ? '⚠️ זוהי רכישת דמו - לא יתבצע חיוב אמיתי'
                : '⚠️ This is a demo purchase - no actual charge will be made'
              }
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  language === 'he' ? 'השלם רכישה' : 'Complete Purchase'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
