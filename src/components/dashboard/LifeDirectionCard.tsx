import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Compass, MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface LifeDirection {
  content: string;
  clarityScore: number | null;
}

const LifeDirectionCard = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [direction, setDirection] = useState<LifeDirection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadDirection = async () => {
      const { data } = await supabase
        .from('aurora_life_direction')
        .select('content, clarity_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDirection({
          content: data.content,
          clarityScore: data.clarity_score,
        });
      }
      setLoading(false);
    };

    loadDirection();
  }, [user?.id]);

  const handleTalkToAurora = () => {
    navigate('/messages/ai');
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!direction) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Compass className="h-5 w-5 text-primary" />
            {t('unified.dashboard.lifeDirection')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {isRTL 
              ? 'עדיין לא הגדרת את כיוון החיים שלך. שוחח עם אורורה כדי לגלות אותו.'
              : "You haven't defined your life direction yet. Chat with Aurora to discover it."
            }
          </p>
          <Button 
            onClick={handleTalkToAurora}
            className="w-full gap-2"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            {isRTL ? 'שוחח עם אורורה' : 'Talk to Aurora'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Compass className="h-5 w-5 text-primary" />
          {t('unified.dashboard.lifeDirection')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <blockquote className="border-s-4 border-primary ps-4 italic text-sm text-muted-foreground">
          "{direction.content}"
        </blockquote>

        {direction.clarityScore !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isRTL ? 'בהירות' : 'Clarity'}</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {direction.clarityScore}%
              </span>
            </div>
            <Progress value={direction.clarityScore} className="h-2" />
          </div>
        )}

        <Button 
          onClick={handleTalkToAurora}
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-xs"
        >
          <MessageCircle className="h-3 w-3" />
          {isRTL ? 'המשך לחקור עם אורורה' : 'Continue exploring with Aurora'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LifeDirectionCard;
