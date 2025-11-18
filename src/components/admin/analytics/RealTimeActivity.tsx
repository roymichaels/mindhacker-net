import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  ShoppingCart,
  BookOpen,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface RealtimeEnrollment {
  id: string;
  user_id: string;
  product_id: string;
  enrolled_at: string;
  profiles?: { full_name: string };
  content_products?: { title: string; price: number };
}

interface RealtimePurchase {
  id: string;
  user_id: string;
  product_id: string;
  price_paid: number;
  purchase_date: string;
  payment_status: string;
  profiles?: { full_name: string };
  content_products?: { title: string };
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'purchase' | 'user_join';
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: string;
  icon: any;
  color: string;
}

interface PresenceState {
  [key: string]: Array<{
    user_id: string;
    online_at: string;
  }>;
}

export const RealTimeActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [realtimeStats, setRealtimeStats] = useState({
    enrollmentsToday: 0,
    purchasesToday: 0,
    revenueToday: 0,
  });

  useEffect(() => {
    // Initial data fetch
    fetchTodayStats();
    fetchRecentActivities();

    // Set up realtime subscription for enrollments
    const enrollmentsChannel = supabase
      .channel('schema-db-changes-enrollments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'course_enrollments'
        },
        async (payload) => {
          const enrollment = payload.new as RealtimeEnrollment;
          
          // Fetch related data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', enrollment.user_id)
            .single();

          const { data: productData } = await supabase
            .from('content_products')
            .select('title')
            .eq('id', enrollment.product_id)
            .single();

          const newActivity: ActivityItem = {
            id: enrollment.id,
            type: 'enrollment',
            title: `${profileData?.full_name || 'משתמש'} נרשם לקורס`,
            subtitle: productData?.title || 'קורס',
            timestamp: enrollment.enrolled_at,
            icon: BookOpen,
            color: 'text-primary',
          };

          setActivities(prev => [newActivity, ...prev].slice(0, 20));
          setRealtimeStats(prev => ({
            ...prev,
            enrollmentsToday: prev.enrollmentsToday + 1,
          }));
        }
      )
      .subscribe();

    // Set up realtime subscription for purchases
    const purchasesChannel = supabase
      .channel('schema-db-changes-purchases')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'content_purchases'
        },
        async (payload) => {
          const purchase = payload.new as RealtimePurchase;

          // Fetch related data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', purchase.user_id)
            .single();

          const { data: productData } = await supabase
            .from('content_products')
            .select('title')
            .eq('id', purchase.product_id)
            .single();

          const newActivity: ActivityItem = {
            id: purchase.id,
            type: 'purchase',
            title: `${profileData?.full_name || 'משתמש'} רכש קורס`,
            subtitle: productData?.title || 'קורס',
            amount: purchase.price_paid,
            timestamp: purchase.purchase_date,
            icon: ShoppingCart,
            color: 'text-accent',
          };

          setActivities(prev => [newActivity, ...prev].slice(0, 20));
          setRealtimeStats(prev => ({
            ...prev,
            purchasesToday: prev.purchasesToday + 1,
            revenueToday: prev.revenueToday + purchase.price_paid,
          }));
        }
      )
      .subscribe();

    // Set up presence tracking for active users
    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: 'online-users',
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState() as PresenceState;
        const users = Object.values(state).flat();
        setActiveUsers(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newActivity: ActivityItem = {
          id: `join-${Date.now()}`,
          type: 'user_join',
          title: 'משתמש חדש התחבר',
          subtitle: 'פעיל כעת בפלטפורמה',
          timestamp: new Date().toISOString(),
          icon: Users,
          color: 'text-muted-foreground',
        };
        setActivities(prev => [newActivity, ...prev].slice(0, 20));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            user_id: 'admin',
          });
        }
      });

    // Cleanup
    return () => {
      supabase.removeChannel(enrollmentsChannel);
      supabase.removeChannel(purchasesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  const fetchTodayStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Enrollments today
    const { count: enrollments } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('enrolled_at', today.toISOString());

    // Purchases today
    const { data: purchases } = await supabase
      .from('content_purchases')
      .select('price_paid')
      .eq('payment_status', 'completed')
      .gte('purchase_date', today.toISOString());

    const revenue = purchases?.reduce((sum, p) => sum + Number(p.price_paid), 0) || 0;

    setRealtimeStats({
      enrollmentsToday: enrollments || 0,
      purchasesToday: purchases?.length || 0,
      revenueToday: revenue,
    });
  };

  const fetchRecentActivities = async () => {
    // Fetch recent enrollments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        user_id,
        enrolled_at,
        profiles(full_name),
        content_products(title)
      `)
      .order('enrolled_at', { ascending: false })
      .limit(10);

    // Fetch recent purchases
    const { data: purchases } = await supabase
      .from('content_purchases')
      .select(`
        id,
        user_id,
        price_paid,
        purchase_date,
        profiles(full_name),
        content_products(title)
      `)
      .order('purchase_date', { ascending: false })
      .limit(10);

    const enrollmentActivities: ActivityItem[] = (enrollments || []).map(e => ({
      id: e.id,
      type: 'enrollment' as const,
      title: `${(e.profiles as any)?.full_name || 'משתמש'} נרשם לקורס`,
      subtitle: (e.content_products as any)?.title || 'קורס',
      timestamp: e.enrolled_at || '',
      icon: BookOpen,
      color: 'text-primary',
    }));

    const purchaseActivities: ActivityItem[] = (purchases || []).map(p => ({
      id: p.id,
      type: 'purchase' as const,
      title: `${(p.profiles as any)?.full_name || 'משתמש'} רכש קורס`,
      subtitle: (p.content_products as any)?.title || 'קורס',
      amount: p.price_paid,
      timestamp: p.purchase_date || '',
      icon: ShoppingCart,
      color: 'text-accent',
    }));

    const allActivities = [...enrollmentActivities, ...purchaseActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    setActivities(allActivities);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm", { locale: he });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משתמשים פעילים</CardTitle>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <Activity className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">מחוברים כעת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הרשמות היום</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.enrollmentsToday}</div>
            <p className="text-xs text-muted-foreground">הרשמות חדשות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רכישות היום</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtimeStats.purchasesToday}</div>
            <p className="text-xs text-muted-foreground">רכישות חדשות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הכנסות היום</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{realtimeStats.revenueToday.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">סך הכנסות</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>פעילות חיה</CardTitle>
              <CardDescription>עדכונים בזמן אמת מהפלטפורמה</CardDescription>
            </div>
            <Badge variant="outline" className="gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span>Live</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  ממתין לפעילות חיה...
                </p>
              </div>
            ) : (
              activities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-background ${activity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.subtitle}
                          </p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                          {activity.amount && (
                            <Badge variant="secondary" className="text-xs">
                              ₪{activity.amount.toFixed(0)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
