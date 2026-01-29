import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageCircle, Sparkles, Heart, Target, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface Insight {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: typeof Lightbulb; label: { he: string; en: string }; color: string }> = {
  value: { icon: Heart, label: { he: 'ערך', en: 'Value' }, color: 'bg-pink-500/10 text-pink-500' },
  principle: { icon: Target, label: { he: 'עיקרון', en: 'Principle' }, color: 'bg-blue-500/10 text-blue-500' },
  self_concept: { icon: Sparkles, label: { he: 'תפיסה עצמית', en: 'Self-concept' }, color: 'bg-purple-500/10 text-purple-500' },
  vision_statement: { icon: Zap, label: { he: 'חזון', en: 'Vision' }, color: 'bg-amber-500/10 text-amber-500' },
};

const RecentInsightsCard = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadInsights = async () => {
      const { data } = await supabase
        .from('aurora_identity_elements')
        .select('id, element_type, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setInsights(data.map(i => ({
          id: i.id,
          type: i.element_type,
          content: i.content,
          createdAt: i.created_at,
        })));
      }
      setLoading(false);
    };

    loadInsights();
  }, [user?.id]);

  const handleExploreMore = () => {
    navigate('/messages/ai');
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            {t('unified.dashboard.recentInsights')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {isRTL 
              ? 'עדיין אין תובנות. שוחח עם אורורה כדי לגלות את עצמך.'
              : "No insights yet. Chat with Aurora to discover yourself."
            }
          </p>
          <Button 
            onClick={handleExploreMore}
            className="w-full gap-2"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            {isRTL ? 'התחל לחקור' : 'Start exploring'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          {t('unified.dashboard.recentInsights')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.value;
          const Icon = config.icon;
          const timeAgo = formatDistanceToNow(new Date(insight.createdAt), {
            addSuffix: true,
            locale: isRTL ? he : enUS,
          });

          return (
            <div 
              key={insight.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded ${config.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{insight.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {isRTL ? config.label.he : config.label.en}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
              </div>
            </div>
          );
        })}

        <Button 
          onClick={handleExploreMore}
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-xs mt-2"
        >
          <MessageCircle className="h-3 w-3" />
          {isRTL ? 'גלה עוד עם אורורה' : 'Discover more with Aurora'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecentInsightsCard;
