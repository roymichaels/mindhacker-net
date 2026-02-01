import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, TrendingUp, Calendar, Star, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { he } from 'date-fns/locale';

const CoachAnalytics = () => {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const { data: myProfile, isLoading: profileLoading } = useMyPractitionerProfile();

  // Fetch coach's clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['coach-analytics-clients', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('practitioner_clients')
        .select('*')
        .eq('practitioner_id', myProfile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!myProfile?.id,
  });

  // Fetch coach's products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['coach-analytics-products', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('content_products')
        .select('*, content_reviews(rating)')
        .eq('practitioner_id', myProfile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!myProfile?.id,
  });

  // Fetch practitioner reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['coach-analytics-reviews', myProfile?.id],
    queryFn: async () => {
      if (!myProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('practitioner_reviews')
        .select('*')
        .eq('practitioner_id', myProfile.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!myProfile?.id,
  });

  const isLoading = profileLoading || clientsLoading || productsLoading || reviewsLoading;

  // Calculate stats
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter((c) => c.status === 'active').length || 0;
  const totalProducts = products?.length || 0;
  const totalEnrollments = products?.reduce((sum, p) => sum + (p.enrollment_count || 0), 0) || 0;
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

  // Generate mock chart data (in real app, this would come from analytics table)
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  });

  const clientGrowthData = last30Days.map((date) => {
    const clientsBeforeDate = clients?.filter(
      (c) => new Date(c.created_at || '') <= date
    ).length || 0;
    
    return {
      date: format(date, 'MMM dd', { locale: isHebrew ? he : undefined }),
      clients: clientsBeforeDate,
    };
  });

  const productPerformanceData = products?.map((product) => ({
    name: product.title.length > 20 ? product.title.substring(0, 20) + '...' : product.title,
    enrollments: product.enrollment_count || 0,
    views: product.view_count || 0,
    rating: product.average_rating || 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          {isHebrew ? 'אנליטיקס' : 'Analytics'}
        </h1>
        <p className="text-muted-foreground">
          {isHebrew ? 'מעקב אחר הביצועים שלך' : 'Track your performance metrics'}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'סה"כ לקוחות' : 'Total Clients'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : totalClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isHebrew ? `${activeClients} פעילים` : `${activeClients} active`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'קורסים' : 'Courses'}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-9 w-16" /> : totalProducts}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isHebrew ? `${totalEnrollments} נרשמים` : `${totalEnrollments} enrollments`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'דירוג ממוצע' : 'Avg Rating'}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-1">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isHebrew ? `${reviews?.length || 0} ביקורות` : `${reviews?.length || 0} reviews`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isHebrew ? 'צפיות' : 'Total Views'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                products?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isHebrew ? 'צפיות בתכנים' : 'Content views'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle>{isHebrew ? 'צמיחת לקוחות' : 'Client Growth'}</CardTitle>
            <CardDescription>
              {isHebrew ? '30 הימים האחרונים' : 'Last 30 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clientGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clients"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Product Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{isHebrew ? 'ביצועי קורסים' : 'Course Performance'}</CardTitle>
            <CardDescription>
              {isHebrew ? 'נרשמים לפי קורס' : 'Enrollments by course'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : productPerformanceData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  {isHebrew ? 'אין נתונים להצגה' : 'No data to display'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoachAnalytics;
