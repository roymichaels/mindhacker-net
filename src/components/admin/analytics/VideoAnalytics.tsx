import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play, Clock, CheckCircle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

interface VideoMetric {
  sectionName: string;
  plays: number;
  totalWatchTime: number;
  avgWatchTime: number;
}

interface VideoAnalyticsProps {
  dateRange: string;
}

export const VideoAnalytics = ({ dateRange }: VideoAnalyticsProps) => {
  const { t, isRTL } = useTranslation();
  const [metrics, setMetrics] = useState<VideoMetric[]>([]);
  const [totalPlays, setTotalPlays] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideoMetrics = async () => {
      setIsLoading(true);
      
      const daysAgo = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch video play events
      const { data: playEvents } = await supabase
        .from("conversion_events")
        .select("*")
        .eq("event_type", "video_play")
        .gte("created_at", startDate.toISOString());

      // Fetch video close events (contains watch time)
      const { data: closeEvents } = await supabase
        .from("conversion_events")
        .select("*")
        .eq("event_type", "video_close")
        .gte("created_at", startDate.toISOString());

      if (playEvents) {
        // Group by section
        const sectionMetrics: Record<string, VideoMetric> = {};
        
        playEvents.forEach((event) => {
          const sectionName = event.source || "unknown";
          if (!sectionMetrics[sectionName]) {
            sectionMetrics[sectionName] = {
              sectionName,
              plays: 0,
              totalWatchTime: 0,
              avgWatchTime: 0,
            };
          }
          sectionMetrics[sectionName].plays++;
        });

        // Add watch time data
        closeEvents?.forEach((event) => {
          const sectionName = event.source || "unknown";
          const watchTime = (event.event_data as { watchTimeSeconds?: number })?.watchTimeSeconds || 0;
          if (sectionMetrics[sectionName]) {
            sectionMetrics[sectionName].totalWatchTime += watchTime;
          }
        });

        // Calculate averages
        Object.values(sectionMetrics).forEach((metric) => {
          metric.avgWatchTime = metric.plays > 0 
            ? Math.round(metric.totalWatchTime / metric.plays) 
            : 0;
        });

        const metricsArray = Object.values(sectionMetrics);
        setMetrics(metricsArray);
        setTotalPlays(metricsArray.reduce((sum, m) => sum + m.plays, 0));
        setTotalWatchTime(metricsArray.reduce((sum, m) => sum + m.totalWatchTime, 0));
      }

      setIsLoading(false);
    };

    fetchVideoMetrics();
  }, [dateRange]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#FFB547"];

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("analytics.videoPlays")}</p>
                <p className="text-2xl font-bold">{totalPlays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("analytics.totalWatchTime")}</p>
                <p className="text-2xl font-bold">{formatTime(totalWatchTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("analytics.avgWatchTime")}</p>
                <p className="text-2xl font-bold">
                  {formatTime(totalPlays > 0 ? Math.round(totalWatchTime / totalPlays) : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("analytics.videoSections")}</p>
                <p className="text-2xl font-bold">{metrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plays by Section Bar Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">{t("analytics.playsBySection")}</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="sectionName" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="plays" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                {t("analytics.noVideoData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Watch Time Distribution Pie Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">{t("analytics.watchTimeDistribution")}</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics}
                    dataKey="totalWatchTime"
                    nameKey="sectionName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {metrics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatTime(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                {t("analytics.noVideoData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">{t("analytics.videoPerformanceDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("analytics.section")}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("analytics.plays")}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("analytics.totalTime")}
                    </th>
                    <th className="text-start py-3 px-4 text-sm font-medium text-muted-foreground">
                      {t("analytics.avgTime")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-3 px-4 text-sm font-medium">{metric.sectionName}</td>
                      <td className="py-3 px-4 text-sm">{metric.plays}</td>
                      <td className="py-3 px-4 text-sm">{formatTime(metric.totalWatchTime)}</td>
                      <td className="py-3 px-4 text-sm">{formatTime(metric.avgWatchTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("analytics.noVideoData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoAnalytics;
