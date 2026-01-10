import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
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
} from "recharts";
import { format, subDays, startOfDay, parseISO } from "date-fns";
import { he, enUS } from "date-fns/locale";

interface Campaign {
  id: string;
  title: string;
  sent_at: string | null;
  stats: unknown;
}

interface Subscriber {
  id: string;
  subscribed_at: string | null;
  status: string | null;
}

interface NewsletterStatsProps {
  campaigns: Campaign[];
  subscribers: Subscriber[];
}

const NewsletterStats = ({ campaigns, subscribers }: NewsletterStatsProps) => {
  const { t, isRTL } = useTranslation();

  // Subscriber growth over last 30 days
  const growthData = [];
  for (let i = 29; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const dateStr = format(date, "yyyy-MM-dd");
    const count = subscribers.filter((s) => {
      if (!s.subscribed_at) return false;
      const subDate = format(parseISO(s.subscribed_at), "yyyy-MM-dd");
      return subDate <= dateStr && s.status === "active";
    }).length;
    
    growthData.push({
      date: format(date, "dd/MM", { locale: isRTL ? he : enUS }),
      subscribers: count,
    });
  }

  // Campaign performance
  const sentCampaigns = campaigns.filter((c) => c.sent_at && c.stats);
  const campaignPerformance = sentCampaigns.slice(0, 10).map((campaign) => {
    const stats = campaign.stats as { sent?: number; opened?: number; clicked?: number } | null;
    return {
      name: campaign.title.slice(0, 20) + (campaign.title.length > 20 ? "..." : ""),
      sent: stats?.sent || 0,
      opened: stats?.opened || 0,
      clicked: stats?.clicked || 0,
      openRate: stats?.sent ? ((stats?.opened || 0) / stats.sent * 100).toFixed(1) : 0,
    };
  });

  // Summary stats
  const totalSent = sentCampaigns.reduce((acc, c) => {
    const stats = c.stats as { sent?: number } | null;
    return acc + (stats?.sent || 0);
  }, 0);

  const totalOpened = sentCampaigns.reduce((acc, c) => {
    const stats = c.stats as { opened?: number } | null;
    return acc + (stats?.opened || 0);
  }, 0);

  const totalClicked = sentCampaigns.reduce((acc, c) => {
    const stats = c.stats as { clicked?: number } | null;
    return acc + (stats?.clicked || 0);
  }, 0);

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent * 100).toFixed(1) : 0;
  const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t('newsletter.stats.totalSent')}</p>
            <p className="text-2xl font-bold text-primary">{totalSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t('newsletter.stats.totalOpened')}</p>
            <p className="text-2xl font-bold text-green-400">{totalOpened.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t('newsletter.stats.avgOpenRate')}</p>
            <p className="text-2xl font-bold text-blue-400">{avgOpenRate}%</p>
          </CardContent>
        </Card>
        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">{t('newsletter.stats.avgClickRate')}</p>
            <p className="text-2xl font-bold text-yellow-400">{avgClickRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber Growth Chart */}
      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle>{t('newsletter.stats.subscriberGrowth')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.2)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--primary)/0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance Chart */}
      {campaignPerformance.length > 0 && (
        <Card className="glass-panel border-primary/20">
          <CardHeader>
            <CardTitle>{t('newsletter.stats.campaignPerformance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary)/0.2)" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--primary)/0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="sent" fill="hsl(var(--primary))" name={t('newsletter.stats.sent')} />
                  <Bar dataKey="opened" fill="hsl(142, 76%, 36%)" name={t('newsletter.stats.opened')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewsletterStats;
