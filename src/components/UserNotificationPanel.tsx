import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { UserNotification } from "@/hooks/useUserNotifications";
import { Bell, ExternalLink, X, CheckCheck, Sparkles } from "lucide-react";

interface UserNotificationPanelProps {
  notifications: UserNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
}

const getTypeConfig = (type: string) => {
  const configs: Record<string, { label: string; icon: string; gradient: string }> = {
    purchase_confirmed: { label: 'רכישה אושרה', icon: '🎉', gradient: 'from-emerald-500/20 to-green-500/10' },
    purchase_success: { label: 'רכישה הצליחה', icon: '🎉', gradient: 'from-emerald-500/20 to-green-500/10' },
    course_completed: { label: 'קורס הושלם', icon: '🎓', gradient: 'from-amber-500/20 to-yellow-500/10' },
    access_expiring: { label: 'גישה מסתיימת', icon: '⏰', gradient: 'from-orange-500/20 to-red-500/10' },
    new_content: { label: 'תוכן חדש', icon: '✨', gradient: 'from-purple-500/20 to-pink-500/10' },
    subscription_renewed: { label: 'מנוי חודש', icon: '⭐', gradient: 'from-cyan-500/20 to-blue-500/10' },
    subscription_expiring: { label: 'מנוי מסתיים', icon: '⚠️', gradient: 'from-orange-500/20 to-red-500/10' },
    subscription_activated: { label: 'מנוי הופעל', icon: '⭐', gradient: 'from-cyan-500/20 to-blue-500/10' },
    welcome: { label: 'ברוך הבא', icon: '👋', gradient: 'from-primary/20 to-accent/10' },
    reminder: { label: 'תזכורת', icon: '📢', gradient: 'from-blue-500/20 to-indigo-500/10' },
  };
  return configs[type] || { label: type, icon: '📌', gradient: 'from-muted/20 to-muted/10' };
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
    <div className="w-[min(360px,calc(100vw-1rem))] sm:w-[380px] rounded-2xl overflow-hidden bg-background/80 backdrop-blur-2xl border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_-12px_hsl(var(--primary)/0.3)]">
      {/* Header */}
      <div className="relative p-4 border-b border-primary/10 bg-gradient-to-br from-primary/10 via-transparent to-accent/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              {unreadNotifications.length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base">התראות</h3>
              {unreadNotifications.length > 0 && (
                <p className="text-xs text-muted-foreground">{unreadNotifications.length} חדשות</p>
              )}
            </div>
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
                className="text-xs h-8 px-2 gap-1 text-primary/80 hover:text-primary hover:bg-primary/10"
              >
                <CheckCheck className="h-3 w-3" />
                סמן הכל
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[min(320px,calc(100vh-220px))] sm:h-[360px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="relative mb-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/50" />
            </div>
            <p className="text-foreground font-medium">אין התראות חדשות</p>
            <p className="text-xs text-muted-foreground mt-1">
              נעדכן אותך כשיהיו חדשות
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {notifications.map((notification) => {
              const config = getTypeConfig(notification.type);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    relative p-3 rounded-xl transition-all cursor-pointer
                    bg-gradient-to-br ${config.gradient}
                    border border-border/30 hover:border-primary/30
                    hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:scale-[1.01]
                    active:scale-[0.99]
                    ${!notification.is_read ? 'ring-1 ring-primary/20' : 'opacity-75'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {config.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-semibold leading-tight ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 shadow-[0_0_6px_hsl(var(--primary))]" />
                        )}
                      </div>

                      {/* Message */}
                      <p className={`text-xs mb-2 line-clamp-2 leading-relaxed ${!notification.is_read ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>

                      {/* Footer: Time and Link */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: he,
                          })}
                        </span>
                        {notification.link && (
                          <div className="flex items-center gap-1 text-primary/60">
                            <span className="text-[10px]">צפה</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-primary/10 bg-gradient-to-t from-primary/5 to-transparent">
          <Button
            className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 border-0"
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
