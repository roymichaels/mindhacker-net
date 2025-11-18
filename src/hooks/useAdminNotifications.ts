import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type DbNotification = Database['public']['Tables']['admin_notifications']['Row'];

export interface AdminNotification {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  link: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  expires_at: string | null;
}

const convertDbToNotification = (dbNotif: DbNotification): AdminNotification => ({
  ...dbNotif,
  metadata: typeof dbNotif.metadata === 'object' && dbNotif.metadata !== null 
    ? dbNotif.metadata as Record<string, any>
    : {},
});

interface NotificationFilters {
  type?: string;
  priority?: string;
  is_read?: boolean;
  search?: string;
}

export const useAdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (filters?: NotificationFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filters?.type) {
        query = query.eq('type', filters.type as any);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority as any);
      }
      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const convertedData = (data || []).map(convertDbToNotification);
      setNotifications(convertedData);
      updateUnreadCount(convertedData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון הודעות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (notifs: AdminNotification[]) => {
    const count = notifs.filter(n => !n.is_read).length;
    setUnreadCount(count);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      toast({
        title: "הצלחה",
        description: "כל ההודעות סומנו כנקראו",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לסמן את כל ההודעות",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZGQ8MW6rn7Kp2GAo9l9ryxHgrBSR0xe/alUQMGGq77OWdKg8HUpbo7q9qHAREkNjzya5pGwpAdtD05YlCDBhru+7mnxwPCVWo5+6BIQED6D4AAAA=');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          const newNotification = convertDbToNotification(payload.new as DbNotification);
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast for high/urgent priority
          if (newNotification.priority === 'high' || newNotification.priority === 'urgent') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.priority === 'urgent' ? 'destructive' : 'default',
            });
            playNotificationSound();
          }

          // Request browser notification permission if not granted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
