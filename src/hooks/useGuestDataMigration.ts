import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

const STORAGE_PREFIX = 'guest_launchpad_';
const MIGRATE_FLAG = 'migrate_guest_launchpad';

/**
 * Migrates guest launchpad data from localStorage to the authenticated user's
 * database record after signup. Runs once when the flag is detected.
 */
export function useGuestDataMigration() {
  const { user } = useAuth();
  const migrationAttempted = useRef(false);

  useEffect(() => {
    if (!user?.id || migrationAttempted.current) return;

    const shouldMigrate = localStorage.getItem(MIGRATE_FLAG);
    if (!shouldMigrate) return;

    migrationAttempted.current = true;
    migrateGuestData(user.id);
  }, [user?.id]);
}

async function migrateGuestData(userId: string) {
  try {
    // Read guest progress from localStorage
    const stored = localStorage.getItem(`${STORAGE_PREFIX}progress`);
    if (!stored) {
      localStorage.removeItem(MIGRATE_FLAG);
      return;
    }

    const guestProgress = JSON.parse(stored);
    if (!guestProgress || guestProgress.current_step <= 1) {
      localStorage.removeItem(MIGRATE_FLAG);
      return;
    }

    // Build the update payload from guest data
    const updatePayload: Record<string, unknown> = {
      current_step: guestProgress.current_step || 1,
      updated_at: new Date().toISOString(),
    };

    // Step 1: Welcome
    if (guestProgress.step_1_intention) {
      updatePayload.step_1_welcome = true;
      updatePayload.step_1_intention = typeof guestProgress.step_1_intention === 'string'
        ? guestProgress.step_1_intention
        : JSON.stringify(guestProgress.step_1_intention);
      updatePayload.step_1_completed_at = new Date().toISOString();
    }

    // Step 2: Personal Profile
    if (guestProgress.step_2_profile_data) {
      updatePayload.step_2_profile = true;
      updatePayload.step_2_profile_data = guestProgress.step_2_profile_data as Json;
      updatePayload.step_2_profile_completed_at = new Date().toISOString();
    }

    // Step 3: Lifestyle Routine
    if (guestProgress.step_3_lifestyle_data) {
      updatePayload.step_3_lifestyle_data = guestProgress.step_3_lifestyle_data as Json;
      updatePayload.step_3_lifestyle_completed_at = new Date().toISOString();
    }

    // Step 4: Growth Deep Dive (merged into profile_data)
    if (guestProgress.step_4_growth_data) {
      const existingProfile = (updatePayload.step_2_profile_data as Record<string, unknown>) || {};
      updatePayload.step_2_profile_data = {
        ...existingProfile,
        deep_dive: guestProgress.step_4_growth_data,
      } as Json;
    }

    // Step 5: First Chat
    if (guestProgress.step_5_chat_summary) {
      updatePayload.step_2_first_chat = true;
      updatePayload.step_2_summary = typeof guestProgress.step_5_chat_summary === 'string'
        ? guestProgress.step_5_chat_summary
        : JSON.stringify(guestProgress.step_5_chat_summary);
      updatePayload.step_2_completed_at = new Date().toISOString();
    }

    // Step 6: Introspection
    if (guestProgress.step_6_introspection_data) {
      updatePayload.step_3_introspection = true;
      updatePayload.step_3_completed_at = new Date().toISOString();
    }

    // Step 7: Life Plan
    if (guestProgress.step_7_life_plan_data) {
      updatePayload.step_4_life_plan = true;
      updatePayload.step_4_completed_at = new Date().toISOString();
    }

    // Step 8: Focus Areas
    if (guestProgress.step_8_focus_areas?.length > 0) {
      updatePayload.step_5_focus_areas = true;
      updatePayload.step_5_focus_areas_selected = guestProgress.step_8_focus_areas;
      updatePayload.step_5_completed_at = new Date().toISOString();
    }

    // Step 9: First Week
    if (guestProgress.step_9_first_week_actions) {
      updatePayload.step_6_first_week = true;
      updatePayload.step_6_completed_at = new Date().toISOString();
    }

    // Step 10: Final Notes
    if (guestProgress.step_10_final_notes) {
      updatePayload.step_10_final_notes = guestProgress.step_10_final_notes;
      updatePayload.step_10_completed_at = new Date().toISOString();
    }

    // Step 11: Complete
    if (guestProgress.launchpad_complete) {
      updatePayload.step_7_dashboard_activated = true;
      updatePayload.step_7_completed_at = new Date().toISOString();
      updatePayload.launchpad_complete = true;
      updatePayload.completed_at = guestProgress.completed_at || new Date().toISOString();
    }

    // Upsert the launchpad_progress record
    const { error: upsertError } = await supabase
      .from('launchpad_progress')
      .upsert({
        user_id: userId,
        ...updatePayload,
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Guest migration upsert failed:', upsertError);
      return;
    }

    // Also migrate the AI summary result if it exists
    const resultStored = localStorage.getItem('guest_launchpad_result');
    if (resultStored && guestProgress.launchpad_complete) {
      try {
        const result = JSON.parse(resultStored);
        // Store summary in aurora tables if available
        if (result?.summary) {
          await migrateAISummary(userId, result.summary);
        }
      } catch {
        // Non-critical, continue
      }
    }

    // Clean up localStorage
    cleanupGuestData();

    toast.success('הנתונים מהמסע שלך נשמרו בהצלחה! 🎉', {
      description: 'כל ההתקדמות שלך הועברה לחשבון החדש',
    });

  } catch (error) {
    console.error('Guest data migration failed:', error);
    // Don't block the user - clear the flag so it doesn't retry infinitely
    localStorage.removeItem(MIGRATE_FLAG);
  }
}

async function migrateAISummary(userId: string, summary: Record<string, unknown>) {
  try {
    // Populate aurora_onboarding_progress
    await supabase.from('aurora_onboarding_progress').upsert({
      user_id: userId,
      onboarding_complete: true,
      direction_clarity: 'exploring',
      identity_understanding: 'exploring',
      energy_patterns_status: 'exploring',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Store life direction if available
    if (summary.life_direction || summary.identity_profile) {
      const directionContent = JSON.stringify({
        identity_profile: summary.identity_profile,
        life_direction: summary.life_direction,
        consciousness_analysis: summary.consciousness_analysis,
      });

      // Check if record exists first (no unique constraint on user_id)
      const { data: existing } = await supabase
        .from('aurora_life_direction')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase.from('aurora_life_direction').update({
          content: directionContent,
          clarity_score: 5,
          updated_at: new Date().toISOString(),
        }).eq('user_id', userId);
      } else {
        await supabase.from('aurora_life_direction').insert({
          user_id: userId,
          content: directionContent,
          clarity_score: 5,
        });
      }
    }
  } catch (error) {
    console.error('AI summary migration failed:', error);
  }
}

function cleanupGuestData() {
  localStorage.removeItem(MIGRATE_FLAG);
  
  const keysToRemove = [
    `${STORAGE_PREFIX}progress`,
    `${STORAGE_PREFIX}introspection`,
    `${STORAGE_PREFIX}life_plan`,
    'guest_launchpad_result',
  ];
  
  for (let step = 1; step <= 11; step++) {
    keysToRemove.push(`${STORAGE_PREFIX}step_${step}`);
  }
  
  keysToRemove.push(
    `${STORAGE_PREFIX}personal_profile`,
    `${STORAGE_PREFIX}lifestyle_routine`,
    `${STORAGE_PREFIX}first_week`,
    `${STORAGE_PREFIX}final_notes`,
  );
  
  keysToRemove.forEach(key => {
    try { localStorage.removeItem(key); } catch {}
  });
}
