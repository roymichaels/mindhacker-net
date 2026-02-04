import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Battery, Moon, Activity as ActivityIcon, Droplets } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";

interface HealthStatusCardProps {
  language: string;
}

const HealthStatusCard = ({ language }: HealthStatusCardProps) => {
  const { data: launchpadData, isLoading } = useLaunchpadData();

  // Extract health data from launchpad profile
  const profileData = launchpadData?.personalProfile || {};
  
  // Map raw values to display labels
  const energyLevelMap: Record<string, { he: string; en: string }> = {
    high: { he: 'גבוהה', en: 'High' },
    medium: { he: 'בינונית', en: 'Medium' },
    low: { he: 'נמוכה', en: 'Low' },
    varies: { he: 'משתנה', en: 'Varies' },
  };

  const sleepHoursMap: Record<string, { he: string; en: string }> = {
    'less_than_5': { he: 'פחות מ-5', en: 'Less than 5' },
    '5_to_6': { he: '5-6 שעות', en: '5-6 hours' },
    '6_to_7': { he: '6-7 שעות', en: '6-7 hours' },
    '7_to_8': { he: '7-8 שעות', en: '7-8 hours' },
    'more_than_8': { he: 'יותר מ-8', en: 'More than 8' },
  };

  const activityMap: Record<string, { he: string; en: string }> = {
    daily: { he: 'יומית', en: 'Daily' },
    few_times_week: { he: 'מספר פעמים בשבוע', en: 'Few times/week' },
    once_week: { he: 'פעם בשבוע', en: 'Once a week' },
    rarely: { he: 'לעתים נדירות', en: 'Rarely' },
    none: { he: 'לא פעיל', en: 'Not active' },
  };

  const hydrationMap: Record<string, { he: string; en: string }> = {
    excellent: { he: 'מצוינת', en: 'Excellent' },
    good: { he: 'טובה', en: 'Good' },
    moderate: { he: 'בינונית', en: 'Moderate' },
    poor: { he: 'לא מספיקה', en: 'Poor' },
  };

  const energyLevel = profileData.energy_level as string || '';
  const sleepHours = profileData.sleep_hours as string || '';
  const activityFrequency = profileData.activity_frequency as string || '';
  const hydration = profileData.hydration as string || '';

  const hasData = energyLevel || sleepHours || activityFrequency || hydration;

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-background/60 border-border/50 animate-pulse">
        <CardContent className="p-6 h-32" />
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-background/60 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-lg">
            {language === 'he' ? 'סטטוס בריאות' : 'Health Status'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {energyLevel && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-400/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Battery className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'רמת אנרגיה' : 'Energy Level'}
                  </p>
                </div>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {energyLevelMap[energyLevel]?.[language === 'he' ? 'he' : 'en'] || energyLevel}
                </p>
              </div>
            )}
            {sleepHours && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="h-4 w-4 text-indigo-500" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'שעות שינה' : 'Sleep Hours'}
                  </p>
                </div>
                <p className="font-medium">
                  {sleepHoursMap[sleepHours]?.[language === 'he' ? 'he' : 'en'] || sleepHours}
                </p>
              </div>
            )}
            {activityFrequency && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <ActivityIcon className="h-4 w-4 text-orange-500" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'פעילות גופנית' : 'Physical Activity'}
                  </p>
                </div>
                <p className="font-medium">
                  {activityMap[activityFrequency]?.[language === 'he' ? 'he' : 'en'] || activityFrequency}
                </p>
              </div>
            )}
            {hydration && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'הידרציה' : 'Hydration'}
                  </p>
                </div>
                <p className="font-medium">
                  {hydrationMap[hydration]?.[language === 'he' ? 'he' : 'en'] || hydration}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {language === 'he' 
                ? 'עדיין אין נתוני בריאות - השלם את מסע הטרנספורמציה'
                : 'No health data yet - complete your transformation journey'}
            </p>
            <Button asChild variant="outline" className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10">
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
