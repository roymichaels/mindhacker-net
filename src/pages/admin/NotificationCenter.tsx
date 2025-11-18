import { useState } from "react";
import { useAdminNotifications, AdminNotification } from "@/hooks/useAdminNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Search,
  Filter,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    new_user: 'משתמש חדש',
    new_purchase: 'רכישה',
    new_subscription: 'מנוי חדש',
    subscription_cancelled: 'ביטול מנוי',
    new_enrollment: 'הרשמה',
    course_completed: 'קורס הושלם',
    new_review: 'ביקורת',
    high_value_purchase: 'רכישה גבוהה',
    payment_failed: 'תשלום נכשל',
    content_uploaded: 'תוכן חדש',
  };
  return labels[type] || type;
};

const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useAdminNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleSearch = () => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (selectedType !== "all") filters.type = selectedType;
    if (selectedPriority !== "all") filters.priority = selectedPriority;
    if (activeTab === "unread") filters.is_read = false;
    if (activeTab === "read") filters.is_read = true;
    fetchNotifications(filters);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread" && n.is_read) return false;
    if (activeTab === "read" && !n.is_read) return false;
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-glow flex items-center gap-2">
            <Bell className="h-8 w-8" />
            מרכז התראות
          </h1>
          <p className="text-muted-foreground mt-1">
            נהל את כל ההתראות שלך במקום אחד
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="h-4 w-4" />
            סמן הכל כנקרא ({unreadCount})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">סה"כ התראות</div>
          <div className="text-2xl font-bold mt-1">{notifications.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">לא נקראו</div>
          <div className="text-2xl font-bold mt-1 text-primary">{unreadCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">התראות דחופות</div>
          <div className="text-2xl font-bold mt-1 text-destructive">
            {notifications.filter(n => n.priority === 'urgent' && !n.is_read).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">היום</div>
          <div className="text-2xl font-bold mt-1">
            {notifications.filter(n => {
              const today = new Date();
              const notifDate = new Date(n.created_at);
              return notifDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">סינון</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-9"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="סוג התראה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים</SelectItem>
              <SelectItem value="new_user">משתמש חדש</SelectItem>
              <SelectItem value="new_purchase">רכישה</SelectItem>
              <SelectItem value="new_subscription">מנוי חדש</SelectItem>
              <SelectItem value="subscription_cancelled">ביטול מנוי</SelectItem>
              <SelectItem value="new_review">ביקורת</SelectItem>
              <SelectItem value="payment_failed">תשלום נכשל</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העדיפויות</SelectItem>
              <SelectItem value="urgent">דחוף</SelectItem>
              <SelectItem value="high">גבוה</SelectItem>
              <SelectItem value="medium">בינוני</SelectItem>
              <SelectItem value="low">נמוך</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            חפש
          </Button>
        </div>
      </Card>

      {/* Notifications List */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">הכל ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">לא נקראו ({unreadCount})</TabsTrigger>
          <TabsTrigger value="read">נקראו ({notifications.length - unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">טוען...</div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">אין התראות להצגה</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-accent/50 ${
                        !notification.is_read ? 'bg-accent/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Priority Indicator */}
                        <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          getPriorityColor(notification.priority)
                        }`} />

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {getPriorityLabel(notification.priority)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {notification.link && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Message */}
                          <p className={`text-sm mb-2 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.message}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: he,
                              })}
                            </span>
                            {!notification.is_read && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => markAsRead(notification.id)}
                              >
                                סמן כנקרא
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
