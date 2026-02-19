import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { AddProjectWizard } from '@/components/projects/AddProjectWizard';
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal';
import { Button } from '@/components/ui/button';
import { Plus, FolderKanban, Sparkles, Rocket, Target, Brain } from 'lucide-react';
import { PresetOrb } from '@/components/orb';
import { cn } from '@/lib/utils';
import { UserProject } from '@/hooks/useProjects';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/aurora-ui/PageShell';

interface ProjectsProps {
  openWizardTrigger?: number;
}

const Projects = ({ openWizardTrigger = 0 }: ProjectsProps) => {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { projects, isLoading } = useProjects();
  const { canAccessProjects } = useSubscriptionGate();
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<UserProject | null>(null);

  // Open wizard when triggered from sidebar
  useEffect(() => {
    if (openWizardTrigger > 0) setWizardOpen(true);
  }, [openWizardTrigger]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  const isHe = language === 'he';

  // Gate: un-onboarded users
  if (!isLaunchpadComplete) {
    const features = [
      { icon: Target, he: 'תוכנית 90 יום מותאמת אישית', en: 'Personalized 90-day plan' },
      { icon: Sparkles, he: 'אימון AI יומי עם אורורה', en: 'Daily AI coaching with Aurora' },
      { icon: Brain, he: 'כלי התבוננות וצמיחה', en: 'Introspection & growth tools' },
    ];
    return (
      <PageShell className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-lg mx-auto"
        >
          <div className="mx-auto">
            <PresetOrb size={80} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">
            {isHe ? 'השלם את הכיול כדי לפתוח פרויקטים' : 'Complete Calibration to Unlock Projects'}
          </h2>
          <p className="text-muted-foreground">
            {isHe
              ? 'מודול הפרויקטים מתחבר לתוכנית ה-90 יום שלך. השלם את הכיול כדי להתחיל.'
              : 'The Projects module connects to your 90-day plan. Complete calibration to get started.'}
          </p>
          <div className="grid gap-3 text-start">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isHe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-3"
              >
                <div className="rounded-full bg-amber-500/10 p-2">
                  <f.icon className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm font-medium">{isHe ? f.he : f.en}</span>
              </motion.div>
            ))}
          </div>
          <Button
            onClick={() => navigate('/onboarding')}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
          >
            <Rocket className="w-5 h-5 me-2" />
            {isHe ? 'התחל את המסע' : 'Start Your Journey'}
          </Button>
        </motion.div>
      </PageShell>
    );
  }

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
