/**
 * WorkAnalytics — Weekly trends chart with deep work %, velocity, and totals.
 */
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeekWorkScores, useTodayWorkSessions } from '@/hooks/useWorkSessions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Brain, TrendingUp, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkAnalytics() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { data: weekScores = [] } = useWeekWorkScores();
  const { data: todaySessions = [] } = useTodayWorkSessions();

  // Weekly bar chart data
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const score = weekScores.find(s => s.score_date === dateStr);
      const dayIdx = d.getDay();
      result.push({
        day: isHe ? daysHe[dayIdx] : days[dayIdx],
        total: score?.total_minutes || 0,
        deep: score?.deep_work_minutes || 0,
        isToday: i === 0,
      });
    }
    return result;
  }, [weekScores, isHe]);

  // Summary stats
  const summary = useMemo(() => {
    const totalMin = weekScores.reduce((s, w) => s + w.total_minutes, 0);
    const deepMin = weekScores.reduce((s, w) => s + w.deep_work_minutes, 0);
    const avgVelocity = weekScores.length > 0
      ? Math.round(weekScores.reduce((s, w) => s + w.velocity, 0) / weekScores.length)
      : 0;
    const activeDays = weekScores.filter(s => s.total_minutes > 0).length;
    return { totalMin, deepMin, deepPct: totalMin > 0 ? Math.round((deepMin / totalMin) * 100) : 0, avgVelocity, activeDays };
  }, [weekScores]);

  // Deep vs shallow pie
  const pieData = useMemo(() => {
    const completed = todaySessions.filter(s => s.ended_at);
    const deepMin = completed.filter(s => s.is_deep_work).reduce((s, x) => s + Math.floor(x.duration_seconds / 60), 0);
    const shallowMin = completed.filter(s => !s.is_deep_work).reduce((s, x) => s + Math.floor(x.duration_seconds / 60), 0);
    return [
      { name: isHe ? 'עבודה עמוקה' : 'Deep Work', value: deepMin, fill: 'hsl(var(--primary))' },
      { name: isHe ? 'עבודה רגילה' : 'Shallow Work', value: shallowMin, fill: 'hsl(var(--muted-foreground) / 0.3)' },
    ];
  }, [todaySessions, isHe]);

  const summaryCards = [
    { icon: Clock, label: isHe ? 'סה"כ השבוע' : 'Week Total', value: `${Math.round(summary.totalMin / 60)}h ${summary.totalMin % 60}m`, color: 'text-primary' },
    { icon: Brain, label: isHe ? '% עבודה עמוקה' : 'Deep Work %', value: `${summary.deepPct}%`, color: 'text-violet-500' },
    { icon: TrendingUp, label: isHe ? 'מהירות ממוצעת' : 'Avg Velocity', value: `${summary.avgVelocity}`, color: 'text-emerald-500' },
    { icon: Flame, label: isHe ? 'ימים פעילים' : 'Active Days', value: `${summary.activeDays}/7`, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="p-3 rounded-xl border border-border bg-card flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-muted/50", card.color)}>
              <card.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold">{card.value}</p>
              <p className="text-[11px] text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold mb-3">
          {isHe ? '📊 מגמה שבועית (דקות)' : '📊 Weekly Trend (minutes)'}
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={2}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={30} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Bar dataKey="deep" stackId="a" radius={[0, 0, 0, 0]} name={isHe ? 'עמוק' : 'Deep'}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'} />
              ))}
            </Bar>
            <Bar dataKey="total" stackId="a" radius={[4, 4, 0, 0]} name={isHe ? 'רגיל' : 'Shallow'}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.isToday ? 'hsl(var(--muted-foreground) / 0.4)' : 'hsl(var(--muted-foreground) / 0.2)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today deep vs shallow pie */}
      {(pieData[0].value > 0 || pieData[1].value > 0) && (
        <div className="p-4 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-3">
            {isHe ? '🧠 חלוקת עבודה היום' : '🧠 Today\'s Work Split'}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
