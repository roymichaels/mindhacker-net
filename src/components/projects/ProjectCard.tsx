import { UserProject } from '@/hooks/useProjects';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calendar, Flag, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: UserProject;
  onClick?: () => void;
}

const priorityConfig: Record<string, { labelEn: string; labelHe: string; class: string }> = {
  low: { labelEn: 'Low', labelHe: 'נמוכה', class: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  medium: { labelEn: 'Medium', labelHe: 'בינונית', class: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  high: { labelEn: 'High', labelHe: 'גבוהה', class: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  critical: { labelEn: 'Critical', labelHe: 'קריטית', class: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' },
};

const statusConfig: Record<string, { labelEn: string; labelHe: string }> = {
  active: { labelEn: 'Active', labelHe: 'פעיל' },
  paused: { labelEn: 'Paused', labelHe: 'מושהה' },
  completed: { labelEn: 'Completed', labelHe: 'הושלם' },
  archived: { labelEn: 'Archived', labelHe: 'בארכיון' },
};

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { language, isRTL } = useTranslation();
  const p = priorityConfig[project.priority] || priorityConfig.medium;
  const s = statusConfig[project.status] || statusConfig.active;

  return (
    <button
      onClick={onClick}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        "w-full text-start group relative overflow-hidden rounded-2xl border border-border/50",
        "bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-amber-500/5",
        "transition-all duration-300 hover:border-amber-500/30 p-4 space-y-3"
      )}
    >
      {/* Color accent bar */}
      <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl" style={{ backgroundColor: project.cover_color }} />

      {/* Header */}
      <div className="flex items-start justify-between pt-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{project.description}</p>
          )}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-amber-500 transition-all shrink-0 ms-2" />
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{language === 'he' ? 'התקדמות' : 'Progress'}</span>
          <span>{project.progress_percentage}%</span>
        </div>
        <Progress value={project.progress_percentage} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-yellow-500" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5", p.class)}>
          <Flag className="h-3 w-3 me-1" />
          {language === 'he' ? p.labelHe : p.labelEn}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border">
          {language === 'he' ? s.labelHe : s.labelEn}
        </Badge>
        {project.target_date && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(project.target_date), 'dd/MM/yy')}
          </span>
        )}
      </div>

      {/* Life areas */}
      {project.linked_life_areas?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {project.linked_life_areas.slice(0, 3).map(a => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {a}
            </span>
          ))}
          {project.linked_life_areas.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{project.linked_life_areas.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}
