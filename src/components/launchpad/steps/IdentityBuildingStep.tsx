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
  Sparkles, Check, ChevronDown, ChevronUp, Loader2, 
  ArrowLeft, ArrowRight, GripVertical, X, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  CHARACTER_TRAITS, 
  TRAIT_CATEGORIES, 
  getTraitsByCategory, 
  getAllCategories,
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

const STORAGE_KEY = 'launchpad_identity_traits';
const STORAGE_KEY_ROLEMODELS = 'launchpad_identity_rolemodels';
const MIN_TRAITS = 3;
const MAX_TRAITS = 6;

type Phase = 'select' | 'rolemodels';

export function IdentityBuildingStep({ 
  onComplete, 
  isCompleting, 
  rewards 
}: IdentityBuildingStepProps) {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('select');
  const [prioritizedTraits, setPrioritizedTraits] = useState<string[]>([]);
  const [roleModels, setRoleModels] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<TraitCategory>>(
    new Set(['inner_strength', 'thinking'])
  );

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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

  const toggleTrait = (traitId: string) => {
    setPrioritizedTraits((prev) => {
      if (prev.includes(traitId)) {
        return prev.filter((id) => id !== traitId);
      }
      if (prev.length >= MAX_TRAITS) {
        toast.warning(
          language === 'he' 
            ? `ניתן לבחור עד ${MAX_TRAITS} תכונות` 
            : `You can select up to ${MAX_TRAITS} traits`
        );
        return prev;
      }
      return [...prev, traitId];
    });
  };

  const removeTrait = (traitId: string) => {
    setPrioritizedTraits((prev) => prev.filter((id) => id !== traitId));
  };

  const toggleCategory = (category: TraitCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleGoToRoleModels = () => {
    setPhase('rolemodels');
  };

  const handleBackToSelect = () => {
    setPhase('select');
  };

  const handleComplete = async () => {
    if (prioritizedTraits.length < MIN_TRAITS || !user?.id) return;

    setIsSaving(true);

    try {
      // Delete existing character traits and role models for this user
      await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id)
        .in('element_type', ['character_trait', 'role_model']);

      // Insert prioritized character traits with priority
      const traitsToInsert = prioritizedTraits.map((traitId, index) => {
        const trait = getTrait(traitId);
        return {
          user_id: user.id,
          element_type: 'character_trait' as const,
          content: traitId,
          metadata: {
            priority: index + 1,
            isCore: index < 3, // Top 3 are core traits
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

      const suggestedEgoState = suggestEgoState(prioritizedTraits);

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_ROLEMODELS);

      onComplete({
        selectedTraits: prioritizedTraits,
        prioritizedTraits,
        roleModels: roleModels.trim(),
        suggestedEgoState,
        categoryCounts: getAllCategories().reduce((acc, cat) => {
          acc[cat] = prioritizedTraits.filter(
            (id) => CHARACTER_TRAITS.find((t) => t.id === id)?.category === cat
          ).length;
          return acc;
        }, {} as Record<TraitCategory, number>),
      });
    } catch (error) {
      console.error('Failed to save traits:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירת התכונות' : 'Failed to save traits');
    } finally {
      setIsSaving(false);
    }
  };

  const canContinue = prioritizedTraits.length >= MIN_TRAITS;
  const bonusThreshold = 5;
  const hasBonus = prioritizedTraits.length >= bonusThreshold;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Phase Indicator */}
      <div className="flex justify-center gap-2">
        {(['select', 'rolemodels'] as Phase[]).map((p, idx) => (
          <div
            key={p}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              phase === p 
                ? "bg-violet-600 scale-125" 
                : idx < ['select', 'rolemodels'].indexOf(phase)
                  ? "bg-violet-400"
                  : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <SelectAndPrioritizePhase
            key="select"
            language={language}
            isRTL={isRTL}
            prioritizedTraits={prioritizedTraits}
            setPrioritizedTraits={setPrioritizedTraits}
            expandedCategories={expandedCategories}
            toggleTrait={toggleTrait}
            removeTrait={removeTrait}
            toggleCategory={toggleCategory}
            canContinue={canContinue}
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
            hasBonus={hasBonus}
            rewards={rewards}
            isSaving={isSaving}
            isCompleting={isCompleting}
            onBack={handleBackToSelect}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ SELECT & PRIORITIZE PHASE (Combined) ============
interface SelectAndPrioritizePhaseProps {
  language: string;
  isRTL: boolean;
  prioritizedTraits: string[];
  setPrioritizedTraits: (traits: string[]) => void;
  expandedCategories: Set<TraitCategory>;
  toggleTrait: (id: string) => void;
  removeTrait: (id: string) => void;
  toggleCategory: (cat: TraitCategory) => void;
  canContinue: boolean;
  onContinue: () => void;
}

function SelectAndPrioritizePhase({
  language,
  isRTL,
  prioritizedTraits,
  setPrioritizedTraits,
  expandedCategories,
  toggleTrait,
  removeTrait,
  toggleCategory,
  canContinue,
  onContinue,
}: SelectAndPrioritizePhaseProps) {
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
          <span className="text-4xl">🎭</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'he' ? 'בנו את הזהות שלכם' : 'Build Your Identity'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? `בחרו ${MIN_TRAITS}-${MAX_TRAITS} תכונות וסדרו אותן לפי חשיבות. 3 הראשונות הן תכונות הליבה.`
            : `Select ${MIN_TRAITS}-${MAX_TRAITS} traits and order by importance. Top 3 are core traits.`}
        </p>
      </div>

      {/* Priority List (Reorderable) */}
      {prioritizedTraits.length > 0 && (
        <Card className="p-4 border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h4 className="font-semibold text-sm">
                {language === 'he' ? 'התכונות שלי (לפי סדר חשיבות)' : 'My Traits (by priority)'}
              </h4>
            </div>
            <Badge 
              variant={prioritizedTraits.length >= MIN_TRAITS ? "default" : "secondary"}
              className={cn(
                prioritizedTraits.length >= MIN_TRAITS && "bg-violet-600"
              )}
            >
              {prioritizedTraits.length} / {MAX_TRAITS}
            </Badge>
          </div>

          <Reorder.Group
            axis="y"
            values={prioritizedTraits}
            onReorder={setPrioritizedTraits}
            className="space-y-2"
          >
            {prioritizedTraits.map((traitId, index) => {
              const trait = getTrait(traitId);
              if (!trait) return null;
              const isCore = index < 3;
              const categoryInfo = TRAIT_CATEGORIES[trait.category];

              return (
                <Reorder.Item
                  key={traitId}
                  value={traitId}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all",
                    isCore 
                      ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
                      : "border-border bg-background"
                  )}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                    isCore 
                      ? "bg-amber-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  
                  <span className="text-lg shrink-0">{trait.icon}</span>
                  
                  <span className="flex-1 font-medium text-sm truncate">
                    {language === 'he' ? trait.nameHe : trait.name}
                  </span>

                  {isCore && (
                    <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 dark:text-amber-400 shrink-0">
                      {language === 'he' ? 'ליבה' : 'Core'}
                    </Badge>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrait(traitId);
                    }}
                    className="p-1 hover:bg-destructive/10 rounded shrink-0"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {language === 'he' ? '↕️ גררו לשינוי סדר' : '↕️ Drag to reorder'}
          </p>
        </Card>
      )}

      {/* Categories & Traits */}
      <div className="space-y-3">
        {getAllCategories().map((category) => {
          const categoryInfo = TRAIT_CATEGORIES[category];
          const traits = getTraitsByCategory(category);
          const isExpanded = expandedCategories.has(category);
          const selectedInCategory = prioritizedTraits.filter(
            (id) => traits.find((t) => t.id === id)
          ).length;

          return (
            <Card key={category} className="overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full p-3 flex items-center justify-between transition-colors",
                  "hover:bg-muted/50",
                  isExpanded && "bg-muted/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryInfo.icon}</span>
                  <span className="font-medium text-sm">
                    {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
                  </span>
                  {selectedInCategory > 0 && (
                    <Badge className={cn(categoryInfo.bgClass, categoryInfo.textClass, "text-xs")}>
                      {selectedInCategory}
                    </Badge>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {traits.map((trait) => {
                        const isSelected = prioritizedTraits.includes(trait.id);
                        const isDisabled = !isSelected && prioritizedTraits.length >= MAX_TRAITS;
                        const priorityIndex = prioritizedTraits.indexOf(trait.id);
                        
                        return (
                          <TraitCard
                            key={trait.id}
                            trait={trait}
                            isSelected={isSelected}
                            isDisabled={isDisabled}
                            priorityNumber={isSelected ? priorityIndex + 1 : undefined}
                            onClick={() => toggleTrait(trait.id)}
                            language={language}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <Button
          size="lg"
          className="w-full text-lg py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={onContinue}
          disabled={!canContinue}
        >
          {!canContinue ? (
            language === 'he' 
              ? `בחרו לפחות ${MIN_TRAITS} תכונות (${prioritizedTraits.length}/${MIN_TRAITS})` 
              : `Select at least ${MIN_TRAITS} traits (${prioritizedTraits.length}/${MIN_TRAITS})`
          ) : (
            <span className="flex items-center gap-2">
              {language === 'he' ? 'המשך לדמויות השראה' : 'Continue to Role Models'}
              {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
            </span>
          )}
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
  hasBonus: boolean;
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
  hasBonus,
  rewards,
  isSaving,
  isCompleting,
  onBack,
  onComplete,
}: RoleModelsPhaseProps) {
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
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center"
        >
          <span className="text-4xl">🌟</span>
        </motion.div>
        
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          {language === 'he' ? 'דמויות השראה' : 'Role Models'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'מי הדמויות (מסדרות, סרטים, ספרים) שהייתם רוצים להידמות אליהן? זה עוזר לנו להבין טוב יותר את הזהות שאתם בונים.'
            : 'Which characters (from shows, movies, books) do you aspire to be like? This helps us better understand the identity you\'re building.'}
        </p>
      </div>

      {/* Role Models Input */}
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roleModels" className="text-base font-medium">
            {language === 'he' 
              ? 'כתבו 1-3 דמויות ולמה הן מעוררות בכם השראה'
              : 'Write 1-3 characters and why they inspire you'}
          </Label>
          <Textarea
            id="roleModels"
            value={roleModels}
            onChange={(e) => setRoleModels(e.target.value)}
            placeholder={language === 'he' 
              ? 'לדוגמה:\n• הארוי ספקטר (Suits) - הביטחון העצמי והאסטרטגיה שלו\n• טוני סטארק (Iron Man) - היצירתיות והחזון שלו'
              : 'Example:\n• Harvey Specter (Suits) - his confidence and strategy\n• Tony Stark (Iron Man) - his creativity and vision'}
            className="min-h-[150px] resize-none"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          {language === 'he' 
            ? '💡 טיפ: דמויות השראה עוזרות ל-AI להבין את הסגנון והגישה שלכם לחיים'
            : '💡 Tip: Role models help the AI understand your style and approach to life'}
        </p>
      </Card>

      {/* Summary */}
      <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
        <h4 className="font-semibold mb-3">
          {language === 'he' ? 'סיכום הזהות שלכם' : 'Your Identity Summary'}
        </h4>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'תכונות ליבה:' : 'Core traits:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {prioritizedTraits.slice(0, 3).map((traitId, index) => {
              const trait = getTrait(traitId);
              if (!trait) return null;
              const categoryInfo = TRAIT_CATEGORIES[trait.category];
              
              return (
                <Badge
                  key={traitId}
                  className={cn(
                    "text-sm",
                    categoryInfo.bgClass,
                    categoryInfo.textClass
                  )}
                >
                  <span className={isRTL ? "ml-1" : "mr-1"}>{index + 1}.</span>
                  {trait.icon} {language === 'he' ? trait.nameHe : trait.name}
                </Badge>
              );
            })}
          </div>
          
          {prioritizedTraits.length > 3 && (
            <>
              <p className="text-sm text-muted-foreground mt-3">
                {language === 'he' ? 'תכונות נוספות:' : 'Additional traits:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {prioritizedTraits.slice(3).map((traitId) => {
                  const trait = getTrait(traitId);
                  if (!trait) return null;
                  
                  return (
                    <Badge key={traitId} variant="outline" className="text-sm">
                      {trait.icon} {language === 'he' ? trait.nameHe : trait.name}
                    </Badge>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Rewards Preview */}
      {rewards && (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            +{rewards.xp}{hasBonus ? '+25' : ''} XP
          </span>
          <span className="flex items-center gap-1">
            🪙 +{rewards.tokens}{hasBonus ? '+2' : ''} Tokens
          </span>
        </div>
      )}
      
      {hasBonus && (
        <p className="text-center text-sm text-green-600 dark:text-green-400">
          ✨ {language === 'he' ? 'בונוס על בחירת 5+ תכונות!' : 'Bonus for selecting 5+ traits!'}
        </p>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 py-6"
          onClick={onBack}
        >
          <span className="flex items-center gap-2">
            {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            {language === 'he' ? 'חזרה' : 'Back'}
          </span>
        </Button>
        
        <Button
          size="lg"
          className="flex-1 py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={onComplete}
          disabled={isSaving || isCompleting}
        >
          {(isSaving || isCompleting) ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {language === 'he' ? 'שומר...' : 'Saving...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {language === 'he' ? 'סיום ←' : 'Complete →'}
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ============ TRAIT CARD COMPONENT ============
interface TraitCardProps {
  trait: CharacterTrait;
  isSelected: boolean;
  isDisabled?: boolean;
  priorityNumber?: number;
  onClick: () => void;
  language: string;
}

function TraitCard({ trait, isSelected, isDisabled, priorityNumber, onClick, language }: TraitCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "relative p-3 rounded-xl border-2 text-start transition-all",
        "hover:shadow-md",
        isDisabled && "opacity-50 cursor-not-allowed",
        isSelected
          ? `border-current bg-gradient-to-br ${trait.gradient} text-white shadow-lg`
          : "border-border hover:border-muted-foreground/50 bg-card"
      )}
    >
      {/* Priority Number Badge */}
      {isSelected && priorityNumber && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md font-bold text-xs",
            priorityNumber <= 3 
              ? "bg-amber-500 text-white" 
              : "bg-white text-gray-700"
          )}
        >
          {priorityNumber}
        </motion.div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xl">{trait.icon}</span>
        <span className={cn(
          "font-medium text-sm",
          isSelected ? "text-white" : "text-foreground"
        )}>
          {language === 'he' ? trait.nameHe : trait.name}
        </span>
        <span className={cn(
          "text-xs line-clamp-2",
          isSelected ? "text-white/80" : "text-muted-foreground"
        )}>
          {language === 'he' ? trait.descriptionHe : trait.description}
        </span>
      </div>
    </motion.button>
  );
}

export default IdentityBuildingStep;
