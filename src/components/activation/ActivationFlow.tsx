/**
 * ActivationFlow — Full-screen orchestrator for the unified Identity Activation Flow
 * 10 screens, dark minimal, no dashboard chrome
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ActivationProgress } from './ActivationProgress';
import { RevealScreen } from './RevealScreen';
import { QuestionCard } from '@/components/flow/QuestionCard';
import { getVisibleMiniSteps, isMiniStepValid, collectStepAnswers } from '@/lib/flow/flowSpec';
import { activationFlowSpec } from '@/flows/activationFlowSpec';
import type { FlowAnswers, MiniStep, FlowStep } from '@/lib/flow/types';
import type { Json } from '@/integrations/supabase/types';

const TOTAL_SCREENS = 10;

export function ActivationFlow() {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const [currentScreen, setCurrentScreen] = useState(1); // 1-based
  const [answers, setAnswers] = useState<FlowAnswers>({});
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = activationFlowSpec.steps;
  const currentStep: FlowStep | undefined = steps[currentScreen - 1];

  // Get visible mini-steps for current screen
  const visibleMiniSteps = currentStep ? getVisibleMiniSteps(currentStep, answers) : [];
  const currentMini: MiniStep | undefined = visibleMiniSteps[0]; // Each screen has 1 visible mini-step

  // Auto-save to DB (debounced)
  useEffect(() => {
    if (!user?.id || Object.keys(answers).length === 0) return;
    const timer = setTimeout(async () => {
      try {
        // Normalize branched answer keys
        const normalized = normalizeAnswers(answers);
        await supabase
          .from('launchpad_progress')
          .update({
            step_1_intention: JSON.stringify(normalized),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } catch (e) {
        console.error('Auto-save error:', e);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [answers, user?.id]);

  // Normalize answers: extract branched keys into clean structure
  const normalizeAnswers = useCallback((raw: FlowAnswers): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    const focus = raw.primary_focus as string;

    result.primary_focus = focus;
    result.commitment_level = raw.commitment_level;
    result.secondary_focus = raw.secondary_focus;
    result.core_obstacle = raw.core_obstacle;
    result.peak_productivity = raw.peak_productivity;
    result.identity_statement = raw.identity_statement;
    result.ninety_day_vision = raw.ninety_day_vision;

    // Extract branched pain/outcome
    if (focus) {
      result.primary_pain = raw[`primary_pain_${focus}`];
      result.desired_outcome = raw[`desired_outcome_${focus}`];
    }

    return result;
  }, []);

  const handleChange = useCallback((value: string | string[] | number) => {
    if (!currentMini) return;
    setAnswers(prev => ({ ...prev, [currentMini.id]: value }));
  }, [currentMini]);

  const goNext = useCallback(() => {
    if (currentScreen < TOTAL_SCREENS) {
      setCurrentScreen(prev => prev + 1);
    }
  }, [currentScreen]);

  const goPrev = useCallback(() => {
    if (currentScreen > 1) {
      setCurrentScreen(prev => prev - 1);
    }
  }, [currentScreen]);

  const handleComplete = useCallback(async () => {
    // Require auth
    if (!user?.id) {
      openAuthModal?.('signup');
      return;
    }

    setIsCompleting(true);
    try {
      const normalized = normalizeAnswers(answers);

      // Save all answers
      await supabase
        .from('launchpad_progress')
        .update({
          step_1_intention: JSON.stringify(normalized),
          step_1_welcome: true,
          step_1_completed_at: new Date().toISOString(),
          step_2_profile: true,
          step_2_profile_data: normalized as unknown as Json,
          step_2_profile_completed_at: new Date().toISOString(),
          step_7_dashboard_activated: true,
          step_7_completed_at: new Date().toISOString(),
          launchpad_complete: true,
          completed_at: new Date().toISOString(),
          current_step: 11,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Call summary generation
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke('generate-launchpad-summary', {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });
      } catch (e) {
        console.error('Summary generation error (non-blocking):', e);
      }

      toast.success(language === 'he' ? 'ברוכים הבאים ל-MindOS!' : 'Welcome to MindOS!');
      navigate('/today');
    } catch (e) {
      console.error('Completion error:', e);
      toast.error(language === 'he' ? 'שגיאה' : 'Error');
    } finally {
      setIsCompleting(false);
    }
  }, [answers, user?.id, navigate, language, normalizeAnswers, openAuthModal]);

  // Render
  const isRevealScreen = currentScreen === TOTAL_SCREENS;

  return (
    <div
      className="min-h-screen bg-gray-950 flex flex-col dark"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ colorScheme: 'dark', '--background': '222.2 84% 4.9%', '--foreground': '210 40% 98%', '--border': '217.2 32.6% 17.5%', '--muted-foreground': '215 20.2% 65.1%', '--primary': '340 82% 65%', '--primary-foreground': '0 0% 100%', '--card': '222.2 84% 4.9%', '--muted': '217.2 32.6% 17.5%', '--accent': '217.2 32.6% 17.5%', '--accent-foreground': '210 40% 98%', '--destructive': '0 62.8% 50.6%' } as React.CSSProperties}
    >
      {/* Progress bar */}
      <ActivationProgress current={currentScreen} total={TOTAL_SCREENS} />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {isRevealScreen ? (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RevealScreen
                  answers={answers}
                  onComplete={handleComplete}
                  isCompleting={isCompleting}
                />
              </motion.div>
            ) : currentMini ? (
              <motion.div
                key={currentMini.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <QuestionCard
                  miniStep={currentMini}
                  value={answers[currentMini.id]}
                  onChange={handleChange}
                  onNext={goNext}
                  onSkip={goNext}
                  showSkip={!currentMini.validation.required}
                  autoAdvance={currentMini.inputType === 'single_select'}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Back button (bottom) */}
      {currentScreen > 1 && !isRevealScreen && (
        <div className="pb-6 flex justify-center">
          <button
            onClick={goPrev}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'he' ? '← חזרה' : '← Back'}
          </button>
        </div>
      )}
    </div>
  );
}
