import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { handleError } from "@/lib/errorHandling";

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

// Send push notification via edge function
const sendPushNotification = async (userId: string, title: string, body: string, url?: string) => {
  try {
    await supabase.functions.invoke('push-notifications', {
      body: {
        action: 'send',
        user_id: userId,
        title,
        body,
        url: url || '/dashboard'
      }
    });
    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};

// Update badge on app icon (iOS 18+)
const updateAppBadge = (count: number) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'UPDATE_BADGE',
        count
      });
    });
  }
};

export const useUserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const newUnreadCount = (data || []).filter(n => !n.is_read).length;
      setNotifications(data || []);
      setUnreadCount(newUnreadCount);
      updateAppBadge(newUnreadCount);
    } catch (error) {
      handleError(error, "שגיאה בטעינת התראות", "useUserNotifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        updateAppBadge(newCount);
        return newCount;
      });
    } catch (error) {
      handleError(error, "שגיאה בסימון התראה כנקראה", "useUserNotifications");
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      updateAppBadge(0);
    } catch (error) {
      handleError(error, "שגיאה בסימון כל ההתראות כנקראות", "useUserNotifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Set up realtime subscription for new notifications
      const channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as UserNotification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => {
              const newCount = prev + 1;
              updateAppBadge(newCount);
              return newCount;
            });
            
            // Trigger push notification for ALL notification types
            // This sends push to the user's devices when they receive any notification
            if (user) {
              console.log('Sending push notification for:', newNotification.type, newNotification.title);
              sendPushNotification(
                user.id,
                newNotification.title,
                newNotification.message,
                newNotification.link || undefined
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
