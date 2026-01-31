import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { UserNotification } from "@/hooks/useUserNotifications";
import { Bell, ExternalLink, X, CheckCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserNotificationPanelProps {
  notifications: UserNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClose: () => void;
}

const getTypeConfig = (type: string) => {
  const configs: Record<string, { label: string; icon: string; color: string }> = {
    purchase_confirmed: { label: 'רכישה אושרה', icon: '🎉', color: 'text-emerald-400' },
    purchase_success: { label: 'רכישה הצליחה', icon: '🎉', color: 'text-emerald-400' },
    course_completed: { label: 'קורס הושלם', icon: '🎓', color: 'text-amber-400' },
    access_expiring: { label: 'גישה מסתיימת', icon: '⏰', color: 'text-orange-400' },
    new_content: { label: 'תוכן חדש', icon: '✨', color: 'text-purple-400' },
    subscription_renewed: { label: 'מנוי חודש', icon: '⭐', color: 'text-cyan-400' },
    subscription_expiring: { label: 'מנוי מסתיים', icon: '⚠️', color: 'text-orange-400' },
    subscription_activated: { label: 'מנוי הופעל', icon: '⭐', color: 'text-cyan-400' },
    welcome: { label: 'ברוך הבא', icon: '👋', color: 'text-primary' },
    reminder: { label: 'תזכורת', icon: '📢', color: 'text-blue-400' },
  };
  return configs[type] || { label: type, icon: '📌', color: 'text-muted-foreground' };
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
    <motion.div 
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-[calc(100vw-1rem)] max-w-sm rounded-xl overflow-hidden backdrop-blur-xl bg-card/80 border border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_40px_-12px_hsl(var(--primary)/0.3)]"
    >
      {/* Header - Compact */}
      <div className="relative px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative p-1.5 rounded-lg bg-primary/20">
              <Bell className="h-4 w-4 text-primary" />
              {unreadNotifications.length > 0 && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm">התראות</h3>
              {unreadNotifications.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                  {unreadNotifications.length}
                </span>
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
                className="h-7 px-2 text-[10px] gap-1 text-primary/80 hover:text-primary hover:bg-primary/10"
              >
                <CheckCheck className="h-3 w-3" />
                <span className="hidden xs:inline">סמן הכל</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List - Compact */}
      <ScrollArea className="h-[min(280px,calc(100vh-200px))]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="relative mb-3">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">אין התראות חדשות</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              נעדכן אותך כשיהיו חדשות
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1.5">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const config = getTypeConfig(notification.type);
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      relative p-2.5 rounded-lg transition-all cursor-pointer
                      bg-card/50 hover:bg-card/80
                      border border-border/30 hover:border-primary/30
                      active:scale-[0.98]
                      ${!notification.is_read ? 'border-primary/20' : 'opacity-70'}
                    `}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="text-lg flex-shrink-0">
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title + Unread indicator */}
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className={`text-xs font-semibold leading-tight truncate ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_4px_hsl(var(--primary))]" />
                          )}
                        </div>

                        {/* Message - 1 line max */}
                        <p className={`text-[10px] mb-1 line-clamp-1 leading-relaxed ${!notification.is_read ? 'text-foreground/60' : 'text-muted-foreground/60'}`}>
                          {notification.message}
                        </p>

                        {/* Footer: Time and Link */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground/50 font-medium">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: he,
                            })}
                          </span>
                          {notification.link && (
                            <ExternalLink className="h-2.5 w-2.5 text-primary/40" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      {/* Footer - Compact */}
      {notifications.length > 0 && (
        <div className="p-2 border-t border-border/30">
          <Button
            className="w-full h-9 text-xs font-semibold bg-primary/90 hover:bg-primary text-primary-foreground"
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
          >
            צפה בכל ההתראות
          </Button>
        </div>
      )}
    </motion.div>
  );
};
