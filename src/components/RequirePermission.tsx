import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface RequirePermissionProps {
  children: ReactNode;
  permission: string | string[];
  fallback?: ReactNode;
  showLoader?: boolean;
  requireAll?: boolean;
}

const RequirePermission = ({
  children,
  permission,
  fallback,
  showLoader = true,
  requireAll = false,
}: RequirePermissionProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  const { t } = useTranslation();

  if (loading && showLoader) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t('panel.noAccess')}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {t('panel.noAccessDescription')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequirePermission;
