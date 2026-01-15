import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";
import { debug } from "@/lib/debug";
import { getStoredAffiliateCode, clearAffiliateCode } from "@/hooks/useAffiliateTracking";

interface SubscriptionCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: Tables<"subscription_tiers">;
  billingCycle: "monthly" | "quarterly" | "yearly";
}

type PaymentStatus = "instant_success" | "pending" | "failed";

const SubscriptionCheckoutDialog = ({ open, onOpenChange, tier, billingCycle }: SubscriptionCheckoutDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("instant_success");
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);

  const getPrice = () => {
    switch (billingCycle) {
      case "monthly":
        return tier.price_monthly;
      case "quarterly":
        return tier.price_quarterly || tier.price_monthly * 3;
      case "yearly":
        return tier.price_yearly || tier.price_monthly * 12;
    }
  };

  const getBillingCycleText = () => {
    switch (billingCycle) {
      case "monthly":
        return "חודשי";
      case "quarterly":
        return "רבעוני";
      case "yearly":
        return "שנתי";
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: t("subscription.loginRequired"),
        description: t("subscription.loginRequiredDesc"),
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (paymentStatus === "failed") {
        toast({
          title: t("subscription.paymentFailed"),
          description: t("subscription.paymentFailedDesc"),
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Calculate dates
      const now = new Date();
      const nextBillingDate = new Date(now);
      switch (billingCycle) {
        case "monthly":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "quarterly":
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "yearly":
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      // Check for existing subscription
      const { data: existingSub } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trial"])
        .single();

      if (existingSub) {
        // Cancel existing subscription
        await supabase
          .from("user_subscriptions")
          .update({ 
            status: "cancelled",
            cancelled_at: now.toISOString(),
          })
          .eq("id", existingSub.id);
      }

      // Get affiliate code if exists
      const affiliateCode = getStoredAffiliateCode();

      // Create new subscription
      const { error: subscriptionError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          tier_id: tier.id,
          status: paymentStatus === "instant_success" ? "active" : "trial",
          billing_cycle: billingCycle,
          start_date: now.toISOString(),
          next_billing_date: nextBillingDate.toISOString(),
        });

      // If affiliate code exists, create affiliate referral for this subscription
      if (affiliateCode) {
        const { data: affiliate } = await supabase
          .from("affiliates")
          .select("id, commission_rate")
          .eq("affiliate_code", affiliateCode)
          .eq("status", "active")
          .maybeSingle();

        if (affiliate) {
          const price = getPrice();
          const commissionAmount = (price * affiliate.commission_rate) / 100;
          
          await supabase.from("affiliate_referrals").insert({
            affiliate_id: affiliate.id,
            referred_user_id: user.id,
            order_amount: price,
            commission_amount: commissionAmount,
            status: "pending",
          });
          
          // Clear affiliate code after successful referral creation
          clearAffiliateCode();
        }
      }

      if (subscriptionError) throw subscriptionError;

      setSubscriptionComplete(true);

      toast({
        title: paymentStatus === "instant_success" ? t("subscription.activated") : t("subscription.pending"),
        description: paymentStatus === "instant_success" 
          ? `${t("subscription.accessGranted")} ${tier.name}`
          : t("subscription.pendingDesc"),
      });

      if (paymentStatus === "instant_success") {
        setTimeout(() => {
          navigate("/courses");
        }, 1500);
      }
    } catch (error) {
      debug.error("Subscription error:", error);
      toast({
        title: t("subscription.error"),
        description: t("subscription.errorDesc"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const price = getPrice();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        {subscriptionComplete ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-primary/20 p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">המנוי הופעל!</DialogTitle>
            <DialogDescription className="text-center">
              המנוי שלך ל-{tier.name} הופעל בהצלחה
            </DialogDescription>
            <Button onClick={() => navigate("/courses")}>
              גלה מוצרים דיגיטליים
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">השלמת הרשמה למנוי</DialogTitle>
              <DialogDescription>
                זהו תהליך רכישה דמה - לא יחויב תשלום אמיתי
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Subscription Summary */}
              <Card className="glass-panel">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          מנוי {getBillingCycleText()}
                        </p>
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-bold cyber-glow">
                          {formatPrice(price, language)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          /{getBillingCycleText()}
                        </div>
                      </div>
                    </div>
                    {tier.features && tier.features.length > 0 && (
                      <div className="border-t border-border/30 pt-3 space-y-1">
                        {tier.features.slice(0, 3).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mock Payment Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">בחר תוצאת תשלום (דמה)</Label>
                <RadioGroup value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="instant_success" id="instant_success" />
                    <Label htmlFor="instant_success" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום מיידי מוצלח</div>
                      <div className="text-sm text-muted-foreground">הפעלה מיידית של המנוי</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום ממתין לאישור</div>
                      <div className="text-sm text-muted-foreground">המנוי יופעל לאחר אישור</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse border border-border/30 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="failed" id="failed" />
                    <Label htmlFor="failed" className="flex-1 cursor-pointer">
                      <div className="font-medium">תשלום נכשל</div>
                      <div className="text-sm text-muted-foreground">לבדיקת טיפול בשגיאות</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Info Card */}
              <Card className="bg-muted/50 border-muted">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">מצב דמה</p>
                      <p>זהו מערכת תשלום דמה. לא יחויב תשלום אמיתי ולא נדרשים פרטי כרטיס אשראי.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                ביטול
              </Button>
              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    מעבד...
                  </>
                ) : (
                  <>הירשם למנוי</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionCheckoutDialog;
