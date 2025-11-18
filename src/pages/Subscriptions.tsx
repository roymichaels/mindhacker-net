import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import MatrixRain from "@/components/MatrixRain";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Crown, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionCheckoutDialog from "@/components/checkout/SubscriptionCheckoutDialog";
import type { Tables } from "@/integrations/supabase/types";

const Subscriptions = () => {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<Tables<"subscription_tiers"> | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["subscription-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_tiers")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ["current-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_tiers (*)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSubscribe = (tier: Tables<"subscription_tiers">) => {
    setSelectedTier(tier);
    setCheckoutOpen(true);
  };

  const getPrice = (tier: Tables<"subscription_tiers">) => {
    switch (billingCycle) {
      case "monthly":
        return tier.price_monthly;
      case "quarterly":
        return tier.price_quarterly || tier.price_monthly * 3;
      case "yearly":
        return tier.price_yearly || tier.price_monthly * 12;
    }
  };

  const getIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "premium":
        return <Crown className="h-6 w-6" />;
      case "vip":
        return <Crown className="h-6 w-6" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px] opacity-30" style={{ zIndex: 1 }} />
      
      <Header />
      
      <main className="relative container mx-auto px-4 py-8 mt-20">
        {/* Hero Section */}
        <div className="text-center mb-12" dir="rtl">
          <h1 className="text-4xl md:text-6xl font-black cyber-glow mb-4">
            בחר את התוכנית המתאימה לך
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            גישה בלתי מוגבלת לתוכן מובחר, משאבים בלעדיים ותמיכה מקצועית
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSubscription && (
          <Card className="glass-panel mb-8 border-primary/50" dir="rtl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/20 p-3">
                    {getIcon(currentSubscription.subscription_tiers?.access_level || "")}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">המנוי הנוכחי שלך</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentSubscription.subscription_tiers?.name} - {currentSubscription.billing_cycle === "monthly" ? "חודשי" : currentSubscription.billing_cycle === "quarterly" ? "רבעוני" : "שנתי"}
                    </p>
                  </div>
                </div>
                <Badge className="cyber-glow">פעיל</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Cycle Selector */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as any)} dir="rtl">
            <TabsList className="glass-panel">
              <TabsTrigger value="monthly" className="text-xs sm:text-sm">חודשי</TabsTrigger>
              <TabsTrigger value="quarterly" className="text-xs sm:text-sm">
                רבעוני
                <Badge variant="secondary" className="mr-1 sm:mr-2 text-[10px] sm:text-xs">חסוך 10%</Badge>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs sm:text-sm">
                שנתי
                <Badge variant="secondary" className="mr-1 sm:mr-2 text-[10px] sm:text-xs">חסוך 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="glass-panel">
                <CardHeader className="p-4 sm:p-6">
                  <Skeleton className="h-6 sm:h-8 w-32 mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-full" />
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-12 sm:h-16 w-full mb-4" />
                  <Skeleton className="h-32 sm:h-40 w-full" />
                </CardContent>
              </Card>
            ))
          ) : tiers && tiers.length > 0 ? (
            tiers.map((tier) => {
              const price = getPrice(tier);
              const isCurrentTier = currentSubscription?.tier_id === tier.id;
              const isPremium = tier.access_level === "premium" || tier.access_level === "vip";

              return (
                <Card
                  key={tier.id}
                  className={`glass-panel relative ${isPremium ? "border-primary cyber-border" : ""}`}
                  dir="rtl"
                >
                  {isPremium && (
                    <div className="absolute -top-4 right-1/2 translate-x-1/2">
                      <Badge className="cyber-glow px-4 py-1">מומלץ</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="rounded-full bg-primary/20 p-4">
                        {getIcon(tier.access_level)}
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-black cyber-glow mb-1">
                        ₪{price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        /{billingCycle === "monthly" ? "חודש" : billingCycle === "quarterly" ? "רבעון" : "שנה"}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {tier.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isPremium ? "default" : "outline"}
                      onClick={() => handleSubscribe(tier)}
                      disabled={isCurrentTier}
                    >
                      {isCurrentTier ? "המנוי הנוכחי שלך" : "הירשם עכשיו"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12" dir="rtl">
              <p className="text-xl text-muted-foreground">
                אין תוכניות מנוי זמינות כרגע
              </p>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto" dir="rtl">
          <h2 className="text-3xl font-black text-center mb-8">שאלות נפוצות</h2>
          <div className="space-y-4">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">האם אוכל לבטל את המנוי בכל עת?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  כן, תוכל לבטל את המנוי בכל עת מדף ניהול המנוי שלך. המנוי יישאר פעיל עד לסוף התקופה ששולמה.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">מה ההבדל בין התוכניות?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  כל תוכנית מציעה גישה לרמות תוכן שונות. תוכנית Basic מאפשרת גישה לתוכן בסיסי, Premium לתוכן מתקדם, ו-VIP כוללת גישה לכל התוכן והתמיכה המלאה.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-lg">האם יש תקופת ניסיון?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  כן, אנו מציעים תקופת ניסיון של 7 ימים לכל המנויים החדשים. תוכל לבטל בכל עת במהלך תקופת הניסיון ללא חיוב.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Checkout Dialog */}
      {selectedTier && (
        <SubscriptionCheckoutDialog
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          tier={selectedTier}
          billingCycle={billingCycle}
        />
      )}
    </div>
  );
};

export default Subscriptions;
