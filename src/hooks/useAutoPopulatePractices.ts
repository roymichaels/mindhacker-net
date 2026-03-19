/**
 * useAutoPopulatePractices — auto-populates user_practices from onboarding data
 * when the practices modal finds an empty list.
 *
 * Sources: launchpad_progress (exercise_types, willing_to_do, hobbies),
 *          profiles (selected_pillars), practices library.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Maps onboarding exercise keywords → practice library names
const EXERCISE_MAP: Record<string, string[]> = {
  gym: ['Calisthenics', 'Sprint Training'],
  strength: ['Calisthenics', 'Sprint Training'],
  yoga: ['Yoga'],
  pilates: ['Yoga', 'Mobility Work'],
  running: ['Sprint Training'],
  'martial-arts': ['Combat Training'],
  martial_arts: ['Combat Training'],
  boxing: ['Combat Training'],
  swimming: ['Sprint Training'],
  'power-walking': ['Walking Meditation'],
  calisthenics: ['Calisthenics'],
  crossfit: ['Calisthenics', 'Sprint Training'],
  dance: ['Mobility Work', 'Animal Flow'],
  hiking: ['Walking Meditation'],
  functional: ['Animal Flow', 'Calisthenics'],
};

// Maps willing_to_do items → practice names
const WILLINGNESS_MAP: Record<string, string[]> = {
  meditation: ['Meditation'],
  journaling: ['Journaling'],
  cold_showers: ['Cold Exposure'],
  cold_exposure: ['Cold Exposure'],
  daily_exercise: ['Mobility Work'],
  no_screens_evening: ['Evening Reflection'],
  wake_early: ['Sun Exposure'],
  strict_diet: ['Financial Review'], // proxy: discipline/review
};

// Hobby keywords → practice names
const HOBBY_MAP: Record<string, string[]> = {
  reading: ['Reading & Study'],
  art: ['Creative Practice'],
  creative: ['Creative Practice'],
  music: ['Creative Practice'],
  writing: ['Journaling', 'Creative Practice'],
  coding: ['Deep Work Block'],
  learning: ['Reading & Study'],
  cooking: ['Creative Practice'],
};

// Fundamentals always included
const FUNDAMENTALS = ['Sun Exposure', 'Breathwork', 'Evening Reflection'];

interface PracticeRow {
  user_id: string;
  practice_id: string;
  is_active: boolean;
  is_core_practice: boolean;
  energy_phase: string;
  preferred_duration: number;
  frequency_per_week: number;
  skill_level: number;
}

export function useAutoPopulatePractices(shouldRun: boolean) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isPopulating, setIsPopulating] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (!shouldRun || !user?.id || attempted.current || isPopulating) return;
    attempted.current = true;

    (async () => {
      try {
        // Check if user already has active practices
        const { count } = await supabase
          .from('user_practices')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true);

        if ((count || 0) > 0) return; // already populated

        setIsPopulating(true);

        // Fetch data sources in parallel
        const [libraryRes, profileRes, launchpadRes] = await Promise.all([
          supabase.from('practices').select('id, name, name_he, category, pillar, default_duration, energy_type').eq('is_active', true),
          supabase.from('profiles').select('selected_pillars').eq('id', user.id).single(),
          supabase.from('launchpad_progress').select('step_2_profile_data, step_3_lifestyle_data').eq('user_id', user.id).maybeSingle(),
        ]);

        const library = libraryRes.data || [];
        if (library.length === 0) return;

        const selectedPillars = profileRes.data?.selected_pillars as Record<string, string[]> | null;
        const profileData = launchpadRes.data?.step_2_profile_data as Record<string, any> | null;
        const lifestyleData = launchpadRes.data?.step_3_lifestyle_data as Record<string, any> | null;

        // Collect all relevant pillars
        const allPillars = new Set<string>([
          ...(selectedPillars?.core || []),
          ...(selectedPillars?.arena || []),
        ]);
        // Also check lifestyle data for __selected_pillars
        if (lifestyleData?.__selected_pillars) {
          for (const p of lifestyleData.__selected_pillars) allPillars.add(p);
        }

        // Extract onboarding signals
        const exerciseTypes: string[] = profileData?.exercise_types || [];
        const willingToDo: string[] = profileData?.willing_to_do || [];
        const hobbies: string[] = profileData?.hobbies || [];

        const rows: PracticeRow[] = [];
        const addedIds = new Set<string>();

        const addPractice = (name: string, core: boolean, freq: number) => {
          const p = library.find(l => l.name === name);
          if (!p || addedIds.has(p.id)) return;
          addedIds.add(p.id);
          rows.push({
            user_id: user.id,
            practice_id: p.id,
            is_active: true,
            is_core_practice: core,
            energy_phase: p.energy_type || 'day',
            preferred_duration: p.default_duration || 15,
            frequency_per_week: freq,
            skill_level: 1,
          });
        };

        // 1) Pillar-matched practices (core)
        for (const practice of library) {
          if (allPillars.has(practice.pillar)) {
            addPractice(practice.name, true, practice.category === 'training' ? 5 : 7);
          }
        }

        // 2) Exercise types from onboarding
        for (const ex of exerciseTypes) {
          const names = EXERCISE_MAP[ex] || EXERCISE_MAP[ex.toLowerCase()] || [];
          for (const n of names) addPractice(n, false, 3);
        }

        // 3) Willing-to-do items
        for (const w of willingToDo) {
          const names = WILLINGNESS_MAP[w] || [];
          for (const n of names) addPractice(n, false, 5);
        }

        // 4) Hobbies
        for (const h of hobbies) {
          // Try direct match and keyword match
          const hLower = typeof h === 'string' ? h.toLowerCase() : '';
          for (const [keyword, names] of Object.entries(HOBBY_MAP)) {
            if (hLower.includes(keyword)) {
              for (const n of names) addPractice(n, false, 3);
            }
          }
        }

        // 5) Meditation experience → add meditation if user has experience
        if (profileData?.meditation_experience && profileData.meditation_experience !== 'never') {
          addPractice('Meditation', true, 7);
        }

        // 6) Always include fundamentals
        for (const f of FUNDAMENTALS) {
          addPractice(f, false, 7);
        }

        if (rows.length > 0) {
          const { error } = await supabase
            .from('user_practices')
            .upsert(rows, { onConflict: 'user_id,practice_id', ignoreDuplicates: true } as any);

          if (!error) {
            qc.invalidateQueries({ queryKey: ['user-practices'] });
            console.log(`[practices-bridge] Auto-populated ${rows.length} practices`);
          } else {
            console.error('[practices-bridge] Insert error:', error.message);
          }
        }
      } catch (err) {
        console.error('[practices-bridge] Error:', err);
      } finally {
        setIsPopulating(false);
      }
    })();
  }, [shouldRun, user?.id]);

  return { isPopulating };
}
