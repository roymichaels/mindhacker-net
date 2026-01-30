import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, Loader2, ArrowLeft, ArrowRight, GripVertical, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  TRAIT_CATEGORIES, 
  getAllCategories,
  type TraitCategory 
} from '@/lib/characterTraits';

interface IdentityBuildingStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
}

const STORAGE_KEY = 'launchpad_identity_categories';
const STORAGE_KEY_ROLEMODELS = 'launchpad_identity_rolemodels';

type Phase = 'prioritize' | 'rolemodels';

// Map categories to ego states
const categoryToEgoState: Record<TraitCategory, string> = {
  inner_strength: 'warrior',
  thinking: 'sage',
  heart: 'healer',
  leadership: 'king',
  social: 'lover',
  spiritual: 'mystic',
};

export function IdentityBuildingStep({ 
  onComplete, 
  isCompleting, 
  rewards 
}: IdentityBuildingStepProps) {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('prioritize');
  const [prioritizedCategories, setPrioritizedCategories] = useState<TraitCategory[]>(getAllCategories());
  const [roleModels, setRoleModels] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setPrioritizedCategories(parsed as TraitCategory[]);
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    const savedRoleModels = localStorage.getItem(STORAGE_KEY_ROLEMODELS);
    if (savedRoleModels) {
      setRoleModels(savedRoleModels);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prioritizedCategories));
  }, [prioritizedCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLEMODELS, roleModels);
  }, [roleModels]);

  const handleGoToRoleModels = () => {
    setPhase('rolemodels');
  };

  const handleBackToPrioritize = () => {
    setPhase('prioritize');
  };

  const handleComplete = async () => {
    if (!user?.id) return;

    setIsSaving(true);

    try {
      // Delete existing identity elements for this user
      await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id)
        .in('element_type', ['category_priority', 'role_model']);

      // Insert prioritized categories
      const categoriesToInsert = prioritizedCategories.map((category, index) => {
        const categoryInfo = TRAIT_CATEGORIES[category];
        return {
          user_id: user.id,
          element_type: 'category_priority' as const,
          content: category,
          metadata: {
            priority: index + 1,
            isCore: index < 3, // Top 3 are core categories
            color: categoryInfo.color,
            icon: categoryInfo.icon,
            selected_at: new Date().toISOString(),
          },
        };
      });

      const { error: categoriesError } = await supabase
        .from('aurora_identity_elements')
        .insert(categoriesToInsert);

      if (categoriesError) throw categoriesError;

      // Insert role models if provided
      if (roleModels.trim()) {
        const { error: roleModelError } = await supabase
          .from('aurora_identity_elements')
          .insert({
            user_id: user.id,
            element_type: 'role_model' as const,
            content: roleModels.trim(),
            metadata: {
              created_at: new Date().toISOString(),
            },
          });

        if (roleModelError) throw roleModelError;
      }

      // Suggested ego state based on top category
      const suggestedEgoState = categoryToEgoState[prioritizedCategories[0]] || 'guardian';

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_ROLEMODELS);

      onComplete({
        prioritizedCategories,
        roleModels: roleModels.trim(),
        suggestedEgoState,
        coreCategories: prioritizedCategories.slice(0, 3),
      });
    } catch (error) {
      console.error('Failed to save priorities:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Phase Indicator */}
      <div className="flex justify-center gap-2">
        {(['prioritize', 'rolemodels'] as Phase[]).map((p, idx) => (
          <div
            key={p}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              phase === p 
                ? "bg-violet-600 scale-125" 
                : idx < ['prioritize', 'rolemodels'].indexOf(phase)
                  ? "bg-violet-400"
                  : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'prioritize' && (
          <PrioritizePhase
            key="prioritize"
            language={language}
            isRTL={isRTL}
            prioritizedCategories={prioritizedCategories}
            setPrioritizedCategories={setPrioritizedCategories}
            onContinue={handleGoToRoleModels}
          />
        )}

        {phase === 'rolemodels' && (
          <RoleModelsPhase
            key="rolemodels"
            language={language}
            isRTL={isRTL}
            roleModels={roleModels}
            setRoleModels={setRoleModels}
            prioritizedCategories={prioritizedCategories}
            rewards={rewards}
            isSaving={isSaving}
            isCompleting={isCompleting}
            onBack={handleBackToPrioritize}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ PRIORITIZE PHASE ============
interface PrioritizePhaseProps {
  language: string;
  isRTL: boolean;
  prioritizedCategories: TraitCategory[];
  setPrioritizedCategories: (categories: TraitCategory[]) => void;
  onContinue: () => void;
}

function PrioritizePhase({
  language,
  isRTL,
  prioritizedCategories,
  setPrioritizedCategories,
  onContinue,
}: PrioritizePhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
        >
          <span className="text-4xl">🎯</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'he' ? 'מה הכי חשוב לכם?' : 'What matters most to you?'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'סדרו את התחומים לפי החשיבות שלהם עבורכם. גררו למעלה את מה שהכי חשוב.'
            : 'Order these areas by importance. Drag up what matters most.'}
        </p>
      </div>

      {/* Priority List */}
      <Card className="p-4 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h4 className="font-semibold">
            {language === 'he' ? 'סדר העדיפויות שלי' : 'My Priority Order'}
          </h4>
        </div>

        <Reorder.Group
          axis="y"
          values={prioritizedCategories}
          onReorder={setPrioritizedCategories}
          className="space-y-2"
        >
          {prioritizedCategories.map((category, index) => {
            const categoryInfo = TRAIT_CATEGORIES[category];
            const isCore = index < 3;

            return (
              <Reorder.Item
                key={category}
                value={category}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all",
                  isCore 
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                  isCore 
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                <span className="text-2xl shrink-0">{categoryInfo.icon}</span>
                
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block">
                    {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
                  </span>
                </div>

                {isCore && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shrink-0">
                    {language === 'he' ? 'ליבה' : 'Core'}
                  </Badge>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <p className="text-sm text-muted-foreground mt-4 text-center flex items-center justify-center gap-2">
          <span>↕️</span>
          {language === 'he' ? 'גררו לשינוי סדר העדיפויות' : 'Drag to reorder priorities'}
        </p>
      </Card>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={onContinue}
        >
          <span className="flex items-center gap-2">
            {language === 'he' ? 'המשך לדמויות השראה' : 'Continue to Role Models'}
            {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </span>
        </Button>
      </div>
    </motion.div>
  );
}

// ============ ROLE MODELS PHASE ============
interface RoleModelsPhaseProps {
  language: string;
  isRTL: boolean;
  roleModels: string;
  setRoleModels: (value: string) => void;
  prioritizedCategories: TraitCategory[];
  rewards?: { xp: number; tokens: number; unlock: string };
  isSaving: boolean;
  isCompleting?: boolean;
  onBack: () => void;
  onComplete: () => void;
}

function RoleModelsPhase({
  language,
  isRTL,
  roleModels,
  setRoleModels,
  prioritizedCategories,
  rewards,
  isSaving,
  isCompleting,
  onBack,
  onComplete,
}: RoleModelsPhaseProps) {
  const topCategories = prioritizedCategories.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"
        >
          <span className="text-4xl">⭐</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          {language === 'he' ? 'דמויות השראה' : 'Role Models'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'מי הדמויות שמעוררות בכם השראה? (אופציונלי)'
            : 'Who inspires you? (Optional)'}
        </p>
      </div>

      {/* Summary of Core Categories */}
      <Card className="p-4 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
        <p className="text-sm text-muted-foreground mb-3 text-center">
          {language === 'he' ? 'התחומים העיקריים שלכם:' : 'Your core areas:'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {topCategories.map((category, index) => {
            const categoryInfo = TRAIT_CATEGORIES[category];
            return (
              <Badge 
                key={category} 
                className={cn(
                  "text-sm py-1.5 px-3",
                  categoryInfo.bgClass, 
                  categoryInfo.textClass
                )}
              >
                <span className="mr-1">{categoryInfo.icon}</span>
                {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
              </Badge>
            );
          })}
        </div>
      </Card>

      {/* Role Models Input */}
      <div className="space-y-3">
        <Label htmlFor="rolemodels" className="text-base font-medium">
          {language === 'he' 
            ? 'דמויות שמעוררות בכם השראה (אמיתיות או בדיוניות)'
            : 'Characters that inspire you (real or fictional)'}
        </Label>
        <Textarea
          id="rolemodels"
          placeholder={language === 'he' 
            ? 'למשל: סטיב ג׳ובס, גנדלף, דוד המלך, ריאן גוסלינג...'
            : 'e.g., Steve Jobs, Gandalf, King David, Ryan Gosling...'}
          value={roleModels}
          onChange={(e) => setRoleModels(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {language === 'he' 
            ? 'הדמויות האלה יעזרו לנו להבין טוב יותר את השאיפות שלכם'
            : 'These characters help us understand your aspirations better'}
        </p>
      </div>

      {/* Rewards Preview */}
      {rewards && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-700 dark:text-amber-300">+{rewards.xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">🪙</span>
              <span className="font-medium text-amber-700 dark:text-amber-300">+{rewards.tokens}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="flex-1"
        >
          <span className="flex items-center gap-2">
            {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            {language === 'he' ? 'חזרה' : 'Back'}
          </span>
        </Button>
        
        <Button
          size="lg"
          className="flex-[2] text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={onComplete}
          disabled={isSaving || isCompleting}
        >
          {isSaving || isCompleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {language === 'he' ? 'סיום' : 'Complete'}
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
