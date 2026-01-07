import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Users, TrendingDown, Route } from "lucide-react";
import { subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface JourneyStep {
  from: string;
  to: string;
  count: number;
}

interface PathNode {
  path: string;
  count: number;
  dropOff: number;
}

const UserJourney = () => {
  // Fetch page views with session info
  const { data: pageViews = [], isLoading } = useQuery({
    queryKey: ["user-journey"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("page_views") as any)
        .select("session_id, page_path, referrer_path, entered_at")
        .gte("entered_at", subDays(new Date(), 30).toISOString())
        .order("entered_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch conversion events
  const { data: events = [] } = useQuery({
    queryKey: ["journey-events"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("conversion_events") as any)
        .select("session_id, event_type, page_path")
        .gte("created_at", subDays(new Date(), 30).toISOString());
      if (error) throw error;
      return data || [];
    },
  });

  // Build journey paths
  const journeySteps: JourneyStep[] = [];
  const pathCounts: Record<string, number> = {};
  const sessionPaths: Record<string, string[]> = {};

  pageViews.forEach((pv: any) => {
    const sessionId = pv.session_id;
    if (!sessionPaths[sessionId]) {
      sessionPaths[sessionId] = [];
    }
    sessionPaths[sessionId].push(pv.page_path);
    pathCounts[pv.page_path] = (pathCounts[pv.page_path] || 0) + 1;
  });

  // Calculate transitions
  const transitions: Record<string, number> = {};
  Object.values(sessionPaths).forEach((paths) => {
    for (let i = 0; i < paths.length - 1; i++) {
      const key = `${paths[i]}→${paths[i + 1]}`;
      transitions[key] = (transitions[key] || 0) + 1;
    }
  });

  const topTransitions = Object.entries(transitions)
    .map(([key, count]) => {
      const [from, to] = key.split("→");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Common paths (sequences of 3+ pages)
  const commonPaths: Record<string, number> = {};
  Object.values(sessionPaths).forEach((paths) => {
    if (paths.length >= 3) {
      const pathKey = paths.slice(0, 3).join(" → ");
      commonPaths[pathKey] = (commonPaths[pathKey] || 0) + 1;
    }
  });

  const topPaths = Object.entries(commonPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Conversion funnel with drop-offs
  const funnelSteps = [
    { name: "כניסה לאתר", event: null },
    { name: "צפייה בדף נחיתה", paths: ["/consciousness-leap", "/personal-hypnosis"] },
    { name: "קליק על CTA", event: "cta_click" },
    { name: "צפייה בטופס", event: "form_view" },
    { name: "שליחת טופס", event: "form_success" },
  ];

  const totalSessions = Object.keys(sessionPaths).length;
  
  const funnelData = funnelSteps.map((step, index) => {
    let count = 0;
    if (step.event === null) {
      count = totalSessions;
    } else if (step.paths) {
      count = Object.values(sessionPaths).filter(paths => 
        paths.some(p => step.paths!.some(sp => p.includes(sp)))
      ).length;
    } else {
      count = events.filter((e: any) => e.event_type === step.event).length;
    }
    
    const prevCount = index > 0 ? (funnelData[index - 1]?.count || totalSessions) : totalSessions;
    const dropOff = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;
    
    return { name: step.name, count, dropOff };
  });

  // Calculate actual funnel data since we can't reference it during construction
  const actualFunnelData: PathNode[] = funnelSteps.map((step, index) => {
    let count = 0;
    if (step.event === null) {
      count = totalSessions;
    } else if (step.paths) {
      count = Object.values(sessionPaths).filter(paths => 
        paths.some(p => step.paths!.some(sp => p.includes(sp)))
      ).length;
    } else {
      count = events.filter((e: any) => e.event_type === step.event).length;
    }
    return { path: step.name, count, dropOff: 0 };
  });

  // Calculate drop-offs
  for (let i = 1; i < actualFunnelData.length; i++) {
    const prevCount = actualFunnelData[i - 1].count;
    actualFunnelData[i].dropOff = prevCount > 0 
      ? Math.round(((prevCount - actualFunnelData[i].count) / prevCount) * 100) 
      : 0;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            משפך המרות מורחב
          </CardTitle>
          <CardDescription>מסע המשתמש מכניסה ועד המרה</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actualFunnelData.map((step, index) => {
              const widthPercent = totalSessions > 0 
                ? Math.max(15, (step.count / totalSessions) * 100) 
                : 100;
              const conversionRate = totalSessions > 0 
                ? ((step.count / totalSessions) * 100).toFixed(1) 
                : "0";

              return (
                <div key={step.path} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{step.path}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{step.count}</span>
                      <span className="text-xs text-muted-foreground">({conversionRate}%)</span>
                      {step.dropOff > 0 && (
                        <span className="text-xs text-destructive flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          -{step.dropOff}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-lg transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                    {index < actualFunnelData.length - 1 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Transitions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              מעברים נפוצים
            </CardTitle>
            <CardDescription>מאיפה לאיפה המבקרים עוברים</CardDescription>
          </CardHeader>
          <CardContent>
            {topTransitions.length > 0 ? (
              <div className="space-y-3">
                {topTransitions.map((transition, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                    <div className="flex-1 flex items-center gap-2 text-sm overflow-hidden">
                      <span className="truncate max-w-[100px]" title={transition.from}>
                        {transition.from}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate max-w-[100px]" title={transition.to}>
                        {transition.to}
                      </span>
                    </div>
                    <span className="font-bold text-sm">{transition.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין מספיק נתונים</p>
            )}
          </CardContent>
        </Card>

        {/* Common Paths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              מסלולים נפוצים
            </CardTitle>
            <CardDescription>רצפי 3 דפים נפוצים ביותר</CardDescription>
          </CardHeader>
          <CardContent>
            {topPaths.length > 0 ? (
              <div className="space-y-3">
                {topPaths.map(([path, count], index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">מסלול #{index + 1}</span>
                      <span className="font-bold text-sm">{count} משתמשים</span>
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                      {path}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">אין מספיק נתונים</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle>סטטיסטיקות סשנים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{totalSessions}</div>
              <div className="text-sm text-muted-foreground">סה"כ סשנים</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {totalSessions > 0 ? (pageViews.length / totalSessions).toFixed(1) : 0}
              </div>
              <div className="text-sm text-muted-foreground">דפים לסשן</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {Object.values(sessionPaths).filter(p => p.length >= 3).length}
              </div>
              <div className="text-sm text-muted-foreground">סשנים עמוקים (3+ דפים)</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {Object.values(sessionPaths).filter(p => p.length === 1).length}
              </div>
              <div className="text-sm text-muted-foreground">יציאות מידיות</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserJourney;
