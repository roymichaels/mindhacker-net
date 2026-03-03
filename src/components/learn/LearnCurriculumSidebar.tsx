/**
 * LearnCurriculumSidebar - Right sidebar showing modules & lessons for the selected course.
 * Self-contained: fetches its own data based on selectedCurriculumId.
 */
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PanelRightClose, PanelRightOpen, BookOpen, CheckCircle, Lock,
  Play, FileText, Brain, Target, Trophy, ChevronDown, ChevronUp,
  Zap, RefreshCw, Loader2, GraduationCap,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  theory: BookOpen,
  practice: Target,
  quiz: Brain,
  project: Trophy,
};

interface LearnCurriculumSidebarProps {
  selectedCurriculumId: string | null;
  onSelectLesson?: (lesson: any) => void;
  onRecalibrate?: () => void;
  recalibrating?: boolean;
}

export function LearnCurriculumSidebar({ selectedCurriculumId, onSelectLesson, onRecalibrate, recalibrating }: LearnCurriculumSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { data: curriculum } = useQuery({
    queryKey: ['learning-curriculum-detail', selectedCurriculumId],
    queryFn: async () => {
      if (!selectedCurriculumId) return null;
      const { data, error } = await supabase
        .from('learning_curricula')
        .select('*')
        .eq('id', selectedCurriculumId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCurriculumId,
  });

  const { data: modules } = useQuery({
    queryKey: ['learning-modules', selectedCurriculumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('curriculum_id', selectedCurriculumId!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCurriculumId,
  });

  const { data: lessons } = useQuery({
    queryKey: ['learning-lessons', selectedCurriculumId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_lessons')
        .select('*')
        .eq('curriculum_id', selectedCurriculumId!)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCurriculumId,
  });

  const nextLesson = useMemo(() => {
    if (!lessons) return null;
    return lessons.find((l: any) => l.status === 'unlocked' || l.status === 'in_progress') ||
           lessons.find((l: any) => l.status !== 'completed' && l.status !== 'locked') || null;
  }, [lessons]);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (nextLesson) {
      setExpandedModules(prev => {
        const next = new Set(prev);
        next.add((nextLesson as any).module_id);
        return next;
      });
    }
  }, [nextLesson]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalXp = useMemo(() => {
    if (!lessons) return 0;
    return lessons.filter((l: any) => l.status === 'completed').reduce((s: number, l: any) => s + (l.xp_reward || 0), 0);
  }, [lessons]);

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-s rtl:border-e border-border/50 dark:border-cyan-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed top-14 bottom-14 z-50 ltr:right-0 rtl:left-0 w-[320px] max-w-[80vw] lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:w-[280px] xl:w-[320px] lg:max-w-none"
      )}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:left-2 rtl:right-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {collapsed && (
        <div className="flex flex-col items-center pt-8 pb-3 px-0.5 gap-1.5">
          {curriculum && (
            <span className="text-[9px] font-bold text-cyan-400">{curriculum.progress_percentage || 0}%</span>
          )}
          {modules?.map((mod: any) => {
            const isDone = mod.status === 'completed';
            const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
            const isLocked = mod.status === 'locked';
            return (
              <div
                key={mod.id}
                className={cn(
                  "w-8 h-1.5 rounded-full",
                  isDone ? "bg-emerald-500/60" : isActive ? "bg-cyan-400/50" : isLocked ? "bg-muted/20" : "bg-muted/30"
                )}
              />
            );
          })}
          {onRecalibrate && curriculum && (
            <button
              onClick={onRecalibrate}
              disabled={recalibrating}
              className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors mt-2"
              title={isHe ? 'כיול מחדש' : 'Recalibrate'}
            >
              {recalibrating
                ? <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              }
            </button>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="flex flex-col h-full p-3 pt-8 overflow-y-auto scrollbar-hide">
          {!selectedCurriculumId || !curriculum ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-8">
              <GraduationCap className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {isHe ? 'בחר קורס כדי לראות את התוכנית' : 'Select a course to see the curriculum'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <h3 className="text-xs font-bold text-foreground leading-tight">{curriculum.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{curriculum.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={curriculum.progress_percentage || 0} className="h-1.5 flex-1" />
                  <span className="text-[10px] font-bold text-cyan-400">{curriculum.progress_percentage || 0}%</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><BookOpen className="w-2.5 h-2.5" />{curriculum.total_modules} {isHe ? 'מודולים' : 'modules'}</span>
                  <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{curriculum.completed_lessons}/{curriculum.total_lessons}</span>
                  <span className="flex items-center gap-0.5"><Zap className="w-2.5 h-2.5 text-amber-400" />{totalXp} XP</span>
                </div>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-2" />

              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                {isHe ? 'תוכנית הלימודים' : 'Curriculum'}
              </span>

              <div className="flex-1 space-y-0.5">
                {modules?.map((mod: any) => {
                  const isLocked = mod.status === 'locked';
                  const isDone = mod.status === 'completed';
                  const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
                  const isOpen = expandedModules.has(mod.id);
                  const modLessons = lessons?.filter((l: any) => l.module_id === mod.id) || [];

                  return (
                    <div key={mod.id}>
                      <button
                        onClick={() => !isLocked && toggleModule(mod.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-start",
                          isLocked ? "opacity-35 cursor-not-allowed" : "hover:bg-muted/30",
                          isOpen && "bg-muted/20"
                        )}
                      >
                        {isLocked ? (
                          <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                        ) : isDone ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Play className={cn("h-3 w-3 shrink-0", isActive ? "text-cyan-400" : "text-muted-foreground")} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold leading-tight truncate">{mod.title}</p>
                          <p className="text-[9px] text-muted-foreground">{mod.completed_lessons}/{mod.total_lessons}</p>
                        </div>
                        {!isLocked && (
                          isOpen
                            ? <ChevronUp className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            : <ChevronDown className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        )}
                      </button>

                      {isOpen && !isLocked && modLessons.map((lesson: any) => {
                        const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
                        const isNext = lesson.id === nextLesson?.id;
                        const lessonDone = lesson.status === 'completed';
                        const lessonLocked = lesson.status === 'locked';

                        return (
                          <button
                            key={lesson.id}
                            disabled={lessonLocked}
                            onClick={() => !lessonLocked && onSelectLesson?.(lesson)}
                            className={cn(
                              "w-full flex items-center gap-2 ps-7 pe-2 py-1.5 rounded-md transition-colors text-start",
                              lessonLocked && "opacity-20 cursor-not-allowed",
                              lessonDone && "text-muted-foreground",
                              isNext && "bg-cyan-500/10",
                              !isNext && !lessonDone && !lessonLocked && "hover:bg-muted/20",
                            )}
                          >
                            {lessonLocked ? (
                              <Lock className="h-2.5 w-2.5 shrink-0" />
                            ) : lessonDone ? (
                              <CheckCircle className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Icon className={cn("h-2.5 w-2.5 shrink-0", isNext ? "text-cyan-400" : "text-muted-foreground/60")} />
                            )}
                            <span className="text-[10px] flex-1 leading-tight truncate">{lesson.title}</span>
                            {isNext && (
                              <Badge className="text-[8px] h-3.5 px-1 bg-cyan-500/15 text-cyan-400 border-0 shrink-0">
                                {isHe ? 'הבא' : 'Next'}
                              </Badge>
                            )}
                            {lesson.score !== null && (
                              <span className="text-[9px] text-cyan-400 shrink-0">{lesson.score}%</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {onRecalibrate && (
                <button
                  onClick={onRecalibrate}
                  disabled={recalibrating}
                  className="w-full flex items-center justify-center gap-1.5 p-2 mt-3 rounded-lg text-[11px] font-semibold bg-muted/40 border border-border/30 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", recalibrating && "animate-spin")} />
                  {recalibrating
                    ? (isHe ? 'מכייל מחדש...' : 'Recalibrating...')
                    : (isHe ? 'כיול מחדש' : 'Recalibrate')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </aside>
  );
}
