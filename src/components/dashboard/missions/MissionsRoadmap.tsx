import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target, 
  Calendar, 
  CalendarDays, 
  CalendarRange,
  User,
  Briefcase,
  Heart,
  CheckCircle2,
  Circle,
  Sparkles,
  Trophy,
  Loader2
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMissionsRoadmap, Mission, MissionCategory, MissionTimeScope } from '@/hooks/useMissionsRoadmap';
import { cn } from '@/lib/utils';
import { MissionCard } from './MissionCard';

const categoryIcons: Record<MissionCategory, React.ElementType> = {
  personal: User,
  business: Briefcase,
  health: Heart,
};

const categoryColors: Record<MissionCategory, string> = {
  personal: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  business: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  health: 'text-green-500 bg-green-500/10 border-green-500/30',
};

const categoryGradients: Record<MissionCategory, string> = {
  personal: 'from-blue-500/20 to-indigo-500/10',
  business: 'from-amber-500/20 to-yellow-500/10',
  health: 'from-green-500/20 to-emerald-500/10',
};

const timeScopeIcons: Record<MissionTimeScope, React.ElementType> = {
  daily: Calendar,
  weekly: CalendarDays,
  monthly: CalendarRange,
};

export function MissionsRoadmap() {
  const { language, isRTL, t } = useTranslation();
  const { roadmap, loading, stats, toggleItem } = useMissionsRoadmap();
  const [activeTimeScope, setActiveTimeScope] = useState<MissionTimeScope>('weekly');
  const isHebrew = language === 'he';

  const timeScopeLabels: Record<MissionTimeScope, { en: string; he: string }> = {
    daily: { en: 'Daily', he: 'יומי' },
    weekly: { en: 'Weekly', he: 'שבועי' },
    monthly: { en: 'Monthly', he: 'חודשי' },
  };

  const categoryLabels: Record<MissionCategory, { en: string; he: string }> = {
    personal: { en: 'Personal', he: 'אישי' },
    business: { en: 'Business', he: 'עסקי' },
    health: { en: 'Health', he: 'בריאות' },
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const currentData = roadmap[activeTimeScope];
  const categories: MissionCategory[] = ['personal', 'business', 'health'];

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Overview */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              {isHebrew ? 'מפת המשימות' : 'Missions Roadmap'}
            </CardTitle>
            {roadmap.currentMilestone && (
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                {isHebrew ? `שבוע ${roadmap.currentWeek}` : `Week ${roadmap.currentWeek}`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-2">
            <Progress value={stats.progress} className="flex-1" />
            <span className="text-sm font-medium">{stats.progress}%</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {stats.completed} {isHebrew ? 'הושלמו' : 'completed'}
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              {stats.remaining} {isHebrew ? 'נותרו' : 'remaining'}
            </span>
            {stats.todayTotal > 0 && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-500" />
                {stats.todayRemaining} {isHebrew ? 'להיום' : 'today'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Milestone Banner */}
      {roadmap.currentMilestone && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {roadmap.currentMilestone.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {roadmap.currentMilestone.goal}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Scope Tabs */}
      <Tabs 
        value={activeTimeScope} 
        onValueChange={(v) => setActiveTimeScope(v as MissionTimeScope)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3">
          {(['daily', 'weekly', 'monthly'] as MissionTimeScope[]).map((scope) => {
            const Icon = timeScopeIcons[scope];
            return (
              <TabsTrigger key={scope} value={scope} className="gap-1.5">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isHebrew ? timeScopeLabels[scope].he : timeScopeLabels[scope].en}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(['daily', 'weekly', 'monthly'] as MissionTimeScope[]).map((scope) => (
          <TabsContent key={scope} value={scope} className="mt-4">
            <div className="space-y-4">
              {categories.map((category) => {
                const missions = roadmap[scope][category];
                const Icon = categoryIcons[category];
                const colorClass = categoryColors[category];
                const gradient = categoryGradients[category];

                return (
                  <Card 
                    key={category} 
                    className={cn(
                      "overflow-hidden",
                      missions.length === 0 && "opacity-60"
                    )}
                  >
                    <CardHeader className={cn("py-3 bg-gradient-to-r", gradient)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg border", colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {isHebrew ? categoryLabels[category].he : categoryLabels[category].en}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {missions.reduce((acc, m) => acc + m.completedCount, 0)}/
                          {missions.reduce((acc, m) => acc + m.totalCount, 0)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      {missions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {isHebrew ? 'אין משימות' : 'No missions'}
                        </p>
                      ) : (
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-2">
                            {missions.map((mission) => (
                              <MissionCard 
                                key={mission.id} 
                                mission={mission} 
                                onToggleItem={toggleItem}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
