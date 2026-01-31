import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Reminder {
  id: string;
  user_id: string;
  message: string;
  reminder_date: string;
  context: string | null;
  source: string;
  is_delivered: boolean;
  delivered_at: string | null;
  created_at: string;
}

interface UseAuroraRemindersResult {
  reminders: Reminder[];
  todayReminders: Reminder[];
  loading: boolean;
  createReminder: (message: string, date: string, context?: string) => Promise<boolean>;
  markDelivered: (reminderId: string) => Promise<boolean>;
  deleteReminder: (reminderId: string) => Promise<boolean>;
}

/**
 * Hook for managing Aurora reminders.
 * Reminders are created through chat tags like [reminder:set:message:YYYY-MM-DD]
 */
export const useAuroraReminders = (user: User | null): UseAuroraRemindersResult => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    if (!user?.id) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('aurora_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('Failed to fetch reminders:', error);
        return;
      }

      setReminders(data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReminders();

    // Subscribe to changes
    if (user?.id) {
      const channel = supabase
        .channel('aurora-reminders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'aurora_reminders',
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchReminders()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchReminders]);

  // Create a new reminder
  const createReminder = useCallback(async (
    message: string,
    date: string,
    context?: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_reminders')
        .insert({
          user_id: user.id,
          message,
          reminder_date: date,
          context: context || null,
          source: 'aurora',
          is_delivered: false,
        });

      if (error) {
        console.error('Failed to create reminder:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error creating reminder:', err);
      return false;
    }
  }, [user?.id]);

  // Mark reminder as delivered
  const markDelivered = useCallback(async (reminderId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_reminders')
        .update({
          is_delivered: true,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to mark reminder as delivered:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error marking reminder:', err);
      return false;
    }
  }, [user?.id]);

  // Delete a reminder
  const deleteReminder = useCallback(async (reminderId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('aurora_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete reminder:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error deleting reminder:', err);
      return false;
    }
  }, [user?.id]);

  // Filter for today's reminders (pending only)
  const todayReminders = reminders.filter(
    r => r.reminder_date <= today && !r.is_delivered
  );

  return {
    reminders,
    todayReminders,
    loading,
    createReminder,
    markDelivered,
    deleteReminder,
  };
};
