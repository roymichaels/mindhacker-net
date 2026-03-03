/**
 * LearnActivitySidebar - Left sidebar for the Learn page.
 * Shows learning stats, course progress, module breakdown, and recalibrate action.
 * Cyan/teal color scheme matching learning identity.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  PanelLeftClose, PanelLeftOpen, GraduationCap, BookOpen, CheckCircle2,
  Trophy, Zap, Clock, FileText, Target, Flame, RefreshCw, Loader2,
  Plus,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface LearnActivitySidebarProps {
  onNewCourse?: () => void;
  onRecalibrate?: () => void;
  recalibrating?: boolean;
}

export function LearnActivitySidebar({ onNewCourse, onRecalibrate, recalibrating }: LearnActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();

  // Fetch all curricula
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

  const activeCurriculum = curricula?.[0];

  // Compute stats
  const stats = useMemo(() => {
    if (!curricula?.length) {
      return { totalCourses: 0, completedLessons: 0, totalLessons: 0, totalModules: 0, avgProgress: 0, totalXp: 0, estimatedDays: 0 };
    }
    const totalCourses = curricula.length;
    const completedLessons = curricula.reduce((s, c) => s + (c.completed_lessons || 0), 0);
    const totalLessons = curricula.reduce((s, c) => s + (c.total_lessons || 0), 0);
    const totalModules = curricula.reduce((s, c) => s + (c.total_modules || 0), 0);
    const avgProgress = totalCourses > 0 ? Math.round(curricula.reduce((s, c) => s + (c.progress_percentage || 0), 0) / totalCourses) : 0;
    const totalXp = completedLessons * 25; // Approximate XP
    const estimatedDays = curricula.reduce((s, c) => s + (c.estimated_days || 0), 0);
    return { totalCourses, completedLessons, totalLessons, totalModules, avgProgress, totalXp, estimatedDays };
  }, [curricula]);

  const statItems = [
    { icon: GraduationCap, value: stats.totalCourses, label: isHe ? 'קורסים' : 'Courses', color: 'text-cyan-400' },
    { icon: CheckCircle2, value: `${stats.completedLessons}/${stats.totalLessons}`, label: isHe ? 'שיעורים' : 'Lessons', color: 'text-emerald-400' },
    { icon: BookOpen, value: stats.totalModules, label: isHe ? 'מודולים' : 'Modules', color: 'text-blue-400' },
    { icon: Zap, value: stats.totalXp, label: isHe ? 'XP נצבר' : 'XP Earned', color: 'text-amber-400' },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-e rtl:border-s border-border/50 dark:border-cyan-500/15",
        collapsed ? "w-[54px] min-w-[54px]" : "fixed top-14 bottom-14 inset-x-0 z-50 w-full lg:relative lg:top-auto lg:bottom-auto lg:inset-x-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
      )}
    >
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

      {/* Collapsed view */}
      {collapsed && (
        <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-1 w-full">
            {statItems.map((m, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                <m.icon className={cn("w-4 h-4", m.color)} />
                <span className="text-[10px] font-bold leading-none">{m.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center gap-1.5 mt-2">
            {activeCurriculum && (
              <span className="text-[9px] font-bold text-cyan-400">{activeCurriculum.progress_percentage || 0}%</span>
            )}
            {onNewCourse && (
              <button
                onClick={onNewCourse}
                className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                title={isHe ? 'קורס חדש' : 'New Course'}
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
            {onRecalibrate && activeCurriculum && (
              <button
                onClick={onRecalibrate}
                disabled={recalibrating}
                className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                title={isHe ? 'כיול מחדש' : 'Recalibrate'}
              >
                {recalibrating
                  ? <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                }
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expanded view */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
          {/* Stats Grid */}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
            {isHe ? 'סטטיסטיקה' : 'Stats'}
          </span>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {statItems.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                <span className="text-sm font-bold leading-none">{m.value}</span>
                <span className="text-[9px] text-muted-foreground text-center">{m.label}</span>
              </div>
            ))}
          </div>

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-3" />

          {/* Active Course */}
          {activeCurriculum ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <Flame className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground truncate">
                    {activeCurriculum.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isHe ? 'Boot Camp פעיל' : 'Active Boot Camp'}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>{isHe ? 'התקדמות' : 'Progress'}</span>
                  <span className="font-bold text-cyan-400">{activeCurriculum.progress_percentage || 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${activeCurriculum.progress_percentage || 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {isHe ? 'מודולים' : 'Modules'}
                  </span>
                  <span className="font-semibold">{activeCurriculum.total_modules}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {isHe ? 'שיעורים' : 'Lessons'}
                  </span>
                  <span className="font-semibold">{activeCurriculum.completed_lessons}/{activeCurriculum.total_lessons}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isHe ? 'זמן משוער' : 'Est. Time'}
                  </span>
                  <span className="font-semibold">~{activeCurriculum.estimated_days} {isHe ? 'ימים' : 'days'}</span>
                </div>
              </div>

              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent mb-3" />

              {/* Actions */}
              <div className="space-y-1.5 mt-auto">
                {onNewCourse && (
                  <button
                    onClick={onNewCourse}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isHe ? 'קורס חדש' : 'New Course'}
                  </button>
                )}
                {onRecalibrate && (
                  <button
                    onClick={onRecalibrate}
                    disabled={recalibrating}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-[11px] font-semibold bg-muted/40 border border-border/30 text-muted-foreground hover:bg-muted/60 transition-colors"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", recalibrating && "animate-spin")} />
                    {recalibrating
                      ? (isHe ? 'מכייל מחדש...' : 'Recalibrating...')
                      : (isHe ? 'כיול מחדש' : 'Recalibrate')}
                  </button>
                )}
              </div>
            </>
          ) : (
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
          )}
        </div>
      )}
    </aside>
  );
}
