/**
 * BusinessDashboardModals - All modals for the business dashboard
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check, ChevronRight, Palette, Target, Users, TrendingUp, Settings, Megaphone, Brain, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useBusinessPlan, type BusinessPlan } from '@/hooks/useBusinessPlan';
import { useBusinessBranding, type BusinessBranding } from '@/hooks/useBusinessBranding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface BusinessDashboardModalsProps {
  activeModal: ModalType;
  onClose: () => void;
  businessId: string;
  journeyData: {
    id: string;
    business_name: string | null;
    current_step: number;
    journey_complete: boolean;
    step_1_vision: unknown;
    step_2_business_model: unknown;
    step_3_target_audience?: unknown;
    step_4_value_proposition?: unknown;
    step_5_challenges?: unknown;
    step_6_resources?: unknown;
    step_7_financial?: unknown;
    step_8_marketing?: unknown;
    step_9_operations?: unknown;
    step_10_action_plan?: unknown;
    ai_summary?: string | null;
  };
  plan: BusinessPlan | null | undefined;
  branding: BusinessBranding | null | undefined;
  language: string;
}

export function BusinessDashboardModals({
  activeModal,
  onClose,
  businessId,
  journeyData,
  plan,
  branding,
  language,
}: BusinessDashboardModalsProps) {
  const isRTL = language === 'he';

  return (
    <>
      <AIAnalysisModal 
        open={activeModal === 'ai-analysis'} 
        onClose={onClose} 
        journeyData={journeyData}
        language={language}
        isRTL={isRTL}
      />
      
      <NinetyDayPlanModal
        open={activeModal === '90-day-plan'}
        onClose={onClose}
        businessId={businessId}
        journeyData={journeyData}
        plan={plan}
        language={language}
        isRTL={isRTL}
      />
      
      <BrandingModal
        open={activeModal === 'branding'}
        onClose={onClose}
        businessId={businessId}
        branding={branding}
        language={language}
        isRTL={isRTL}
      />
      
      <JourneyDataModal
        open={activeModal === 'marketing'}
        onClose={onClose}
        title={language === 'he' ? 'אסטרטגיית שיווק' : 'Marketing Strategy'}
        icon={<Megaphone className="h-5 w-5" />}
        data={journeyData.step_8_marketing}
        language={language}
        isRTL={isRTL}
      />
      
      <JourneyDataModal
        open={activeModal === 'operations'}
        onClose={onClose}
        title={language === 'he' ? 'מרכז תפעול' : 'Operations Hub'}
        icon={<Settings className="h-5 w-5" />}
        data={journeyData.step_9_operations}
        language={language}
        isRTL={isRTL}
      />
      
      <JourneyDataModal
        open={activeModal === 'financial'}
        onClose={onClose}
        title={language === 'he' ? 'לוח פיננסי' : 'Financial Dashboard'}
        icon={<TrendingUp className="h-5 w-5" />}
        data={journeyData.step_7_financial}
        language={language}
        isRTL={isRTL}
      />
      
      <JourneyDataModal
        open={activeModal === 'audience'}
        onClose={onClose}
        title={language === 'he' ? 'תובנות קהל יעד' : 'Audience Insights'}
        icon={<Users className="h-5 w-5" />}
        data={journeyData.step_3_target_audience}
        language={language}
        isRTL={isRTL}
      />
      
      <JourneyDataModal
        open={activeModal === 'challenges'}
        onClose={onClose}
        title={language === 'he' ? 'אתגרים וצמיחה' : 'Challenges & Growth'}
        icon={<Target className="h-5 w-5" />}
        data={journeyData.step_5_challenges}
        language={language}
        isRTL={isRTL}
      />
    </>
  );
}

// AI Analysis Modal
function AIAnalysisModal({ 
  open, 
  onClose, 
  journeyData,
  language,
  isRTL,
}: { 
  open: boolean; 
  onClose: () => void;
  journeyData: BusinessDashboardModalsProps['journeyData'];
  language: string;
  isRTL: boolean;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(journeyData.ai_summary || null);

  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('aurora-analyze', {
        body: {
          type: 'business',
          data: journeyData,
          language,
        },
      });
      
      if (error) throw error;
      setAnalysis(data.analysis || data.summary);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת ניתוח' : 'Error generating analysis');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {language === 'he' ? 'ניתוח AI לעסק' : 'AI Business Analysis'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {analysis ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{analysis}</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'he' 
                  ? 'קבל ניתוח עומק של העסק שלך מ-AI'
                  : 'Get a deep analysis of your business from AI'
                }
              </p>
              <Button 
                onClick={generateAnalysis} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-indigo-500"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {language === 'he' ? 'מנתח...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 me-2" />
                    {language === 'he' ? 'צור ניתוח' : 'Generate Analysis'}
                  </>
                )}
              </Button>
            </div>
          )}
        </ScrollArea>
        
        {analysis && (
          <div className="flex justify-end pt-4">
            <Button 
              onClick={generateAnalysis} 
              variant="outline" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 me-2" />
              )}
              {language === 'he' ? 'חדש ניתוח' : 'Regenerate'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 90-Day Plan Modal
function NinetyDayPlanModal({
  open,
  onClose,
  businessId,
  journeyData,
  plan,
  language,
  isRTL,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string;
  journeyData: BusinessDashboardModalsProps['journeyData'];
  plan: BusinessPlan | null | undefined;
  language: string;
  isRTL: boolean;
}) {
  const { createPlan, isCreating, completeMilestone } = useBusinessPlan(businessId);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-business-plan', {
        body: {
          businessId,
          journeyData,
          language,
        },
      });
      
      if (error) throw error;
      
      // Create plan with generated milestones
      createPlan({
        title: data.title || (language === 'he' ? 'תוכנית 90 יום' : '90-Day Plan'),
        description: data.description,
        milestones: data.milestones,
      });
      
      toast.success(language === 'he' ? 'התוכנית נוצרה!' : 'Plan created!');
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error(language === 'he' ? 'שגיאה ביצירת תוכנית' : 'Error creating plan');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            {language === 'he' ? 'תוכנית 90 יום' : '90-Day Business Plan'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {plan ? (
            <div className="space-y-4">
              {/* Progress summary */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    {plan.milestones?.filter(m => m.is_completed).length || 0}/{plan.milestones?.length || 12}
                  </span>
                </div>
                <Progress 
                  value={(plan.milestones?.filter(m => m.is_completed).length || 0) / (plan.milestones?.length || 12) * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Milestones list */}
              <div className="space-y-3">
                {plan.milestones?.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      milestone.is_completed 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-card border-border hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        milestone.is_completed 
                          ? "bg-green-500 text-white" 
                          : "bg-amber-500/20 text-amber-600"
                      )}>
                        {milestone.is_completed ? <Check className="h-4 w-4" /> : milestone.week_number}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        {milestone.focus_area && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {milestone.focus_area}
                          </Badge>
                        )}
                      </div>
                      
                      {!milestone.is_completed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => completeMilestone(milestone.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'he' 
                  ? 'צור תוכנית פעולה מותאמת אישית ל-90 יום'
                  : 'Create a personalized 90-day action plan'
                }
              </p>
              <Button 
                onClick={generatePlan} 
                disabled={isGenerating || isCreating}
                className="bg-gradient-to-r from-amber-500 to-yellow-400"
              >
                {isGenerating || isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {language === 'he' ? 'יוצר תוכנית...' : 'Creating plan...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 me-2" />
                    {language === 'he' ? 'צור תוכנית AI' : 'Generate AI Plan'}
                  </>
                )}
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Branding Modal
function BrandingModal({
  open,
  onClose,
  businessId,
  branding,
  language,
  isRTL,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string;
  branding: BusinessBranding | null | undefined;
  language: string;
  isRTL: boolean;
}) {
  const { saveBranding, isSaving } = useBusinessBranding(businessId);
  const [tagline, setTagline] = useState(branding?.tagline || '');
  const [mission, setMission] = useState(branding?.mission_statement || '');
  const [vision, setVision] = useState(branding?.vision_statement || '');
  const [values, setValues] = useState(branding?.core_values?.join(', ') || '');
  const [brandVoice, setBrandVoice] = useState(branding?.brand_voice || '');

  const handleSave = () => {
    saveBranding({
      tagline,
      mission_statement: mission,
      vision_statement: vision,
      core_values: values.split(',').map(v => v.trim()).filter(Boolean),
      brand_voice: brandVoice,
    });
    toast.success(language === 'he' ? 'המיתוג נשמר!' : 'Branding saved!');
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-pink-500" />
            {language === 'he' ? 'מיתוג וזהות' : 'Branding & Identity'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'he' ? 'סלוגן' : 'Tagline'}
              </label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={language === 'he' ? 'משפט קצר שמסכם את המותג' : 'A short phrase that summarizes your brand'}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'he' ? 'הצהרת משימה' : 'Mission Statement'}
              </label>
              <Textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder={language === 'he' ? 'מה אתם עושים ולמה' : 'What you do and why'}
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'he' ? 'חזון' : 'Vision'}
              </label>
              <Textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder={language === 'he' ? 'לאן אתם שואפים להגיע' : 'Where you aspire to be'}
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'he' ? 'ערכי ליבה (מופרדים בפסיקים)' : 'Core Values (comma-separated)'}
              </label>
              <Input
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder={language === 'he' ? 'אמינות, חדשנות, מצוינות' : 'Integrity, Innovation, Excellence'}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {language === 'he' ? 'קול המותג' : 'Brand Voice'}
              </label>
              <Textarea
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder={language === 'he' ? 'איך המותג מדבר? רשמי, ידידותי, מקצועי...' : 'How does your brand speak? Formal, friendly, professional...'}
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {language === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 me-2" />
            )}
            {language === 'he' ? 'שמור' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Generic Journey Data Modal (for marketing, operations, financial, etc.)
function JourneyDataModal({
  open,
  onClose,
  title,
  icon,
  data,
  language,
  isRTL,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  data: unknown;
  language: string;
  isRTL: boolean;
}) {
  const formatData = (obj: unknown): React.ReactNode => {
    if (!obj) {
      return (
        <p className="text-muted-foreground text-center py-8">
          {language === 'he' ? 'אין נתונים זמינים' : 'No data available'}
        </p>
      );
    }

    if (typeof obj === 'string') {
      return <p className="whitespace-pre-wrap">{obj}</p>;
    }

    if (Array.isArray(obj)) {
      return (
        <ul className="space-y-2">
          {obj.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (typeof obj === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(obj as Record<string, unknown>).map(([key, value]) => (
            <div key={key}>
              <h4 className="font-medium text-sm text-amber-600 mb-1 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <div className="ps-3 border-s-2 border-amber-500/20">
                {formatData(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p>{String(obj)}</p>;
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {formatData(data)}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default BusinessDashboardModals;
