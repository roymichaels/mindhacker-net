import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MousePointerClick, TrendingUp, Clock, ArrowRight, Eye, FileEdit, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ConversionMetrics = () => {
  // Fetch visitor sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["visitor-sessions"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("visitor_sessions") as any)
        .select("*")
        .gte("first_seen", subDays(new Date(), 30).toISOString())
        .order("first_seen", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch conversion events
  const { data: events = [] } = useQuery({
    queryKey: ["conversion-events"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("conversion_events") as any)
        .select("*")
        .gte("created_at", subDays(new Date(), 30).toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch page views
  const { data: pageViews = [] } = useQuery({
    queryKey: ["page-views"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("page_views") as any)
        .select("*")
        .gte("entered_at", subDays(new Date(), 30).toISOString())
        .order("entered_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate stats
  const totalVisitors = sessions.length;
  const formSubmissions = events.filter((e: any) => e.event_type === "form_success").length;
  const conversionRate = totalVisitors > 0 ? ((formSubmissions / totalVisitors) * 100).toFixed(1) : "0";
  
  const bounceViews = pageViews.filter((pv: any) => pv.is_bounce);
  const bounceRate = pageViews.length > 0 ? ((bounceViews.length / pageViews.length) * 100).toFixed(1) : "0";

  const totalTimeOnSite = sessions.reduce((acc: number, s: any) => {
    if (s.first_seen && s.last_seen) {
      const diff = new Date(s.last_seen).getTime() - new Date(s.first_seen).getTime();
      return acc + diff;
    }
    return acc;
  }, 0);
  const avgTimeOnSite = totalVisitors > 0 ? Math.round(totalTimeOnSite / totalVisitors / 1000) : 0;
  const avgTimeFormatted = `${Math.floor(avgTimeOnSite / 60)}:${String(avgTimeOnSite % 60).padStart(2, '0')}`;

  // Events by source
  const eventsBySource = events.reduce((acc: Record<string, number>, e: any) => {
    const source = e.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  const sourceData = Object.entries(eventsBySource)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 6);

  // Funnel data
  const funnelData = [
    { name: "צפיות בדף", value: pageViews.length, icon: Eye },
    { name: "קליקים על CTA", value: events.filter((e: any) => e.event_type === "cta_click").length, icon: MousePointerClick },
    { name: "צפייה בטופס", value: events.filter((e: any) => e.event_type === "form_view").length, icon: FileEdit },
    { name: "התחלת מילוי", value: events.filter((e: any) => e.event_type === "form_start").length, icon: ArrowRight },
    { name: "שליחת טופס", value: formSubmissions, icon: CheckCircle },
  ];

  // Daily conversions
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayEvents = events.filter((e: any) => {
      const eventDate = new Date(e.created_at);
      return eventDate >= dayStart && eventDate <= dayEnd && e.event_type === "form_success";
    });
    
    const dayVisitors = sessions.filter((s: any) => {
      const sessionDate = new Date(s.first_seen);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });

    return {
      date: format(date, "dd/MM"),
      conversions: dayEvents.length,
      visitors: dayVisitors.length,
    };
  });

  // Device breakdown
  const deviceData = sessions.reduce((acc: Record<string, number>, s: any) => {
    const device = s.device_type || "unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const deviceChartData = Object.entries(deviceData).map(([name, value]) => ({ name, value }));

  // UTM sources
  const utmData = sessions
    .filter((s: any) => s.utm_source)
    .reduce((acc: Record<string, number>, s: any) => {
      acc[s.utm_source] = (acc[s.utm_source] || 0) + 1;
      return acc;
    }, {});
  const utmChartData = Object.entries(utmData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">סה"כ מבקרים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitors}</div>
            <p className="text-xs text-muted-foreground">ב-30 הימים האחרונים</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">אחוז המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">טפסים / מבקרים</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">זמן ממוצע באתר</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTimeFormatted}</div>
            <p className="text-xs text-muted-foreground">דקות:שניות</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">אחוז נטישה</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounceRate}%</div>
            <p className="text-xs text-muted-foreground">עזבו מהר</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">משפך המרות</TabsTrigger>
          <TabsTrigger value="sources">מקורות</TabsTrigger>
          <TabsTrigger value="trends">מגמות</TabsTrigger>
          <TabsTrigger value="devices">מכשירים</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>משפך המרות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => {
                  const prevValue = index > 0 ? funnelData[index - 1].value : stage.value;
                  const dropRate = prevValue > 0 ? ((1 - stage.value / prevValue) * 100).toFixed(0) : 0;
                  const widthPercent = funnelData[0].value > 0 
                    ? Math.max(20, (stage.value / funnelData[0].value) * 100) 
                    : 100;

                  return (
                    <div key={stage.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <stage.icon className="h-4 w-4" />
                          <span>{stage.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{stage.value}</span>
                          {index > 0 && (
                            <span className="text-xs text-destructive">-{dropRate}%</span>
                          )}
                        </div>
                      </div>
                      <div 
                        className="h-8 bg-primary/20 rounded relative overflow-hidden"
                        style={{ width: `${widthPercent}%` }}
                      >
                        <div 
                          className="absolute inset-0 bg-primary rounded"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>אירועים לפי מקור</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>מקורות UTM</CardTitle>
              </CardHeader>
              <CardContent>
                {utmChartData.length > 0 ? (
                  <div className="space-y-3">
                    {utmChartData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="font-bold">{item.value as number}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    אין נתוני UTM עדיין
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מגמת המרות - 7 ימים אחרונים</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--muted-foreground))" 
                    name="מבקרים"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--primary))" 
                    name="המרות"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>פילוח לפי מכשיר</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col justify-center space-y-3">
                  {deviceChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                        />
                        <span className="text-sm capitalize">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConversionMetrics;
