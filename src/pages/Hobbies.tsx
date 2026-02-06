import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Palette, Gamepad2, Music, Dumbbell, TreePine, Users, Sparkles, Rocket } from "lucide-react";
import { useLaunchpadData } from "@/hooks/useLaunchpadData";
import { Card } from "@/components/ui/card";

const Hobbies = () => {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { isLoading } = useLaunchpadData();

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'תחביבים | MindOS' : 'Hobbies | MindOS',
    description: language === 'he' 
      ? 'גלה את התחביבים שלך - יצירתיות, פנאי, משחקים ופעילויות שמביאות לך שמחה'
      : 'Discover your hobbies - creativity, leisure, games and activities that bring you joy',
    url: `${window.location.origin}/hobbies`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'תחביבים' : 'Hobbies', url: `${window.location.origin}/hobbies` },
      ]),
    ],
  });

  // Hobbies tools grid
  const hobbiesTools = [
    {
      id: 'creative',
      icon: Sparkles,
      title: language === 'he' ? 'יצירתיות' : 'Creative',
      description: language === 'he' ? 'פרויקטים יצירתיים ואמנות' : 'Creative projects and art',
    },
    {
      id: 'sports',
      icon: Dumbbell,
      title: language === 'he' ? 'ספורט' : 'Sports',
      description: language === 'he' ? 'פעילויות ספורטיביות וכושר' : 'Sports and fitness activities',
    },
    {
      id: 'music',
      icon: Music,
      title: language === 'he' ? 'מוזיקה ואומנות' : 'Music & Arts',
      description: language === 'he' ? 'נגינה, ציור ומלאכת יד' : 'Playing, painting and crafts',
    },
    {
      id: 'games',
      icon: Gamepad2,
      title: language === 'he' ? 'משחקים' : 'Games',
      description: language === 'he' ? 'משחקי וידאו, לוח ובידור' : 'Video games, board games & entertainment',
    },
    {
      id: 'outdoors',
      icon: TreePine,
      title: language === 'he' ? 'טבע ופעילויות חוץ' : 'Outdoors',
      description: language === 'he' ? 'טיולים, קמפינג ופעילויות בטבע' : 'Hiking, camping & outdoor activities',
    },
    {
      id: 'social',
      icon: Users,
      title: language === 'he' ? 'תחביבים חברתיים' : 'Social Hobbies',
      description: language === 'he' ? 'קבוצות, מפגשים ופעילויות משותפות' : 'Groups, meetups & shared activities',
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
      <div className="space-y-6 pb-24 sm:pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section - Teal/Cyan gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-100 to-cyan-50 dark:from-teal-950 dark:to-cyan-950/50 p-6 shadow-lg border border-teal-200 dark:border-teal-800/50"
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 dark:bg-teal-800/30 rounded-lg backdrop-blur-sm">
                  <Palette className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-teal-700 dark:text-teal-400">
                  {language === 'he' ? 'תחביבים' : 'Hobbies'}
                </h1>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/hobbies/journey')}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-500 text-white hover:from-teal-500 hover:to-cyan-400 shadow-lg font-bold border border-teal-400/30"
                >
                  <Rocket className="w-4 h-4 me-2" />
                  {language === 'he' ? 'התחל מסע' : 'Start Journey'}
                </Button>
              </div>
            </div>
            <p className="text-teal-600/80 dark:text-teal-200 text-sm md:text-base">
              {language === 'he' 
                ? 'גלה את התחביבים שלך - יצירתיות, פנאי ופעילויות שמביאות לך שמחה ומאזנות את חייך'
                : 'Discover your hobbies - creativity, leisure and activities that bring you joy and balance your life'}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-teal-500/10 dark:bg-teal-700/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-cyan-500/10 dark:bg-cyan-700/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Hobbies Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלי תחביבים' : 'Hobby Tools'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hobbiesTools.map((tool) => (
              <Card
                key={tool.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/60 border-teal-200/50 dark:border-teal-800/30 hover:border-teal-400 dark:hover:border-teal-600"
                onClick={() => navigate('/hobbies/journey')}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 dark:from-teal-800/30 dark:to-cyan-800/30">
                    <tool.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Hobbies Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-teal-100/50 to-cyan-100/50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-teal-500/20 dark:bg-teal-800/30">
                <Palette className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-2">
                  {language === 'he' ? 'מדד איזון הפנאי' : 'Leisure Balance Index'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'he' 
                    ? 'השלם את מסע התחביבים כדי לגלות את מדד איזון הפנאי שלך'
                    : 'Complete the Hobbies Journey to discover your leisure balance index'}
                </p>
                <Button
                  onClick={() => navigate('/hobbies/journey')}
                  variant="outline"
                  className="border-teal-400 dark:border-teal-600/50 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30"
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

export default Hobbies;
