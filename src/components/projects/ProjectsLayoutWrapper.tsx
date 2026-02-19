/**
 * ProjectsLayoutWrapper - Wraps Projects page with sidebar-driven layout.
 * Mirrors AdminLayoutWrapper pattern with amber/gold theme.
 */
import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ProjectsHudSidebar } from '@/components/projects/ProjectsHudSidebar';
import { ProjectsActivitySidebar } from '@/components/projects/ProjectsActivitySidebar';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Projects = lazy(() => import('@/pages/Projects'));

export default function ProjectsLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);

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
