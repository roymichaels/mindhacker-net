import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
const MIN_TRAITS = 3;

export function IdentityBuildingStep({ 
  onComplete, 
  isCompleting, 
  rewards 
}: IdentityBuildingStepProps) {
  const { t, isRTL, language } = useTranslation();
  const { user } = useAuth();
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
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
          setSelectedTraits(parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTraits));
  }, [selectedTraits]);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits((prev) =>
      prev.includes(traitId)
        ? prev.filter((id) => id !== traitId)
        : [...prev, traitId]
    );
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

  const handleContinue = async () => {
    if (selectedTraits.length < MIN_TRAITS || !user?.id) return;

    setIsSaving(true);

    try {
      // Delete existing character traits for this user
      await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id)
        .eq('element_type', 'character_trait');

      // Insert new character traits
      const traitsToInsert = selectedTraits.map((traitId) => {
        const trait = getTrait(traitId);
        return {
          user_id: user.id,
          element_type: 'character_trait' as const,
          content: traitId,
          metadata: {
            category: trait?.category,
            color: trait?.color,
            icon: trait?.icon,
            selected_at: new Date().toISOString(),
          },
        };
      });

      const { error } = await supabase
        .from('aurora_identity_elements')
        .insert(traitsToInsert);

      if (error) throw error;

      const suggestedEgoState = suggestEgoState(selectedTraits);

      onComplete({
        selectedTraits,
        suggestedEgoState,
        categoryCounts: getAllCategories().reduce((acc, cat) => {
          acc[cat] = selectedTraits.filter(
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

  const canContinue = selectedTraits.length >= MIN_TRAITS;
  const bonusThreshold = 5;
  const hasBonus = selectedTraits.length >= bonusThreshold;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
          {language === 'he' ? 'בנו את האדם שאתם רוצים להיות' : 'Build The Person You Want To Be'}
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'בחרו את תכונות האופי שאתם רוצים לפתח ולחזק. אלה יהפכו למצפן שלכם לצמיחה.'
            : 'Select the character traits you want to develop and strengthen. These will become your compass for growth.'}
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="p-4 bg-muted/50 border-violet-500/20">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-sm text-muted-foreground">
            {language === 'he'
              ? 'המידע הזה נשמר באופן פרטי ומשמש רק לאימון AI מותאם אישית עבורך.'
              : 'This information is kept private and only used for personalized AI coaching for you.'}
          </p>
        </div>
      </Card>

      {/* Categories & Traits */}
      <div className="space-y-4">
        {getAllCategories().map((category) => {
          const categoryInfo = TRAIT_CATEGORIES[category];
          const traits = getTraitsByCategory(category);
          const isExpanded = expandedCategories.has(category);
          const selectedInCategory = selectedTraits.filter(
            (id) => traits.find((t) => t.id === id)
          ).length;

          return (
            <Card key={category} className="overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  "w-full p-4 flex items-center justify-between transition-colors",
                  "hover:bg-muted/50",
                  isExpanded && `bg-gradient-to-r ${categoryInfo.gradient} bg-opacity-10`
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <div className="text-start">
                    <h3 className="font-semibold">
                      {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
                    </h3>
                    {selectedInCategory > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {selectedInCategory} {language === 'he' ? 'נבחרו' : 'selected'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedInCategory > 0 && (
                    <Badge 
                      className={cn(categoryInfo.bgClass, categoryInfo.textClass)}
                    >
                      {selectedInCategory}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Traits Grid */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {traits.map((trait) => {
                        const isSelected = selectedTraits.includes(trait.id);
                        
                        return (
                          <TraitCard
                            key={trait.id}
                            trait={trait}
                            isSelected={isSelected}
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

      {/* Selected Summary */}
      {selectedTraits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-0 bg-background/95 backdrop-blur-sm border rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {language === 'he' ? 'התכונות שבחרתי' : 'My Selected Traits'}
            </h4>
            <Badge variant="secondary" className="text-sm">
              {selectedTraits.length} / {MIN_TRAITS}+
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedTraits.slice(0, 8).map((traitId) => {
              const trait = CHARACTER_TRAITS.find((t) => t.id === traitId);
              if (!trait) return null;
              
              return (
                <Badge
                  key={trait.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    TRAIT_CATEGORIES[trait.category].bgClass,
                    TRAIT_CATEGORIES[trait.category].textClass
                  )}
                  onClick={() => toggleTrait(trait.id)}
                >
                  <span className="mr-1">{trait.icon}</span>
                  {language === 'he' ? trait.nameHe : trait.name}
                  <span className="ml-1 opacity-60">×</span>
                </Badge>
              );
            })}
            {selectedTraits.length > 8 && (
              <Badge variant="outline">
                +{selectedTraits.length - 8}
              </Badge>
            )}
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <div className="pt-4 space-y-3">
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

        <Button
          size="lg"
          className="w-full text-lg py-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={handleContinue}
          disabled={!canContinue || isCompleting || isSaving}
        >
          {(isCompleting || isSaving) ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {language === 'he' ? 'שומר...' : 'Saving...'}
            </span>
          ) : !canContinue ? (
            language === 'he' 
              ? `בחרו לפחות ${MIN_TRAITS} תכונות` 
              : `Select at least ${MIN_TRAITS} traits`
          ) : (
            language === 'he' ? 'המשך ←' : 'Continue →'
          )}
        </Button>
      </div>
    </div>
  );
}

interface TraitCardProps {
  trait: CharacterTrait;
  isSelected: boolean;
  onClick: () => void;
  language: string;
}

function TraitCard({ trait, isSelected, onClick, language }: TraitCardProps) {
  const categoryInfo = TRAIT_CATEGORIES[trait.category];
  
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-xl border-2 text-start transition-all",
        "hover:shadow-md",
        isSelected
          ? `border-current bg-gradient-to-br ${trait.gradient} text-white shadow-lg`
          : "border-border hover:border-muted-foreground/50 bg-card"
      )}
    >
      {/* Selected Check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <Check className="h-4 w-4 text-green-600" />
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
