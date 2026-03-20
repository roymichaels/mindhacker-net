/**
 * TherapistLayoutWrapper — wraps therapist CareerHub without sidebars.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

import CareerHub from '@/pages/CareerHub';

export default function TherapistLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CareerHub careerPath="therapist" />
    </Suspense>
  );
}
