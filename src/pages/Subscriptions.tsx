import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Lock, Loader2, Crown, Briefcase, Users } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { TIER_CONFIGS, TIER_FEATURES, type SubscriptionTier, tierIncludes } from "@/lib/subscriptionTiers";

const TIER_ORDER: SubscriptionTier[] = ["free", "pro", "coach", "business"];

const TIER_ICONS: Record<SubscriptionTier, React.ReactNode> = {
  free: <Zap className="h-8 w-8" />,
  pro: <Crown className="h-8 w-8" />,
  coach: <Users className="h-8 w-8" />,
  business: <Briefcase className="h-8 w-8" />,
};

const Subscriptions = () => {
  const { language } = useTranslation();
  const isRTL = language === "he";
  const { user } = useAuth();
  const { tier: userTier, subscriptionEnd, isLoading } = useSubscriptionGate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useSEO({
    title: isRTL ? "מנויים | מיינד OS" : "Subscriptions | MindOS",
    description: isRTL
      ? "בחר את התוכנית המתאימה לך ושדרג את המסע שלך"
      : "Choose the plan that fits you and upgrade your journey",
    keywords: "subscription, pro, coach, business, mindos",
    url: `${window.location.origin}/subscriptions`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: isRTL ? "דף הבית" : "Home", url: window.location.origin },
        { name: isRTL ? "מנויים" : "Subscriptions", url: `${window.location.origin}/subscriptions` },
      ]),
    ],
  });

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

  const faqItems = isRTL
    ? [
        { q: "מה כולל הניסיון החינמי?", a: "7 ימים של גישה מלאה ל-Pro, ללא תשלום. תוכל לבטל בכל רגע." },
        { q: "איך מבטלים?", a: "דרך ניהול המנוי (Stripe Portal) או מהדאשבורד. אין עמלות ביטול." },
        { q: "מה קורה אחרי הביטול?", a: "תמשיך ליהנות מהגישה עד סוף התקופה ששילמת. אחר כך תחזור לתוכנית החינמית." },
        { q: "אפשר לשדרג או לשנמך?", a: "כן, תוכל לשנות תוכנית בכל עת דרך ניהול המנוי." },
      ]
    : [
        { q: "What's included in the free trial?", a: "7 days of full Pro access, no charge. Cancel anytime." },
        { q: "How do I cancel?", a: "Through the subscription management portal. No cancellation fees." },
        { q: "What happens after cancellation?", a: "You keep access until the end of your billing period, then revert to Free." },
        { q: "Can I upgrade or downgrade?", a: "Yes, you can change your plan anytime through subscription management." },
      ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          {isRTL ? "בחר את המסלול שלך" : "Choose Your Path"}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {isRTL
            ? "מהתפתחות אישית ועד לבניית עסק — יש לנו תוכנית בשבילך"
            : "From personal growth to building a business — we have a plan for you"}
        </p>
      </div>

      {/* Active subscription banner */}
      {isPaidUser && (
        <Card className="border-primary/50 bg-primary/5 backdrop-blur-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">
                  {isRTL
                    ? `מנוי ${TIER_CONFIGS[userTier].label.he} פעיל`
                    : `${TIER_CONFIGS[userTier].label.en} subscription active`}
                </p>
                {subscriptionEnd && (
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "מתחדש ב-" : "Renews "}
                    {new Date(subscriptionEnd).toLocaleDateString(isRTL ? "he-IL" : "en-US")}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
              {portalLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {isRTL ? "ניהול מנוי" : "Manage Subscription"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
              className={`relative flex flex-col rounded-2xl border bg-card/50 backdrop-blur-sm transition-all ${
                isCurrent ? "border-primary ring-1 ring-primary/30" : ""
              } ${isPopular && !isCurrent ? "ring-1 ring-primary/40" : ""} ${
                isComingSoon ? "opacity-50 grayscale pointer-events-none" : ""
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 whitespace-nowrap">
                    {isRTL ? "התוכנית שלך" : "Your Plan"}
                  </Badge>
                </div>
              )}
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 whitespace-nowrap">
                    <Zap className="w-3 h-3 me-1" />
                    {isRTL ? "הכי פופולרי" : "Most Popular"}
                  </Badge>
                </div>
              )}
              {isComingSoon && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                  <Badge variant="secondary" className="px-4 py-1 whitespace-nowrap">
                    <Lock className="w-3 h-3 me-1" />
                    {isRTL ? "בקרוב" : "Coming Soon"}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8 pb-4">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    {TIER_ICONS[tierKey]}
                  </div>
                </div>
                <CardTitle className="text-2xl">{config.label[isRTL ? "he" : "en"]}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">
                  {config.description[isRTL ? "he" : "en"]}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-black text-primary">
                    {tierKey === "free"
                      ? (isRTL ? "חינם" : "Free")
                      : isRTL
                        ? `₪${config.priceILS}`
                        : `$${config.priceUSD}`}
                  </div>
                  {tierKey !== "free" && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {isRTL ? "לחודש" : "per month"}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-5">
                <ul className="space-y-2.5">
                  {(isRTL ? features.he : features.en).map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="px-5 pb-6 pt-4">
                {tierKey === "free" ? (
                  <Button variant="outline" className="w-full" disabled={isCurrent}>
                    {isCurrent
                      ? (isRTL ? "התוכנית הנוכחית" : "Current Plan")
                      : (isRTL ? "כלול" : "Included")}
                  </Button>
                ) : isCurrent ? (
                  <Button variant="outline" className="w-full" onClick={handleManageSubscription} disabled={portalLoading}>
                    {portalLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                    {isRTL ? "ניהול מנוי" : "Manage"}
                  </Button>
                ) : isUpgrade && !isComingSoon ? (
                  <Button
                    className="w-full"
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
                  <Button variant="outline" className="w-full" disabled={isComingSoon} onClick={isComingSoon ? undefined : handleManageSubscription}>
                    {isComingSoon ? (isRTL ? "בקרוב" : "Coming Soon") : (isRTL ? "שנה תוכנית" : "Change Plan")}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <h2 className="text-2xl font-bold mb-6">
          {isRTL ? "שאלות נפוצות" : "FAQ"}
        </h2>
        <div className="space-y-3 text-start">
          {faqItems.map((item, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;