import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsData {
  visitorsToday: number;
  visitorsYesterday: number;
  pageViews: number;
  pageViewsYesterday: number;
  conversionRate: number;
  conversionRateYesterday: number;
  leadsToday: number;
  leadsYesterday: number;
  formCompletions: number;
  topLandingPages: Array<{ page: string; views: number; conversions: number }>;
  deviceBreakdown: { mobile: number; desktop: number; tablet: number };
  videoPlays: number;
  avgSessionDuration: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if daily reports are enabled
    const { data: settings } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["daily_report_enabled", "daily_report_email"]);

    const settingsMap = Object.fromEntries(
      settings?.map((s) => [s.setting_key, s.setting_value]) || []
    );

    if (settingsMap.daily_report_enabled !== "true" || !settingsMap.daily_report_email) {
      return new Response(
        JSON.stringify({ message: "Daily reports disabled or no email configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(yesterday);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

    // Fetch today's sessions
    const { data: todaySessions, count: todayVisitors } = await supabase
      .from("visitor_sessions")
      .select("*", { count: "exact" })
      .gte("first_seen", today.toISOString());

    // Fetch yesterday's sessions
    const { count: yesterdayVisitors } = await supabase
      .from("visitor_sessions")
      .select("*", { count: "exact" })
      .gte("first_seen", yesterday.toISOString())
      .lt("first_seen", today.toISOString());

    // Fetch today's page views
    const { count: todayPageViews } = await supabase
      .from("page_views")
      .select("*", { count: "exact" })
      .gte("entered_at", today.toISOString());

    // Fetch yesterday's page views
    const { count: yesterdayPageViews } = await supabase
      .from("page_views")
      .select("*", { count: "exact" })
      .gte("entered_at", yesterday.toISOString())
      .lt("entered_at", today.toISOString());

    // Fetch today's leads
    const { count: todayLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact" })
      .gte("created_at", today.toISOString());

    // Fetch yesterday's leads
    const { count: yesterdayLeads } = await supabase
      .from("leads")
      .select("*", { count: "exact" })
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString());

    // Fetch form submissions today
    const { count: formCompletions } = await supabase
      .from("form_submissions")
      .select("*", { count: "exact" })
      .gte("submitted_at", today.toISOString());

    // Fetch conversion events today
    const { data: conversionEvents } = await supabase
      .from("conversion_events")
      .select("*")
      .gte("created_at", today.toISOString());

    // Fetch video play events
    const videoPlays = conversionEvents?.filter((e) => e.event_type === "video_play").length || 0;

    // Calculate device breakdown from today's sessions
    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
    todaySessions?.forEach((session) => {
      const device = session.device_type?.toLowerCase() || "desktop";
      if (device.includes("mobile")) deviceBreakdown.mobile++;
      else if (device.includes("tablet")) deviceBreakdown.tablet++;
      else deviceBreakdown.desktop++;
    });

    // Get top landing pages
    const { data: landingPages } = await supabase
      .from("page_views")
      .select("page_path")
      .gte("entered_at", today.toISOString());

    const pageCount: Record<string, number> = {};
    landingPages?.forEach((pv) => {
      const path = pv.page_path || "/";
      pageCount[path] = (pageCount[path] || 0) + 1;
    });

    const topLandingPages = Object.entries(pageCount)
      .map(([page, views]) => ({ page, views, conversions: 0 }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Calculate conversion rate
    const conversionRate = todayVisitors && todayVisitors > 0
      ? ((todayLeads || 0) / todayVisitors) * 100
      : 0;

    const conversionRateYesterday = yesterdayVisitors && yesterdayVisitors > 0
      ? ((yesterdayLeads || 0) / yesterdayVisitors) * 100
      : 0;

    // Calculate average session duration
    const totalSessionTime = todaySessions?.reduce(
      (sum, s) => sum + (s.total_time_seconds || 0),
      0
    ) || 0;
    const avgSessionDuration = todaySessions && todaySessions.length > 0
      ? Math.round(totalSessionTime / todaySessions.length)
      : 0;

    const analyticsData: AnalyticsData = {
      visitorsToday: todayVisitors || 0,
      visitorsYesterday: yesterdayVisitors || 0,
      pageViews: todayPageViews || 0,
      pageViewsYesterday: yesterdayPageViews || 0,
      conversionRate: Math.round(conversionRate * 10) / 10,
      conversionRateYesterday: Math.round(conversionRateYesterday * 10) / 10,
      leadsToday: todayLeads || 0,
      leadsYesterday: yesterdayLeads || 0,
      formCompletions: formCompletions || 0,
      topLandingPages,
      deviceBreakdown,
      videoPlays,
      avgSessionDuration,
    };

    // Store report in database
    const reportDate = today.toISOString().split("T")[0];
    await supabase.from("analytics_reports").upsert({
      report_date: reportDate,
      report_data: analyticsData,
      sent_at: new Date().toISOString(),
    });

    // Generate email content
    const visitorChange = analyticsData.visitorsYesterday > 0
      ? Math.round(((analyticsData.visitorsToday - analyticsData.visitorsYesterday) / analyticsData.visitorsYesterday) * 100)
      : 0;
    const visitorChangeSymbol = visitorChange >= 0 ? "↑" : "↓";

    const pageViewChange = analyticsData.pageViewsYesterday > 0
      ? Math.round(((analyticsData.pageViews - analyticsData.pageViewsYesterday) / analyticsData.pageViewsYesterday) * 100)
      : 0;
    const pageViewChangeSymbol = pageViewChange >= 0 ? "↑" : "↓";

    const conversionChange = analyticsData.conversionRateYesterday > 0
      ? Math.round((analyticsData.conversionRate - analyticsData.conversionRateYesterday) * 10) / 10
      : 0;
    const conversionChangeSymbol = conversionChange >= 0 ? "↑" : "↓";

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const totalDevices = deviceBreakdown.mobile + deviceBreakdown.desktop + deviceBreakdown.tablet;
    const mobilePercent = totalDevices > 0 ? Math.round((deviceBreakdown.mobile / totalDevices) * 100) : 0;
    const desktopPercent = totalDevices > 0 ? Math.round((deviceBreakdown.desktop / totalDevices) * 100) : 0;

    const emailHtml = `
<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #e5e7eb; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden; border: 1px solid #374151; }
    .header { background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 24px; text-align: center; }
    .header h1 { margin: 0; color: #0a0a0f; font-size: 24px; }
    .header p { margin: 8px 0 0; color: #1a1a2e; font-size: 14px; }
    .content { padding: 24px; }
    .metric-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: rgba(0,0,0,0.3); border-radius: 8px; padding: 16px; border: 1px solid #374151; }
    .metric-value { font-size: 28px; font-weight: bold; color: #00d4ff; }
    .metric-label { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .metric-change { font-size: 12px; margin-top: 4px; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .section { margin-top: 24px; }
    .section-title { font-size: 16px; font-weight: 600; color: #00d4ff; margin-bottom: 12px; border-bottom: 1px solid #374151; padding-bottom: 8px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #374151; }
    .table th { color: #9ca3af; font-weight: 500; font-size: 12px; }
    .bar { height: 8px; background: #374151; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #00d4ff, #0099cc); border-radius: 4px; }
    .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 12px; border-top: 1px solid #374151; }
    .cta { display: inline-block; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #0a0a0f; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Mind Hacker Daily Report</h1>
      <p>${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
    </div>
    
    <div class="content">
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-value">${analyticsData.visitorsToday}</div>
          <div class="metric-label">Visitors Today</div>
          <div class="metric-change ${visitorChange >= 0 ? "positive" : "negative"}">${visitorChangeSymbol} ${Math.abs(visitorChange)}% vs yesterday</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analyticsData.pageViews}</div>
          <div class="metric-label">Page Views</div>
          <div class="metric-change ${pageViewChange >= 0 ? "positive" : "negative"}">${pageViewChangeSymbol} ${Math.abs(pageViewChange)}% vs yesterday</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analyticsData.conversionRate}%</div>
          <div class="metric-label">Conversion Rate</div>
          <div class="metric-change ${conversionChange >= 0 ? "positive" : "negative"}">${conversionChangeSymbol} ${Math.abs(conversionChange)}% vs yesterday</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${analyticsData.leadsToday}</div>
          <div class="metric-label">Leads Captured</div>
          <div class="metric-change">Form completions: ${analyticsData.formCompletions}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🎬 Video Engagement</div>
        <div class="metric-grid">
          <div class="metric-card">
            <div class="metric-value">${analyticsData.videoPlays}</div>
            <div class="metric-label">Videos Played</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatTime(analyticsData.avgSessionDuration)}</div>
            <div class="metric-label">Avg Session Duration</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">📱 Device Breakdown</div>
        <table class="table">
          <tr>
            <td>Mobile</td>
            <td style="width: 60%">
              <div class="bar"><div class="bar-fill" style="width: ${mobilePercent}%"></div></div>
            </td>
            <td style="text-align: right">${mobilePercent}%</td>
          </tr>
          <tr>
            <td>Desktop</td>
            <td>
              <div class="bar"><div class="bar-fill" style="width: ${desktopPercent}%"></div></div>
            </td>
            <td style="text-align: right">${desktopPercent}%</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">🔥 Top Landing Pages</div>
        <table class="table">
          <thead>
            <tr>
              <th>Page</th>
              <th style="text-align: right">Views</th>
            </tr>
          </thead>
          <tbody>
            ${analyticsData.topLandingPages.map((p) => `
              <tr>
                <td>${p.page}</td>
                <td style="text-align: right">${p.views}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://mind-hacker.net/admin/analytics" class="cta">View Full Dashboard →</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Mind Hacker OÜ • Automated Daily Analytics Report</p>
      <p>To disable these reports, update settings in your admin panel.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Mind Hacker <reports@mind-hacker.net>",
        to: [settingsMap.daily_report_email],
        subject: `📊 Daily Analytics Report - ${reportDate}`,
        html: emailHtml,
      });
    }

    return new Response(
      JSON.stringify({ success: true, data: analyticsData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating analytics report:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
