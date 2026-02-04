import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { ArrowRight, Battery, Moon, Activity as ActivityIcon, Droplets, Heart, TrendingUp } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { useHealthData } from "@/hooks/useHealthData";

interface HealthStatusCardProps {
  language: string;
}

const HealthStatusCard = ({ language }: HealthStatusCardProps) => {
  const { data: launchpadData, isLoading: launchpadLoading } = useLaunchpadData();
  const { healthData, isLoading: healthLoading } = useHealthData();

  const isLoading = launchpadLoading || healthLoading;

  // Extract health data from launchpad profile
  const profileData = launchpadData?.personalProfile || {};
  
  // Map raw values to display labels
  const energyLevelMap: Record<string, { he: string; en: string; score: number }> = {
    high: { he: 'גבוהה', en: 'High', score: 100 },
    medium: { he: 'בינונית', en: 'Medium', score: 65 },
    low: { he: 'נמוכה', en: 'Low', score: 30 },
    varies: { he: 'משתנה', en: 'Varies', score: 50 },
  };

  const sleepHoursMap: Record<string, { he: string; en: string; score: number }> = {
    'less-than-5': { he: 'פחות מ-5', en: '< 5h', score: 20 },
    'less_than_5': { he: 'פחות מ-5', en: '< 5h', score: 20 },
    '5-to-6': { he: '5-6 שעות', en: '5-6h', score: 40 },
    '5_to_6': { he: '5-6 שעות', en: '5-6h', score: 40 },
    '5-6': { he: '5-6 שעות', en: '5-6h', score: 40 },
    '6-7': { he: '6-7 שעות', en: '6-7h', score: 70 },
    '6-to-7': { he: '6-7 שעות', en: '6-7h', score: 70 },
    '6_to_7': { he: '6-7 שעות', en: '6-7h', score: 70 },
    '7-8': { he: '7-8 שעות', en: '7-8h', score: 100 },
    '7-to-8': { he: '7-8 שעות', en: '7-8h', score: 100 },
    '7_to_8': { he: '7-8 שעות', en: '7-8h', score: 100 },
    'more-than-8': { he: 'יותר מ-8', en: '8h+', score: 90 },
    'more_than_8': { he: 'יותר מ-8', en: '8h+', score: 90 },
  };

  // Activity/Exercise frequency map - using actual DB values
  const activityMap: Record<string, { he: string; en: string; score: number }> = {
    'daily': { he: 'יומית', en: 'Daily', score: 100 },
    '5-6/week': { he: '5-6 בשבוע', en: '5-6/week', score: 95 },
    '3-4/week': { he: '3-4 בשבוע', en: '3-4/week', score: 80 },
    '1-2/week': { he: '1-2 בשבוע', en: '1-2/week', score: 60 },
    'few_times_week': { he: 'מספר פעמים', en: 'Few/week', score: 75 },
    'few-times-week': { he: 'מספר פעמים', en: 'Few/week', score: 75 },
    'once_week': { he: 'פעם בשבוע', en: '1x/week', score: 50 },
    'once-week': { he: 'פעם בשבוע', en: '1x/week', score: 50 },
    'rarely': { he: 'לעתים רחוקות', en: 'Rarely', score: 25 },
    'none': { he: 'לא פעיל', en: 'None', score: 10 },
  };

  // Hydration items map (for array values)
  const hydrationItemMap: Record<string, { he: string; en: string }> = {
    'water': { he: 'מים', en: 'Water' },
    'natural-juice': { he: 'מיץ טבעי', en: 'Natural Juice' },
    'natural_juice': { he: 'מיץ טבעי', en: 'Natural Juice' },
    'coconut-water': { he: 'מי קוקוס', en: 'Coconut Water' },
    'coconut_water': { he: 'מי קוקוס', en: 'Coconut Water' },
    'tea': { he: 'תה', en: 'Tea' },
    'coffee': { he: 'קפה', en: 'Coffee' },
    'herbal-tea': { he: 'תה צמחים', en: 'Herbal Tea' },
    'herbal_tea': { he: 'תה צמחים', en: 'Herbal Tea' },
    'juice': { he: 'מיץ', en: 'Juice' },
    'soda': { he: 'שתייה קלה', en: 'Soda' },
    'energy-drinks': { he: 'משקאות אנרגיה', en: 'Energy Drinks' },
    'sports-drinks': { he: 'משקאות ספורט', en: 'Sports Drinks' },
  };

  // Get raw values - note: exercise_frequency is the actual field name
  const energyLevel = (profileData.energy_level as string) || '';
  const sleepHours = (profileData.sleep_hours as string) || '';
  const exerciseFrequency = (profileData.exercise_frequency as string) || '';
  const hydrationRaw = profileData.hydration;
  
  // Handle hydration as array or string
  const getHydrationDisplay = (): { display: string; score: number } => {
    if (!hydrationRaw) return { display: '', score: 0 };
    
    const isHebrew = language === 'he';
    
    if (Array.isArray(hydrationRaw)) {
      // Map each hydration item to its label
      const labels = hydrationRaw.map(item => {
        const mapped = hydrationItemMap[item as string];
        return mapped ? mapped[isHebrew ? 'he' : 'en'] : null;
      }).filter(Boolean);
      
      if (labels.length === 0) return { display: '', score: 0 };
      
      // Score based on water presence and variety
      const hasWater = hydrationRaw.includes('water');
      const score = hasWater ? 80 + Math.min(hydrationRaw.length * 5, 20) : 60;
      
      // Show first 2 items max
      const displayItems = labels.slice(0, 2);
      const display = displayItems.join(', ') + (labels.length > 2 ? '...' : '');
      
      return { display, score };
    }
    
    // Handle as string (legacy)
    const mapped = hydrationItemMap[hydrationRaw as string];
    if (mapped) {
      return { 
        display: mapped[isHebrew ? 'he' : 'en'], 
        score: hydrationRaw === 'water' ? 80 : 60 
      };
    }
    
    return { display: '', score: 0 };
  };

  const hydrationData = getHydrationDisplay();
  const hasData = energyLevel || sleepHours || exerciseFrequency || hydrationData.display;

  // Calculate overall health score
  const scores = [
    energyLevelMap[energyLevel]?.score || 0,
    sleepHoursMap[sleepHours]?.score || 0,
    activityMap[exerciseFrequency]?.score || 0,
    hydrationData.score,
  ].filter(s => s > 0);
  
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-red-800/30 animate-pulse">
        <CardContent className="p-6 h-40" />
      </Card>
    );
  }

  const metrics = [
    {
      key: 'energy',
      value: energyLevel,
      icon: Battery,
      labelHe: 'אנרגיה',
      labelEn: 'Energy',
      displayValue: energyLevelMap[energyLevel]?.[language === 'he' ? 'he' : 'en'],
      score: energyLevelMap[energyLevel]?.score || 0,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-orange-400/10',
    },
    {
      key: 'sleep',
      value: sleepHours,
      icon: Moon,
      labelHe: 'שינה',
      labelEn: 'Sleep',
      displayValue: sleepHoursMap[sleepHours]?.[language === 'he' ? 'he' : 'en'],
      score: sleepHoursMap[sleepHours]?.score || 0,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-purple-400/10',
    },
    {
      key: 'activity',
      value: exerciseFrequency,
      icon: ActivityIcon,
      labelHe: 'פעילות',
      labelEn: 'Activity',
      displayValue: activityMap[exerciseFrequency]?.[language === 'he' ? 'he' : 'en'],
      score: activityMap[exerciseFrequency]?.score || 0,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-emerald-400/10',
    },
    {
      key: 'hydration',
      value: hydrationData.display,
      icon: Droplets,
      labelHe: 'הידרציה',
      labelEn: 'Hydration',
      displayValue: hydrationData.display,
      score: hydrationData.score,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-cyan-400/10',
    },
  ].filter(m => m.value && m.displayValue);

  return (
    <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 border-red-800/30 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <Heart className="h-4 w-4 text-red-400 fill-red-400/50" />
            </div>
            <CardTitle className="text-base text-red-400">
              {language === 'he' ? 'סטטוס בריאות' : 'Health Status'}
            </CardTitle>
          </div>
          {hasData && overallScore > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${getScoreColor(overallScore)}`} />
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          )}
        </div>
        {hasData && overallScore > 0 && (
          <div className="mt-2">
            <Progress 
              value={overallScore} 
              className="h-1.5 bg-gray-800"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {metrics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {metrics.map((metric) => (
              <div 
                key={metric.key}
                className={`p-3 rounded-xl bg-gradient-to-br ${metric.bgColor} border border-white/5 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? metric.labelHe : metric.labelEn}
                  </p>
                </div>
                <p className={`font-semibold text-sm ${metric.color}`}>
                  {metric.displayValue}
                </p>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(metric.score)} transition-all`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-red-400/50" />
            </div>
            <p className="text-muted-foreground mb-4">
              {language === 'he' 
                ? 'עדיין אין נתוני בריאות - השלם את מסע הטרנספורמציה'
                : 'No health data yet - complete your transformation journey'}
            </p>
            <Button asChild className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400">
              <Link to="/launchpad">
                {language === 'he' ? 'התחל את המסע' : 'Start your journey'}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthStatusCard;
