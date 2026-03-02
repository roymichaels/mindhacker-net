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

  // ── Curriculum Detail View — React Native style inline list ──
  return (
    <div className="min-h-screen pb-20" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-0">
        {/* Back + Header */}
        <button
          onClick={() => setSelectedCurriculum(null)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className={cn("h-3.5 w-3.5", isHe && "rotate-180")} />
          {isHe ? 'חזרה לרשימה' : 'Back to list'}
        </button>

        {/* Compact progress header */}
        <div className="space-y-2 mb-4">
          <h1 className="text-base font-bold leading-tight">{activeCurriculum.title}</h1>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons} {isHe ? 'שיעורים' : 'lessons'}</span>
            <span className="font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
          </div>
          <Progress value={activeCurriculum.progress_percentage} className="h-1.5" />
        </div>

        {/* ── Modules & Lessons — flat list ── */}
        <div className="space-y-0">
          {modules?.map(mod => {
            const isLocked = mod.status === 'locked';
            const isDone = mod.status === 'completed';
            const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
            const isOpen = expandedModules.has(mod.id);
            const modLessons = lessons?.filter(l => l.module_id === mod.id) || [];

            return (
              <div key={mod.id}>
                {/* Module header row */}
                <button
                  onClick={() => !isLocked && toggleModule(mod.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3.5 transition-colors border-b border-border/20",
                    isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-muted/30 active:bg-muted/50",
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
                    <p className="text-sm font-semibold truncate">{mod.title}</p>
                    <p className="text-[11px] text-muted-foreground">{mod.completed_lessons}/{mod.total_lessons}</p>
                  </div>
                  {!isLocked && (
                    isOpen
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Expanded lessons */}
                {isOpen && !isLocked && (
                  <div className="bg-muted/10">
                    {modLessons.map(lesson => {
                      const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
                      const isNext = lesson.id === nextLesson?.id;
                      const lessonDone = lesson.status === 'completed';
                      const lessonLocked = lesson.status === 'locked';

                      return (
                        <button
                          key={lesson.id}
                          disabled={lessonLocked}
                          onClick={() => !lessonLocked && setSelectedLesson(lesson)}
                          className={cn(
                            "w-full flex items-center gap-3 px-5 py-3 transition-colors text-start border-b border-border/10",
                            lessonLocked && "opacity-25 cursor-not-allowed",
                            lessonDone && "text-muted-foreground",
                            isNext && "bg-primary/5 border-s-2 border-s-primary",
                            !isNext && !lessonDone && !lessonLocked && "hover:bg-muted/20 active:bg-muted/40",
                          )}
                        >
                          {lessonLocked ? (
                            <Lock className="h-3.5 w-3.5 shrink-0" />
                          ) : lessonDone ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Icon className={cn("h-3.5 w-3.5 shrink-0", isNext ? "text-primary" : "text-muted-foreground")} />
                          )}
                          <span className="text-sm truncate flex-1">{lesson.title}</span>
                          {isNext && (
                            <Badge className="text-[9px] h-4 px-1.5 bg-primary/20 text-primary border-0 shrink-0">
                              {isHe ? 'הבא' : 'Next'}
                            </Badge>
                          )}
                          {lesson.score !== null && (
                            <span className="text-xs text-primary shrink-0">{lesson.score}%</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* All done state */}
        {!nextLesson && lessons && lessons.length > 0 && (
          <div className="py-12 text-center space-y-3">
            <Trophy className="h-10 w-10 mx-auto text-amber-400" />
            <h3 className="text-base font-bold">{isHe ? 'כל השיעורים הושלמו!' : 'All lessons completed!'}</h3>
            <p className="text-sm text-muted-foreground">{isHe ? 'עבודה מעולה!' : 'Great work!'}</p>
          </div>
        )}
      </div>

      {/* Full-screen Lesson Focus Session */}
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
