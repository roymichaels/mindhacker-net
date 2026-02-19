/**
 * ProjectsLayoutWrapper - Wraps Projects page with sidebar-driven layout.
 * Hides sidebars for un-onboarded users.
 */
import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ProjectsHudSidebar } from '@/components/projects/ProjectsHudSidebar';
import { ProjectsActivitySidebar } from '@/components/projects/ProjectsActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Projects = lazy(() => import('@/pages/Projects'));

export default function ProjectsLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // Un-onboarded users: no sidebars
  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <Projects openWizardTrigger={wizardTrigger} />
        </DashboardLayout>
      </Suspense>
    );
  }

  const leftSidebar = (
    <ProjectsHudSidebar onNewProject={() => setWizardTrigger(prev => prev + 1)} />
  );

  const rightSidebar = (
    <ProjectsActivitySidebar />
  );

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <Projects openWizardTrigger={wizardTrigger} />
      </DashboardLayout>
    </Suspense>
  );
}
