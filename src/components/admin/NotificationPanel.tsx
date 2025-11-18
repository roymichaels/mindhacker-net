import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { AdminNotification } from "@/hooks/useAdminNotifications";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";

interface NotificationPanelProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-destructive text-destructive-foreground';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-blue-500 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'דחוף';
    case 'high': return 'גבוה';
    case 'medium': return 'בינוני';
    default: return 'נמוך';
  }
};

export const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}: NotificationPanelProps) => {
  const navigate = useNavigate();

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="w-[380px] sm:w-[420px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
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
            onClick={onMarkAllAsRead}
            className="gap-1 text-xs"
          >
            <CheckCheck className="h-3 w-3" />
            סמן הכל כנקרא
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">אין התראות חדשות</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 transition-colors cursor-pointer hover:bg-accent/50 ${
                  !notification.is_read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority Indicator */}
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    !notification.is_read ? getPriorityColor(notification.priority) : 'bg-muted'
                  }`} />

                  <div className="flex-1 min-w-0">
                    {/* Title and Priority Badge */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 ${getPriorityColor(notification.priority)}`}
                        >
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                      )}
                    </div>

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
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              navigate('/admin/notifications');
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
