import { useCallback, useRef, useEffect } from 'react';
import { debug } from '@/lib/debug';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLaunchpadData } from './useLaunchpadData';
import { useQueryClient } from '@tanstack/react-query';

export interface StepSaveData {
  step: number;
  data: Record<string, unknown>;
}

/**
 * Hook for auto-saving launchpad step data with debouncing
 * Saves to both localStorage (immediate) and database (debounced)
 * 
 * CRITICAL FIX: During loading state, we:
 * 1. Return localStorage data from getSavedData (not null) to prevent component re-initialization
 * 2. Skip database saves in autoSave to prevent overwriting existing data
 */
export function useLaunchpadAutoSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: launchpadData, isLoading } = useLaunchpadData();
  const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  /**
   * Save step data to localStorage immediately
   */
  const saveToLocalStorage = useCallback((step: number, data: Record<string, unknown>) => {
    const key = `launchpad_step_${step}`;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, []);

  /**
   * Load step data from localStorage
   */
  const loadFromLocalStorage = useCallback((step: number): Record<string, unknown> | null => {
    const key = `launchpad_step_${step}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return null;
  }, []);

  /**
   * Save step data to database
   */
  const saveToDatabase = useCallback(async (step: number, data: Record<string, unknown>) => {
    if (!user?.id) return;

    try {
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      // Map step number to database column
      switch (step) {
        case 1: // Welcome
          updates.step_1_intention = JSON.stringify(data);
          break;
        case 2: // Personal Profile
          updates.step_2_profile_data = data;
          break;
        case 3: // Lifestyle Routine (NEW)
          updates.step_3_lifestyle_data = data;
          break;
        case 4: // Growth Deep Dive (stored in profile_data.deep_dive)
          // Need to merge with existing profile data
          const existingProfile = launchpadData?.personalProfile || {};
          updates.step_2_profile_data = {
            ...existingProfile,
            deep_dive: data,
          };
          break;
        case 5: // First Chat with Aurora
          updates.step_2_summary = JSON.stringify(data);
          break;
        case 8: // Focus Areas
          updates.step_5_focus_areas_selected = data.focus_areas || [];
          break;
        case 9: // First Week
          // Transform from component format to DB format
          updates.step_6_actions = {
            habits_to_quit: (data as any).selectedQuit || [],
            habits_to_build: (data as any).selectedBuild || [],
            career_status: (data as any).selectedCareerStatus || '',
            career_goal: (data as any).selectedCareerGoal || '',
          };
          break;
        case 10: // Final Notes (NEW)
          updates.step_10_final_notes = data.notes || data.final_notes || null;
          break;
        default:
          // Steps 6, 7, 11 have their own completion logic (forms/chat/dashboard)
          return;
      }

      const { error } = await supabase
        .from('launchpad_progress')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving to database:', error);
      } else {
        // Invalidate cache to ensure fresh data on next fetch
        queryClient.invalidateQueries({ queryKey: ['launchpad-data', user.id] });
      }
    } catch (e) {
      console.error('Error in saveToDatabase:', e);
    }
  }, [user?.id, launchpadData?.personalProfile, queryClient]);

  /**
   * Auto-save with debouncing - saves to localStorage immediately and DB after 500ms
   * 
   * CRITICAL: During loading state, we ONLY save to localStorage to prevent
   * overwriting database data with initial/empty component state
   */
  const autoSave = useCallback((step: number, data: Record<string, unknown>) => {
    // Save to localStorage immediately (always safe)
    saveToLocalStorage(step, data);

    // CRITICAL FIX: Do NOT save to database while still loading
    // This prevents the race condition where a component initializes with empty state
    // and immediately overwrites the existing database data
    if (isLoading) {
      debug.log(`[AutoSave] Skipping DB save for step ${step} - still loading`);
      return;
    }

    // Clear existing timer for this step
    if (debounceTimers.current[step]) {
      clearTimeout(debounceTimers.current[step]);
    }

    // Debounce database save (500ms)
    debounceTimers.current[step] = setTimeout(() => {
      saveToDatabase(step, data);
    }, 500);
  }, [saveToLocalStorage, saveToDatabase, isLoading]);

  /**
   * Get saved data for a step - prioritizes database over localStorage
   * 
   * CRITICAL FIX: During loading, we return localStorage data instead of null.
   * This prevents components from re-initializing with empty state and
   * triggering auto-save that overwrites database data.
   */
  const getSavedData = useCallback((step: number): Record<string, unknown> | null => {
    // CRITICAL FIX: During loading, return localStorage fallback instead of null
    // This ensures components have SOME data to hydrate from, preventing
    // the "init new chat -> autoSave -> overwrite DB" race condition
    if (isLoading) {
      const localData = loadFromLocalStorage(step);
      if (localData) {
        debug.log(`[getSavedData] Loading in progress, using localStorage for step ${step}`);
      }
      return localData;
    }

    // Try database first
    let dbData: Record<string, unknown> | null = null;
    
    if (launchpadData) {
      switch (step) {
        case 1: // Welcome
          if (launchpadData.welcomeQuiz && Object.keys(launchpadData.welcomeQuiz).length > 0) {
            dbData = launchpadData.welcomeQuiz;
          }
          break;
        case 2: // Personal Profile
          if (launchpadData.personalProfile && Object.keys(launchpadData.personalProfile).length > 0) {
            dbData = launchpadData.personalProfile as Record<string, unknown>;
          }
          break;
        case 3: // Lifestyle Routine (NEW)
          if ((launchpadData as any).step_3_lifestyle_data) {
            dbData = (launchpadData as any).step_3_lifestyle_data;
          }
          break;
        case 4: // Growth Deep Dive
          if (launchpadData.deepDive) {
            dbData = { answers: launchpadData.deepDive };
          }
          break;
        case 5: // First Chat with Aurora
          if (launchpadData.firstChat) {
            dbData = launchpadData.firstChat as Record<string, unknown>;
          }
          break;
        case 8: // Focus Areas
          if (launchpadData.focusAreas && launchpadData.focusAreas.length > 0) {
            dbData = { focus_areas: launchpadData.focusAreas };
          }
          break;
        case 9: // First Week
          if (launchpadData.firstWeek && (
            launchpadData.firstWeek.habits_to_quit.length > 0 ||
            launchpadData.firstWeek.habits_to_build.length > 0 ||
            launchpadData.firstWeek.career_status ||
            launchpadData.firstWeek.career_goal
          )) {
            dbData = {
              selectedQuit: launchpadData.firstWeek.habits_to_quit,
              selectedBuild: launchpadData.firstWeek.habits_to_build,
              selectedCareerStatus: launchpadData.firstWeek.career_status,
              selectedCareerGoal: launchpadData.firstWeek.career_goal,
            };
          }
          break;
        case 10: // Final Notes (NEW)
          if ((launchpadData as any).step_10_final_notes) {
            dbData = { notes: (launchpadData as any).step_10_final_notes };
          }
          break;
      }
    }

    // If we have DB data, use it
    if (dbData) {
      return dbData;
    }

    // Fallback to localStorage
    return loadFromLocalStorage(step);
  }, [isLoading, launchpadData, loadFromLocalStorage]);

  /**
   * Clear saved data for a step (after successful completion)
   */
  const clearSavedData = useCallback((step: number) => {
    const key = `launchpad_step_${step}`;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }, []);

  return {
    autoSave,
    getSavedData,
    clearSavedData,
    isLoading,
    launchpadData,
  };
}
