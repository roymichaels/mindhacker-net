/**
 * LearnCurriculumSidebar — Injected into the left HUD sidebar slot on the Learn page.
 * Shows curriculum modules + lessons tree with progress tracking.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelRightClose, PanelRightOpen,
  BookOpen, Target, Brain, Trophy, FileText,
  CheckCircle, Lock, Play, ChevronDown, ChevronUp,
  GraduationCap, ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface LearnCurriculumSidebarProps {
  curriculumTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  modules: Module[];
  lessons: Lesson[];
  nextLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
}

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  theory: BookOpen,
  practice: Target,
  quiz: Brain,
  project: Trophy,
};

export function LearnCurriculumSidebar({
  curriculumTitle,
  progress,
  completedLessons,
  totalLessons,
  modules,
  lessons,
  nextLessonId,
  onSelectLesson,
  onBack,
}: LearnCurriculumSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-primary/15",
      collapsed ? "w-16 min-w-[64px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
    )}>
      {/* Collapse toggle */}
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

      {/* ===== COLLAPSED MINI VIEW ===== */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-8 pb-4 px-1 overflow-hidden">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-[10px] font-bold text-primary text-center leading-tight">
            {progress}%
          </span>

          {/* Mini module dots */}
          <div className="flex flex-col items-center gap-1.5 mt-2">
            {modules.map(mod => {
              const isDone = mod.status === 'completed';
              const isLocked = mod.status === 'locked';
              const isActive = mod.status === 'in_progress' || mod.status === 'unlocked';
              return (
                <div
                  key={mod.id}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    isDone && "bg-emerald-500",
                    isActive && "bg-primary animate-pulse",
                    isLocked && "bg-muted-foreground/20",
                  )}
                  title={mod.title}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ===== EXPANDED FULL VIEW ===== */}
      {!collapsed && (
        <div className="flex flex-col h-full pt-8">
          {/* Header */}
          <div className="px-3 pb-3 space-y-2 border-b border-border/30">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className={cn("h-3.5 w-3.5", !isRTL && "rotate-180")} />
              {isHe ? 'חזרה לרשימה' : 'Back to list'}
            </button>
            <h2 className="text-sm font-bold truncate" dir={isRTL ? 'rtl' : 'ltr'}>{curriculumTitle}</h2>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{completedLessons}/{totalLessons} {isHe ? 'שיעורים' : 'lessons'}</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          </div>

          {/* Modules & Lessons tree */}
          <ScrollArea className="flex-1">
            <div className="py-1">
              {modules.map(mod => (
                <SidebarModule
                  key={mod.id}
                  mod={mod}
                  lessons={lessons.filter(l => l.module_id === mod.id)}
                  isHe={isHe}
                  nextLessonId={nextLessonId}
                  onSelectLesson={onSelectLesson}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </aside>
  );
}

// ── Sidebar Module ──
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
    <div className="border-b border-border/20 last:border-b-0">
      <button
        onClick={() => !isLocked && setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2.5 text-start transition-colors",
          isLocked ? "opacity-35 cursor-not-allowed" : "hover:bg-muted/40",
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
          open ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && !isLocked && (
        <div className="pb-1.5 px-1.5">
          {lessons.map(lesson => {
            const Icon = LESSON_TYPE_ICONS[lesson.lesson_type] || FileText;
            const isNext = lesson.id === nextLessonId;
            const lessonDone = lesson.status === 'completed';
            const lessonLocked = lesson.status === 'locked';

            return (
              <button
                key={lesson.id}
                disabled={lessonLocked}
                onClick={() => !lessonLocked && onSelectLesson(lesson)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-start transition-colors text-[11px]",
                  lessonLocked && "opacity-25 cursor-not-allowed",
                  lessonDone && "text-muted-foreground",
                  isNext && "bg-primary/10 border border-primary/20 font-medium",
                  !isNext && !lessonDone && !lessonLocked && "hover:bg-muted/30",
                )}
              >
                {lessonLocked ? (
                  <Lock className="h-3 w-3 shrink-0" />
                ) : lessonDone ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <Icon className={cn("h-3 w-3 shrink-0", isNext ? "text-primary" : "text-muted-foreground")} />
                )}
                <span className="truncate flex-1">{lesson.title}</span>
                {isNext && (
                  <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary border-0 shrink-0">
                    {isHe ? 'הבא' : 'Next'}
                  </Badge>
                )}
                {lesson.score !== null && (
                  <span className="text-[10px] text-primary shrink-0">{lesson.score}%</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
