import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export const useUserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Mock notifications for demonstration
      // In production, fetch from a user_notifications table
      const mockNotifications: UserNotification[] = [
        {
          id: '1',
          type: 'new_content',
          title: 'תוכן חדש זמין!',
          message: 'הועלה קורס חדש שמתאים בדיוק בשבילך - "שיטות למידה מתקדמות"',
          link: '/courses',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: '2',
          type: 'course_completed',
          title: 'כל הכבוד! 🎉',
          message: 'סיימת בהצלחה את הקורס "יסודות הכירורגיה הנפשית". קיבלת תעודה דיגיטלית',
          link: '/dashboard',
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'access_expiring',
          title: 'הגישה שלך עומדת להסתיים',
          message: 'הגישה למנוי Premium שלך תסתיים בעוד 7 ימים. חדש כדי להמשיך ליהנות',
          link: '/subscriptions',
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
  };
};
