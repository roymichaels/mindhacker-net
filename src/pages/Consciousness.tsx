import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  User, Sparkles, Calendar, Brain, ArrowRight, Heart, Target, 
  Anchor, Activity, UserCircle 
} from "lucide-react";
import {
  AIAnalysisModal, LifePlanModal, ConsciousnessModal, BehavioralModal,
  IdentityModal, TraitsModal, CommitmentsModal, AnchorsModal,
} from "@/components/dashboard/DashboardModals";
import { useUnifiedDashboard } from "@/hooks/useUnifiedDashboard";
import { useOnboardingProgress } from "@/hooks/aurora/useOnboardingProgress";
import { PillarHubLayout, PillarToolsGrid, pillarColors } from "@/components/hub-shared";
import type { PillarToolItem } from "@/components/hub-shared";

type ModalType = 'ai' | 'plan' | 'consciousness' | 'behavioral' | 'identity' | 'traits' | 'commitments' | 'anchors' | null;

const Consciousness = () => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const dashboard = useUnifiedDashboard();
  const { onboarding } = useOnboardingProgress();
  const [identityData, setIdentityData] = useState<{
    identityTitle?: string;
    mainValues?: string[];
  } | null>(null);
  const colors = pillarColors.consciousness;

  const hasJourneyData = onboarding?.onboarding_complete || 
    onboarding?.direction_clarity !== 'incomplete' || 
    onboarding?.identity_understanding !== 'shallow';

  useEffect(() => {
    if (user) fetchIdentityData();
  }, [user]);

  const fetchIdentityData = async () => {
    try {
      if (!user) return;

      const { data: identityElements } = await supabase
        .from('aurora_identity_elements')
        .select('element_type, content')
        .eq('user_id', user.id);

      if (identityElements) {
        const values = identityElements.filter(el => el.element_type === 'value').map(el => el.content).slice(0, 3);
        const title = identityElements.find(el => el.element_type === 'identity_title');
        setIdentityData({ identityTitle: title?.content, mainValues: values });
      }
    } catch (error) {
      console.error('Error fetching identity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tools: PillarToolItem[] = [
    { id: 'ai-analysis', icon: Sparkles, title: language === 'he' ? 'ניתוח AI' : 'AI Analysis', description: language === 'he' ? 'ניתוח מעמיק של הפרופיל האישי שלך' : 'Deep analysis of your personal profile', onClick: () => setActiveModal('ai') },
    { id: '90-day-plan', icon: Calendar, title: language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan', description: language === 'he' ? 'מפת דרכים אישית עם אבני דרך מדידות' : 'Personal roadmap with measurable milestones', onClick: () => setActiveModal('plan') },
    { id: 'consciousness', icon: Brain, title: language === 'he' ? 'מפת תודעה' : 'Consciousness Map', description: language === 'he' ? 'הבנת דפוסי החשיבה והאנרגיה שלך' : 'Understanding your thinking and energy patterns', onClick: () => setActiveModal('consciousness') },
    { id: 'identity', icon: UserCircle, title: language === 'he' ? 'כרטיס זהות' : 'Identity Card', description: language === 'he' ? 'ערכים, עקרונות ותפיסות עצמיות' : 'Values, principles and self-concepts', onClick: () => setActiveModal('identity') },
    { id: 'traits', icon: Heart, title: language === 'he' ? 'תכונות אופי' : 'Character Traits', description: language === 'he' ? 'התכונות שמגדירות את מי שאתה' : 'The traits that define who you are', onClick: () => setActiveModal('traits') },
    { id: 'insights', icon: Activity, title: language === 'he' ? 'תובנות' : 'Behavioral Insights', description: language === 'he' ? 'דפוסי התנהגות ואנרגיה' : 'Behavior and energy patterns', onClick: () => setActiveModal('behavioral') },
    { id: 'commitments', icon: Target, title: language === 'he' ? 'התחייבויות' : 'Commitments', description: language === 'he' ? 'ההתחייבויות הפעילות שלך' : 'Your active commitments', onClick: () => setActiveModal('commitments') },
    { id: 'anchors', icon: Anchor, title: language === 'he' ? 'עוגנים' : 'Anchors', description: language === 'he' ? 'פעולות יומיות שמעגנות אותך' : 'Daily actions that ground you', onClick: () => setActiveModal('anchors') },
  ];

  return (
    <PillarHubLayout
      colors={colors}
      icon={User}
      title={{ he: 'תודעה', en: 'Consciousness' }}
      description={{ he: 'מרכז התודעה שלך - מפת תודעה, זהות, תכונות ותוכנית אישית', en: 'Your consciousness hub - consciousness map, identity, traits and personal plan' }}
      journeyPath="/launchpad"
      seoPath="/consciousness"
      isLoading={loading}
      journeyLabel={hasJourneyData ? { he: 'ערוך מסע', en: 'Edit Journey' } : undefined}
    >
      {/* Identity Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="backdrop-blur-xl bg-background/60 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCircle className={`h-5 w-5 ${colors.iconColor}`} />
              <CardTitle className="text-lg">
                {language === 'he' ? 'סטטוס זהות' : 'Identity Status'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {identityData?.identityTitle || identityData?.mainValues?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {identityData.identityTitle && (
                  <div className={`p-4 rounded-lg bg-gradient-to-r ${colors.statusGradient} border ${colors.statusBorder}`}>
                    <p className="text-xs text-muted-foreground mb-1">
                      {language === 'he' ? 'תואר זהות' : 'Identity Title'}
                    </p>
                    <p className={`font-medium ${colors.titleColor}`}>
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
                <Button asChild variant="outline" className={colors.outlineBtn}>
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

      {/* Tools Grid */}
      <PillarToolsGrid tools={tools} colors={colors} sectionTitle={language === 'he' ? 'כלי תודעה' : 'Consciousness Tools'} />

      {/* Modals */}
      <AIAnalysisModal open={activeModal === 'ai'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <LifePlanModal open={activeModal === 'plan'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <ConsciousnessModal open={activeModal === 'consciousness'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <BehavioralModal open={activeModal === 'behavioral'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <IdentityModal open={activeModal === 'identity'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} values={dashboard.values} principles={dashboard.principles} selfConcepts={dashboard.selfConcepts} identityTitle={dashboard.identityTitle} />
      <TraitsModal open={activeModal === 'traits'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} />
      <CommitmentsModal open={activeModal === 'commitments'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} commitments={dashboard.activeCommitments} />
      <AnchorsModal open={activeModal === 'anchors'} onOpenChange={(open) => !open && setActiveModal(null)} language={language} anchors={dashboard.dailyAnchors} />
    </PillarHubLayout>
  );
};

export default Consciousness;
