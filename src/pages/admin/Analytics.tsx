import { useEffect, useState, useCallback } from "react";
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
import { format, startOfMonth, subMonths, subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EngagementMetrics } from "@/components/admin/analytics/EngagementMetrics";
import { RealTimeActivity } from "@/components/admin/analytics/RealTimeActivity";
import ConversionMetrics from "@/components/admin/analytics/ConversionMetrics";
import PagePerformance from "@/components/admin/analytics/PagePerformance";
import UserJourney from "@/components/admin/analytics/UserJourney";
import DateRangePicker, { DateRange } from "@/components/admin/analytics/DateRangePicker";
import { useTranslation } from "@/hooks/useTranslation";
import { getCurrencySymbol } from "@/lib/currency";
import { toast } from "sonner";

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
  const [dateRange, setDateRange] = useState<DateRange>("30d");
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
  const { t, isRTL, language } = useTranslation();

  const locale = language === 'he' ? 'he-IL' : 'en-US';

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchAnalytics();
    toast.success("נתונים עודכנו");
  }, []);

  const handleExport = useCallback((format: "csv" | "pdf") => {
    toast.success(`ייצוא ל-${format.toUpperCase()} יתחיל בקרוב`);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { count: enrollmentCount } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true });

      const { data: purchases } = await supabase
        .from("content_purchases")
        .select("price_paid")
        .eq("payment_status", "completed");

      const { data: subscriptions } = await supabase
        .from("user_subscriptions")
        .select("tier_id, subscription_tiers(price_monthly)")
        .eq("status", "active");

      const { count: activeSubCount } = await supabase
        .from("user_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const purchaseRevenue = purchases?.reduce((sum, p) => sum + Number(p.price_paid), 0) || 0;
      const subscriptionRevenue = subscriptions?.reduce(
        (sum, s: any) => sum + Number(s.subscription_tiers?.price_monthly || 0),
        0
      ) || 0;

      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("is_completed");
      
      const completedCount = enrollments?.filter(e => e.is_completed).length || 0;
      const avgCompletion = enrollments?.length 
        ? (completedCount / enrollments.length) * 100 
        : 0;

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

      const monthlyTrends = await fetchMonthlyTrends();

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
        user_name: (e.profiles as any)?.full_name || t('common.unknown'),
        course_title: (e.content_products as any)?.title || t('common.unknown'),
        created_at: e.enrolled_at || "",
      })) || [];

      const { data: completionData } = await supabase
        .from("course_enrollments")
        .select(`
          product_id,
          is_completed,
          content_products(title)
        `);

      const completionByProduct = completionData?.reduce((acc: any, curr) => {
        const productId = curr.product_id;
        const title = (curr.content_products as any)?.title || t('common.unknown');
        
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

      const { count: enrollments } = await supabase
        .from("course_enrollments")
        .select("*", { count: "exact", head: true })
        .gte("enrolled_at", monthStart.toISOString())
        .lt("enrolled_at", monthEnd.toISOString());

      const { data: purchases } = await supabase
        .from("content_purchases")
        .select("price_paid")
        .gte("purchase_date", monthStart.toISOString())
        .lt("purchase_date", monthEnd.toISOString());

      const revenue = purchases?.reduce((sum, p) => sum + Number(p.price_paid), 0) || 0;

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
    <div className="space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('adminAnalytics.pageTitle')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('adminAnalytics.pageSubtitle')}</p>
        </div>
        <DateRangePicker
          selectedRange={dateRange}
          onRangeChange={setDateRange}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isLoading={loading}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminAnalytics.totalEnrollments')}</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t('adminAnalytics.totalEnrollmentsDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminAnalytics.totalRevenue')}</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{getCurrencySymbol(language)}{stats.totalRevenue.toFixed(0)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t('adminAnalytics.totalRevenueDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminAnalytics.activeSubscriptions')}</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t('adminAnalytics.activeSubscriptionsDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('adminAnalytics.completionRate')}</CardTitle>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.avgCompletionRate.toFixed(1)}%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{t('adminAnalytics.completionRateDesc')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="conversions" className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex min-w-full sm:w-auto">
            <TabsTrigger value="conversions" className="text-xs sm:text-sm whitespace-nowrap">המרות</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs sm:text-sm whitespace-nowrap">ביצועים</TabsTrigger>
            <TabsTrigger value="journey" className="text-xs sm:text-sm whitespace-nowrap">מסע משתמש</TabsTrigger>
            <TabsTrigger value="realtime" className="text-xs sm:text-sm whitespace-nowrap">{t('adminAnalytics.tabRealtime')}</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm whitespace-nowrap">{t('adminAnalytics.tabTrends')}</TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs sm:text-sm whitespace-nowrap">{t('adminAnalytics.tabEngagement')}</TabsTrigger>
            <TabsTrigger value="courses" className="text-xs sm:text-sm whitespace-nowrap">{t('adminAnalytics.tabCourses')}</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">{t('adminAnalytics.tabActivity')}</TabsTrigger>
          </TabsList>
        </div>

        {/* Conversion Metrics */}
        <TabsContent value="conversions">
          <ConversionMetrics />
        </TabsContent>

        {/* Page Performance */}
        <TabsContent value="performance">
          <PagePerformance />
        </TabsContent>

        {/* User Journey */}
        <TabsContent value="journey">
          <UserJourney />
        </TabsContent>

        {/* Real-Time Activity */}
        <TabsContent value="realtime">
          <RealTimeActivity />
        </TabsContent>

        {/* Monthly Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('adminAnalytics.monthlyEnrollments')}</CardTitle>
                <CardDescription>{t('adminAnalytics.last6Months')}</CardDescription>
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
                      name={t('adminAnalytics.enrollments')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completions" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name={t('adminAnalytics.completions')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('adminAnalytics.monthlyRevenue')}</CardTitle>
                <CardDescription>{t('adminAnalytics.revenueTracking')}</CardDescription>
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
                      formatter={(value: number) => `${getCurrencySymbol(language)}${value.toFixed(0)}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name={t('adminAnalytics.revenue')}
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
              <CardTitle>{t('adminAnalytics.popularCourses')}</CardTitle>
              <CardDescription>{t('adminAnalytics.rankedByEnrollments')}</CardDescription>
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
                    name={t('adminAnalytics.enrollments')}
                    radius={[0, 8, 8, 0]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--accent))"
                    name={`${t('adminAnalytics.revenue')} (${getCurrencySymbol(language)})`}
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
              <CardTitle>{t('adminAnalytics.courseCompletionRates')}</CardTitle>
              <CardDescription>{t('adminAnalytics.percentageCompleted')}</CardDescription>
            </CardHeader>
            <CardContent>
              {courseCompletions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('adminAnalytics.noCourses')}
                </p>
              ) : (
                <div className="space-y-4">
                  {courseCompletions.map((course, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{course.course_title}</span>
                        <span className="text-muted-foreground">
                          {course.completed}/{course.total_enrolled} ({course.completion_rate.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${course.completion_rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminAnalytics.recentActivity')}</CardTitle>
              <CardDescription>{t('adminAnalytics.latestEnrollments')}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('adminAnalytics.noRecentActivity')}
                </p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {t('adminAnalytics.newEnrollment')}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.user_name} {t('adminAnalytics.registeredFor')} {activity.course_title}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString(locale)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;