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
  Sparkles, Loader2, ArrowLeft, ArrowRight, GripVertical, Star, Trophy, Zap, Crown, Flame
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
    if (!user?.id) {
      toast.error(language === 'he' ? 'יש להתחבר תחילה' : 'Please log in first');
      return;
    }

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

      toast.success(language === 'he' ? '🎉 הזהות שלך נשמרה!' : '🎉 Your identity saved!');

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
      {/* Animated Phase Indicator */}
      <div className="flex justify-center gap-3">
        {(['prioritize', 'rolemodels'] as Phase[]).map((p, idx) => (
          <motion.div
            key={p}
            animate={{ 
              scale: phase === p ? [1, 1.2, 1] : 1,
              opacity: phase === p ? 1 : 0.4
            }}
            transition={{ 
              scale: { duration: 0.5, repeat: phase === p ? Infinity : 0, repeatDelay: 2 }
            }}
            className={cn(
              "w-4 h-4 rounded-full transition-all shadow-lg",
              phase === p 
                ? "bg-gradient-to-br from-violet-500 to-purple-600 ring-4 ring-violet-300/50" 
                : idx < ['prioritize', 'rolemodels'].indexOf(phase)
                  ? "bg-gradient-to-br from-green-400 to-emerald-500"
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
      {/* Playful Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative w-24 h-24 mx-auto"
        >
          {/* Animated rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-dashed border-violet-300/50"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border-4 border-dotted border-purple-400/40"
          />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <span className="text-3xl">🎯</span>
          </div>
          {/* Floating sparkles */}
          <motion.div
            animate={{ y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-5 w-5 text-amber-400" />
          </motion.div>
          <motion.div
            animate={{ y: [5, -5, 5], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-1 -left-1"
          >
            <Zap className="h-4 w-4 text-yellow-400" />
          </motion.div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent"
        >
          {language === 'he' ? '🔥 סדרו את התכונות שלכם!' : '🔥 Rank Your Traits!'}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-md mx-auto text-lg"
        >
          {language === 'he' 
            ? 'גררו את התכונות למעלה או למטה. 6 הראשונות = ליבת הזהות שלכם! 💎'
            : 'Drag traits up or down. Top 6 = Your core identity! 💎'}
        </motion.p>

        {/* Mini legend */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 text-sm"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-300/50">
            <Crown className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-700 dark:text-amber-300">1-6</span>
            <span className="text-amber-600 dark:text-amber-400">{language === 'he' ? 'ליבה' : 'Core'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
            <span className="text-muted-foreground">7-30</span>
            <span className="text-muted-foreground">{language === 'he' ? 'משניות' : 'Secondary'}</span>
          </div>
        </motion.div>
      </div>

      {/* Priority List - Fixed Layout */}
      <Card className="border-2 border-violet-300 dark:border-violet-700 bg-gradient-to-b from-violet-50/80 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/20 shadow-xl shadow-violet-500/10 overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/80 dark:to-purple-900/80 backdrop-blur-sm p-4 border-b border-violet-200 dark:border-violet-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              </motion.div>
              <h4 className="font-bold text-lg">
                {language === 'he' ? 'סדר העדיפויות שלי' : 'My Priority Order'}
              </h4>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                {prioritizedTraits.length} {language === 'he' ? 'תכונות' : 'traits'}
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="p-4 max-h-[45vh] overflow-y-auto">
          <Reorder.Group
            axis="y"
            values={prioritizedTraits}
            onReorder={setPrioritizedTraits}
            className="space-y-2"
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
                    "flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all",
                    isCore 
                      ? "bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-600 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/20"
                      : "bg-white/80 dark:bg-gray-900/50 border border-border hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/30"
                  )}
                >
                  <GripVertical className={cn(
                    "h-5 w-5 shrink-0",
                    isCore ? "text-amber-500" : "text-muted-foreground"
                  )} />
                  
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-lg",
                      isCore 
                        ? "bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white" 
                        : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </motion.div>
                  
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0",
                    isCore ? "bg-white/80 shadow-inner" : "bg-muted/50"
                  )}>
                    {trait.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-bold block truncate",
                      isCore ? "text-amber-800 dark:text-amber-200" : "text-foreground"
                    )}>
                      {language === 'he' ? trait.nameHe : trait.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium", categoryInfo.bgClass, categoryInfo.textClass)}
                    >
                      {language === 'he' ? categoryInfo.nameHe : categoryInfo.name}
                    </Badge>

                    {isCore && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white border-0 font-bold px-2 py-1 shadow-lg">
                          <Crown className="h-3 w-3 mr-1" />
                          {language === 'he' ? 'ליבה' : 'Core'}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-gradient-to-r from-violet-100/95 to-purple-100/95 dark:from-violet-900/95 dark:to-purple-900/95 backdrop-blur-sm p-3 border-t border-violet-200 dark:border-violet-700">
          <motion.p 
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-medium text-center flex items-center justify-center gap-2"
          >
            <span className="text-2xl">↕️</span>
            <span className="text-violet-700 dark:text-violet-300">
              {language === 'he' ? 'גררו למעלה/למטה לשינוי סדר!' : 'Drag up/down to reorder!'}
            </span>
            <span className="text-2xl">🎮</span>
          </motion.p>
        </div>
      </Card>

      {/* Playful Continue Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-2"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            className="w-full text-xl py-7 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/30 font-bold"
            onClick={onContinue}
          >
            <motion.span 
              className="flex items-center gap-3"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-6 w-6" />
              {language === 'he' ? 'המשך לדמויות השראה' : 'Continue to Role Models'}
              {isRTL ? <ArrowLeft className="h-6 w-6" /> : <ArrowRight className="h-6 w-6" />}
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>
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
      {/* Playful Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative w-24 h-24 mx-auto"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 blur-xl opacity-50"
          />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
            <span className="text-4xl">⭐</span>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Trophy className="h-6 w-6 text-amber-500" />
          </motion.div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent"
        >
          {language === 'he' ? '✨ דמויות שמעוררות בכם השראה' : '✨ Your Role Models'}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground max-w-md mx-auto text-lg"
        >
          {language === 'he' 
            ? 'מי האנשים או הדמויות שאתם מעריצים? (אופציונלי)'
            : 'Who do you look up to? (Optional)'}
        </motion.p>
      </div>

      {/* Core Traits Summary - Playful */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5 border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 shadow-lg shadow-amber-200/30">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-amber-600" />
            <span className="font-bold text-amber-800 dark:text-amber-200">
              {language === 'he' ? 'תכונות הליבה שלכם:' : 'Your core traits:'}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {coreTraits.map((trait, idx) => {
              const categoryInfo = TRAIT_CATEGORIES[trait.category];
              return (
                <motion.div
                  key={trait.id}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 * idx, type: "spring" }}
                >
                  <Badge 
                    className={cn(
                      "text-sm py-2 px-4 font-bold shadow-md",
                      categoryInfo.bgClass, 
                      categoryInfo.textClass
                    )}
                  >
                    <span className="text-lg mr-1.5">{trait.icon}</span>
                    {language === 'he' ? trait.nameHe : trait.name}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Role Models Input - Playful */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Label htmlFor="rolemodels" className="text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          {language === 'he' 
            ? 'דמויות שמעוררות בכם השראה (אמיתיות או בדיוניות)'
            : 'Characters that inspire you (real or fictional)'}
        </Label>
        <Textarea
          id="rolemodels"
          placeholder={language === 'he' 
            ? 'למשל: סטיב ג׳ובס, גנדלף, דוד המלך, ריאן גוסלינג, טוני רובינס...'
            : 'e.g., Steve Jobs, Gandalf, King David, Elon Musk, Tony Robbins...'}
          value={roleModels}
          onChange={(e) => setRoleModels(e.target.value)}
          className="min-h-[120px] resize-none text-lg border-2 border-violet-200 dark:border-violet-700 focus:border-violet-400 focus:ring-violet-400"
        />
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <span>💡</span>
          {language === 'he' 
            ? 'הדמויות האלה יעזרו לנו להבין טוב יותר את השאיפות שלכם'
            : 'These characters help us understand your aspirations better'}
        </p>
      </motion.div>

      {/* Rewards Preview - Playful */}
      {rewards && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-5 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-950/40 dark:via-yellow-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-700 shadow-lg">
            <div className="flex items-center justify-center gap-6">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 bg-white/80 dark:bg-black/30 px-4 py-2 rounded-full shadow-md"
              >
                <Sparkles className="h-5 w-5 text-amber-600" />
                <span className="font-black text-lg text-amber-700 dark:text-amber-300">+{rewards.xp} XP</span>
              </motion.div>
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="flex items-center gap-2 bg-white/80 dark:bg-black/30 px-4 py-2 rounded-full shadow-md"
              >
                <span className="text-2xl">🪙</span>
                <span className="font-black text-lg text-amber-700 dark:text-amber-300">+{rewards.tokens}</span>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons - Playful */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 pt-4"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="w-full py-6 text-lg font-bold border-2"
          >
            <span className="flex items-center gap-2">
              {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
              {language === 'he' ? 'חזרה' : 'Back'}
            </span>
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-[2]">
          <Button
            size="lg"
            className="w-full text-xl py-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 shadow-xl shadow-violet-500/30 font-black"
            onClick={onComplete}
            disabled={isSaving || isCompleting}
          >
            {isSaving || isCompleting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.span 
                className="flex items-center gap-3"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6" />
                {language === 'he' ? '🎉 סיום!' : '🎉 Complete!'}
              </motion.span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default IdentityBuildingStep;
