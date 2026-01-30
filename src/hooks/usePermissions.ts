import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Permission {
  permission_key: string;
  description: string;
  description_en: string;
  category: string;
  is_enabled: boolean;
}

interface PermissionsState {
  permissions: string[];
  allPermissions: Permission[];
  loading: boolean;
  error: string | null;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    allPermissions: [],
    loading: true,
    error: null,
  });

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setState({ permissions: [], allPermissions: [], loading: false, error: null });
      return;
    }

    try {
      // Get user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) throw rolesError;

      if (!userRoles || userRoles.length === 0) {
        setState({ permissions: [], allPermissions: [], loading: false, error: null });
        return;
      }

      const roles = userRoles.map(r => r.role);

      // Get permissions for user's roles
      const { data: rolePermissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permission_key, description, description_en, category, is_enabled')
        .in('role', roles)
        .eq('is_enabled', true);

      if (permError) throw permError;

      const uniquePermissions = [...new Set(rolePermissions?.map(p => p.permission_key) || [])];
      
      setState({
        permissions: uniquePermissions,
        allPermissions: rolePermissions || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setState({ permissions: [], allPermissions: [], loading: false, error: 'Failed to fetch permissions' });
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback((permissionKey: string): boolean => {
    return state.permissions.includes(permissionKey);
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.some(p => state.permissions.includes(p));
  }, [state.permissions]);

  const hasAllPermissions = useCallback((permissionsToCheck: string[]): boolean => {
    return permissionsToCheck.every(p => state.permissions.includes(p));
  }, [state.permissions]);

  return {
    permissions: state.permissions,
    allPermissions: state.allPermissions,
    loading: state.loading,
    error: state.error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchPermissions,
  };
};
