/**
 * ProjectsLayoutWrapper - Sets sidebars for the Projects hub.
 */
import { Suspense, lazy, useState } from 'react';
import { ProjectsHudSidebar } from '@/components/projects/ProjectsHudSidebar';
import { ProjectsActivitySidebar } from '@/components/projects/ProjectsActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSidebars } from '@/hooks/useSidebars';

const Projects = lazy(() => import('@/pages/Projects'));

export default function ProjectsLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();

  useSidebars(
    isLaunchpadComplete ? <ProjectsHudSidebar onNewProject={() => setWizardTrigger(prev => prev + 1)} /> : null,
    isLaunchpadComplete ? <ProjectsActivitySidebar /> : null
  );

  return (
    <Suspense fallback={null}>
      <Projects openWizardTrigger={wizardTrigger} />
    </Suspense>
  );
}
