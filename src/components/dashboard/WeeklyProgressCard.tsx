import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Brain, MessageCircle, Lightbulb, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyStats {
  hypnosisSessions: number;
  auroraChats: number;
  insightsGained: number;
  totalXp: number;
}

const WeeklyProgressCard = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      const { data, error } = await supabase
        .from('weekly_user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setStats({
          hypnosisSessions: data.hypnosis_sessions || 0,
          auroraChats: data.aurora_chats || 0,
          insightsGained: data.insights_gained || 0,
          totalXp: data.total_xp || 0,
        });
      } else {
        // No data yet - set empty stats
        setStats({
          hypnosisSessions: 0,
          auroraChats: 0,
          insightsGained: 0,
          totalXp: 0,
        });
      }
      setLoading(false);
    };

    loadStats();
  }, [user?.id]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const statItems = [
    {
      icon: Brain,
      label: isRTL ? 'סשנים' : 'Sessions',
      value: stats?.hypnosisSessions || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: MessageCircle,
      label: isRTL ? 'שיחות אורורה' : 'Aurora Chats',
      value: stats?.auroraChats || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Lightbulb,
      label: isRTL ? 'תובנות' : 'Insights',
      value: stats?.insightsGained || 0,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Zap,
      label: 'XP',
      value: stats?.totalXp || 0,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t('unified.dashboard.weeklyProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex flex-col items-center justify-center p-3 rounded-lg ${item.bgColor}`}
              >
                <Icon className={`h-5 w-5 ${item.color} mb-1`} />
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressCard;
