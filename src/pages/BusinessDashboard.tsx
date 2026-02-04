/**
 * BusinessDashboard - Full dashboard for managing a single business
 * Mirrors the Personality hub structure with business-specific tools
 */

import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useBusinessOrbProfile } from '@/hooks/useBusinessOrbProfile';
import { useBusinessPlan } from '@/hooks/useBusinessPlan';
import { useBusinessBranding } from '@/hooks/useBusinessBranding';
import { BusinessHUD } from '@/components/business/BusinessHUD';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Brain, Calendar, Palette, Megaphone, Settings, Target, Users, TrendingUp, Sparkles, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { detectIndustry } from '@/lib/businessOrbSystem';

// Lazy load modals
const BusinessDashboardModals = lazy(() => import('@/components/business/BusinessDashboardModals'));

type ModalType = 
  | 'ai-analysis' 
  | '90-day-plan' 
  | 'branding' 
  | 'marketing' 
  | 'operations' 
  | 'financial' 
  | 'audience' 
  | 'challenges'
  | null;

const BusinessDashboard = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { language, isRTL, t } = useTranslation();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { journeyData, profile, isLoading: orbLoading } = useBusinessOrbProfile(businessId);
  const { plan, progress: planProgress, isLoading: planLoading } = useBusinessPlan(businessId);
  const { branding, isLoading: brandingLoading } = useBusinessBranding(businessId);

  const isLoading = orbLoading || planLoading || brandingLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!journeyData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-muted-foreground">
          {language === 'he' ? 'העסק לא נמצא' : 'Business not found'}
        </p>
        <Button onClick={() => navigate('/business')} variant="outline">
          <ArrowLeft className="h-4 w-4 me-2" />
          {language === 'he' ? 'חזרה לעסקים' : 'Back to Businesses'}
        </Button>
      </div>
    );
  }

  const businessName = journeyData.business_name || (language === 'he' ? 'עסק בהקמה' : 'New Business');
  const industry = detectIndustry({
    step_1_vision: journeyData.step_1_vision as { description?: string; keywords?: string[] } | null,
    step_2_business_model: journeyData.step_2_business_model as { industry?: string; type?: string } | null,
  });
  const journeyProgress = Math.round((journeyData.current_step - 1) / 10 * 100);

  // Tool cards configuration
  const toolCards = [
    {
      id: 'ai-analysis' as ModalType,
      icon: Brain,
      titleHe: 'ניתוח AI',
      titleEn: 'AI Analysis',
      descHe: 'ניתוח עמוק של העסק שלך',
      descEn: 'Deep analysis of your business',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      id: '90-day-plan' as ModalType,
      icon: Calendar,
      titleHe: 'תוכנית 90 יום',
      titleEn: '90-Day Plan',
      descHe: 'אבני דרך שבועיות לצמיחה',
      descEn: 'Weekly milestones for growth',
      color: 'from-amber-500 to-yellow-400',
      badge: planProgress ? `${planProgress.percentage}%` : undefined,
    },
    {
      id: 'branding' as ModalType,
      icon: Palette,
      titleHe: 'מיתוג וזהות',
      titleEn: 'Branding & Identity',
      descHe: 'לוגו, צבעים, קול מותג',
      descEn: 'Logo, colors, brand voice',
      color: 'from-pink-500 to-rose-400',
      badge: branding?.tagline ? '✓' : undefined,
    },
    {
      id: 'marketing' as ModalType,
      icon: Megaphone,
      titleHe: 'אסטרטגיית שיווק',
      titleEn: 'Marketing Strategy',
      descHe: 'תוכנית שיווק מותאמת',
      descEn: 'Customized marketing plan',
      color: 'from-cyan-500 to-teal-400',
    },
    {
      id: 'operations' as ModalType,
      icon: Settings,
      titleHe: 'מרכז תפעול',
      titleEn: 'Operations Hub',
      descHe: 'תהליכים ומערכות',
      descEn: 'Processes and systems',
      color: 'from-slate-500 to-zinc-400',
    },
    {
      id: 'financial' as ModalType,
      icon: TrendingUp,
      titleHe: 'לוח פיננסי',
      titleEn: 'Financial Dashboard',
      descHe: 'תקציב ותחזיות',
      descEn: 'Budget and projections',
      color: 'from-green-500 to-emerald-400',
    },
    {
      id: 'audience' as ModalType,
      icon: Users,
      titleHe: 'תובנות קהל יעד',
      titleEn: 'Audience Insights',
      descHe: 'הכר את הלקוחות שלך',
      descEn: 'Know your customers',
      color: 'from-blue-500 to-sky-400',
    },
    {
      id: 'challenges' as ModalType,
      icon: Target,
      titleHe: 'אתגרים וצמיחה',
      titleEn: 'Challenges & Growth',
      descHe: 'התמודדות עם מכשולים',
      descEn: 'Overcoming obstacles',
      color: 'from-orange-500 to-red-400',
    },
  ];

  return (
    <div 
      className="min-h-screen bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/business')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{businessName}</h1>
              <p className="text-xs text-muted-foreground capitalize">{industry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Business HUD */}
        <BusinessHUD
          businessId={businessId!}
          businessName={businessName}
          industry={industry}
          progress={journeyData.journey_complete ? 100 : journeyProgress}
          isComplete={journeyData.journey_complete}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-400/5 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{journeyProgress}%</div>
              <div className="text-xs text-muted-foreground">
                {language === 'he' ? 'התקדמות מסע' : 'Journey Progress'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-400/5 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {planProgress?.completedMilestones || 0}/{planProgress?.totalMilestones || 12}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'he' ? 'אבני דרך' : 'Milestones'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-400/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {plan?.current_week || 1}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'he' ? 'שבוע נוכחי' : 'Current Week'}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-400/5 border-cyan-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {branding ? '✓' : '—'}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'he' ? 'מיתוג' : 'Branding'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tool Cards Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            {language === 'he' ? 'כלי ניהול עסקי' : 'Business Management Tools'}
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {toolCards.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "group cursor-pointer transition-all hover:shadow-lg",
                    "border-border/50 hover:border-amber-500/30",
                    "bg-gradient-to-br from-card to-card/80"
                  )}
                  onClick={() => setActiveModal(tool.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-br",
                        tool.color,
                        "text-white group-hover:scale-110 transition-transform"
                      )}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {language === 'he' ? tool.titleHe : tool.titleEn}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {language === 'he' ? tool.descHe : tool.descEn}
                        </div>
                      </div>
                      {tool.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 text-xs font-medium">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Generate Plan CTA (if no plan exists) */}
        {!plan && journeyData.journey_complete && (
          <Card className="bg-gradient-to-br from-amber-500/20 via-yellow-400/10 to-orange-500/10 border-amber-500/30">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2">
                {language === 'he' ? 'צור תוכנית 90 יום' : 'Create Your 90-Day Plan'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'he' 
                  ? 'AI יצור תוכנית פעולה מותאמת אישית עם אבני דרך שבועיות'
                  : 'AI will create a personalized action plan with weekly milestones'
                }
              </p>
              <Button 
                onClick={() => setActiveModal('90-day-plan')}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white"
              >
                <Sparkles className="h-4 w-4 me-2" />
                {language === 'he' ? 'צור תוכנית' : 'Generate Plan'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        <BusinessDashboardModals
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          businessId={businessId!}
          journeyData={journeyData}
          plan={plan}
          branding={branding}
          language={language}
        />
      </Suspense>
    </div>
  );
};

export default BusinessDashboard;
