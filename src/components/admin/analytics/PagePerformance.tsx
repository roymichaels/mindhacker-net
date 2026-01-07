import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays } from "date-fns";
import { ArrowDownRight, ArrowUpRight, Clock, Eye, MousePointerClick, ScrollText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageData {
  page_path: string;
  views: number;
  avgTime: number;
  avgScroll: number;
  bounceRate: number;
  exits: number;
}

const PagePerformance = () => {
  // Fetch page views with metrics
  const { data: pageViews = [], isLoading } = useQuery({
    queryKey: ["page-performance"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("page_views") as any)
        .select("*")
        .gte("entered_at", subDays(new Date(), 30).toISOString())
        .order("entered_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate page-level metrics
  const pageMetrics = pageViews.reduce((acc: Record<string, PageData>, pv: any) => {
    const path = pv.page_path || "/";
    if (!acc[path]) {
      acc[path] = {
        page_path: path,
        views: 0,
        avgTime: 0,
        avgScroll: 0,
        bounceRate: 0,
        exits: 0,
      };
    }
    acc[path].views += 1;
    acc[path].avgTime += pv.time_on_page_seconds || 0;
    acc[path].avgScroll += pv.scroll_depth_percent || 0;
    if (pv.is_bounce) acc[path].bounceRate += 1;
    if (pv.exited_at) acc[path].exits += 1;
    return acc;
  }, {});

  // Finalize averages
  const pageData: PageData[] = (Object.values(pageMetrics) as PageData[])
    .map((page) => ({
      ...page,
      avgTime: page.views > 0 ? Math.round(page.avgTime / page.views) : 0,
      avgScroll: page.views > 0 ? Math.round(page.avgScroll / page.views) : 0,
      bounceRate: page.views > 0 ? Math.round((page.bounceRate / page.views) * 100) : 0,
    }))
    .sort((a, b) => b.views - a.views);

  // Top landing pages (first page in session)
  const landingPages = pageViews
    .filter((pv: any) => !pv.referrer_path)
    .reduce((acc: Record<string, number>, pv: any) => {
      const path = pv.page_path || "/";
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {});

  const landingPageData = Object.entries(landingPages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10);

  // Exit pages
  const exitPages = pageViews
    .filter((pv: any) => pv.exited_at)
    .reduce((acc: Record<string, number>, pv: any) => {
      const path = pv.page_path || "/";
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {});

  const exitPageData = Object.entries(exitPages)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10);

  // Summary stats
  const totalViews = pageViews.length;
  const avgTimeOnPage = totalViews > 0 
    ? Math.round(pageViews.reduce((sum: number, pv: any) => sum + (pv.time_on_page_seconds || 0), 0) / totalViews)
    : 0;
  const avgScrollDepth = totalViews > 0
    ? Math.round(pageViews.reduce((sum: number, pv: any) => sum + (pv.scroll_depth_percent || 0), 0) / totalViews)
    : 0;
  const overallBounceRate = totalViews > 0
    ? Math.round((pageViews.filter((pv: any) => pv.is_bounce).length / totalViews) * 100)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">צפיות בדף</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">30 ימים אחרונים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">זמן ממוצע בדף</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgTimeOnPage)}</div>
            <p className="text-xs text-muted-foreground">דקות:שניות</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">עומק גלילה ממוצע</CardTitle>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScrollDepth}%</div>
            <p className="text-xs text-muted-foreground">מתוך הדף</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">אחוז נטישה</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallBounceRate}%</div>
            <p className="text-xs text-muted-foreground">עזבו מהר</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Landing Pages Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-green-500" />
              דפי נחיתה מובילים
            </CardTitle>
            <CardDescription>דפים שמבקרים נכנסים אליהם ראשון</CardDescription>
          </CardHeader>
          <CardContent>
            {landingPageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={landingPageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} name="כניסות" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין נתונים עדיין</p>
            )}
          </CardContent>
        </Card>

        {/* Exit Pages Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              דפי יציאה מובילים
            </CardTitle>
            <CardDescription>דפים שמבקרים עוזבים מהם</CardDescription>
          </CardHeader>
          <CardContent>
            {exitPageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={exitPageData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--destructive))" radius={4} name="יציאות" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין נתונים עדיין</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Page Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>ביצועי דפים</CardTitle>
          <CardDescription>מדדים מפורטים לכל דף</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>דף</TableHead>
                  <TableHead className="text-center">צפיות</TableHead>
                  <TableHead className="text-center">זמן ממוצע</TableHead>
                  <TableHead className="text-center">גלילה ממוצעת</TableHead>
                  <TableHead className="text-center">אחוז נטישה</TableHead>
                  <TableHead className="text-center">יציאות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.slice(0, 15).map((page) => (
                  <TableRow key={page.page_path}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {page.page_path}
                    </TableCell>
                    <TableCell className="text-center">{page.views}</TableCell>
                    <TableCell className="text-center">{formatTime(page.avgTime)}</TableCell>
                    <TableCell className="text-center">{page.avgScroll}%</TableCell>
                    <TableCell className="text-center">
                      <span className={page.bounceRate > 70 ? "text-destructive" : page.bounceRate > 50 ? "text-yellow-500" : "text-green-500"}>
                        {page.bounceRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{page.exits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagePerformance;
