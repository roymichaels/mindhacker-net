import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AddProjectWizard } from '@/components/projects/AddProjectWizard';
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserProject } from '@/hooks/useProjects';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';

interface ProjectsProps {
  openWizardTrigger?: number;
}

const Projects = ({ openWizardTrigger = 0 }: ProjectsProps) => {
  const { language, isRTL } = useTranslation();
  const { projects, isLoading } = useProjects();
  const { canAccessProjects } = useSubscriptionGate();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);

  // Open wizard when triggered from sidebar
  useEffect(() => {
    if (openWizardTrigger > 0) setWizardOpen(true);
  }, [openWizardTrigger]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  if (!canAccessProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <ProGateOverlay feature="projects" className="max-w-md w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-6">
          <div className="absolute -top-10 -end-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="absolute -bottom-6 -start-6 h-24 w-24 rounded-full bg-yellow-400/10 blur-2xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <FolderKanban className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-500">
                  {language === 'he' ? 'הפרויקטים שלי' : 'My Projects'}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'he'
                  ? 'נהל את כל הפרויקטים שלך, שלב עם המטרות והתוכניות שלך דרך אורורה'
                  : 'Manage all your projects, integrate with your goals and plans through Aurora'}
              </p>
            </div>
            <Button
              onClick={() => setWizardOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/20 gap-2"
            >
              <Plus className="h-4 w-4" />
              {language === 'he' ? 'פרויקט חדש' : 'New Project'}
            </Button>
          </div>
        </div>

        {/* Active Projects */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-500/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              {language === 'he' ? 'אין פרויקטים עדיין' : 'No projects yet'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {language === 'he'
                ? 'צור את הפרויקט הראשון שלך ואורורה תעזור לך לשלב אותו עם המטרות והתוכניות שלך'
                : 'Create your first project and Aurora will help you integrate it with your goals and plans'}
            </p>
            <Button onClick={() => setWizardOpen(true)} className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white gap-2">
              <Plus className="h-4 w-4" />
              {language === 'he' ? 'צור פרויקט' : 'Create Project'}
            </Button>
          </div>
        ) : (
          <>
            {activeProjects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === 'he' ? `פרויקטים פעילים (${activeProjects.length})` : `Active Projects (${activeProjects.length})`}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                  ))}
                </div>
              </div>
            )}
            {otherProjects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {language === 'he' ? 'אחרים' : 'Other'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AddProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
};

export default Projects;
