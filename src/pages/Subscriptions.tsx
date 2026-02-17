import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Lock, Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";
import { useSubscriptionGate } from "@/hooks/useSubscriptionGate";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Subscriptions = () => {
  const { language } = useTranslation();
  const isRTL = language === "he";
  const { user } = useAuth();
  const { isPro, subscriptionEnd, isLoading } = useSubscriptionGate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useSEO({
    title: isRTL ? "מנויים | מיינד OS" : "Subscriptions | MindOS",
    description: isRTL
      ? "שדרג ל-Pro וקבל גישה מלאה לכל הכלים של MindOS"
      : "Upgrade to Pro and get full access to all MindOS tools",
    keywords: "subscription, pro, mindos, coaching, AI",
    url: `${window.location.origin}/subscriptions`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: isRTL ? "דף הבית" : "Home", url: window.location.origin },
        { name: isRTL ? "מנויים" : "Subscriptions", url: `${window.location.origin}/subscriptions` },
      ]),
    ],
  });

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: isRTL ? "נדרשת התחברות" : "Login required",
        description: isRTL ? "אנא התחבר כדי להירשם למנוי" : "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session");
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
      setCheckoutLoading(false);
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

  const proFeatures = isRTL
    ? [
        "הודעות ללא הגבלה לאורורה — אימון AI אישי",
        "מנוע תכנון 90 יום מלא",
        "נאדג׳ים פרואקטיביים של המאמן",
        "ספריית היפנוזה",
        "הרגלים ורשימות ללא הגבלה",
        "כל מרכזי העמודים פתוחים",
      ]
    : [
        "Unlimited Aurora messages — personal AI coaching",
        "Full 90-day plan engine",
        "Proactive coaching nudges",
        "Hypnosis library",
        "Unlimited habits and checklists",
        "All pillar hubs unlocked",
      ];

  const faqItems = isRTL
    ? [
        { q: "מה כולל הניסיון החינמי?", a: "7 ימים של גישה מלאה לכל הפיצ'רים של Pro, ללא תשלום. תוכל לבטל בכל רגע." },
        { q: "איך מבטלים?", a: "דרך ניהול המנוי (Stripe Portal) או מהדאשבורד. אין עמלות ביטול." },
        { q: "מה קורה אחרי הביטול?", a: "תמשיך ליהנות מהגישה עד סוף התקופה ששילמת. אחר כך תחזור לתוכנית החינמית." },
      ]
    : [
        { q: "What's included in the free trial?", a: "7 days of full Pro access, no charge. Cancel anytime." },
        { q: "How do I cancel?", a: "Through the subscription management portal. No cancellation fees." },
        { q: "What happens after cancellation?", a: "You keep access until the end of your billing period, then revert to Free." },
      ];

  return (
    <div className="relative min-h-screen">
      <Header />

      <main className="relative container mx-auto px-4 py-8 mt-20" style={{ zIndex: 2 }}>
        {/* Hero */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-6xl font-black cyber-glow mb-4">
            {isRTL ? "שחרר את הפוטנציאל המלא" : "Unlock Your Full Potential"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? "גישה מלאה לכל הכלים של MindOS — אימון AI ללא הגבלה, תכנון 90 יום, ועוד"
              : "Full access to every MindOS tool — unlimited AI coaching, 90-day planning, and more"}
          </p>
        </div>

        {/* Active subscription banner */}
        {isPro && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="glass-panel border-primary" dir={isRTL ? "rtl" : "ltr"}>
              <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 p-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{isRTL ? "מנוי Pro פעיל" : "Pro subscription active"}</p>
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? "מתחדש ב-" : "Renews "}
                        {new Date(subscriptionEnd).toLocaleDateString(isRTL ? "he-IL" : "en-US")}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
                  {portalLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isRTL ? "ניהול מנוי" : "Manage Subscription"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pro Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="glass-panel border-primary cyber-border relative" dir={isRTL ? "rtl" : "ltr"}>
            {!isPro && (
              <div className="absolute -top-4 right-1/2 translate-x-1/2">
                <Badge className="cyber-glow px-6 py-2 text-base whitespace-nowrap">
                  <Zap className="w-4 h-4 ml-2" />
                  {isRTL ? "7 ימי ניסיון חינם!" : "7-day free trial!"}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-primary/20 p-6">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl mb-2">MindOS Pro</CardTitle>
              <CardDescription className="text-base">
                {isRTL ? "גישה מלאה וללא הגבלה לכל הכלים" : "Full, unlimited access to every tool"}
              </CardDescription>
              <div className="mt-6">
                <div className="text-6xl md:text-7xl font-black cyber-glow mb-2">
                  {formatPrice(97, language)}
                </div>
                <div className="text-lg text-muted-foreground">
                  {isRTL ? "לחודש" : "per month"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-6 md:px-12 py-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-4 text-center">
                    {isRTL ? "מה כלול ב-Pro?" : "What's included in Pro?"}
                  </h3>
                  <ul className="space-y-3">
                    {proFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-center">
                      {isRTL ? "💰 ביטול בכל עת, ללא התחייבות" : "💰 Cancel anytime, no commitment"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>

            {!isPro && (
              <CardFooter className="flex flex-col gap-4 px-6 md:px-12 pb-8">
                <Button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isLoading}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xl py-6 cyber-glow"
                >
                  {checkoutLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isRTL ? (
                    "התחל 7 ימי ניסיון חינם"
                  ) : (
                    "Start 7-day free trial"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {isRTL
                    ? "לאחר הניסיון: ₪97/חודש. ביטול בכל עת."
                    : "After trial: $27/month. Cancel anytime."}
                </p>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto mt-16 text-center" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 cyber-glow">
            {isRTL ? "שאלות נפוצות" : "FAQ"}
          </h2>
          <div className="space-y-4 text-right">
            {faqItems.map((item, i) => (
              <Card key={i} className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;
