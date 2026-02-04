import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Target, 
  Calendar, 
  Trophy, 
  Sparkles, 
  ArrowRight,
  MessageCircle,
  Rocket,
  BookOpen,
  TrendingUp
} from "lucide-react";

const Business = () => {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [careerData, setCareerData] = useState<{
    currentStatus?: string;
    careerGoal?: string;
  } | null>(null);

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'עסקים | MindOS' : 'Business | MindOS',
    description: language === 'he' 
      ? 'מרכז הצמיחה העסקית שלך - כלים, אסטרטגיות ותוכניות לטרנספורמציה קריירתית'
      : 'Your business growth hub - tools, strategies and plans for career transformation',
    url: `${window.location.origin}/business`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'עסקים' : 'Business', url: `${window.location.origin}/business` },
      ]),
    ],
  });

  useEffect(() => {
    fetchCareerData();
  }, []);

  const fetchCareerData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Try to fetch launchpad progress for career info
      const { data: launchpad } = await supabase
        .from('launchpad_progress')
        .select('step_2_profile_data, step_5_focus_areas_selected, step_1_intention')
        .eq('user_id', user.id)
        .maybeSingle();

      if (launchpad) {
        const profileData = launchpad.step_2_profile_data as Record<string, any> | null;
        const focusAreas = launchpad.step_5_focus_areas_selected as string[] | null;
        
        setCareerData({
          currentStatus: profileData?.occupation || profileData?.currentRole,
          careerGoal: focusAreas?.find(a => a.toLowerCase().includes('career') || a.toLowerCase().includes('business')) 
            || launchpad.step_1_intention,
        });
      }
    } catch (error) {
      console.error('Error fetching career data:', error);
    } finally {
      setLoading(false);
    }
  };

  const businessTools = [
    {
      id: 'weekly-actions',
      icon: Target,
      titleHe: 'פעולות שבועיות',
      titleEn: 'Weekly Actions',
      descHe: 'משימות מותאמות אישית לשבוע הקרוב',
      descEn: 'AI-personalized tasks for the upcoming week',
      path: '/life-plan',
      available: true,
    },
    {
      id: '90-day-plan',
      icon: Calendar,
      titleHe: 'תוכנית 90 יום',
      titleEn: '90-Day Plan',
      descHe: 'מפת דרכים קריירתית עם אבני דרך מדידות',
      descEn: 'Career roadmap with measurable milestones',
      path: '/life-plan',
      available: true,
    },
    {
      id: 'elite-challenges',
      icon: Trophy,
      titleHe: 'אתגרי עילית',
      titleEn: 'Elite Challenges',
      descHe: 'משימות מאתגרות לבניית מנהיגות',
      descEn: 'Challenging missions to build leadership',
      path: '/life-plan',
      available: true,
    },
    {
      id: 'resources',
      icon: BookOpen,
      titleHe: 'משאבים עסקיים',
      titleEn: 'Business Resources',
      descHe: 'בקרוב - תכנים וכלים לצמיחה',
      descEn: 'Coming soon - content and growth tools',
      path: '#',
      available: false,
    },
  ];

  const quickActions = [
    {
      id: 'business-hypnosis',
      icon: Sparkles,
      titleHe: 'סשן עסקי',
      titleEn: 'Business Session',
      descHe: 'היפנוזה ממוקדת קריירה',
      descEn: 'Career-focused hypnosis',
      path: '/hypnosis?goal=business',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      id: 'ask-aurora',
      icon: MessageCircle,
      titleHe: 'שאל את אורורה',
      titleEn: 'Ask Aurora',
      descHe: 'ייעוץ AI לעסקים',
      descEn: 'AI business coaching',
      path: '/aurora',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'view-plan',
      icon: Rocket,
      titleHe: 'צפה בתוכנית',
      titleEn: 'View Full Plan',
      descHe: 'תוכנית הטרנספורמציה שלך',
      descEn: 'Your transformation plan',
      path: '/life-plan',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideRightPanel>
      <div className="space-y-6 pb-24" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 p-6 shadow-lg"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Briefcase className="h-6 w-6 text-purple-900" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-purple-900">
                {t('business.title')}
              </h1>
            </div>
            <p className="text-purple-900/80 text-sm md:text-base">
              {t('business.subtitle')}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Career Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-xl bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">{t('business.careerStatus')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {careerData?.currentStatus || careerData?.careerGoal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {careerData.currentStatus && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">{t('business.currentStatus')}</p>
                      <p className="font-medium">{careerData.currentStatus}</p>
                    </div>
                  )}
                  {careerData.careerGoal && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border border-amber-500/20">
                      <p className="text-xs text-muted-foreground mb-1">{t('business.careerGoal')}</p>
                      <p className="font-medium text-amber-600 dark:text-amber-400">{careerData.careerGoal}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">{t('business.noCareerData')}</p>
                  <Button asChild variant="outline" className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                    <Link to="/launchpad">
                      {t('business.completeLaunchpad')}
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">{t('business.tools')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {businessTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className={`backdrop-blur-xl bg-background/60 border-border/50 h-full transition-all hover:shadow-md ${
                    tool.available ? 'cursor-pointer hover:border-amber-500/50' : 'opacity-60'
                  }`}
                  onClick={() => tool.available && navigate(tool.path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${tool.available ? 'bg-gradient-to-r from-amber-500/20 to-yellow-400/20' : 'bg-muted'}`}>
                        <tool.icon className={`h-5 w-5 ${tool.available ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {language === 'he' ? tool.titleHe : tool.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === 'he' ? tool.descHe : tool.descEn}
                        </p>
                      </div>
                      {tool.available && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4">{t('business.quickActions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 border-border/50 hover:border-amber-500/50 hover:bg-amber-500/5"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-sm">
                    {language === 'he' ? action.titleHe : action.titleEn}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language === 'he' ? action.descHe : action.descEn}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Business;
