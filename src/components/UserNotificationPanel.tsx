import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { UserNotification } from "@/hooks/useUserNotifications";
import { Bell, ExternalLink } from "lucide-react";

interface UserNotificationPanelProps {
  notifications: UserNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    purchase_confirmed: 'רכישה אושרה',
    purchase_success: 'רכישה הצליחה',
    course_completed: 'קורס הושלם',
    access_expiring: 'גישה מסתיימת',
    new_content: 'תוכן חדש',
    subscription_renewed: 'מנוי חודש',
    subscription_expiring: 'מנוי מסתיים',
    subscription_activated: 'מנוי הופעל',
    welcome: 'ברוך הבא',
    reminder: 'תזכורת',
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'purchase_confirmed':
    case 'purchase_success':
      return '🎉';
    case 'course_completed':
      return '🎓';
    case 'access_expiring':
      return '⏰';
    case 'new_content':
      return '✨';
    case 'subscription_renewed':
    case 'subscription_activated':
      return '⭐';
    case 'subscription_expiring':
      return '⚠️';
    case 'welcome':
      return '👋';
    case 'reminder':
      return '📢';
    default:
      return '📌';
  }
};

export const UserNotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: UserNotificationPanelProps) => {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: UserNotification) => {
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="w-[min(380px,calc(100vw-2rem))] sm:w-[min(420px,calc(100vw-2rem))] bg-background border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">התראות</h3>
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadNotifications.length}
            </Badge>
          )}
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
            className="text-xs"
          >
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px] bg-background">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-background">
            <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">אין התראות חדשות</p>
            <p className="text-xs text-muted-foreground mt-1">
              נעדכן אותך כשיהיו חדשות
            </p>
          </div>
        ) : (
          <div className="divide-y bg-background">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 transition-colors cursor-pointer hover:bg-accent/50 ${
                  !notification.is_read ? 'bg-accent/20' : 'bg-background'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>

                    {/* Type Badge */}
                    <Badge variant="outline" className="text-[10px] mb-2">
                      {getTypeLabel(notification.type)}
                    </Badge>

                    {/* Message */}
                    <p className={`text-xs mb-2 line-clamp-2 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.message}
                    </p>

                    {/* Footer: Time and Link */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: he,
                        })}
                      </span>
                      {notification.link && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t bg-background">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
          >
            צפה בכל ההתראות
          </Button>
        </div>
      )}
    </div>
  );
};
