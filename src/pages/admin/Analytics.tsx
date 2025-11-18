import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award,
  BookOpen,
  Activity
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { format, startOfMonth, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementMetrics } from "@/components/admin/analytics/EngagementMetrics";

interface AnalyticsStats {
  totalEnrollments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  avgCompletionRate: number;
}

interface PopularCourse {
  title: string;
  enrollments: number;
  revenue: number;
}

interface MonthlyData {
  month: string;
  enrollments: number;
  revenue: number;
  completions: number;
}

interface RecentActivity {
  id: string;
  type: string;
  user_name: string;
  course_title: string;
  created_at: string;
}

interface CourseCompletion {
  course_title: string;
  total_enrolled: number;
  completed: number;
  completion_rate: number;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats>({
    totalEnrollments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    avgCompletionRate: 0,
  });
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch total enrollments
      const { count: enrollmentCount } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true });

      // Fetch course purchase revenue
      const { data: purchases } = await supabase
        .from("content_purchases")
        .select("price_paid")
        .eq("payment_status", "completed");

      // Fetch subscription revenue
      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("tier_id, subscription_tiers(price_monthly)")
        .eq("status", "active");

      // Fetch active subscriptions count
      const { count: activeSubCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Calculate total revenue
      const purchaseRevenue = purchases?.reduce((sum, p) => sum + Number(p.price_paid), 0) || 0;
      const subscriptionRevenue = subscriptions?.reduce(
        (sum, s: any) => sum + Number(s.subscription_tiers?.price_monthly || 0),
        0
      ) || 0;

      // Fetch completion rate
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("is_completed");
      
      const completedCount = enrollments?.filter(e => e.is_completed).length || 0;
      const avgCompletion = enrollments?.length 
        ? (completedCount / enrollments.length) * 100 
        : 0;

      // Fetch popular courses
      const { data: coursesData } = await supabase
        .from("content_products")
        .select(`
          id,
          title,
          enrollment_count,
          content_purchases(price_paid)
        `)
        .order("enrollment_count", { ascending: false })
        .limit(5);

      const popular = coursesData?.map(course => ({
        title: course.title,
        enrollments: course.enrollment_count || 0,
        revenue: (course.content_purchases as any[])?.reduce(
          (sum, p) => sum + Number(p.price_paid), 
          0
        ) || 0,
      })) || [];

      // Fetch monthly trends (last 6 months)
      const monthlyTrends = await fetchMonthlyTrends();

      // Fetch recent activity
      const { data: recentEnrollments } = await supabase
        .from("course_enrollments")
        .select(`
          id,
          enrolled_at,
          profiles(full_name),
          content_products(title)
        `)
        .order("enrolled_at", { ascending: false })
        .limit(10);

      const activity = recentEnrollments?.map(e => ({
        id: e.id,
        type: "enrollment",
        user_name: (e.profiles as any)?.full_name || "Unknown",
        course_title: (e.content_products as any)?.title || "Unknown",
        created_at: e.enrolled_at || "",
      })) || [];

      // Fetch course completion rates
      const { data: completionData } = await supabase
        .from("course_enrollments")
        .select(`
          product_id,
          is_completed,
          content_products(title)
        `);

      const completionByProduct = completionData?.reduce((acc: any, curr) => {
        const productId = curr.product_id;
        const title = (curr.content_products as any)?.title || "Unknown";
        
        if (!acc[productId]) {
          acc[productId] = {
            course_title: title,
            total_enrolled: 0,
            completed: 0,
          };
        }
        
        acc[productId].total_enrolled += 1;
        if (curr.is_completed) {
          acc[productId].completed += 1;
        }
        
        return acc;
      }, {});

      const completions = Object.values(completionByProduct || {}).map((c: any) => ({
        ...c,
        completion_rate: c.total_enrolled > 0 
          ? (c.completed / c.total_enrolled) * 100 
          : 0,
      })) as CourseCompletion[];

      setStats({
        totalEnrollments: enrollmentCount || 0,
        totalRevenue: purchaseRevenue + subscriptionRevenue,
        activeSubscriptions: activeSubCount || 0,
        avgCompletionRate: avgCompletion,
      });
      setPopularCourses(popular);
      setMonthlyData(monthlyTrends);
      setRecentActivity(activity);
      setCourseCompletions(completions);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyTrends = async () => {
    const months: MonthlyData[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));

      // Enrollments
      const { count: enrollments } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true })
        .gte("enrolled_at", monthStart.toISOString())
        .lt("enrolled_at", monthEnd.toISOString());

      // Revenue
      const { data: purchases } = await supabase
        .from("content_purchases")
        .select("price_paid")
        .gte("purchase_date", monthStart.toISOString())
        .lt("purchase_date", monthEnd.toISOString());

      const revenue = purchases?.reduce((sum, p) => sum + Number(p.price_paid), 0) || 0;

      // Completions
      const { count: completions } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true })
        .eq("is_completed", true)
        .gte("completed_at", monthStart.toISOString())
        .lt("completed_at", monthEnd.toISOString());

      months.push({
        month: format(date, "MMM yyyy"),
        enrollments: enrollments || 0,
        revenue: revenue,
        completions: completions || 0,
      });
    }

    return months;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">ניתוח נתונים</h1>
        <p className="text-muted-foreground">סקירה כללית של פעילות הפלטפורמה</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הרשמות לקורסים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">סך כל ההרשמות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכנסות</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪{stats.totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">מקורסים ומנויים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">מנויים פעילים</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">מנויים פעילים כעת</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אחוז השלמת קורסים</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">ממוצע השלמות</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">מגמות חודשיות</TabsTrigger>
          <TabsTrigger value="engagement">מעורבות משתמשים</TabsTrigger>
          <TabsTrigger value="courses">קורסים פופולריים</TabsTrigger>
          <TabsTrigger value="completions">שיעורי השלמה</TabsTrigger>
          <TabsTrigger value="activity">פעילות אחרונה</TabsTrigger>
        </TabsList>

        {/* Monthly Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>הרשמות והשלמות חודשיות</CardTitle>
                <CardDescription>מגמות לאורך 6 חודשים אחרונים</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="enrollments" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="הרשמות"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="השלמות"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הכנסות חודשיות</CardTitle>
                <CardDescription>מעקב הכנסות לאורך זמן</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      formatter={(value: number) => `₪${value.toFixed(0)}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="הכנסות"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Metrics */}
        <TabsContent value="engagement">
          <EngagementMetrics />
        </TabsContent>

        {/* Popular Courses */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>הקורסים הפופולריים ביותר</CardTitle>
              <CardDescription>מדורג לפי מספר הרשמות</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={popularCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    stroke="hsl(var(--muted-foreground))"
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="enrollments" 
                    fill="hsl(var(--primary))"
                    name="הרשמות"
                    radius={[0, 8, 8, 0]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--accent))"
                    name="הכנסות (₪)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Course Completions */}
        <TabsContent value="completions">
          <Card>
            <CardHeader>
              <CardTitle>שיעורי השלמת קורסים</CardTitle>
              <CardDescription>אחוז השלמה לפי קורס</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseCompletions.map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{course.course_title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {course.completed}/{course.total_enrolled} ({course.completion_rate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${course.completion_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
                {courseCompletions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    אין נתוני השלמות זמינים
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>פעילות אחרונה</CardTitle>
              <CardDescription>הרשמות אחרונות לקורסים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <Activity className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.user_name} נרשם/ה לקורס
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.course_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString("he-IL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    אין פעילות אחרונה
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
