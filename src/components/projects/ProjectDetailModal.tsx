import { UserProject, useProjects } from '@/hooks/useProjects';
import { useTranslation } from '@/hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Trash2, Target, Eye, Clock, Mountain, Shield, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectDetailModalProps {
  project: UserProject | null;
  onClose: () => void;
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { language, isRTL } = useTranslation();
  const { updateProject, deleteProject } = useProjects();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (project) {
      setProgress(project.progress_percentage);
      setStatus(project.status);
    }
  }, [project]);

  if (!project) return null;

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
    updateProject.mutate({ id: project.id, progress_percentage: value[0] } as any);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateProject.mutate({ 
      id: project.id, 
      status: value,
      ...(value === 'completed' ? { completed_at: new Date().toISOString(), progress_percentage: 100 } : {}),
    } as any);
    if (value === 'completed') setProgress(100);
  };

  const handleDelete = () => {
    deleteProject.mutate(project.id);
    onClose();
  };

  const sections = [
    { icon: Eye, title: language === 'he' ? 'חזון' : 'Vision', content: project.vision },
    { icon: Target, title: language === 'he' ? 'למה זה חשוב' : 'Why It Matters', content: project.why_it_matters },
    { icon: Mountain, title: language === 'he' ? 'תוצאה רצויה' : 'Desired Outcome', content: project.desired_outcome },
    { icon: Shield, title: language === 'he' ? 'משאבים' : 'Resources', content: project.resources_needed },
    { icon: Flag, title: language === 'he' ? 'חסמים' : 'Blockers', content: project.potential_blockers },
  ].filter(s => s.content);

  return (
    <Dialog open={!!project} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl shrink-0" style={{ backgroundColor: project.cover_color }} />
            <DialogTitle className="text-start">{project.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {project.description && (
            <p className="text-sm text-muted-foreground">{project.description}</p>
          )}

          {/* Progress slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{language === 'he' ? 'התקדמות' : 'Progress'}</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{progress}%</span>
            </div>
            <Slider value={[progress]} onValueChange={handleProgressChange} max={100} step={5} className="[&_[role=slider]]:bg-amber-500" />
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{language === 'he' ? 'סטטוס:' : 'Status:'}</span>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{language === 'he' ? 'פעיל' : 'Active'}</SelectItem>
                <SelectItem value="paused">{language === 'he' ? 'מושהה' : 'Paused'}</SelectItem>
                <SelectItem value="completed">{language === 'he' ? 'הושלם' : 'Completed'}</SelectItem>
                <SelectItem value="archived">{language === 'he' ? 'בארכיון' : 'Archived'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meta info */}
          <div className="flex gap-2 flex-wrap">
            {project.target_date && (
              <Badge variant="outline" className="text-xs gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(project.target_date), 'dd/MM/yyyy')}
              </Badge>
            )}
            {project.timeline && (
              <Badge variant="outline" className="text-xs">{project.timeline}</Badge>
            )}
            {project.linked_life_areas?.map(a => (
              <Badge key={a} variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">{a}</Badge>
            ))}
          </div>

          {/* Sections */}
          {sections.length > 0 && (
            <div className="space-y-3">
              {sections.map((section, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/50 bg-muted/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <section.icon className="h-3.5 w-3.5" />
                    {section.title}
                  </div>
                  <p className="text-sm text-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Delete */}
          <div className="pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              {language === 'he' ? 'מחק פרויקט' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
