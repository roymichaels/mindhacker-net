import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, Loader2, ArrowLeft, ArrowRight, Star, Trophy, Zap, Crown, Flame, Check, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  CHARACTER_TRAITS, 
  TRAIT_CATEGORIES,
  suggestEgoState,
  getTrait,
  type CharacterTrait 
} from '@/lib/characterTraits';

interface IdentityBuildingStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
}

const STORAGE_KEY = 'launchpad_identity_selected_v3';
const STORAGE_KEY_ROLEMODELS = 'launchpad_identity_rolemodels';

type Phase = 'select' | 'rank' | 'rolemodels';

// Tier system for ranking
type Tier = 'S' | 'A' | 'B';
const TIERS: { id: Tier; label: string; labelHe: string; color: string; bgClass: string; max: number }[] = [
  { id: 'S', label: 'Core Identity', labelHe: 'ליבת הזהות', color: 'from-amber-400 via-orange-500 to-red-500', bgClass: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-amber-400', max: 3 },
  { id: 'A', label: 'Strong Traits', labelHe: 'תכונות חזקות', color: 'from-violet-500 to-purple-600', bgClass: 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border-violet-400', max: 3 },
  { id: 'B', label: 'Supporting', labelHe: 'תומכות', color: 'from-blue-500 to-cyan-500', bgClass: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-blue-400', max: 4 },
];

export function IdentityBuildingStep({ 
  onComplete, 
  isCompleting, 
  rewards 
}: IdentityBuildingStepProps) {
  const { isRTL, language } = useTranslation();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [tierAssignments, setTierAssignments] = useState<Record<string, Tier>>({});
  const [roleModels, setRoleModels] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedTraits) setSelectedTraits(parsed.selectedTraits);
        if (parsed.tierAssignments) setTierAssignments(parsed.tierAssignments);
      } catch { /* ignore */ }
    }
    
    const savedRoleModels = localStorage.getItem(STORAGE_KEY_ROLEMODELS);
    if (savedRoleModels) setRoleModels(savedRoleModels);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedTraits, tierAssignments }));
  }, [selectedTraits, tierAssignments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ROLEMODELS, roleModels);
  }, [roleModels]);

  const toggleTrait = useCallback((traitId: string) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitId)) {
        // Remove from tier assignments too
        setTierAssignments(ta => {
          const copy = { ...ta };
          delete copy[traitId];
          return copy;
        });
        return prev.filter(id => id !== traitId);
      }
      if (prev.length >= 10) {
        toast.error(language === 'he' ? 'מקסימום 10 תכונות' : 'Maximum 10 traits');
        return prev;
      }
      return [...prev, traitId];
    });
  }, [language]);

  const assignTier = useCallback((traitId: string, tier: Tier) => {
    const currentInTier = Object.entries(tierAssignments).filter(([, t]) => t === tier).length;
    const tierConfig = TIERS.find(t => t.id === tier);
    
    if (tierAssignments[traitId] !== tier && currentInTier >= (tierConfig?.max || 3)) {
      toast.error(language === 'he' ? `מקסימום ${tierConfig?.max} בדרגה זו` : `Maximum ${tierConfig?.max} in this tier`);
      return;
    }
    
    setTierAssignments(prev => ({ ...prev, [traitId]: tier }));
  }, [tierAssignments, language]);

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error(language === 'he' ? 'יש להתחבר תחילה' : 'Please log in first');
      return;
    }

    setIsSaving(true);

    try {
      await supabase
        .from('aurora_identity_elements')
        .delete()
        .eq('user_id', user.id)
        .in('element_type', ['character_trait', 'role_model']);

      // Create prioritized list based on tiers
      const tierOrder: Tier[] = ['S', 'A', 'B'];
      const sortedTraits = selectedTraits.sort((a, b) => {
        const tierA = tierAssignments[a] || 'B';
        const tierB = tierAssignments[b] || 'B';
        return tierOrder.indexOf(tierA) - tierOrder.indexOf(tierB);
      });

      const traitsToInsert = sortedTraits.map((traitId, index) => {
        const trait = getTrait(traitId);
        const tier = tierAssignments[traitId] || 'B';
        return {
          user_id: user.id,
          element_type: 'character_trait' as const,
          content: traitId,
          metadata: {
            priority: index + 1,
            tier,
            isCore: tier === 'S',
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

      if (roleModels.trim()) {
        const { error: roleModelError } = await supabase
          .from('aurora_identity_elements')
          .insert({
            user_id: user.id,
            element_type: 'role_model' as const,
            content: roleModels.trim(),
            metadata: { created_at: new Date().toISOString() },
          });
        if (roleModelError) throw roleModelError;
      }

      const suggestedEgoState = suggestEgoState(sortedTraits.slice(0, 6));

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_ROLEMODELS);

      toast.success(language === 'he' ? '🎉 הזהות שלך נשמרה!' : '🎉 Your identity saved!');

      onComplete({
        prioritizedTraits: sortedTraits,
        coreTraits: sortedTraits.filter(id => tierAssignments[id] === 'S'),
        tierAssignments,
        roleModels: roleModels.trim(),
        suggestedEgoState,
      });
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const allAssigned = selectedTraits.every(id => tierAssignments[id]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Phase Indicator */}
      <div className="flex justify-center gap-3 pt-2">
        {(['select', 'rank', 'rolemodels'] as Phase[]).map((p, idx) => {
          const phaseIndex = ['select', 'rank', 'rolemodels'].indexOf(phase);
          return (
            <motion.div
              key={p}
              animate={{ scale: phase === p ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.5, repeat: phase === p ? Infinity : 0, repeatDelay: 2 }}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                phase === p 
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 ring-4 ring-violet-300/50" 
                  : idx < phaseIndex
                    ? "bg-gradient-to-br from-green-400 to-emerald-500"
                    : "bg-muted-foreground/30"
              )}
            />
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <SelectPhase
            key="select"
            language={language}
            isRTL={isRTL}
            selectedTraits={selectedTraits}
            onToggle={toggleTrait}
            onContinue={() => setPhase('rank')}
          />
        )}

        {phase === 'rank' && (
          <RankPhase
            key="rank"
            language={language}
            isRTL={isRTL}
            selectedTraits={selectedTraits}
            tierAssignments={tierAssignments}
            onAssignTier={assignTier}
            allAssigned={allAssigned}
            onBack={() => setPhase('select')}
            onContinue={() => setPhase('rolemodels')}
          />
        )}

        {phase === 'rolemodels' && (
          <RoleModelsPhase
            key="rolemodels"
            language={language}
            isRTL={isRTL}
            roleModels={roleModels}
            setRoleModels={setRoleModels}
            tierAssignments={tierAssignments}
            selectedTraits={selectedTraits}
            rewards={rewards}
            isSaving={isSaving}
            isCompleting={isCompleting}
            onBack={() => setPhase('rank')}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ SELECT PHASE ============
interface SelectPhaseProps {
  language: string;
  isRTL: boolean;
  selectedTraits: string[];
  onToggle: (id: string) => void;
  onContinue: () => void;
}

function SelectPhase({ language, isRTL, selectedTraits, onToggle, onContinue }: SelectPhaseProps) {
  const categories = Object.entries(TRAIT_CATEGORIES);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl"
        >
          🎯
        </motion.div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          {language === 'he' ? 'בחרו 10 תכונות' : 'Choose 10 Traits'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {language === 'he' ? 'התכונות שהכי מגדירות אתכם' : 'The traits that define you most'}
        </p>
      </div>

      {/* Selection Counter */}
      <div className="flex justify-center">
        <motion.div 
          animate={{ scale: selectedTraits.length === 10 ? [1, 1.1, 1] : 1 }}
          className={cn(
            "px-6 py-2 rounded-full font-bold text-lg shadow-lg transition-colors",
            selectedTraits.length === 10
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-700 dark:text-violet-300"
          )}
        >
          {selectedTraits.length}/10 {selectedTraits.length === 10 && '✓'}
        </motion.div>
      </div>

      {/* Trait Grid by Category */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto px-1">
        {categories.map(([catId, cat]) => {
          const traitsInCat = CHARACTER_TRAITS.filter(t => t.category === catId);
          return (
            <Card key={catId} className={cn("p-3", cat.bgClass, "border")}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.icon}</span>
                <span className="font-bold text-sm">{language === 'he' ? cat.nameHe : cat.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {traitsInCat.map(trait => {
                  const isSelected = selectedTraits.includes(trait.id);
                  return (
                    <motion.button
                      key={trait.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggle(trait.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        isSelected
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                          : "bg-white/80 dark:bg-gray-800/80 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-border"
                      )}
                    >
                      <span>{trait.icon}</span>
                      <span>{language === 'he' ? trait.nameHe : trait.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        className="w-full py-6 text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg disabled:opacity-50"
        onClick={onContinue}
        disabled={selectedTraits.length < 6}
      >
        <span className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          {language === 'he' ? `המשך לדירוג (${selectedTraits.length}/10)` : `Continue to Ranking (${selectedTraits.length}/10)`}
          {isRTL ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
        </span>
      </Button>
    </motion.div>
  );
}

// ============ RANK PHASE ============
interface RankPhaseProps {
  language: string;
  isRTL: boolean;
  selectedTraits: string[];
  tierAssignments: Record<string, Tier>;
  onAssignTier: (traitId: string, tier: Tier) => void;
  allAssigned: boolean;
  onBack: () => void;
  onContinue: () => void;
}

function RankPhase({ language, isRTL, selectedTraits, tierAssignments, onAssignTier, allAssigned, onBack, onContinue }: RankPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          {language === 'he' ? 'דרגו את התכונות!' : 'Rank Your Traits!'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {language === 'he' ? 'לחצו על תכונה ובחרו את הדרגה שלה' : 'Tap a trait and choose its tier'}
        </p>
      </div>

      {/* Tier Containers */}
      <div className="space-y-3">
        {TIERS.map(tier => {
          const traitsInTier = selectedTraits.filter(id => tierAssignments[id] === tier.id);
          const spotsLeft = tier.max - traitsInTier.length;
          
          return (
            <Card key={tier.id} className={cn("p-3 border-2", tier.bgClass)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br text-white font-black flex items-center justify-center text-lg shadow-lg", tier.color)}>
                    {tier.id}
                  </div>
                  <span className="font-bold">{language === 'he' ? tier.labelHe : tier.label}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {traitsInTier.length}/{tier.max}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {traitsInTier.map(traitId => {
                  const trait = getTrait(traitId);
                  if (!trait) return null;
                  return (
                    <motion.div
                      key={traitId}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md text-sm font-medium"
                    >
                      <span>{trait.icon}</span>
                      <span>{language === 'he' ? trait.nameHe : trait.name}</span>
                      <button
                        onClick={() => onAssignTier(traitId, tier.id === 'S' ? 'B' : tier.id === 'A' ? 'S' : 'A')}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
                {spotsLeft > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 px-2">
                    +{spotsLeft} {language === 'he' ? 'פנויים' : 'spots'}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Unassigned Traits */}
      {selectedTraits.filter(id => !tierAssignments[id]).length > 0 && (
        <Card className="p-3 border-dashed border-2">
          <p className="text-sm font-medium text-muted-foreground mb-2 text-center">
            {language === 'he' ? 'לחצו לשייך לדרגה:' : 'Tap to assign tier:'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {selectedTraits.filter(id => !tierAssignments[id]).map(traitId => {
              const trait = getTrait(traitId);
              if (!trait) return null;
              return (
                <div key={traitId} className="flex flex-col items-center gap-1">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
                  >
                    <span>{trait.icon}</span>
                    <span>{language === 'he' ? trait.nameHe : trait.name}</span>
                  </motion.div>
                  <div className="flex gap-1">
                    {TIERS.map(tier => {
                      const count = Object.values(tierAssignments).filter(t => t === tier.id).length;
                      const isFull = count >= tier.max;
                      return (
                        <motion.button
                          key={tier.id}
                          whileHover={{ scale: isFull ? 1 : 1.1 }}
                          whileTap={{ scale: isFull ? 1 : 0.9 }}
                          onClick={() => !isFull && onAssignTier(traitId, tier.id)}
                          disabled={isFull}
                          className={cn(
                            "w-7 h-7 rounded-lg bg-gradient-to-br text-white font-bold text-xs shadow-md transition-opacity",
                            tier.color,
                            isFull && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {tier.id}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1 py-5">
          {isRTL ? <ArrowRight className="h-5 w-5 mr-2" /> : <ArrowLeft className="h-5 w-5 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>
        <Button
          size="lg"
          className="flex-[2] py-5 bg-gradient-to-r from-violet-600 to-purple-600 font-bold disabled:opacity-50"
          onClick={onContinue}
          disabled={!allAssigned}
        >
          <span className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            {language === 'he' ? 'המשך' : 'Continue'}
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
  tierAssignments: Record<string, Tier>;
  selectedTraits: string[];
  rewards?: { xp: number; tokens: number; unlock: string };
  isSaving: boolean;
  isCompleting?: boolean;
  onBack: () => void;
  onComplete: () => void;
}

function RoleModelsPhase({
  language, isRTL, roleModels, setRoleModels, tierAssignments, selectedTraits,
  rewards, isSaving, isCompleting, onBack, onComplete,
}: RoleModelsPhaseProps) {
  const coreTraits = selectedTraits.filter(id => tierAssignments[id] === 'S').map(id => getTrait(id)).filter(Boolean) as CharacterTrait[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl">⭐</motion.div>
        <h2 className="text-2xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          {language === 'he' ? 'דמויות השראה' : 'Role Models'}
        </h2>
      </div>

      {/* Core Traits Summary */}
      <Card className="p-4 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <span className="font-bold text-sm text-amber-800 dark:text-amber-200">
            {language === 'he' ? 'ליבת הזהות שלכם:' : 'Your Core Identity:'}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {coreTraits.map(trait => (
            <Badge key={trait.id} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              {trait.icon} {language === 'he' ? trait.nameHe : trait.name}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Role Models Input */}
      <div className="space-y-2">
        <Label className="font-bold flex items-center gap-2">
          <span className="text-xl">🌟</span>
          {language === 'he' ? 'דמויות שמעוררות בכם השראה (אופציונלי)' : 'Your role models (optional)'}
        </Label>
        <Textarea
          placeholder={language === 'he' ? 'סטיב ג׳ובס, גנדלף, דוד המלך...' : 'Steve Jobs, Gandalf, King David...'}
          value={roleModels}
          onChange={(e) => setRoleModels(e.target.value)}
          className="min-h-[80px] resize-none"
        />
      </div>

      {/* Rewards */}
      {rewards && (
        <Card className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="font-bold text-amber-700">+{rewards.xp} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🪙</span>
              <span className="font-bold text-amber-700">+{rewards.tokens}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" size="lg" onClick={onBack} className="flex-1 py-5">
          {isRTL ? <ArrowRight className="h-5 w-5 mr-2" /> : <ArrowLeft className="h-5 w-5 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>
        <Button
          size="lg"
          className="flex-[2] py-5 bg-gradient-to-r from-violet-600 to-purple-600 font-bold"
          onClick={onComplete}
          disabled={isSaving || isCompleting}
        >
          {isSaving || isCompleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {language === 'he' ? '🎉 סיום!' : '🎉 Complete!'}
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default IdentityBuildingStep;
