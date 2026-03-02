/**
 * Learn — Aurora Teaches You. Full curriculum system.
 * Browse curricula, study lessons, complete quizzes & projects.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Plus, Sparkles, BookOpen, GraduationCap, Trophy, ChevronRight, Play, CheckCircle, Lock, FileText, Brain, Target, Flame, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import CurriculumWizard from '@/components/learn/CurriculumWizard';
import LessonViewer from '@/components/learn/LessonViewer';

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

  // ── Curriculum Detail View ──
  if (selectedCurriculum && activeCurriculum) {
    return (
      <div className="min-h-screen pb-24" dir={isHe ? 'rtl' : 'ltr'}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedCurriculum(null)}>
              <ArrowLeft className={`h-5 w-5 ${isHe ? 'rotate-180' : ''}`} />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{activeCurriculum.title}</h1>
              <p className="text-sm text-muted-foreground">{activeCurriculum.description}</p>
            </div>
            <Badge className={DIFFICULTY_COLORS['advanced']}>
              <Flame className="h-3 w-3 me-1" />
              Boot Camp
            </Badge>
          </div>

          {/* Progress */}
          <Card>
            <CardContent className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons} {isHe ? 'שיעורים' : 'lessons'}
                </span>
                <span className="font-bold text-primary">{activeCurriculum.progress_percentage}%</span>
              </div>
              <Progress value={activeCurriculum.progress_percentage} className="h-2" />
            </CardContent>
          </Card>

          {/* Modules */}
          <div className="space-y-4">
            {modules?.map((mod) => {
              const modLessons = lessons?.filter(l => l.module_id === mod.id) || [];
              const isLocked = mod.status === 'locked';
              
              return (
                <Card key={mod.id} className={isLocked ? 'opacity-50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : mod.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 text-primary" />
                        )}
                        <CardTitle className="text-base">{mod.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className={DIFFICULTY_COLORS[mod.difficulty] || ''}>
                        {mod.difficulty}
                      </Badge>
                    </div>
                    {mod.description && (
                      <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {mod.completed_lessons}/{mod.total_lessons} {isHe ? 'שיעורים' : 'lessons'}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {modLessons.map((lesson) => {
                      const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
                      const lessonLocked = lesson.status === 'locked';
                      const lessonDone = lesson.status === 'completed';
                      
                      return (
                        <button
                          key={lesson.id}
                          disabled={lessonLocked}
                          onClick={() => !lessonLocked && setSelectedLesson(lesson)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-colors ${
                            lessonLocked 
                              ? 'opacity-40 cursor-not-allowed' 
                              : lessonDone
                                ? 'bg-green-500/5 hover:bg-green-500/10'
                                : 'hover:bg-muted/50'
                          }`}
                        >
                          {lessonLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : lessonDone ? (
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          ) : (
                            <Icon className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.time_estimate_minutes} {isHe ? 'דק\'' : 'min'} · +{lesson.xp_reward} XP
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {lesson.lesson_type}
                          </Badge>
                          {lesson.score !== null && (
                            <span className="text-xs font-bold text-primary">{lesson.score}%</span>
                          )}
                          {!lessonLocked && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Lesson Viewer */}
        <Dialog open={!!selectedLesson} onOpenChange={open => !open && setSelectedLesson(null)}>
          <DialogContent className="max-w-3xl max-h-[95vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
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

  // ── Curricula List View ──
  return (
    <div className="min-h-screen pb-24" dir={isHe ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              {isHe ? 'Aurora מלמדת' : 'Aurora Teaches'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isHe ? 'תוכניות לימוד אינטנסיביות — מאפס למקצוען' : 'Intensive boot camps — from zero to pro'}
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isHe ? 'תוכנית חדשה' : 'New Curriculum'}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">{isHe ? 'טוען...' : 'Loading...'}</div>
        ) : !curricula?.length ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{isHe ? 'מוכן להתחיל ללמוד?' : 'Ready to learn?'}</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  {isHe
                    ? 'ספר ל-Aurora מה אתה רוצה ללמוד והיא תבנה לך תוכנית לימודים אינטנסיבית — מאפס למקצוען.'
                    : 'Tell Aurora what you want to learn and she\'ll build an intensive curriculum — from zero to pro.'}
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
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold">{curr.title}</h3>
                      {curr.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{curr.description}</p>
                      )}
                    </div>
                    <Badge variant={curr.status === 'completed' ? 'default' : 'secondary'}>
                      {curr.status === 'completed' 
                        ? (isHe ? 'הושלם' : 'Completed')
                        : curr.status === 'active'
                          ? (isHe ? 'פעיל' : 'Active')
                          : (isHe ? 'טיוטה' : 'Draft')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden" dir={isHe ? 'rtl' : 'ltr'}>
          <CurriculumWizard
            onComplete={handleWizardComplete}
            onClose={() => setShowWizard(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
