import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, Sparkles, Gift, Download, ArrowRight, UserPlus, MessageCircle, Music } from 'lucide-react';
import { SummaryScores } from '@/components/launchpad/summary/SummaryScores';
import { ConsciousnessAnalysis } from '@/components/launchpad/summary/ConsciousnessAnalysis';
import { IdentityProfile } from '@/components/launchpad/summary/IdentityProfile';
import { PlanPreview } from '@/components/launchpad/summary/PlanPreview';
import { LifeDirectionSection } from '@/components/launchpad/summary/LifeDirectionSection';
import { downloadGuestPDF } from '@/lib/guestProfilePdfGenerator';
import { PersonalizedOrb } from '@/components/orb';

interface GuestResult {
  summary: {
    consciousness_analysis?: {
      current_state: string;
      dominant_patterns: string[];
      blind_spots: string[];
      strengths: string[];
      growth_edges: string[];
    };
    identity_profile?: {
      dominant_traits: string[];
      suggested_ego_state: string;
      values_hierarchy: string[];
      identity_title?: {
        title?: string;
        title_en?: string;
        icon?: string;
      };
    };
    behavioral_insights?: {
      habits_to_transform: string[];
      habits_to_cultivate: string[];
      resistance_patterns: string[];
    };
    life_direction?: {
      core_aspiration?: string;
      vision_summary?: string;
      clarity_score?: number;
    };
  };
  plan: {
    months: Array<{
      number: number;
      title: string;
      title_he?: string;
      focus: string;
      milestone: string;
    }>;
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
}

export default function FreeJourneyComplete() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<GuestResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Load result from localStorage
    try {
      const stored = localStorage.getItem('guest_launchpad_result');
      if (stored) {
        setResult(JSON.parse(stored));
      } else {
        // No result, redirect back
        navigate('/free-journey');
      }
    } catch {
      navigate('/free-journey');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleDownloadPDF = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadGuestPDF({
        summary: result.summary,
        scores: result.scores,
        plan: result.plan as any,
        language,
      });
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSignup = () => {
    // Store flag to migrate data after signup
    localStorage.setItem('migrate_guest_launchpad', 'true');
    navigate('/signup');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {language === 'he' ? 'טוען את התוצאות...' : 'Loading results...'}
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const signupBenefits = [
    {
      icon: Gift,
      titleHe: '50 טוקנים חינם',
      titleEn: '50 Free Tokens',
      descHe: 'לשימוש ב-Aurora ובהיפנוזה',
      descEn: 'For Aurora & hypnosis',
    },
    {
      icon: MessageCircle,
      titleHe: 'Aurora מאמנת AI',
      titleEn: 'Aurora AI Coach',
      descHe: 'שיחות אישיות ללא הגבלה',
      descEn: 'Unlimited personal chats',
    },
    {
      icon: Music,
      titleHe: 'סשני היפנוזה',
      titleEn: 'Hypnosis Sessions',
      descHe: 'מותאמים אישית עבורך',
      descEn: 'Personalized for you',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <PersonalizedOrb size={80} showGlow disablePersonalization />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {language === 'he' ? '🎉 הניתוח שלך מוכן!' : '🎉 Your Analysis is Ready!'}
          </h1>

          <p className="text-muted-foreground">
            {language === 'he'
              ? 'Aurora ניתחה את כל המידע שלך ויצרה פרופיל אישי ותוכנית טרנספורמציה'
              : 'Aurora analyzed your data and created a personal profile and transformation plan'}
          </p>
        </motion.div>

        {/* Scores */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/50 border border-border/50"
        >
          <SummaryScores
            consciousnessScore={result.scores.consciousness}
            clarityScore={result.scores.clarity}
            readinessScore={result.scores.readiness}
          />
        </motion.div>

        {/* Identity Profile */}
        {result.summary?.identity_profile && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <IdentityProfile
              profile={result.summary.identity_profile}
              behavioral={result.summary.behavioral_insights}
            />
          </motion.div>
        )}

        {/* Consciousness Analysis */}
        {result.summary?.consciousness_analysis && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <ConsciousnessAnalysis analysis={result.summary.consciousness_analysis} />
          </motion.div>
        )}

        {/* Life Direction */}
        {result.summary?.life_direction && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-card/50 border border-border/50"
          >
            <LifeDirectionSection lifeDirection={result.summary.life_direction} />
          </motion.div>
        )}

        {/* Plan Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl bg-card/50 border border-border/50"
        >
          <PlanPreview
            months={result.plan?.months || []}
            onViewFullPlan={() => {}}
          />
        </motion.div>

        {/* Download PDF */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            size="lg"
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full h-12 gap-2"
          >
            {downloading ? (
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
        </motion.div>

        {/* Conversion CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20"
        >
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold">
              {language === 'he' ? '✨ רוצה לשמור את התוצאות?' : '✨ Want to Save Your Results?'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'he' 
                ? 'הנתונים שלך נשמרים רק במכשיר הזה. הירשם כדי לגשת מכל מקום ולקבל עוד הטבות!'
                : 'Your data is only saved on this device. Sign up to access from anywhere and get more benefits!'}
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 py-4">
              {signupBenefits.map((benefit) => (
                <div key={benefit.titleEn} className="text-center space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs font-medium">{isRTL ? benefit.titleHe : benefit.titleEn}</p>
                  <p className="text-[10px] text-muted-foreground">{isRTL ? benefit.descHe : benefit.descEn}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleSignup}
              className="w-full h-14 text-lg gap-2 shadow-xl shadow-primary/20"
            >
              <UserPlus className="w-5 h-5" />
              {language === 'he' ? 'הירשם עכשיו - חינם!' : 'Sign Up Now - Free!'}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>

            <p className="text-xs text-muted-foreground">
              {language === 'he' 
                ? 'כבר יש לך חשבון?' 
                : 'Already have an account?'}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {language === 'he' ? 'התחבר' : 'Log in'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
