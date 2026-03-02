/**
 * Learn — Aurora Teaches You. Full curriculum system.
 * Uses useSidebars() to inject curriculum outline into the global left HUD sidebar slot.
 */
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

import { toast } from 'sonner';
import {
  Sparkles, BookOpen, GraduationCap, Trophy, ChevronRight, Play, CheckCircle, Lock,
  FileText, Brain, Target, Flame, ArrowLeft, Clock, Zap, ChevronDown, ChevronUp, Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CurriculumWizard from '@/components/learn/CurriculumWizard';

import LessonFocusSession from '@/components/learn/LessonFocusSession';
import { cn } from '@/lib/utils';

interface Curriculum {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  topic: string;
  category: string | null;
  status: string;
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
  total_modules: number;
  estimated_days: number;
  pillar: string | null;
  created_at: string;
}

interface Module {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  difficulty: string;
  order_index: number;
  status: string;
  total_lessons: number;
  completed_lessons: number;
}

interface Lesson {
  id: string;
  title: string;
  title_en: string | null;
  lesson_type: string;
  order_index: number;
  status: string;
  content: any;
  score: number | null;
  xp_reward: number;
  time_estimate_minutes: number;
  completed_at: string | null;
  user_submission: any;
  feedback: any;
  module_id: string;
  curriculum_id: string;
}

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  theory: BookOpen,
  practice: Target,
  quiz: Brain,
  project: Trophy,
};

const LESSON_TYPE_LABELS: Record<string, { he: string; en: string }> = {
  theory: { he: 'תיאוריה', en: 'Theory' },
  practice: { he: 'תרגול', en: 'Practice' },
  quiz: { he: 'בוחן', en: 'Quiz' },
  project: { he: 'פרויקט', en: 'Project' },
};

