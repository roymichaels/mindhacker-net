import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserNotifications } from "@/hooks/useUserNotifications";

export const UserNotificationBell = () => {
  const { unreadCount } = useUserNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => {
        // Navigate to notifications page when implemented
        console.log('Notifications clicked');
      }}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
