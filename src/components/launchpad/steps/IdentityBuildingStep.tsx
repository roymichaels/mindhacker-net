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
  CHARACTER_TRAITS, 
  TRAIT_CATEGORIES,
  suggestEgoState,
  getTrait,
  type TraitCategory,
  type CharacterTrait 
} from '@/lib/characterTraits';

interface IdentityBuildingStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
}

const STORAGE_KEY = 'launchpad_identity_traits_v2';
const STORAGE_KEY_ROLEMODELS = 'launchpad_identity_rolemodels';

type Phase = 'prioritize' | 'rolemodels';

export function IdentityBuildingStep({ 
  onComplete, 
  isCompleting, 
  rewards 
}: IdentityBuildingStepProps) {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('prioritize');
  // All 30 traits - user prioritizes all of them
  const [prioritizedTraits, setPrioritizedTraits] = useState<string[]>(
    CHARACTER_TRAITS.map(t => t.id)
  );
  const [roleModels, setRoleModels] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === CHARACTER_TRAITS.length) {
          setPrioritizedTraits(parsed);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prioritizedTraits));
  }, [prioritizedTraits]);

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
        .in('element_type', ['character_trait', 'role_model']);

      // Insert all prioritized traits
      const traitsToInsert = prioritizedTraits.map((traitId, index) => {
        const trait = getTrait(traitId);
        return {
          user_id: user.id,
          element_type: 'character_trait' as const,
          content: traitId,
          metadata: {
            priority: index + 1,
            isCore: index < 6, // Top 6 are core traits
            category: trait?.category,
            color: trait?.color,
            icon: trait?.icon,
            selected_at: new Date().toISOString(),
          },
        };
      });

      const { error: traitsError } = await supabase
        .from('aurora_identity_elements')
        .insert(traitsToInsert);

      if (traitsError) throw traitsError;

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

      const suggestedEgoState = suggestEgoState(prioritizedTraits.slice(0, 10));

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_ROLEMODELS);

      onComplete({
        prioritizedTraits,
        coreTraits: prioritizedTraits.slice(0, 6),
        roleModels: roleModels.trim(),
        suggestedEgoState,
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
            prioritizedTraits={prioritizedTraits}
            setPrioritizedTraits={setPrioritizedTraits}
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
            prioritizedTraits={prioritizedTraits}
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
  prioritizedTraits: string[];
  setPrioritizedTraits: (traits: string[]) => void;
  onContinue: () => void;
}

function PrioritizePhase({
  language,
  isRTL,
  prioritizedTraits,
  setPrioritizedTraits,
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
          {language === 'he' ? 'סדרו את התכונות שלכם' : 'Prioritize Your Traits'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'גררו את התכונות לפי החשיבות שלהן עבורכם. 6 הראשונות הן תכונות הליבה.'
            : 'Drag traits to order by importance. Top 6 are your core traits.'}
        </p>
      </div>

      {/* Priority List */}
      <Card className="p-4 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 max-h-[50vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 sticky top-0 bg-violet-50/95 dark:bg-violet-950/95 py-2 z-10">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h4 className="font-semibold">
            {language === 'he' ? 'סדר העדיפויות שלי' : 'My Priority Order'}
          </h4>
          <Badge className="bg-violet-600 text-white mr-auto">
            {prioritizedTraits.length} {language === 'he' ? 'תכונות' : 'traits'}
          </Badge>
        </div>

        <Reorder.Group
          axis="y"
          values={prioritizedTraits}
          onReorder={setPrioritizedTraits}
          className="space-y-1.5"
        >
          {prioritizedTraits.map((traitId, index) => {
            const trait = getTrait(traitId);
            if (!trait) return null;
            const isCore = index < 6;
            const categoryInfo = TRAIT_CATEGORIES[trait.category];

            return (
              <Reorder.Item
                key={traitId}
                value={traitId}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
                  isCore 
                    ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                  isCore 
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                <span className="text-lg shrink-0">{trait.icon}</span>
                
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">
                    {language === 'he' ? trait.nameHe : trait.name}
                  </span>
                </div>

                <Badge 
                  variant="outline" 
                  className={cn("text-xs shrink-0", categoryInfo.bgClass, categoryInfo.textClass)}
                >
                  {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
                </Badge>

                {isCore && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs shrink-0">
                    {language === 'he' ? 'ליבה' : 'Core'}
                  </Badge>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <p className="text-sm text-muted-foreground mt-4 text-center flex items-center justify-center gap-2 sticky bottom-0 bg-violet-50/95 dark:bg-violet-950/95 py-2">
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
  prioritizedTraits: string[];
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
  prioritizedTraits,
  rewards,
  isSaving,
  isCompleting,
  onBack,
  onComplete,
}: RoleModelsPhaseProps) {
  const coreTraits = prioritizedTraits.slice(0, 6).map(id => getTrait(id)).filter(Boolean) as CharacterTrait[];

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

      {/* Summary of Core Traits */}
      <Card className="p-4 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
        <p className="text-sm text-muted-foreground mb-3 text-center">
          {language === 'he' ? 'תכונות הליבה שלכם:' : 'Your core traits:'}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {coreTraits.map((trait) => {
            const categoryInfo = TRAIT_CATEGORIES[trait.category];
            return (
              <Badge 
                key={trait.id} 
                className={cn(
                  "text-sm py-1.5 px-3",
                  categoryInfo.bgClass, 
                  categoryInfo.textClass
                )}
              >
                <span className="mr-1">{trait.icon}</span>
                {language === 'he' ? trait.nameHe : trait.name}
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