export default function Learn() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showWizard, setShowWizard] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Fetch curricula
  const { data: curricula, isLoading } = useQuery({
    queryKey: ['learning-curricula', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_curricula')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Curriculum[];
    },
    enabled: !!user?.id,
  });

  // Auto-select first active curriculum for inline display
  const activeCurrId = selectedCurriculum || curricula?.find(c => c.status === 'active')?.id || curricula?.[0]?.id || null;

  // Fetch modules for active curriculum
  const { data: modules } = useQuery({
    queryKey: ['learning-modules', activeCurrId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('curriculum_id', activeCurrId!)
        .order('order_index');
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!activeCurrId,
  });

  // Fetch lessons for active curriculum
  const { data: lessons } = useQuery({
    queryKey: ['learning-lessons', activeCurrId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('curriculum_id', activeCurrId!)
        .order('order_index');
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!activeCurrId,
  });

  const [recalibrating, setRecalibrating] = useState(false);

  const handleWizardComplete = (curriculumId: string) => {
    setShowWizard(false);
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
    setSelectedCurriculum(curriculumId);
    toast.success(isHe ? '🔥 תוכנית הלימודים נוצרה!' : '🔥 Curriculum created!');
  };

  const handleLessonComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['learning-lessons', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-modules', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
    setSelectedLesson(null);
  };

  const activeCurriculum = curricula?.find(c => c.id === activeCurrId);

  const handleRecalibrate = async () => {
    if (!activeCurriculum) return;
    setRecalibrating(true);
    try {
      // Delete existing curriculum and recreate via wizard
      await supabase
        .from('learning_curricula')
        .delete()
        .eq('id', activeCurriculum.id);
      queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
      queryClient.invalidateQueries({ queryKey: ['learning-modules'] });
      queryClient.invalidateQueries({ queryKey: ['learning-lessons'] });
      setSelectedCurriculum(null);
      setShowWizard(true);
      toast.success(isHe ? 'הקורס נמחק — בוא ניצור חדש!' : 'Course deleted — let\'s create a new one!');
    } catch (e) {
      console.error('Recalibrate failed:', e);
      toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
    } finally {
      setRecalibrating(false);
    }
  };

  // Find next unlocked lesson
  const nextLesson = useMemo(() => {
    if (!lessons) return null;
    return lessons.find(l => l.status === 'unlocked' || l.status === 'in_progress') || 
           lessons.find(l => l.status !== 'completed' && l.status !== 'locked') ||
           null;
  }, [lessons]);

  const nextLessonModule = useMemo(() => {
    if (!nextLesson || !modules) return null;
    return modules.find(m => m.id === nextLesson.module_id);
  }, [nextLesson, modules]);

  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    // Auto-expand module containing next lesson
    if (nextLesson && modules) {
      return new Set([nextLesson.module_id]);
    }
    return new Set();
  });

  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  // ── Curriculum Detail View (selected via arrow) ──
  if (selectedCurriculum && activeCurriculum) {
    return (
      <div className="min-h-screen pb-20" dir={isHe ? 'rtl' : 'ltr'}>
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/20 px-4 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCurriculum(null)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/40 active:bg-muted/60 transition-colors shrink-0"
            >
              <ArrowLeft className={cn("h-4 w-4", isHe && "rotate-180")} />
            </button>
            <h1 className="text-sm font-bold truncate flex-1">{activeCurriculum.title}</h1>
            <span className="text-xs font-bold text-primary shrink-0">{activeCurriculum.progress_percentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={activeCurriculum.progress_percentage} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground shrink-0">
              {activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons}
            </span>
          </div>
        </div>

        {/* Modules & Lessons */}
        <ModulesLessonsTree
          modules={modules}
          lessons={lessons}
          nextLesson={nextLesson}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          onSelectLesson={setSelectedLesson}
          isHe={isHe}
        />

        {/* All done */}
        {!nextLesson && lessons && lessons.length > 0 && (
          <div className="py-16 text-center space-y-3">
            <Trophy className="h-10 w-10 mx-auto text-amber-400" />
            <h3 className="text-base font-bold">{isHe ? 'כל השיעורים הושלמו!' : 'All lessons completed!'}</h3>
          </div>
        )}

        {selectedLesson && (
          <LessonFocusSession
            lesson={selectedLesson}
            onComplete={handleLessonComplete}
            onClose={() => setSelectedLesson(null)}
          />
        )}
      </div>
    );
  }

  // ── Main List View (default) ──
  return (
    <div className="min-h-screen pb-24" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {isHe ? 'Aurora מלמדת' : 'Aurora Teaches'}
          </h1>
          <button
            onClick={() => setShowWizard(true)}
            className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center active:bg-primary/20 transition-colors"
          >
            <Plus className="h-4.5 w-4.5 text-primary" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'מאפס למקצוען' : 'From zero to pro'}
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">{isHe ? 'טוען...' : 'Loading...'}</div>
      ) : !curricula?.length ? (
        <div className="px-4 py-16 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Flame className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold">{isHe ? 'מוכן להתחיל ללמוד?' : 'Ready to learn?'}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
              {isHe
                ? 'ספר ל-Aurora מה אתה רוצה ללמוד והיא תבנה לך תוכנית אינטנסיבית.'
                : "Tell Aurora what you want to learn and she'll build an intensive curriculum."}
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)} className="gap-2 rounded-full px-6">
            <Sparkles className="h-4 w-4" />
            {isHe ? 'בואי נתחיל' : "Let's start"}
          </Button>
        </div>
      ) : (
        <>
          {/* Active Curriculum Header */}
          {activeCurriculum && (
            <div className="px-4 pb-2">
              <button
                onClick={() => setSelectedCurriculum(activeCurrId!)}
                className="w-full text-start flex items-center gap-3 py-2"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate flex-1">{activeCurriculum.title}</p>
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground/50 shrink-0", isHe && "rotate-180")} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={activeCurriculum.progress_percentage} className="h-1 flex-1" />
                    <span className="text-[10px] font-bold text-primary w-8 text-end">{activeCurriculum.progress_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{activeCurriculum.total_modules}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{activeCurriculum.total_lessons}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{activeCurriculum.estimated_days}{isHe ? ' ימים' : 'd'}</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Inline Modules & Lessons */}
          {activeCurriculum && modules && (
            <ModulesLessonsTree
              modules={modules}
              lessons={lessons}
              nextLesson={nextLesson}
              expandedModules={expandedModules}
              toggleModule={toggleModule}
              onSelectLesson={setSelectedLesson}
              isHe={isHe}
            />
          )}

          {/* Other curricula */}
          {curricula.length > 1 && (
            <div className="px-4 pt-4 pb-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {isHe ? 'קורסים נוספים' : 'Other courses'}
              </p>
              {curricula.filter(c => c.id !== activeCurrId).map((curr) => (
                <button
                  key={curr.id}
                  onClick={() => setSelectedCurriculum(curr.id)}
                  className="w-full text-start py-3 flex items-center gap-3 border-b border-border/10 active:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate">{curr.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={curr.progress_percentage} className="h-1 flex-1" />
                      <span className="text-[10px] font-bold text-primary">{curr.progress_percentage}%</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground/50 shrink-0", isHe && "rotate-180")} />
                </button>
              ))}
            </div>
          )}

          {/* כיול מחדש button */}
          {activeCurriculum && (
            <div className="px-4 pt-6 pb-4">
              <Button
                onClick={handleRecalibrate}
                disabled={recalibrating}
                variant="outline"
                className="w-full gap-2 rounded-xl h-12 border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCw className={cn("h-4 w-4", recalibrating && "animate-spin")} />
                {recalibrating
                  ? (isHe ? 'מכייל מחדש...' : 'Recalibrating...')
                  : (isHe ? 'כיול מחדש' : 'Recalibrate')}
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="max-w-2xl h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
          <CurriculumWizard
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedLesson && (
        <LessonFocusSession
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
}

// ── Shared Modules/Lessons Tree Component ──
function ModulesLessonsTree({ modules, lessons, nextLesson, expandedModules, toggleModule, onSelectLesson, isHe }: {
  modules: Module[] | undefined;
  lessons: Lesson[] | undefined;
  nextLesson: Lesson | null;
  expandedModules: Set<string>;
  toggleModule: (id: string) => void;
  onSelectLesson: (lesson: Lesson) => void;
  isHe: boolean;
}) {
  return (
    <div>
      {modules?.map((mod) => {
        const isLocked = mod.status === 'locked';
        const isDone = mod.status === 'completed';
        const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
        const isOpen = expandedModules.has(mod.id);
        const modLessons = lessons?.filter(l => l.module_id === mod.id) || [];

        return (
          <div key={mod.id}>
            <button
              onClick={() => !isLocked && toggleModule(mod.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 transition-colors border-b border-border/15",
                isLocked ? "opacity-35 cursor-not-allowed" : "active:bg-muted/40",
              )}
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : isDone ? (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <Play className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              )}
              <div className="flex-1 min-w-0 text-start">
                <p className="text-[13px] font-semibold leading-tight">{mod.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{mod.completed_lessons}/{mod.total_lessons}</p>
              </div>
              {!isLocked && (
                isOpen
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              )}
            </button>

            {isOpen && !isLocked && modLessons.map((lesson, lesIdx) => {
              const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
              const isNext = lesson.id === nextLesson?.id;
              const lessonDone = lesson.status === 'completed';
              const lessonLocked = lesson.status === 'locked';

              return (
                <button
                  key={lesson.id}
                  disabled={lessonLocked}
                  onClick={() => !lessonLocked && onSelectLesson(lesson)}
                  className={cn(
                    "w-full flex items-center gap-3 ps-10 pe-4 py-3 transition-colors text-start",
                    lesIdx < modLessons.length - 1 && "border-b border-border/8",
                    lessonLocked && "opacity-20 cursor-not-allowed",
                    lessonDone && "text-muted-foreground",
                    isNext && "bg-primary/5",
                    !isNext && !lessonDone && !lessonLocked && "active:bg-muted/30",
                  )}
                >
                  {lessonLocked ? (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  ) : lessonDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isNext ? "text-primary" : "text-muted-foreground/60")} />
                  )}
                  <span className="text-[13px] flex-1 leading-tight">{lesson.title}</span>
                  {isNext && (
                    <Badge className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-0 shrink-0">
                      {isHe ? 'הבא' : 'Next'}
                    </Badge>
                  )}
                  {lesson.score !== null && (
                    <span className="text-[11px] text-primary shrink-0">{lesson.score}%</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
