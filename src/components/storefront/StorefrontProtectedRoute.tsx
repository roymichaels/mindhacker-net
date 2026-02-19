import { Navigate } from 'react-router-dom';
import { useCoachStorefront } from '@/contexts/CoachStorefrontContext';
import { useCoachAuth } from '@/contexts/CoachAuthContext';
import { ReactNode } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';

interface StorefrontProtectedRouteProps {
  children: ReactNode;
}

const StorefrontProtectedRoute = ({ children }: StorefrontProtectedRouteProps) => {
  const { practitionerSlug } = useCoachStorefront();
  const { isAuthenticated, isLoading } = useCoachAuth();
  
  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to={`/p/${practitionerSlug}/login`} replace />;
  
  return <>{children}</>;
};

export default StorefrontProtectedRoute;
