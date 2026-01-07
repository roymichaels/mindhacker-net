import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { debug } from "@/lib/debug";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Clock, 
  Eye, 
  TrendingDown,
  Timer
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface EngagementStats {
  avgWatchTime: number;
  avgSessionDuration: number;
  totalSessions: number;
  avgCompletionPercentage: number;
}

interface MostViewedEpisode {
  episode_title: string;
  course_title: string;
  views: number;
  avg_watch_time: number;
}

interface DropOffPoint {
  episode_title: string;
  total_starts: number;
  completed: number;
  drop_off_rate: number;
}

interface SessionDurationData {
  duration_range: string;
  count: number;
}

export const EngagementMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EngagementStats>({
    avgWatchTime: 0,
    avgSessionDuration: 0,
    totalSessions: 0,
    avgCompletionPercentage: 0,
  });
  const [mostViewed, setMostViewed] = useState<MostViewedEpisode[]>([]);
  const [dropOffPoints, setDropOffPoints] = useState<DropOffPoint[]>([]);
  const [sessionDurations, setSessionDurations] = useState<SessionDurationData[]>([]);

  useEffect(() => {
    fetchEngagementData();
  }, []);

  const fetchEngagementData = async () => {
    try {
      // Fetch average watch time from user_progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("watch_time_seconds, last_position_seconds, completed");

      const totalWatchTime = progressData?.reduce(
        (sum, p) => sum + (p.watch_time_seconds || 0), 
        0
      ) || 0;
      const avgWatchTime = progressData?.length 
        ? totalWatchTime / progressData.length 
        : 0;

      // Calculate average completion percentage
      const totalProgress = progressData?.reduce((sum, p) => {
        return sum + (p.last_position_seconds || 0);
      }, 0) || 0;
      const avgCompletion = progressData?.length ? totalProgress / progressData.length : 0;

      // Fetch session data from content_analytics
      const { data: analyticsData } = await supabase
        .from("content_analytics")
        .select("event_type, event_data, created_at, session_id")
        .order("created_at", { ascending: true });

      // Calculate session durations
      const sessionMap = new Map<string, { start: Date; end: Date }>();
      analyticsData?.forEach(event => {
        const sessionId = event.session_id;
        if (!sessionId) return;

        const eventTime = new Date(event.created_at || "");
        
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, { start: eventTime, end: eventTime });
        } else {
          const session = sessionMap.get(sessionId)!;
          if (eventTime < session.start) session.start = eventTime;
          if (eventTime > session.end) session.end = eventTime;
        }
      });

      const sessionDurations = Array.from(sessionMap.values()).map(session => 
        (session.end.getTime() - session.start.getTime()) / 1000 / 60 // minutes
      );

      const avgSessionDuration = sessionDurations.length
        ? sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length
        : 0;

      // Group sessions by duration ranges
      const durationRanges = [
        { label: "0-5 דקות", min: 0, max: 5 },
        { label: "5-15 דקות", min: 5, max: 15 },
        { label: "15-30 דקות", min: 15, max: 30 },
        { label: "30-60 דקות", min: 30, max: 60 },
        { label: "60+ דקות", min: 60, max: Infinity },
      ];

      const durationData = durationRanges.map(range => ({
        duration_range: range.label,
        count: sessionDurations.filter(d => d >= range.min && d < range.max).length,
      }));

      // Fetch most viewed episodes
      const { data: episodeViews } = await supabase
        .from("user_progress")
        .select(`
          episode_id,
          watch_time_seconds,
          content_episodes(title, content_products(title))
        `);

      const episodeViewMap = new Map<string, { 
        title: string; 
        course: string; 
        views: number; 
        totalWatchTime: number 
      }>();

      episodeViews?.forEach(view => {
        const episode = view.content_episodes as any;
        const episodeId = view.episode_id;
        const title = episode?.title || "Unknown";
        const course = episode?.content_products?.title || "Unknown";

        if (!episodeViewMap.has(episodeId)) {
          episodeViewMap.set(episodeId, {
            title,
            course,
            views: 0,
            totalWatchTime: 0,
          });
        }

        const data = episodeViewMap.get(episodeId)!;
        data.views += 1;
        data.totalWatchTime += view.watch_time_seconds || 0;
      });

      const mostViewedEpisodes = Array.from(episodeViewMap.values())
        .map(e => ({
          episode_title: e.title,
          course_title: e.course,
          views: e.views,
          avg_watch_time: e.views > 0 ? e.totalWatchTime / e.views : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Calculate drop-off points (episodes with low completion rates)
      const { data: episodeProgress } = await supabase
        .from("user_progress")
        .select(`
          episode_id,
          completed,
          content_episodes(title)
        `);

      const dropOffMap = new Map<string, { 
        title: string; 
        starts: number; 
        completed: number 
      }>();

      episodeProgress?.forEach(progress => {
        const episode = progress.content_episodes as any;
        const episodeId = progress.episode_id;
        const title = episode?.title || "Unknown";

        if (!dropOffMap.has(episodeId)) {
          dropOffMap.set(episodeId, {
            title,
            starts: 0,
            completed: 0,
          });
        }

        const data = dropOffMap.get(episodeId)!;
        data.starts += 1;
        if (progress.completed) data.completed += 1;
      });

      const dropOffData = Array.from(dropOffMap.values())
        .map(e => ({
          episode_title: e.title,
          total_starts: e.starts,
          completed: e.completed,
          drop_off_rate: e.starts > 0 ? ((e.starts - e.completed) / e.starts) * 100 : 0,
        }))
        .filter(e => e.total_starts >= 5) // Only show episodes with at least 5 starts
        .sort((a, b) => b.drop_off_rate - a.drop_off_rate)
        .slice(0, 10);

      setStats({
        avgWatchTime,
        avgSessionDuration,
        totalSessions: sessionMap.size,
        avgCompletionPercentage: (avgCompletion / 60) * 100, // Rough percentage
      });
      setMostViewed(mostViewedEpisodes);
      setDropOffPoints(dropOffData);
      setSessionDurations(durationData);
    } catch (error) {
      debug.error("Error fetching engagement data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}ש ${minutes}ד`;
    }
    return `${minutes}ד`;
  };

  const formatMinutes = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}ש ${mins}ד`;
    }
    return `${Math.round(minutes)}ד`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
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
    <div className="space-y-6">
      {/* Engagement Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">זמן צפייה ממוצע</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.avgWatchTime)}</div>
            <p className="text-xs text-muted-foreground">לפרק</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משך סשן ממוצע</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(stats.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">סך {stats.totalSessions} סשנים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אחוז השלמה ממוצע</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCompletionPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">של הפרקים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">נקודות נשירה</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dropOffPoints.length}</div>
            <p className="text-xs text-muted-foreground">פרקים בעייתיים</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Most Viewed Episodes */}
        <Card>
          <CardHeader>
            <CardTitle>הפרקים הנצפים ביותר</CardTitle>
            <CardDescription>לפי מספר צפיות</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mostViewed} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="episode_title" 
                  stroke="hsl(var(--muted-foreground))"
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "avg_watch_time") {
                      return [formatTime(value), "זמן צפייה ממוצע"];
                    }
                    return [value, "צפיות"];
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="views" 
                  fill="hsl(var(--primary))"
                  name="צפיות"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Duration Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>התפלגות משך סשנים</CardTitle>
            <CardDescription>מספר סשנים לפי משך זמן</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={sessionDurations}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="duration_range" 
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
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent))"
                  fillOpacity={0.3}
                  name="סשנים"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Points */}
      <Card>
        <CardHeader>
          <CardTitle>נקודות נשירה - פרקים בעייתיים</CardTitle>
          <CardDescription>פרקים עם שיעור נשירה גבוה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dropOffPoints.map((point, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="font-medium">{point.episode_title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{point.total_starts} התחלות</span>
                    <span>{point.completed} השלמות</span>
                    <span className="font-bold text-destructive">
                      {point.drop_off_rate.toFixed(1)}% נשירה
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive transition-all"
                    style={{ width: `${point.drop_off_rate}%` }}
                  />
                </div>
              </div>
            ))}
            {dropOffPoints.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                אין נקודות נשירה משמעותיות
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Watch Time by Episode */}
      <Card>
        <CardHeader>
          <CardTitle>זמן צפייה ממוצע לפי פרק</CardTitle>
          <CardDescription>עבור הפרקים הנצפים ביותר</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mostViewed}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="episode_title" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => formatTime(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                formatter={(value: number) => [formatTime(value), "זמן צפייה"]}
              />
              <Line 
                type="monotone" 
                dataKey="avg_watch_time" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="זמן צפייה ממוצע"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
