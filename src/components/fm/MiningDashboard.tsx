/**
 * Mining Dashboard — Play2Earn activity tracker
 * Shows today's mining stats, activity breakdown, and recent history.
 */
import { Coins, Pickaxe, TrendingUp, Zap, Clock, Shield } from 'lucide-react';
import { useMiningStats, DailyBreakdown } from '@/hooks/fm/useMiningStats';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS: Record<string, string> = {
  hypnosis_session: '🧘',
  habit_completion: '✅',
  habit_streak_3: '🔥',
  habit_streak_7: '💎',
  community_post: '📝',
  community_comment: '💬',
  learning_lesson: '📚',
  daily_login: '👋',
  diagnostic_eval: '🎯',
};

const ACTIVITY_LABELS_HE: Record<string, string> = {
  hypnosis_session: 'סשן היפנוזה',
  habit_completion: 'השלמת הרגל',
  habit_streak_3: 'רצף 3 ימים',
  habit_streak_7: 'רצף 7 ימים',
  community_post: 'פוסט בקהילה',
  community_comment: 'תגובה בקהילה',
  learning_lesson: 'שיעור למידה',
  daily_login: 'כניסה יומית',
  diagnostic_eval: 'סריקה',
};

export function MiningDashboard() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { dailyBreakdown, todayTotal, todayCount, recentLogs, isLoading } = useMiningStats();

  const DAILY_GLOBAL_CAP = 200;
  const capPercent = Math.min(100, (todayTotal / DAILY_GLOBAL_CAP) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Pickaxe className="w-5 h-5 animate-bounce mr-2" />
        {isHe ? 'טוען...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Pickaxe className="w-5 h-5 text-accent" />
          {isHe ? 'כריית MOS' : 'MOS Mining'}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'הרוויח MOS אוטומטית מהפעילות שלך' : 'Auto-earn MOS from your daily activity'}
        </p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-2xl font-bold text-foreground">{todayTotal}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'MOS היום' : 'MOS Today'}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-xl p-4 text-center"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-2xl font-bold text-foreground">{todayCount}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'פעולות שנכרו' : 'Actions Mined'}</p>
        </motion.div>
      </div>

      {/* Daily Cap Progress */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            {isHe ? 'מגבלה יומית' : 'Daily Cap'}
          </span>
          <span className="font-medium text-foreground">{todayTotal} / {DAILY_GLOBAL_CAP} MOS</span>
        </div>
        <Progress value={capPercent} className="h-2" />
        <p className="text-[10px] text-muted-foreground">
          {capPercent >= 100
            ? (isHe ? '🎉 הגעת למקסימום היומי!' : '🎉 Daily maximum reached!')
            : (isHe ? `עוד ${DAILY_GLOBAL_CAP - todayTotal} MOS אפשר לכרות היום` : `${DAILY_GLOBAL_CAP - todayTotal} MOS still mineable today`)}
        </p>
      </div>

      {/* Activity Breakdown */}
      {dailyBreakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-muted-foreground" />
            {isHe ? 'פירוט פעילות' : 'Activity Breakdown'}
          </h3>
          <div className="space-y-2">
            {dailyBreakdown.map((b) => (
              <ActivityRow key={b.activity_type} breakdown={b} isHe={isHe} />
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 space-y-2">
        <p className="text-xs font-medium text-foreground">
          ⛏️ {isHe ? 'איך זה עובד?' : 'How does mining work?'}
        </p>
        <ul className="space-y-1 text-[11px] text-muted-foreground">
          <li>• {isHe ? 'כל פעילות שמושלמת — סשן, הרגל, פוסט, שיעור — כורה MOS אוטומטית' : 'Every completed activity — session, habit, post, lesson — auto-mines MOS'}</li>
          <li>• {isHe ? 'מגבלה יומית מונעת ניצול לרעה ושומרת על ערך' : 'Daily caps prevent abuse and preserve value'}</li>
          <li>• {isHe ? 'צמיחה אמיתית = ערך אמיתי. Proof of Growth.' : 'Real growth = real value. Proof of Growth.'}</li>
        </ul>
      </div>

      {/* Recent Mining History */}
      {recentLogs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {isHe ? 'היסטוריית כרייה' : 'Mining History'}
          </h3>
          <div className="space-y-1.5">
            {recentLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{ACTIVITY_ICONS[log.activity_type] || '⚡'}</span>
                  <span className="text-xs text-foreground">{log.activity_type.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-accent">+{log.mos_awarded}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(log.mined_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayCount === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Pickaxe className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{isHe ? 'עדיין לא כרית היום' : "You haven't mined today yet"}</p>
          <p className="text-xs mt-1">{isHe ? 'השלם סשן, הרגל או שיעור כדי להתחיל' : 'Complete a session, habit, or lesson to start'}</p>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ breakdown, isHe }: { breakdown: DailyBreakdown; isHe: boolean }) {
  const pct = Math.min(100, (breakdown.total / breakdown.cap) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span>{ACTIVITY_ICONS[breakdown.activity_type] || '⚡'}</span>
          <span className="text-foreground">{isHe ? breakdown.label_he : breakdown.label_en}</span>
        </span>
        <span className="text-muted-foreground">
          {breakdown.total}/{breakdown.cap} <span className="text-accent">MOS</span>
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

const ACTIVITY_ICONS_MAP = ACTIVITY_ICONS;
