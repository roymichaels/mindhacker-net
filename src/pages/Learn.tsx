/**
 * Learn — Aurora Teaches You. Full curriculum system.
 * Uses the Aurora Dock for curriculum wizard chat (no modals).
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';

import { toast } from 'sonner';
import {
  Sparkles, BookOpen, GraduationCap, Trophy, ChevronRight, Play, CheckCircle, Lock,
  FileText, Brain, Target, Flame, ArrowLeft, Clock, Zap, ChevronDown, ChevronUp, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
  const auroraChat = useAuroraChatContextSafe();

  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync curriculum selection with sidebars via custom events
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail;
      setSelectedCurriculum(id);
    };
    window.addEventListener('learn:select-curriculum', handler);
    return () => window.removeEventListener('learn:select-curriculum', handler);
  }, []);

  // Listen for lesson open from right sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const lesson = (e as CustomEvent).detail;
      if (lesson) setSelectedLesson(lesson);
    };
    window.addEventListener('learn:open-lesson', handler);
    return () => window.removeEventListener('learn:open-lesson', handler);
  }, []);

  // Broadcast curriculum selection changes to sidebars
  const selectCurriculum = useCallback((id: string | null) => {
    setSelectedCurriculum(id);
    if (id) {
      window.dispatchEvent(new CustomEvent('learn:select-curriculum', { detail: id }));
    }
  }, []);

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

  // Auto-broadcast selection when curricula loads
  useEffect(() => {
    if (activeCurrId && !selectedCurriculum) {
      window.dispatchEvent(new CustomEvent('learn:select-curriculum', { detail: activeCurrId }));
    }
  }, [activeCurrId, selectedCurriculum]);
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

  // handleWizardComplete is now handled globally via useLearnPillarAction hook

  // Open Aurora Dock for curriculum wizard chat
  const openWizardInDock = useCallback(() => {
    if (!auroraChat) return;
    auroraChat.setActivePillar('learn');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    // Inject greeting as an assistant message (not sent as user prompt)
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '🔥 שלום! אני Aurora, ואני הולכת לבנות לך תוכנית לימודים אינטנסיבית.\n\nזה לא קורס רגיל — זה **Boot Camp**. אני אדחוף אותך מאפס למקצוען.\n\n**מה אתה רוצה ללמוד?**\n\nתהיה ספציפי — "Python לData Science", "גיטרה קלאסית", "שיווק דיגיטלי" — כל מה שתרצה.'
        : "🔥 Hey! I'm Aurora, and I'm about to build you an intensive learning curriculum.\n\nThis isn't a casual course — this is a **Boot Camp**. I'll push you from zero to pro.\n\n**What do you want to learn?**\n\nBe specific — \"Python for Data Science\", \"Classical Guitar\", \"Digital Marketing\" — anything you want to master."
    );
  }, [auroraChat, isHe]);

  // Check if learn pillar is active (wizard mode)
  const isWizardActive = auroraChat?.activePillar === 'learn';

  // Pillar action (Build Curriculum button) is now registered globally
  // via useLearnPillarAction in DashboardLayout — no need to duplicate here.

  const handleWizardCompleteFromEvent = useCallback((e: Event) => {
    const curriculumId = (e as CustomEvent).detail;
    if (curriculumId) {
      selectCurriculum(curriculumId);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('learn:select-curriculum', handleWizardCompleteFromEvent);
    return () => window.removeEventListener('learn:select-curriculum', handleWizardCompleteFromEvent);
  }, [handleWizardCompleteFromEvent]);

  const handleLessonComplete = async () => {
    // Close current lesson immediately
    const completedId = selectedLesson?.id;
    setSelectedLesson(null);

    // Refetch lessons and auto-advance to the next one
    await queryClient.invalidateQueries({ queryKey: ['learning-lessons', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-modules', activeCurrId] });
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });

    // Wait a tick for data to settle, then find next lesson
    setTimeout(() => {
      const fresh = queryClient.getQueryData<any[]>(['learning-lessons', activeCurrId]);
      if (!fresh) return;
      const next = fresh.find((l: any) => (l.status === 'unlocked' || l.status === 'in_progress') && l.id !== completedId)
        || fresh.find((l: any) => l.status !== 'completed' && l.status !== 'locked' && l.id !== completedId);
      if (next) {
        setSelectedLesson(next);
      }
    }, 600);
  };

  const activeCurriculum = curricula?.find(c => c.id === activeCurrId);

  const handleRecalibrate = useCallback(async () => {
    if (!activeCurriculum) return;
    setRecalibrating(true);
    window.dispatchEvent(new CustomEvent('learn:recalibrating', { detail: true }));
    try {
      await supabase
        .from('learning_curricula')
        .delete()
        .eq('id', activeCurriculum.id);
      queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
      queryClient.invalidateQueries({ queryKey: ['learning-modules'] });
      queryClient.invalidateQueries({ queryKey: ['learning-lessons'] });
      selectCurriculum(null);
      openWizardInDock();
      toast.success(isHe ? 'הקורס נמחק — בוא ניצור חדש!' : 'Course deleted — let\'s create a new one!');
    } catch (e) {
      console.error('Recalibrate failed:', e);
      toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
    } finally {
      setRecalibrating(false);
      window.dispatchEvent(new CustomEvent('learn:recalibrating', { detail: false }));
    }
  }, [activeCurriculum, queryClient, isHe, openWizardInDock]);

  // Listen for recalibrate event from sidebar
  useEffect(() => {
    const handler = () => handleRecalibrate();
    window.addEventListener('learn:recalibrate', handler);
    return () => window.removeEventListener('learn:recalibrate', handler);
  }, [handleRecalibrate]);

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

  // Curriculum detail view removed — now handled by sidebars

  // ── Motivational quotes ──
  const quotes = isHe
    ? [
        'כל מסע של אלף מיל מתחיל בצעד אחד.',
        'הידע הוא הכוח הגדול ביותר שיש.',
        'אתה לא צריך להיות מושלם — רק להתקדם.',
        'כל שיעור שאתה מסיים מקרב אותך למטרה.',
        'ההשקעה הטובה ביותר היא בעצמך.',
      ]
    : [
        'Every expert was once a beginner.',
        'Knowledge is the most powerful weapon you can carry.',
        'You don\'t have to be perfect — just keep moving.',
        'Each lesson you finish brings you closer to mastery.',
        'The best investment you can make is in yourself.',
      ];
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  // ── Main View: Focused Next Lesson Card ──
  return (
    <div className="min-h-screen pb-24 flex flex-col" dir={isHe ? 'rtl' : 'ltr'}>
      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">{isHe ? 'טוען...' : 'Loading...'}</div>
      ) : !curricula?.length ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Flame className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{isHe ? 'מוכן להתחיל ללמוד?' : 'Ready to learn?'}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {isHe
                  ? 'ספר ל-Aurora מה אתה רוצה ללמוד והיא תבנה לך תוכנית אינטנסיבית.'
                  : "Tell Aurora what you want to learn and she'll build an intensive curriculum."}
              </p>
            </div>
            <Button onClick={openWizardInDock} className="gap-2 rounded-full px-6">
              <Sparkles className="h-4 w-4" />
              {isHe ? 'בואי נתחיל' : "Let's start"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
          {/* New Course button + Motivational quote */}
          <div className="max-w-md text-center space-y-3">
            <Button
              onClick={openWizardInDock}
              variant="outline"
              size="sm"
              className="gap-2 rounded-full border-primary/30 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              {isHe ? 'קורס חדש' : 'New Course'}
            </Button>
            <div className="space-y-2">
              <Sparkles className="h-5 w-5 text-primary mx-auto opacity-60" />
              <p className="text-sm italic text-muted-foreground leading-relaxed">"{dailyQuote}"</p>
            </div>
          </div>

          {/* Active curriculum info */}
          {activeCurriculum && (
            <div className="w-full max-w-md space-y-1.5 text-center">
              <h2 className="text-base font-bold truncate">{activeCurriculum.title}</h2>
              <div className="flex items-center gap-2 justify-center">
                <Progress value={activeCurriculum.progress_percentage} className="h-1.5 w-40" />
                <span className="text-xs font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons} {isHe ? 'שיעורים' : 'lessons'}
              </p>
            </div>
          )}

          {/* Next lesson card */}
          {nextLesson ? (
            <Card
              className="w-full max-w-md cursor-pointer group border-primary/20 hover:border-primary/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-primary/5"
              onClick={() => setSelectedLesson(nextLesson)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="text-[10px] bg-primary/15 text-primary border-0">
                    {isHe ? 'השיעור הבא' : 'Up Next'}
                  </Badge>
                  {nextLessonModule && (
                    <span className="text-[10px] text-muted-foreground">{nextLessonModule.title}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                    {nextLesson.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {(() => {
                      const Icon = LESSON_TYPE_ICONS[nextLesson.lesson_type] || FileText;
                      const label = LESSON_TYPE_LABELS[nextLesson.lesson_type];
                      return (
                        <span className="flex items-center gap-1">
                          <Icon className="h-3.5 w-3.5" />
                          {label ? (isHe ? label.he : label.en) : nextLesson.lesson_type}
                        </span>
                      );
                    })()}
                    {nextLesson.time_estimate_minutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {nextLesson.time_estimate_minutes} {isHe ? 'דק׳' : 'min'}
                      </span>
                    )}
                    {nextLesson.xp_reward > 0 && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        {nextLesson.xp_reward} XP
                      </span>
                    )}
                  </div>
                </div>

                <Button className="w-full gap-2 rounded-xl group-hover:bg-primary">
                  <Play className="h-4 w-4" />
                  {isHe ? 'התחל שיעור' : 'Start Lesson'}
                </Button>
              </CardContent>
            </Card>
          ) : lessons && lessons.length > 0 ? (
            /* All done */
            <div className="text-center space-y-3 py-8">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold">{isHe ? 'סיימת את כל השיעורים! 🎉' : 'All lessons completed! 🎉'}</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                {isHe ? 'כל הכבוד! אתה יכול ליצור קורס חדש או לחזור על שיעורים קודמים.' : 'Amazing work! You can create a new course or review past lessons.'}
              </p>
              <Button onClick={openWizardInDock} variant="outline" className="gap-2 rounded-full mt-2">
                <Plus className="h-4 w-4" />
                {isHe ? 'קורס חדש' : 'New Course'}
              </Button>
            </div>
          ) : null}

          {/* Quick stats row */}
          {activeCurriculum && (
            <div className="flex items-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold">{activeCurriculum.total_modules}</p>
                <p className="text-[10px] text-muted-foreground">{isHe ? 'מודולים' : 'Modules'}</p>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div>
                <p className="text-lg font-bold">{activeCurriculum.completed_lessons}</p>
                <p className="text-[10px] text-muted-foreground">{isHe ? 'הושלמו' : 'Done'}</p>
              </div>
              <div className="w-px h-8 bg-border/30" />
              <div>
                <p className="text-lg font-bold">~{activeCurriculum.estimated_days}</p>
                <p className="text-[10px] text-muted-foreground">{isHe ? 'ימים' : 'Days'}</p>
              </div>
            </div>
          )}
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
