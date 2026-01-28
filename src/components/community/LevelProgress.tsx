import { useTranslation } from '@/hooks/useTranslation';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import * as LucideIcons from 'lucide-react';

interface Level {
  id: string;
  name: string;
  name_en: string | null;
  min_points: number;
  badge_icon: string | null;
  badge_color: string | null;
  order_index: number | null;
}

interface LevelProgressProps {
  currentPoints: number;
  currentLevel?: Level | null;
}

const LevelProgress = ({ currentPoints, currentLevel }: LevelProgressProps) => {
  const { t, isRTL } = useTranslation();

  const { data: levels } = useQuery({
    queryKey: ['community-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_levels')
        .select('*')
        .order('min_points', { ascending: true });
      
      if (error) throw error;
      return data as Level[];
    },
  });

  if (!levels || levels.length === 0) return null;

  // Find next level
  const nextLevel = levels.find(l => l.min_points > currentPoints);
  const currentLevelIndex = currentLevel 
    ? levels.findIndex(l => l.id === currentLevel.id)
    : 0;

  // Calculate progress
  const currentLevelMinPoints = currentLevel?.min_points || 0;
  const nextLevelMinPoints = nextLevel?.min_points || currentLevelMinPoints + 100;
  const pointsInLevel = currentPoints - currentLevelMinPoints;
  const pointsNeeded = nextLevelMinPoints - currentLevelMinPoints;
  const progress = Math.min((pointsInLevel / pointsNeeded) * 100, 100);

  // Get icon component
  const IconComponent = currentLevel?.badge_icon 
    ? (LucideIcons as any)[currentLevel.badge_icon] || LucideIcons.Star
    : LucideIcons.Star;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <IconComponent 
            className="h-4 w-4" 
            style={{ color: currentLevel?.badge_color || '#f59e0b' }}
          />
          <span className="font-medium">
            {isRTL 
              ? currentLevel?.name || t('community.level') 
              : currentLevel?.name_en || currentLevel?.name || t('community.level')
            }
          </span>
        </div>
        <span className="text-muted-foreground">
          {currentPoints} {t('community.points')}
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      {nextLevel && (
        <p className="text-xs text-muted-foreground text-center">
          {nextLevelMinPoints - currentPoints} {t('community.pointsToNextLevel')} (
          {isRTL ? nextLevel.name : nextLevel.name_en || nextLevel.name})
        </p>
      )}
      
      {!nextLevel && (
        <p className="text-xs text-muted-foreground text-center">
          🎉 {t('community.maxLevelReached')}
        </p>
      )}
    </div>
  );
};

export default LevelProgress;
