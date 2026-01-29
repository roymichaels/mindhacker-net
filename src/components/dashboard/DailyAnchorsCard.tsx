import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Anchor, Plus, MessageCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyMinimum {
  id: string;
  title: string;
  category: string | null;
  isCompleted: boolean;
}

const DailyAnchorsCard = () => {
  const { t, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [minimums, setMinimums] = useState<DailyMinimum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadMinimums = async () => {
      const { data } = await supabase
        .from('aurora_daily_minimums')
        .select('id, title, category')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (data) {
        // For now, completion is not persisted daily - just show as unchecked
        // This could be extended with a daily_completion junction table
        setMinimums(data.map(m => ({
          id: m.id,
          title: m.title,
          category: m.category,
          isCompleted: false,
        })));
      }
      setLoading(false);
    };

    loadMinimums();
  }, [user?.id]);

  const handleToggle = (id: string) => {
    setMinimums(prev => prev.map(m => 
      m.id === id ? { ...m, isCompleted: !m.isCompleted } : m
    ));
  };

  const handleAddWithAurora = () => {
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

  if (minimums.length === 0) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Anchor className="h-5 w-5 text-primary" />
            {t('unified.dashboard.dailyAnchors')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {isRTL 
              ? 'אין לך עוגנים יומיים. שוחח עם אורורה כדי להגדיר את המינימום היומי שלך.'
              : "No daily anchors yet. Chat with Aurora to define your daily minimums."
            }
          </p>
          <Button 
            onClick={handleAddWithAurora}
            className="w-full gap-2"
            variant="outline"
          >
            <MessageCircle className="h-4 w-4" />
            {isRTL ? 'הגדר עם אורורה' : 'Define with Aurora'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const completedCount = minimums.filter(m => m.isCompleted).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Anchor className="h-5 w-5 text-primary" />
            {t('unified.dashboard.dailyAnchors')}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{minimums.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {minimums.slice(0, 5).map((minimum) => (
          <div 
            key={minimum.id}
            className="flex items-center gap-3 group"
          >
            <Checkbox 
              checked={minimum.isCompleted}
              onCheckedChange={() => handleToggle(minimum.id)}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm transition-all ${
              minimum.isCompleted 
                ? 'line-through text-muted-foreground' 
                : ''
            }`}>
              {minimum.title}
            </span>
            {minimum.category && (
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                {minimum.category}
              </span>
            )}
          </div>
        ))}

        {minimums.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            +{minimums.length - 5} {isRTL ? 'נוספים' : 'more'}
          </p>
        )}

        <Button 
          onClick={handleAddWithAurora}
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-xs mt-2"
        >
          <Plus className="h-3 w-3" />
          {isRTL ? 'הוסף עוד' : 'Add more'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyAnchorsCard;
