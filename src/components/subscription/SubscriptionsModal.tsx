import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSubscriptionsModal } from "@/contexts/SubscriptionsModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Lock, Loader2, Crown, Briefcase, Users, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { TIER_CONFIGS, TIER_FEATURES, type SubscriptionTier, tierIncludes } from "@/lib/subscriptionTiers";
import { ScrollArea } from "@/components/ui/scroll-area";

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "coach", "business"];

const TIER_ICONS: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-7 w-7" />,
  pro: <Crown className="h-7 w-7" />,
  coach: <Users className="h-7 w-7" />,
  business: <Briefcase className="h-7 w-7" />,
};

const SubscriptionsModal = () => {
  const { isOpen, closeSubscriptions } = useSubscriptionsModal();
  const { language } = useTranslation();
  const isRTL = language === "he";
  const { user } = useAuth();
  const { tier: userTier, subscriptionEnd, isLoading } = useSubscriptionGate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (tier: SubscriptionTier) => {
    if (!user) {
      toast({
        title: isRTL ? "נדרשת התחברות" : "Login required",
        description: isRTL ? "אנא התחבר כדי להירשם למנוי" : "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }
    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { tier },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const isPaidUser = userTier !== "free";

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && closeSubscriptions()}>
      <DialogContent
        className="max-w-5xl w-[95vw] max-h-[90vh] p-0 border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden [&>button]:hidden"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Close button */}
        <button
          onClick={closeSubscriptions}
          className="absolute top-4 end-4 z-50 rounded-full bg-muted/80 p-2 hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 md:p-8 space-y-8">
            {/* Hero */}
            <div className="text-center space-y-3 pt-2">
              <h2 className="text-2xl md:text-3xl font-bold">
                {isRTL ? "בחר את המסלול שלך" : "Choose Your Path"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isRTL
                  ? "מהתפתחות אישית ועד לבניית עסק — יש לנו תוכנית בשבילך"
                  : "From personal growth to building a business — we have a plan for you"}
              </p>
            </div>

            {/* Active subscription banner */}
            {isPaidUser && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/20 p-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">
                        {isRTL
                          ? `מנוי ${TIER_CONFIGS[userTier].label.he} פעיל`
                          : `${TIER_CONFIGS[userTier].label.en} subscription active`}
                      </p>
                      {subscriptionEnd && (
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? "מתחדש ב-" : "Renews "}
                          {new Date(subscriptionEnd).toLocaleDateString(isRTL ? "he-IL" : "en-US")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
                    {portalLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                    {isRTL ? "ניהול מנוי" : "Manage Subscription"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Tier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TIER_ORDER.map((tierKey) => {
                const config = TIER_CONFIGS[tierKey];
                const features = TIER_FEATURES[tierKey];
                const isCurrent = userTier === tierKey;
                const isUpgrade = !tierIncludes(userTier, tierKey) && tierKey !== "free";
                const isPopular = tierKey === "pro";
                const isComingSoon = tierKey === "business";

                return (
                  <Card
                    key={tierKey}
                    className={`relative flex flex-col rounded-2xl border bg-card/60 transition-all ${
                      isCurrent ? "border-primary ring-1 ring-primary/30" : ""
                    } ${isPopular && !isCurrent ? "ring-1 ring-primary/40" : ""} ${
                      isComingSoon ? "opacity-50 grayscale pointer-events-none" : ""
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs whitespace-nowrap">
                          {isRTL ? "התוכנית שלך" : "Your Plan"}
                        </Badge>
                      </div>
                    )}
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs whitespace-nowrap">
                          <Zap className="w-3 h-3 me-1" />
                          {isRTL ? "הכי פופולרי" : "Most Popular"}
                        </Badge>
                      </div>
                    )}
                    {isComingSoon && (
                      <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                        <Badge variant="secondary" className="px-3 py-0.5 text-xs whitespace-nowrap">
                          <Lock className="w-3 h-3 me-1" />
                          {isRTL ? "בקרוב" : "Coming Soon"}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pt-7 pb-3">
                      <div className="flex justify-center mb-2">
                        <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                          {TIER_ICONS[tierKey]}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{config.label[isRTL ? "he" : "en"]}</CardTitle>
                      <CardDescription className="text-xs min-h-[32px]">
                        {config.description[isRTL ? "he" : "en"]}
                      </CardDescription>
                      <div className="mt-3">
                        <div className="text-3xl font-black text-primary">
                          {tierKey === "free"
                            ? (isRTL ? "חינם" : "Free")
                            : isRTL
                              ? `₪${config.priceILS}`
                              : `$${config.priceUSD}`}
                        </div>
                        {tierKey !== "free" && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {isRTL ? "לחודש" : "per month"}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 px-4">
                      <ul className="space-y-2">
                        {(isRTL ? features.he : features.en).map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="px-4 pb-5 pt-3">
                      {tierKey === "free" ? (
                        <Button variant="outline" className="w-full" size="sm" disabled={isCurrent}>
                          {isCurrent
                            ? (isRTL ? "התוכנית הנוכחית" : "Current Plan")
                            : (isRTL ? "כלול" : "Included")}
                        </Button>
                      ) : isCurrent ? (
                        <Button variant="outline" className="w-full" size="sm" onClick={handleManageSubscription} disabled={portalLoading}>
                          {portalLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                          {isRTL ? "ניהול מנוי" : "Manage"}
                        </Button>
                      ) : isUpgrade && !isComingSoon ? (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => handleCheckout(tierKey)}
                          disabled={loadingTier === tierKey || isLoading}
                        >
                          {loadingTier === tierKey ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Zap className="h-4 w-4 me-1" />
                              {config.trial
                                ? (isRTL ? `נסה ${config.trial} ימים חינם` : `Try ${config.trial} days free`)
                                : (isRTL ? "שדרג עכשיו" : "Upgrade now")}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" size="sm" disabled={isComingSoon}>
                          {isComingSoon ? (isRTL ? "בקרוב" : "Coming Soon") : (isRTL ? "שנה תוכנית" : "Change Plan")}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionsModal;
