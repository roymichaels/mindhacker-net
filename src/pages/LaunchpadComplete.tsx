import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, Sparkles, Gift, Download, ArrowRight } from 'lucide-react';
import { SummaryScores } from '@/components/launchpad/summary/SummaryScores';
import { ConsciousnessAnalysis } from '@/components/launchpad/summary/ConsciousnessAnalysis';
import { IdentityProfile } from '@/components/launchpad/summary/IdentityProfile';
import { PlanPreview } from '@/components/launchpad/summary/PlanPreview';
import { LifeDirectionSection } from '@/components/launchpad/summary/LifeDirectionSection';
import { AnswersReview } from '@/components/launchpad/summary/AnswersReview';
import { useProfilePDF } from '@/hooks/useProfilePDF';
import { ProfilePDFRenderer } from '@/components/pdf/ProfilePDFRenderer';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';

interface SummaryData {
  consciousness_analysis: {
    current_state: string;
    dominant_patterns: string[];
    blind_spots: string[];
    strengths: string[];
    growth_edges: string[];
  };
  identity_profile: {
    dominant_traits: string[];
    suggested_ego_state: string;
    values_hierarchy: string[];
    identity_title?: string;
    identity_emoji?: string;
  };
  behavioral_insights: {
    habits_to_transform: string[];
    habits_to_cultivate: string[];
    resistance_patterns: string[];
  };
  life_direction?: {
    central_aspiration?: string;
    vision_summary?: string;
    clarity_score?: number;
  };
}

interface PlanData {
  months: Array<{
    number: number;
    title: string;
    title_he?: string;
    focus: string;
    milestone: string;
  }>;
}

interface LaunchpadProgress {
  step_1_intention: unknown;
  step_2_profile_data: Record<string, unknown>;
  step_5_focus_areas_selected: string[];
  step_6_actions: {
    habits_to_quit?: string[];
    habits_to_build?: string[];
    career_status?: string;
    career_goal?: string;
  };
}

export default function LaunchpadComplete() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { downloadPDF, generating, containerRef, pdfData, showRenderer } = useProfilePDF();
  
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({ consciousness: 0, clarity: 0, readiness: 0 });
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [launchpadProgress, setLaunchpadProgress] = useState<LaunchpadProgress | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchSummary() {
      try {
        // Fetch launchpad summary
        const { data: summary, error: summaryError } = await supabase
          .from('launchpad_summaries')
          .select('*')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (summaryError && summaryError.code !== 'PGRST116') {
          console.error('Error fetching summary:', summaryError);
        }

        if (summary) {
          setScores({
            consciousness: summary.consciousness_score || 70,
            clarity: summary.clarity_score || 65,
            readiness: summary.transformation_readiness || 75,
          });
          setSummaryData(summary.summary_data as unknown as SummaryData);
        }

        // Fetch life plan
        const { data: plan, error: planError } = await supabase
          .from('life_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (planError && planError.code !== 'PGRST116') {
          console.error('Error fetching plan:', planError);
        }

        if (plan) {
          setPlanData(plan.plan_data as unknown as PlanData);
        }

        // Fetch launchpad progress (user answers)
        const { data: progress, error: progressError } = await supabase
          .from('launchpad_progress')
          .select('step_1_intention, step_2_profile_data, step_5_focus_areas_selected, step_6_actions')
          .eq('user_id', user.id)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error fetching progress:', progressError);
        }

        if (progress) {
          setLaunchpadProgress(progress as LaunchpadProgress);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user, navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  // Parse welcome quiz data
  const getWelcomeQuiz = (): Record<string, string | string[]> => {
    if (!launchpadProgress?.step_1_intention) return {};
    
    const intention = launchpadProgress.step_1_intention;
    if (typeof intention === 'string') {
      try {
        return JSON.parse(intention);
      } catch {
        return { intention };
      }
    }
    return intention as Record<string, string | string[]>;
  };

  // Parse first week data
  const getFirstWeek = () => {
    const actions = launchpadProgress?.step_6_actions || {};
    return {
      habits_to_quit: (actions.habits_to_quit as string[]) || [],
      habits_to_build: (actions.habits_to_build as string[]) || [],
      career_status: (actions.career_status as string) || '',
      career_goal: (actions.career_goal as string) || '',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {language === 'he' ? 'טוען את הסיכום שלך...' : 'Loading your summary...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          {/* Large 3D Identity Orb */}
          <motion.div
            className="relative w-36 h-36 mx-auto"
            animate={{
              filter: [
                'drop-shadow(0 0 20px hsl(var(--primary) / 0.4))',
                'drop-shadow(0 0 40px hsl(var(--primary) / 0.6))',
                'drop-shadow(0 0 20px hsl(var(--primary) / 0.4))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <PersonalizedOrb
              size={144}
            />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {language === 'he' ? '🎉 מסע הטרנספורמציה שלך מתחיל!' : '🎉 Your Transformation Journey Begins!'}
          </h1>

          <p className="text-muted-foreground">
            {language === 'he'
              ? 'אורורה ניתחה את כל המידע שלך ויצרה עבורך פרופיל אישי ותוכנית טרנספורמציה'
              : 'Aurora analyzed all your data and created a personal profile and transformation plan for you'}
          </p>

          {/* Rewards */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary"
            >
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">+100 XP</span>
            </motion.div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600"
            >
              <Gift className="w-5 h-5" />
              <span className="font-bold">+15 {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Scores */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/50 border border-border/50"
        >
          <SummaryScores
            consciousnessScore={scores.consciousness}
            clarityScore={scores.clarity}
            readinessScore={scores.readiness}
          />
        </motion.div>

        {/* Identity Profile */}
        {summaryData?.identity_profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <IdentityProfile
              profile={summaryData.identity_profile}
              behavioral={summaryData.behavioral_insights}
            />
          </motion.div>
        )}

        {/* Consciousness Analysis */}
        {summaryData?.consciousness_analysis && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <ConsciousnessAnalysis analysis={summaryData.consciousness_analysis} />
          </motion.div>
        )}

        {/* Life Direction */}
        {summaryData?.life_direction && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <LifeDirectionSection lifeDirection={summaryData.life_direction} />
          </motion.div>
        )}

        {/* User Answers Review */}
        {launchpadProgress && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <AnswersReview
              welcomeQuiz={getWelcomeQuiz()}
              personalProfile={launchpadProgress.step_2_profile_data || {}}
              focusAreas={launchpadProgress.step_5_focus_areas_selected || []}
              firstWeek={getFirstWeek()}
            />
          </motion.div>
        )}

        {/* Plan Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-card/50 border border-border/50"
        >
          <PlanPreview
            months={planData?.months || []}
            onViewFullPlan={() => navigate('/life-plan')}
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pt-4 space-y-3"
        >
          {/* Download PDF Button */}
          <Button
            size="lg"
            variant="outline"
            onClick={downloadPDF}
            disabled={generating}
            className="w-full h-12 gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'he' ? 'יוצר PDF...' : 'Generating PDF...'}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {language === 'he' ? 'הורד פרופיל כ-PDF' : 'Download Profile as PDF'}
              </>
            )}
          </Button>

          {/* Continue Button */}
          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full h-14 text-lg gap-2"
          >
            <Rocket className="w-5 h-5" />
            {language === 'he' ? 'המשך לדשבורד - בוא נתחיל!' : "Continue to Dashboard - Let's Go!"}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>
      </div>

      {/* Hidden PDF Renderer */}
      {showRenderer && pdfData && (
        <ProfilePDFRenderer ref={containerRef} data={pdfData} />
      )}
    </div>
  );
}
