import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type TrustLevel = 'always_ask' | 'auto_execute' | 'confirm_once';

interface ActionPreference {
  action_type: string;
  trust_level: TrustLevel;
  execution_count: number;
}

export const useActionTrust = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Map<string, ActionPreference>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Load user's action preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('aurora_action_preferences')
        .select('action_type, trust_level, execution_count')
        .eq('user_id', user.id);

      if (data) {
        const prefMap = new Map<string, ActionPreference>();
        data.forEach((pref) => {
          prefMap.set(pref.action_type, pref as ActionPreference);
        });
        setPreferences(prefMap);
      }
    } catch (error) {
      console.error('Error loading action preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Check if an action should auto-execute
  const shouldAutoExecute = useCallback((actionType: string): boolean => {
    const pref = preferences.get(actionType);
    return pref?.trust_level === 'auto_execute';
  }, [preferences]);

  // Get trust level for an action
  const getTrustLevel = useCallback((actionType: string): TrustLevel => {
    const pref = preferences.get(actionType);
    return pref?.trust_level || 'always_ask';
  }, [preferences]);

  // Set trust level for an action
  const setTrustLevel = useCallback(async (
    actionType: string,
    trustLevel: TrustLevel
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_action_preferences')
        .upsert({
          user_id: user.id,
          action_type: actionType,
          trust_level: trustLevel,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,action_type',
        });

      if (error) throw error;

      // Update local state
      setPreferences(prev => {
        const newMap = new Map(prev);
        const existing = newMap.get(actionType);
        newMap.set(actionType, {
          action_type: actionType,
          trust_level: trustLevel,
          execution_count: existing?.execution_count || 0,
        });
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('Error setting trust level:', error);
      return false;
    }
  }, [user?.id]);

  // Record an action execution
  const recordExecution = useCallback(async (actionType: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const existing = preferences.get(actionType);
      const newCount = (existing?.execution_count || 0) + 1;

      await supabase
        .from('aurora_action_preferences')
        .upsert({
          user_id: user.id,
          action_type: actionType,
          trust_level: existing?.trust_level || 'always_ask',
          execution_count: newCount,
          last_executed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,action_type',
        });

      // Update local state
      setPreferences(prev => {
        const newMap = new Map(prev);
        newMap.set(actionType, {
          action_type: actionType,
          trust_level: existing?.trust_level || 'always_ask',
          execution_count: newCount,
        });
        return newMap;
      });
    } catch (error) {
      console.error('Error recording execution:', error);
    }
  }, [user?.id, preferences]);

  // Get suggested trust level based on execution history
  const getSuggestedTrustLevel = useCallback((actionType: string): TrustLevel | null => {
    const pref = preferences.get(actionType);
    if (!pref) return null;

    // Suggest auto-execute after 5 successful executions
    if (pref.execution_count >= 5 && pref.trust_level === 'always_ask') {
      return 'auto_execute';
    }

    return null;
  }, [preferences]);

  return {
    preferences,
    isLoading,
    loadPreferences,
    shouldAutoExecute,
    getTrustLevel,
    setTrustLevel,
    recordExecution,
    getSuggestedTrustLevel,
  };
};
