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
import { he, enUS } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";

const MySubscriptions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();
  const dateLocale = language === 'he' ? he : enUS;

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["my-subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase.from("user_subscriptions").select(`*, subscription_tiers (*)`).eq("user_id", user.id).in("status", ["active", "trial"]).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" />{t('subscriptions.statusActive')}</Badge>;
      case "trial": return <Badge variant="secondary" className="gap-1"><AlertCircle className="h-3 w-3" />{t('subscriptions.statusTrial')}</Badge>;
      case "cancelled": return <Badge variant="destructive">{t('subscriptions.statusCancelled')}</Badge>;
      case "expired": return <Badge variant="outline">{t('subscriptions.statusExpired')}</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly": return t('subscriptions.cycleMonthly');
      case "quarterly": return t('subscriptions.cycleQuarterly');
      case "yearly": return t('subscriptions.cycleYearly');
      default: return cycle;
    }
  };

  if (isLoading) {
    return (<Card className="glass-panel" dir={isRTL ? 'rtl' : 'ltr'}><CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />{t('subscriptions.mySubscription')}</CardTitle></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>);
  }

  if (!subscription) {
    return (<Card className="glass-panel" dir={isRTL ? 'rtl' : 'ltr'}><CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />{t('subscriptions.mySubscription')}</CardTitle><CardDescription>{t('subscriptions.noActiveSubscription')}</CardDescription></CardHeader><CardContent><div className="text-center py-8"><Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground mb-4">{t('subscriptions.subscribeDesc')}</p><Button onClick={() => navigate("/subscriptions")}>{t('subscriptions.viewPlans')}</Button></div></CardContent></Card>);
  }

  const tier = subscription.subscription_tiers;
  if (!tier) return null;

  return (
    <Card className="glass-panel border-primary/50" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5" />{t('subscriptions.mySubscription')}</CardTitle><CardDescription className="mt-2">{t('subscriptions.plan')} {tier.name}</CardDescription></div>
          {getStatusBadge(subscription.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div><h4 className="font-semibold mb-3">{t('subscriptions.includedFeatures')}</h4><div className="space-y-2">{tier.features?.slice(0, 4).map((feature, idx) => (<div key={idx} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" /><span>{feature}</span></div>))}</div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
            <div className="flex items-start gap-3"><div className="rounded-full bg-primary/20 p-2"><CreditCard className="h-4 w-4 text-primary" /></div><div><div className="text-sm text-muted-foreground">{t('subscriptions.billingCycle')}</div><div className="font-medium">{getBillingCycleText(subscription.billing_cycle)}</div></div></div>
            {subscription.next_billing_date && (<div className="flex items-start gap-3"><div className="rounded-full bg-primary/20 p-2"><Calendar className="h-4 w-4 text-primary" /></div><div><div className="text-sm text-muted-foreground">{t('subscriptions.nextBilling')}</div><div className="font-medium">{format(new Date(subscription.next_billing_date), "dd MMMM yyyy", { locale: dateLocale })}</div></div></div>)}
            {subscription.start_date && (<div className="flex items-start gap-3"><div className="rounded-full bg-primary/20 p-2"><Calendar className="h-4 w-4 text-primary" /></div><div><div className="text-sm text-muted-foreground">{t('subscriptions.startDate')}</div><div className="font-medium">{format(new Date(subscription.start_date), "dd MMMM yyyy", { locale: dateLocale })}</div></div></div>)}
            {subscription.trial_ends_at && (<div className="flex items-start gap-3"><div className="rounded-full bg-accent/20 p-2"><AlertCircle className="h-4 w-4 text-accent" /></div><div><div className="text-sm text-muted-foreground">{t('subscriptions.trialEnds')}</div><div className="font-medium">{format(new Date(subscription.trial_ends_at), "dd MMMM yyyy", { locale: dateLocale })}</div></div></div>)}
          </div>
        </div>
        <div className="flex gap-2 pt-4 border-t border-border/30"><Button variant="outline" onClick={() => navigate("/subscriptions")} className="flex-1">{t('subscriptions.upgradeSubscription')}</Button><Button variant="outline" onClick={() => navigate("/courses")} className="flex-1">{t('subscriptions.discoverContent')}</Button></div>
        <div className="text-xs text-muted-foreground text-center pt-2">{t('subscriptions.autoRenewalNote')}</div>
      </CardContent>
    </Card>
  );
};

export default MySubscriptions;
