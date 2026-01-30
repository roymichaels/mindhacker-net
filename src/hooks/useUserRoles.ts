import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

interface UserRolesState {
  roles: AppRole[];
  loading: boolean;
  error: string | null;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UserRolesState>({
    roles: [],
    loading: true,
    error: null,
  });

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setState({ roles: [], loading: false, error: null });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const roles = data?.map(r => r.role) || [];
      setState({ roles, loading: false, error: null });
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setState({ roles: [], loading: false, error: 'Failed to fetch roles' });
    }
  }, [user]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((role: AppRole): boolean => {
    return state.roles.includes(role);
  }, [state.roles]);

  const hasAnyRole = useCallback((rolesToCheck: AppRole[]): boolean => {
    return rolesToCheck.some(role => state.roles.includes(role));
  }, [state.roles]);

  const hasPanelAccess = useCallback((): boolean => {
    return hasAnyRole(['admin', 'practitioner', 'affiliate']);
  }, [hasAnyRole]);

  return {
    roles: state.roles,
    loading: state.loading,
    error: state.error,
    hasRole,
    hasAnyRole,
    hasPanelAccess,
    refetch: fetchRoles,
  };
};
