import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Crown, Calendar, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const MySubscriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["my-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq("user_id", user.id)
        .in("status", ["active", "trial"])
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            פעיל
          </Badge>
        );
      case "trial":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            תקופת ניסיון
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">בוטל</Badge>;
      case "expired":
        return <Badge variant="outline">פג תוקף</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "חודשי";
      case "quarterly":
        return "רבעוני";
      case "yearly":
        return "שנתי";
      default:
        return cycle;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-panel" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            המנוי שלי
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="glass-panel" dir="rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            המנוי שלי
          </CardTitle>
          <CardDescription>
            אין לך מנוי פעיל כרגע
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              הירשם למנוי וקבל גישה בלתי מוגבלת לתוכן
            </p>
            <Button onClick={() => navigate("/subscriptions")}>
              צפה בתוכניות המנוי
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = subscription.subscription_tiers;
  if (!tier) return null;

  return (
    <Card className="glass-panel border-primary/50" dir="rtl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              המנוי שלי
            </CardTitle>
            <CardDescription className="mt-2">
              תוכנית {tier.name}
            </CardDescription>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Details */}
        <div className="space-y-4">
          {/* Tier Features */}
          <div>
            <h4 className="font-semibold mb-3">מה כלול במנוי:</h4>
            <div className="space-y-2">
              {tier.features?.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/20 p-2">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">מחזור חיוב</div>
                <div className="font-medium">
                  {getBillingCycleText(subscription.billing_cycle)}
                </div>
              </div>
            </div>

            {subscription.next_billing_date && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">חיוב הבא</div>
                  <div className="font-medium">
                    {format(new Date(subscription.next_billing_date), "dd MMMM yyyy", { locale: he })}
                  </div>
                </div>
              </div>
            )}

            {subscription.start_date && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/20 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">תאריך התחלה</div>
                  <div className="font-medium">
                    {format(new Date(subscription.start_date), "dd MMMM yyyy", { locale: he })}
                  </div>
                </div>
              </div>
            )}

            {subscription.trial_ends_at && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-accent/20 p-2">
                  <AlertCircle className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">תום תקופת ניסיון</div>
                  <div className="font-medium">
                    {format(new Date(subscription.trial_ends_at), "dd MMMM yyyy", { locale: he })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-border/30">
          <Button
            variant="outline"
            onClick={() => navigate("/subscriptions")}
            className="flex-1"
          >
            שדרג מנוי
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/courses")}
            className="flex-1"
          >
            גלה תוכן
          </Button>
        </div>

        {/* Cancel Info */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          המנוי שלך מתחדש אוטומטית. תוכל לבטל בכל עת מהגדרות החשבון.
        </div>
      </CardContent>
    </Card>
  );
};

export default MySubscriptions;
