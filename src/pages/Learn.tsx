/**
 * Learn — Aurora Teaches You. Full curriculum system.
 * 3-column layout: left sidebar (curriculum outline), center (next lesson intro), right sidebar (app HUD).
 */
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import {
  Sparkles, BookOpen, GraduationCap, Trophy, ChevronRight, Play, CheckCircle, Lock,
  FileText, Brain, Target, Flame, ArrowLeft, Clock, Zap, ChevronDown, ChevronUp, Menu, X, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400',
  intermediate: 'bg-yellow-500/20 text-yellow-400',
  advanced: 'bg-orange-500/20 text-orange-400',
  mastery: 'bg-red-500/20 text-red-400',
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Fetch modules for selected curriculum
  const { data: modules } = useQuery({
    queryKey: ['learning-modules', selectedCurriculum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('curriculum_id', selectedCurriculum!)
        .order('order_index');
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!selectedCurriculum,
  });

  // Fetch lessons for selected curriculum
  const { data: lessons } = useQuery({
    queryKey: ['learning-lessons', selectedCurriculum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('curriculum_id', selectedCurriculum!)
        .order('order_index');
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!selectedCurriculum,
  });

  const handleWizardComplete = (curriculumId: string) => {
    setShowWizard(false);
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
    setSelectedCurriculum(curriculumId);
    toast.success(isHe ? '🔥 תוכנית הלימודים נוצרה!' : '🔥 Curriculum created!');
  };

  const handleLessonComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['learning-lessons', selectedCurriculum] });
    queryClient.invalidateQueries({ queryKey: ['learning-modules', selectedCurriculum] });
    queryClient.invalidateQueries({ queryKey: ['learning-curricula'] });
    setSelectedLesson(null);
  };

  const activeCurriculum = curricula?.find(c => c.id === selectedCurriculum);

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

  // ── Curricula List View ──
  if (!selectedCurriculum || !activeCurriculum) {
    return (
      <div className="min-h-screen pb-24" dir={isHe ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                {isHe ? 'Aurora מלמדת' : 'Aurora Teaches'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isHe ? 'תוכניות לימוד אינטנסיביות — מאפס למקצוען' : 'Intensive boot camps — from zero to pro'}
              </p>
            </div>
            <Button onClick={() => setShowWizard(true)} className="gap-2 w-full sm:w-auto">
              <Sparkles className="h-4 w-4" />
              {isHe ? 'תוכנית חדשה' : 'New Curriculum'}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</div>
          ) : !curricula?.length ? (
            <Card className="border-dashed">
              <CardContent className="py-12 sm:py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{isHe ? 'מוכן להתחיל ללמוד?' : 'Ready to learn?'}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                    {isHe
                      ? 'ספר ל-Aurora מה אתה רוצה ללמוד והיא תבנה לך תוכנית לימודים אינטנסיבית — מאפס למקצוען.'
                      : "Tell Aurora what you want to learn and she'll build an intensive curriculum — from zero to pro."}
                  </p>
                </div>
                <Button onClick={() => setShowWizard(true)} size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {isHe ? 'בואי נתחיל' : "Let's start"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {curricula.map(curr => (
                <Card 
                  key={curr.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => setSelectedCurriculum(curr.id)}
                >
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold truncate">{curr.title}</h3>
                        {curr.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{curr.description}</p>
                        )}
                      </div>
                      <Badge variant={curr.status === 'completed' ? 'default' : 'secondary'} className="shrink-0">
                        {curr.status === 'completed' 
                          ? (isHe ? 'הושלם' : 'Completed')
                          : curr.status === 'active'
                            ? (isHe ? 'פעיל' : 'Active')
                            : (isHe ? 'טיוטה' : 'Draft')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                      <span>{curr.total_modules} {isHe ? 'מודולים' : 'modules'}</span>
                      <span>{curr.total_lessons} {isHe ? 'שיעורים' : 'lessons'}</span>
                      <span>~{curr.estimated_days} {isHe ? 'ימים' : 'days'}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{curr.completed_lessons}/{curr.total_lessons}</span>
                        <span className="font-bold text-primary">{curr.progress_percentage}%</span>
                      </div>
                      <Progress value={curr.progress_percentage} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Wizard Dialog */}
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="max-w-2xl h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
            <CurriculumWizard
              onComplete={handleWizardComplete}
              onClose={() => setShowWizard(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Curriculum Detail View with Sidebar ──
  return (
    <div className="min-h-screen pb-20" dir={isHe ? 'rtl' : 'ltr'}>
      {/* Mobile header with toggle */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3 lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => setSelectedCurriculum(null)} className="shrink-0">
          <ArrowLeft className={`h-5 w-5 ${isHe ? 'rotate-180' : ''}`} />
        </Button>
        <h1 className="text-sm font-bold truncate flex-1">{activeCurriculum.title}</h1>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex relative">
        {/* ── Left Sidebar: Curriculum Outline ── */}
        <aside className={cn(
          "fixed lg:sticky top-0 lg:top-0 z-30 lg:z-auto h-[100dvh] lg:h-screen w-72 sm:w-80 border-e bg-card/95 backdrop-blur-sm transition-transform duration-300",
          isHe ? 'right-0 lg:right-auto' : 'left-0 lg:left-auto',
          sidebarOpen ? 'translate-x-0' : (isHe ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'),
        )}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b space-y-2">
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCurriculum(null)} className="shrink-0">
                <ArrowLeft className={`h-5 w-5 ${isHe ? 'rotate-180' : ''}`} />
              </Button>
              <h2 className="text-sm font-bold truncate">{activeCurriculum.title}</h2>
            </div>
            <div className="lg:hidden flex items-center justify-between">
              <h2 className="text-sm font-bold">{isHe ? 'תוכנית לימודים' : 'Curriculum'}</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons} {isHe ? 'שיעורים' : 'lessons'}</span>
                <span className="font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
              </div>
              <Progress value={activeCurriculum.progress_percentage} className="h-1.5" />
            </div>
          </div>

          {/* Modules / Lessons tree */}
          <ScrollArea className="h-[calc(100dvh-120px)]">
            <div className="py-2">
              {modules?.map(mod => (
                <SidebarModule
                  key={mod.id}
                  mod={mod}
                  lessons={lessons?.filter(l => l.module_id === mod.id) || []}
                  isHe={isHe}
                  nextLessonId={nextLesson?.id || null}
                  onSelectLesson={(lesson) => {
                    setSelectedLesson(lesson);
                    setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main Content: Next Lesson Intro ── */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Curriculum progress card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="py-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Flame className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-bold text-sm sm:text-base truncate">{activeCurriculum.title}</h2>
                    <p className="text-xs text-muted-foreground">{activeCurriculum.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{activeCurriculum.total_modules} {isHe ? 'מודולים' : 'modules'}</span>
                  <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{activeCurriculum.total_lessons} {isHe ? 'שיעורים' : 'lessons'}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{activeCurriculum.estimated_days} {isHe ? 'ימים' : 'days'}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons}</span>
                    <span className="font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
                  </div>
                  <Progress value={activeCurriculum.progress_percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Next Lesson Card */}
            {nextLesson ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  {isHe ? 'השיעור הבא שלך' : 'Your Next Lesson'}
                </h3>
                <Card className="border-primary/30 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setSelectedLesson(nextLesson)}>
                  <CardContent className="py-6 space-y-4">
                    <div className="flex items-start gap-4">
                      {(() => {
                        const Icon = LESSON_TYPE_ICONS[nextLesson.lesson_type] || FileText;
                        return (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                        );
                      })()}
                      <div className="flex-1 min-w-0">
                        {nextLessonModule && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {nextLessonModule.title} · {isHe ? 'שלב' : 'Step'} {nextLesson.order_index + 1}
                          </p>
                        )}
                        <h3 className="text-lg font-bold">{nextLesson.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {LESSON_TYPE_LABELS[nextLesson.lesson_type]?.[isHe ? 'he' : 'en'] || nextLesson.lesson_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />{nextLesson.time_estimate_minutes} {isHe ? 'דק\'' : 'min'}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Zap className="h-3 w-3" />+{nextLesson.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lesson content preview */}
                    {nextLesson.content && (
                      <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground line-clamp-4">
                        {typeof nextLesson.content === 'string'
                          ? nextLesson.content.slice(0, 200) + '...'
                          : nextLesson.content.intro || nextLesson.content.theory?.slice(0, 200) || (isHe ? 'לחצו להתחיל' : 'Click to start')}
                      </div>
                    )}

                    <Button className="w-full gap-2" size="lg">
                      <Play className="h-4 w-4" />
                      {isHe ? 'התחל שיעור' : 'Start Lesson'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-4">
                  <Trophy className="h-12 w-12 mx-auto text-amber-400" />
                  <h3 className="text-lg font-bold">{isHe ? 'כל השיעורים הושלמו!' : 'All lessons completed!'}</h3>
                  <p className="text-sm text-muted-foreground">{isHe ? 'עבודה מעולה! סיימת את כל תוכנית הלימודים.' : 'Great work! You\'ve finished the entire curriculum.'}</p>
                  <Button variant="outline" onClick={() => setSelectedCurriculum(null)}>
                    {isHe ? 'חזרה לרשימה' : 'Back to list'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent completed lessons */}
            {lessons && lessons.filter(l => l.status === 'completed').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {isHe ? 'שיעורים שהושלמו לאחרונה' : 'Recently Completed'}
                </h3>
                <div className="space-y-2">
                  {lessons.filter(l => l.status === 'completed').slice(-3).reverse().map(lesson => {
                    const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors text-start"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {LESSON_TYPE_LABELS[lesson.lesson_type]?.[isHe ? 'he' : 'en']} · +{lesson.xp_reward} XP
                            {lesson.score !== null && ` · ${lesson.score}%`}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 ${isHe ? 'rotate-180' : ''}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Lesson Viewer */}
      <Dialog open={!!selectedLesson} onOpenChange={open => !open && setSelectedLesson(null)}>
        <DialogContent className="max-w-3xl h-[95vh] sm:max-h-[95vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
          {selectedLesson && (
            <LessonViewer
              lesson={selectedLesson}
              onComplete={handleLessonComplete}
              onClose={() => setSelectedLesson(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sidebar Module Component ──
function SidebarModule({ mod, lessons, isHe, nextLessonId, onSelectLesson }: {
  mod: Module;
  lessons: Lesson[];
  isHe: boolean;
  nextLessonId: string | null;
  onSelectLesson: (l: Lesson) => void;
}) {
  const hasNext = lessons.some(l => l.id === nextLessonId);
  const [open, setOpen] = useState(hasNext || mod.status === 'in_progress' || mod.status === 'unlocked');
  const isLocked = mod.status === 'locked';
  const isDone = mod.status === 'completed';

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={() => !isLocked && setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3 text-start transition-colors",
          isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/50",
        )}
      >
        {isLocked ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : isDone ? (
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        ) : (
          <Play className="h-3.5 w-3.5 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{mod.title}</p>
          <p className="text-[10px] text-muted-foreground">{mod.completed_lessons}/{mod.total_lessons}</p>
        </div>
        {!isLocked && (
          open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && !isLocked && (
        <div className="pb-2 px-2">
          {lessons.map(lesson => {
            const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
            const isNext = lesson.id === nextLessonId;
            const isDone = lesson.status === 'completed';
            const isLessonLocked = lesson.status === 'locked';

            return (
              <button
                key={lesson.id}
                disabled={isLessonLocked}
                onClick={() => !isLessonLocked && onSelectLesson(lesson)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-start transition-colors text-xs",
                  isLessonLocked && "opacity-30 cursor-not-allowed",
                  isDone && "text-muted-foreground",
                  isNext && "bg-primary/10 border border-primary/20 font-medium",
                  !isNext && !isDone && !isLessonLocked && "hover:bg-muted/50",
                )}
              >
                {isLessonLocked ? (
                  <Lock className="h-3 w-3 shrink-0" />
                ) : isDone ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <Icon className={cn("h-3 w-3 shrink-0", isNext ? "text-primary" : "text-muted-foreground")} />
                )}
                <span className="truncate flex-1">{lesson.title}</span>
                {isNext && <Badge className="text-[9px] h-4 px-1 bg-primary/20 text-primary border-0 shrink-0">{isHe ? 'הבא' : 'Next'}</Badge>}
                {lesson.score !== null && <span className="text-[10px] text-primary shrink-0">{lesson.score}%</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
