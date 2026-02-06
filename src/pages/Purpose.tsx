import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Compass, Heart, Target, Star, Sparkles, Users, Rocket } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { Card } from "@/components/ui/card";

const Purpose = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'ייעוד | MindOS' : 'Purpose | MindOS',
    description: language === 'he' 
      ? 'גלה את הייעוד שלך - המשמעות, הערכים והחזון שמנחים את חייך'
      : 'Discover your purpose - the meaning, values and vision that guide your life',
    url: `${window.location.origin}/purpose`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'ייעוד' : 'Purpose', url: `${window.location.origin}/purpose` },
      ]),
    ],
  });

  // Purpose tools grid
  const purposeTools = [
    {
      id: 'values',
      icon: Heart,
      title: language === 'he' ? 'ערכי ליבה' : 'Core Values',
      description: language === 'he' ? 'זהה את הערכים המנחים אותך' : 'Identify your guiding values',
    },
    {
      id: 'vision',
      icon: Target,
      title: language === 'he' ? 'חזון' : 'Vision',
      description: language === 'he' ? 'צור תמונה ברורה של עתידך' : 'Create a clear picture of your future',
    },
    {
      id: 'meaning',
      icon: Sparkles,
      title: language === 'he' ? 'משמעות' : 'Meaning',
      description: language === 'he' ? 'מה נותן לך תחושת משמעות?' : 'What gives you a sense of meaning?',
    },
    {
      id: 'mission',
      icon: Compass,
      title: language === 'he' ? 'שליחות' : 'Mission',
      description: language === 'he' ? 'מה השליחות שלך בעולם?' : 'What is your mission in the world?',
    },
    {
      id: 'legacy',
      icon: Star,
      title: language === 'he' ? 'מורשת' : 'Legacy',
      description: language === 'he' ? 'מה תשאיר אחריך?' : 'What will you leave behind?',
    },
    {
      id: 'alignment',
      icon: Users,
      title: language === 'he' ? 'יישור' : 'Alignment',
      description: language === 'he' ? 'בדוק את היישור בין ערכיך לחייך' : 'Check alignment between values and life',
    },
  ];

  if (isLoading) {
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
    <DashboardLayout>
      <div className="space-y-6 pb-24 pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section - Purple/Fuchsia gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-100 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950/50 p-6 shadow-lg border border-purple-200 dark:border-purple-800/50"
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 dark:bg-purple-800/30 rounded-lg backdrop-blur-sm">
                  <Compass className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-400">
                  {language === 'he' ? 'ייעוד' : 'Purpose'}
                </h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/purpose/journey')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white hover:from-purple-500 hover:to-fuchsia-400 shadow-lg font-bold border border-purple-400/30"
                >
                  <Rocket className="w-4 h-4 me-2" />
                  {language === 'he' ? 'התחל מסע' : 'Start Journey'}
                </Button>
              </div>
            </div>
            <p className="text-purple-600/80 dark:text-purple-200 text-sm md:text-base">
              {language === 'he' 
                ? 'גלה את הייעוד שלך - ההיבט שמחבר את כל תחומי החיים יחדיו'
                : 'Discover your purpose - the aspect that connects all life domains together'}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-700/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-fuchsia-500/10 dark:bg-fuchsia-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Purpose Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלי ייעוד' : 'Purpose Tools'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {purposeTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/60 border-purple-200/50 dark:border-purple-800/30 hover:border-purple-400 dark:hover:border-purple-600"
                onClick={() => navigate('/purpose/journey')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 dark:from-purple-800/30 dark:to-fuchsia-800/30">
                    <tool.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Purpose Alignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-100/50 to-fuchsia-100/50 dark:from-purple-950/30 dark:to-fuchsia-950/30 border-purple-200 dark:border-purple-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20 dark:bg-purple-800/30">
                <Compass className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2">
                  {language === 'he' ? 'מדד היישור האישי' : 'Personal Alignment Index'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'he' 
                    ? 'השלם את מסע הייעוד כדי לגלות את מדד היישור שלך'
                    : 'Complete the Purpose Journey to discover your alignment index'}
                </p>
                <Button
                  onClick={() => navigate('/purpose/journey')}
                  variant="outline"
                  className="border-purple-400 dark:border-purple-600/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                >
                  {language === 'he' ? 'התחל את המסע' : 'Start the Journey'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Purpose;
