import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

const CompactAffiliate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL, language } = useTranslation();

  const { data: affiliate } = useQuery({
    queryKey: ['compact-affiliate', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: referralsCount } = useQuery({
    queryKey: ['affiliate-referrals-count', affiliate?.id],
    queryFn: async () => {
      if (!affiliate?.id) return 0;
      const { count, error } = await supabase
        .from('affiliate_referrals')
        .select('*', { count: 'exact', head: true })
        .eq('affiliate_id', affiliate.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!affiliate?.id,
  });

  if (!affiliate) {
    return null;
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const pendingEarnings = affiliate.total_earnings - affiliate.total_paid;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('affiliate.title')}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-primary">
              <DollarSign className="h-4 w-4" />
              {formatPrice(pendingEarnings, language)}
            </div>
            <p className="text-xs text-muted-foreground">{t('affiliate.pending')}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold">
              <Users className="h-4 w-4" />
              {referralsCount}
            </div>
            <p className="text-xs text-muted-foreground">{t('affiliate.referrals')}</p>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-primary/10 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t('affiliate.yourCode')}</p>
          <code className="text-sm font-mono font-bold text-primary">
            {affiliate.affiliate_code}
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactAffiliate;
