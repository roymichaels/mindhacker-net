import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { getBreadcrumbSchema } from "@/lib/seo";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  User, 
  Sparkles, 
  Calendar, 
  Brain,
  ArrowRight,
  Rocket,
  Heart,
  Target,
  Anchor,
  Activity,
  UserCircle
} from "lucide-react";
import {
  AIAnalysisModal,
  LifePlanModal,
  ConsciousnessModal,
  BehavioralModal,
  IdentityModal,
  TraitsModal,
  CommitmentsModal,
  AnchorsModal,
} from "@/components/dashboard/DashboardModals";
import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";

type ModalType = 'ai' | 'plan' | 'consciousness' | 'behavioral' | 'identity' | 'traits' | 'commitments' | 'anchors' | null;

const Personality = () => {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const dashboard = useUnifiedDashboard();
  const [identityData, setIdentityData] = useState<{
    identityTitle?: string;
    mainValues?: string[];
  } | null>(null);

  // SEO Configuration
  useSEO({
    title: language === 'he' ? 'אישיות | MindOS' : 'Personality | MindOS',
    description: language === 'he' 
      ? 'מרכז הטרנספורמציה האישית שלך - מפת תודעה, זהות, תכונות ותוכנית אישית'
      : 'Your personal transformation hub - consciousness map, identity, traits and personal plan',
    url: `${window.location.origin}/personality`,
    type: "website",
    structuredData: [
      getBreadcrumbSchema([
        { name: language === 'he' ? 'דף הבית' : 'Home', url: window.location.origin },
        { name: language === 'he' ? 'אישיות' : 'Personality', url: `${window.location.origin}/personality` },
      ]),
    ],
  });

  useEffect(() => {
    fetchIdentityData();
  }, []);

  const fetchIdentityData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch identity elements
      const { data: identityElements } = await supabase
        .from('aurora_identity_elements')
        .select('element_type, content')
        .eq('user_id', user.id);

      if (identityElements) {
        const values = identityElements
          .filter(el => el.element_type === 'value')
          .map(el => el.content)
          .slice(0, 3);
        
        const title = identityElements.find(el => el.element_type === 'identity_title');
        
        setIdentityData({
          identityTitle: title?.content,
          mainValues: values,
        });
      }
    } catch (error) {
      console.error('Error fetching identity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const personalityTools = [
    {
      id: 'ai-analysis',
      icon: Sparkles,
      titleHe: 'ניתוח AI',
      titleEn: 'AI Analysis',
      descHe: 'ניתוח מעמיק של הפרופיל האישי שלך',
      descEn: 'Deep analysis of your personal profile',
      onClick: () => setActiveModal('ai'),
      available: true,
    },
    {
      id: '90-day-plan',
      icon: Calendar,
      titleHe: 'תוכנית 90 יום',
      titleEn: '90-Day Plan',
      descHe: 'מפת דרכים אישית עם אבני דרך מדידות',
      descEn: 'Personal roadmap with measurable milestones',
      onClick: () => setActiveModal('plan'),
      available: true,
    },
    {
      id: 'consciousness',
      icon: Brain,
      titleHe: 'מפת תודעה',
      titleEn: 'Consciousness Map',
      descHe: 'הבנת דפוסי החשיבה והאנרגיה שלך',
      descEn: 'Understanding your thinking and energy patterns',
      onClick: () => setActiveModal('consciousness'),
      available: true,
    },
    {
      id: 'identity',
      icon: UserCircle,
      titleHe: 'כרטיס זהות',
      titleEn: 'Identity Card',
      descHe: 'ערכים, עקרונות ותפיסות עצמיות',
      descEn: 'Values, principles and self-concepts',
      onClick: () => setActiveModal('identity'),
      available: true,
    },
    {
      id: 'traits',
      icon: Heart,
      titleHe: 'תכונות אופי',
      titleEn: 'Character Traits',
      descHe: 'התכונות שמגדירות את מי שאתה',
      descEn: 'The traits that define who you are',
      onClick: () => setActiveModal('traits'),
      available: true,
    },
    {
      id: 'insights',
      icon: Activity,
      titleHe: 'תובנות',
      titleEn: 'Behavioral Insights',
      descHe: 'דפוסי התנהגות ואנרגיה',
      descEn: 'Behavior and energy patterns',
      onClick: () => setActiveModal('behavioral'),
      available: true,
    },
    {
      id: 'commitments',
      icon: Target,
      titleHe: 'התחייבויות',
      titleEn: 'Commitments',
      descHe: 'ההתחייבויות הפעילות שלך',
      descEn: 'Your active commitments',
      onClick: () => setActiveModal('commitments'),
      available: true,
    },
    {
      id: 'anchors',
      icon: Anchor,
      titleHe: 'עוגנים',
      titleEn: 'Anchors',
      descHe: 'פעולות יומיות שמעגנות אותך',
      descEn: 'Daily actions that ground you',
      onClick: () => setActiveModal('anchors'),
      available: true,
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
      <div className="space-y-6 pb-24 pt-9" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section - Blue gradient with yellow text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 p-6 shadow-lg"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <User className="h-6 w-6 text-yellow-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                  {language === 'he' ? 'אישיות' : 'Personality'}
                </h1>
              </div>
              
              {/* Start Transformation Journey Button */}
              <Button
                onClick={() => navigate('/launchpad')}
                className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg font-bold"
              >
                <Rocket className="w-4 h-4 me-2" />
                {language === 'he' ? 'התחל מסע טרנספורמציה' : 'Start Transformation'}
              </Button>
            </div>
            <p className="text-yellow-100 text-sm md:text-base">
              {language === 'he' 
                ? 'מרכז הטרנספורמציה האישית שלך - מפת תודעה, זהות, תכונות ותוכנית אישית'
                : 'Your personal transformation hub - consciousness map, identity, traits and personal plan'}
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 end-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 start-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        {/* Identity Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-xl bg-background/60 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">
                  {language === 'he' ? 'סטטוס זהות' : 'Identity Status'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {identityData?.identityTitle || identityData?.mainValues?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {identityData.identityTitle && (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-400/10 border border-blue-500/20">
                      <p className="text-xs text-muted-foreground mb-1">
                        {language === 'he' ? 'תואר זהות' : 'Identity Title'}
                      </p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {identityData.identityTitle}
                      </p>
                    </div>
                  )}
                  {identityData.mainValues && identityData.mainValues.length > 0 && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">
                        {language === 'he' ? 'ערכים מרכזיים' : 'Core Values'}
                      </p>
                      <p className="font-medium">{identityData.mainValues.join(', ')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    {language === 'he' 
                      ? 'עדיין לא השלמת את מסע הטרנספורמציה שלך'
                      : 'You haven\'t completed your transformation journey yet'}
                  </p>
                  <Button asChild variant="outline" className="border-blue-500/50 text-blue-600 hover:bg-blue-500/10">
                    <Link to="/launchpad">
                      {language === 'he' ? 'התחל את המסע' : 'Start your journey'}
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Personality Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">
            {language === 'he' ? 'כלי אישיות' : 'Personality Tools'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {personalityTools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className={`backdrop-blur-xl bg-background/60 border-border/50 h-full transition-all hover:shadow-md ${
                    tool.available ? 'cursor-pointer hover:border-blue-500/50' : 'opacity-60'
                  }`}
                  onClick={() => tool.available && tool.onClick()}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${tool.available ? 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20' : 'bg-muted'}`}>
                        <tool.icon className={`h-5 w-5 ${tool.available ? 'text-blue-600' : 'text-muted-foreground'}`} />
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
      </div>

      {/* All Modals */}
      <AIAnalysisModal 
        open={activeModal === 'ai'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language} 
      />
      <LifePlanModal 
        open={activeModal === 'plan'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language} 
      />
      <ConsciousnessModal 
        open={activeModal === 'consciousness'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language} 
      />
      <BehavioralModal 
        open={activeModal === 'behavioral'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language} 
      />
      <IdentityModal 
        open={activeModal === 'identity'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language}
        values={dashboard.values}
        principles={dashboard.principles}
        selfConcepts={dashboard.selfConcepts}
        identityTitle={dashboard.identityTitle}
      />
      <TraitsModal 
        open={activeModal === 'traits'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language}
      />
      <CommitmentsModal 
        open={activeModal === 'commitments'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language}
        commitments={dashboard.activeCommitments}
      />
      <AnchorsModal 
        open={activeModal === 'anchors'} 
        onOpenChange={(open) => !open && setActiveModal(null)} 
        language={language}
        anchors={dashboard.dailyAnchors}
      />
    </DashboardLayout>
  );
};

export default Personality;
