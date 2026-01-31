import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { UserNotification } from "@/hooks/useUserNotifications";
import { Bell, ExternalLink, X } from "lucide-react";

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
    <div className="w-[min(360px,calc(100vw-1rem))] sm:w-[380px] rounded-xl overflow-hidden bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base">התראות</h3>
          {unreadNotifications.length > 0 && (
            <Badge className="rounded-full bg-primary text-primary-foreground text-xs px-2">
              {unreadNotifications.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAllAsRead();
              }}
              className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              סמן הכל
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground sm:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[min(350px,calc(100vh-200px))] sm:h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Bell className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">אין התראות חדשות</p>
            <p className="text-xs text-muted-foreground mt-1">
              נעדכן אותך כשיהיו חדשות
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 sm:p-4 transition-all cursor-pointer hover:bg-accent/50 active:scale-[0.99] ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-xl sm:text-2xl flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title and Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-medium leading-tight ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1 animate-pulse" />
                      )}
                    </div>

                    {/* Type Badge */}
                    <Badge variant="outline" className="text-[10px] mb-1.5 border-primary/30 text-primary/80">
                      {getTypeLabel(notification.type)}
                    </Badge>

                    {/* Message */}
                    <p className={`text-xs mb-1.5 line-clamp-2 leading-relaxed ${!notification.is_read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
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
                        <ExternalLink className="h-3 w-3 text-primary/60" />
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
        <div className="p-2 sm:p-3 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full text-sm h-10 bg-primary/10 hover:bg-primary/20 text-primary font-medium"
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
