import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserNotificationPanel } from "./UserNotificationPanel";
import { useUserNotifications } from "@/hooks/useUserNotifications";

export const UserNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useUserNotifications();

  // Mark all as read when popover opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Animate bell when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`relative h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center hover:scale-110 transition-transform ${isAnimating ? 'animate-bounce' : ''}`}
        >
          <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-amber-600 dark:text-amber-400'}`} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] rounded-full animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-96 p-0"
        dir="rtl"
        avoidCollisions={true}
        collisionPadding={{ right: 16, left: 16 }}
      >
        <UserNotificationPanel
          notifications={notifications.slice(0, 10)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
};
