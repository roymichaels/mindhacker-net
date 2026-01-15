import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Copy, DollarSign, Users, TrendingUp, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const LANDING_PAGES = [
  { value: '/', labelKey: 'affiliate.landingHome' },
  { value: '/personal-hypnosis', labelKey: 'affiliate.landingPersonalHypnosis' },
  { value: '/consciousness-leap', labelKey: 'affiliate.landingConsciousnessLeap' },
  { value: '/courses', labelKey: 'affiliate.landingCourses' },
];

const MyAffiliatePanel = () => {
  const { user } = useAuth();
  const { t, language, isRTL } = useTranslation();
  const [selectedPage, setSelectedPage] = useState('/');

  const { data: affiliate, isLoading } = useQuery({
    queryKey: ['my-affiliate', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: referrals } = useQuery({
    queryKey: ['my-referrals', affiliate?.id],
    queryFn: async () => {
      if (!affiliate?.id) return [];
      
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!affiliate?.id,
  });

  if (isLoading) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!affiliate) {
    return null; // Don't show panel if user is not an affiliate
  }

  const referralLink = `${window.location.origin}${selectedPage}?ref=${affiliate.affiliate_code}`;
  const pendingEarnings = referrals?.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.commission_amount, 0) || 0;
  const approvedEarnings = referrals?.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.commission_amount, 0) || 0;
  const totalReferrals = referrals?.length || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: t('affiliate.linkCopied'),
      description: t('affiliate.linkCopiedDesc'),
    });
  };

  return (
    <Card className="glass-panel border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              {t('affiliate.panelTitle')}
            </CardTitle>
            <CardDescription>
              {t('affiliate.panelDescription')}
            </CardDescription>
          </div>
          <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
            {affiliate.status === 'active' ? t('affiliate.statusActive') : t('affiliate.statusPending')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">{t('affiliate.totalReferrals')}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{formatPrice(affiliate.total_earnings, language)}</p>
            <p className="text-xs text-muted-foreground">{t('affiliate.totalEarnings')}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-500">{formatPrice(pendingEarnings, language)}</p>
            <p className="text-xs text-muted-foreground">{t('affiliate.pendingEarnings')}</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{affiliate.commission_rate}%</p>
            <p className="text-xs text-muted-foreground">{t('affiliate.commissionRate')}</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <label className="text-sm font-medium">{t('affiliate.yourLink')}</label>
          
          {/* Landing Page Selector */}
          <div className="flex gap-2 items-center">
            <Select value={selectedPage} onValueChange={setSelectedPage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANDING_PAGES.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {t(page.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 text-sm bg-muted/50 rounded-md border border-border"
              dir="ltr"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('affiliate.shareLink')}
          </p>
        </div>

        {/* Recent Referrals */}
        {referrals && referrals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">{t('affiliate.recentReferrals')}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {referrals.slice(0, 5).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                    </p>
                    <Badge variant={
                      referral.status === 'approved' ? 'default' :
                      referral.status === 'paid' ? 'secondary' : 'outline'
                    } className="mt-1">
                      {referral.status === 'pending' && t('affiliate.statusPending')}
                      {referral.status === 'approved' && t('affiliate.statusApproved')}
                      {referral.status === 'paid' && t('affiliate.statusPaid')}
                    </Badge>
                  </div>
                  <div className={isRTL ? 'text-left' : 'text-right'}>
                    <p className="font-semibold">{formatPrice(referral.commission_amount, language)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('affiliate.fromOrder')} {formatPrice(referral.order_amount, language)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link to full dashboard */}
        <Button variant="outline" className="w-full" asChild>
          <a href="/affiliate-dashboard">
            <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('affiliate.viewFullDashboard')}
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default MyAffiliatePanel;
