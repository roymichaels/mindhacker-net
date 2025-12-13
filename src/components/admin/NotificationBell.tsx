import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPanel } from "./NotificationPanel";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  // Request notification permission on mount (only if API is available)
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-9 w-9 ${isAnimating ? 'animate-bounce' : ''}`}
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary' : ''}`} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="p-0 w-auto"
        dir="rtl"
      >
        <NotificationPanel
          notifications={notifications.slice(0, 10)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};
