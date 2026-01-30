import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, Sparkles, Gift } from 'lucide-react';
import { SummaryScores } from '@/components/launchpad/summary/SummaryScores';
import { ConsciousnessAnalysis } from '@/components/launchpad/summary/ConsciousnessAnalysis';
import { IdentityProfile } from '@/components/launchpad/summary/IdentityProfile';
import { PlanPreview } from '@/components/launchpad/summary/PlanPreview';

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
  };
  behavioral_insights: {
    habits_to_transform: string[];
    habits_to_cultivate: string[];
    resistance_patterns: string[];
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

export default function LaunchpadComplete() {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({ consciousness: 0, clarity: 0, readiness: 0 });
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [planData, setPlanData] = useState<PlanData | null>(null);

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
          .order('created_at', { ascending: false })
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
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (planError && planError.code !== 'PGRST116') {
          console.error('Error fetching plan:', planError);
        }

        if (plan) {
          setPlanData(plan.plan_data as unknown as PlanData);
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
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 20px rgba(var(--primary), 0.3)',
                '0 0 40px rgba(var(--primary), 0.5)',
                '0 0 20px rgba(var(--primary), 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Rocket className="w-10 h-10 text-primary-foreground" />
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {language === 'he' ? '🎉 המסע שלך מתחיל!' : '🎉 Your Journey Begins!'}
          </h1>

          <p className="text-muted-foreground">
            {language === 'he'
              ? 'אורורה ניתחה את כל המידע שלך ויצרה עבורך תוכנית אישית'
              : 'Aurora analyzed all your data and created a personalized plan for you'}
          </p>

          {/* Rewards */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">+100 XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600">
              <Gift className="w-5 h-5" />
              <span className="font-bold">+15 {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
            </div>
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

        {/* Consciousness Analysis */}
        {summaryData?.consciousness_analysis && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <ConsciousnessAnalysis analysis={summaryData.consciousness_analysis} />
          </motion.div>
        )}

        {/* Identity Profile */}
        {summaryData?.identity_profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <IdentityProfile
              profile={summaryData.identity_profile}
              behavioral={summaryData.behavioral_insights}
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

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-4"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            className="w-full h-14 text-lg gap-2"
          >
            <Rocket className="w-5 h-5" />
            {language === 'he' ? 'המשך לדשבורד - בוא נתחיל!' : 'Continue to Dashboard - Let\'s Go!'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
