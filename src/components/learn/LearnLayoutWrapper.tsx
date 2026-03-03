/**
 * LearnLayoutWrapper - Registers Learn-specific sidebars and renders Learn page.
 */
import { Suspense, lazy } from 'react';
import { LearnActivitySidebar } from '@/components/learn/LearnActivitySidebar';
import { useSidebars } from '@/hooks/useSidebars';

const Learn = lazy(() => import('@/pages/Learn'));

export default function LearnLayoutWrapper() {
  // The Learn page manages its own sidebar callbacks via props
  // We render Learn and let it provide callbacks to the sidebar
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LearnLayoutInner />
    </Suspense>
  );
}

function LearnLayoutInner() {
  // We just register the sidebar with null left (Learn doesn't need a HUD nav sidebar)
  // and the activity sidebar on the left
  useSidebars(
    <LearnActivitySidebar />,
    null
  );

  return <Learn />;
}
