import { Navigate } from 'react-router-dom';
import { usePractitioner } from '@/contexts/PractitionerContext';
import { usePractitionerAuth } from '@/contexts/PractitionerAuthContext';
import { ReactNode } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';

interface StorefrontProtectedRouteProps {
  children: ReactNode;
}

const StorefrontProtectedRoute = ({ children }: StorefrontProtectedRouteProps) => {
  const { practitionerSlug } = usePractitioner();
  const { isAuthenticated, isLoading } = usePractitionerAuth();
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/p/${practitionerSlug}/login`} replace />;
  }
  
  return <>{children}</>;
};

export default StorefrontProtectedRoute;
