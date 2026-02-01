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
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-8 w-8 text-muted-foreground/70 hover:text-foreground hover:bg-transparent ${isAnimating ? 'animate-bounce' : ''}`}
        >
          <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'text-primary' : ''}`} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] rounded-full animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
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
