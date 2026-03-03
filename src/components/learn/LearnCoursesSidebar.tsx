/**
 * LearnCoursesSidebar - Left sidebar listing all courses.
 * Allows selecting a course + creating new ones.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  PanelLeftClose, PanelLeftOpen, GraduationCap, BookOpen,
  Plus, CheckCircle2, Clock, Flame, FileText,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LearnCoursesSidebarProps {
  selectedCurriculumId: string | null;
  onSelectCurriculum: (id: string) => void;
  onNewCourse?: () => void;
}

export function LearnCoursesSidebar({ selectedCurriculumId, onSelectCurriculum, onNewCourse }: LearnCoursesSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  const { data: curricula } = useQuery({
    queryKey: ['learning-curricula', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('learning_curricula')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-s rtl:border-e border-border/50 dark:border-cyan-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed top-14 bottom-14 z-50 ltr:right-0 rtl:left-0 w-[280px] max-w-[80vw] lg:relative lg:top-auto lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:w-[260px] xl:w-[280px] lg:max-w-none"
      )}
    >
      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:right-2 rtl:left-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* Collapsed */}
      {collapsed && (
        <div className="flex flex-col items-center pt-8 pb-3 px-0.5 gap-1.5 overflow-y-auto scrollbar-hide">
          {curricula?.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onSelectCurriculum(c.id)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors border",
                c.id === selectedCurriculumId
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                  : "bg-muted/30 border-border/20 text-muted-foreground hover:bg-muted/50"
              )}
              title={c.title}
            >
              <span className="text-[10px] font-bold">{i + 1}</span>
            </button>
          ))}
          {onNewCourse && (
            <button
              onClick={onNewCourse}
              className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center justify-center mt-1"
              title={isHe ? 'קורס חדש' : 'New Course'}
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>
      )}

      {/* Expanded */}
      {!collapsed && (
        <div className="flex flex-col h-full p-3 pt-8 overflow-y-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {isHe ? 'הקורסים שלי' : 'My Courses'}
            </span>
            <span className="text-[10px] text-muted-foreground">{curricula?.length || 0}</span>
          </div>

          {!curricula?.length ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-3 py-8">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {isHe ? 'אין קורסים עדיין. צור את הקורס הראשון שלך!' : 'No courses yet. Create your first one!'}
              </p>
              {onNewCourse && (
                <button
                  onClick={onNewCourse}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isHe ? 'בואי נתחיל' : "Let's start"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5 flex-1">
              {curricula.map((curr) => {
                const isSelected = curr.id === selectedCurriculumId;
                const isDone = curr.status === 'completed';
                return (
                  <button
                    key={curr.id}
                    onClick={() => onSelectCurriculum(curr.id)}
                    className={cn(
                      "w-full text-start rounded-lg p-2.5 transition-all border",
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-500/30 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/40 hover:border-border/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                        isSelected ? "bg-cyan-500/20" : "bg-muted/30"
                      )}>
                        {isDone
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          : <Flame className={cn("w-3.5 h-3.5", isSelected ? "text-cyan-400" : "text-muted-foreground")} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-[12px] font-semibold leading-tight truncate", isSelected && "text-cyan-400")}>
                          {curr.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={curr.progress_percentage} className="h-1 flex-1" />
                          <span className={cn("text-[9px] font-bold", isSelected ? "text-cyan-400" : "text-muted-foreground")}>
                            {curr.progress_percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><FileText className="w-2.5 h-2.5" />{curr.completed_lessons}/{curr.total_lessons}</span>
                          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />~{curr.estimated_days}{isHe ? 'י' : 'd'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* New Course button at bottom */}
          {onNewCourse && curricula && curricula.length > 0 && (
            <button
              onClick={onNewCourse}
              className="w-full flex items-center justify-center gap-1.5 p-2 mt-3 rounded-lg text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {isHe ? 'קורס חדש' : 'New Course'}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
