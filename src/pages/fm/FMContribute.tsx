import { useState } from 'react';
import { Shield, Eye, EyeOff, Coins, CheckCircle2, XCircle, Lock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface DataOffer {
  id: string;
  type: string;
  icon: string;
  labelEn: string;
  labelHe: string;
  descEn: string;
  descHe: string;
  days: number;
  reward: number;
  fieldsEn: string[];
  fieldsHe: string[];
}

const DATA_OFFERS: DataOffer[] = [
  {
    id: 'sleep', type: 'sleep_patterns', icon: '😴',
    labelEn: 'Sleep Patterns', labelHe: 'דפוסי שינה',
    descEn: 'Help researchers understand healthy sleep cycles',
    descHe: 'עזור לחוקרים להבין מחזורי שינה בריאים',
    days: 30, reward: 100,
    fieldsEn: ['Average sleep duration', 'Sleep consistency score', 'Wake frequency'],
    fieldsHe: ['ממוצע שעות שינה', 'ציון עקביות שינה', 'תדירות התעוררות'],
  },
  {
    id: 'habits', type: 'habit_trends', icon: '🎯',
    labelEn: 'Habit Completion Trends', labelHe: 'מגמות השלמת הרגלים',
    descEn: 'Improve habit-building algorithms for everyone',
    descHe: 'שפר אלגוריתמי בניית הרגלים לכולם',
    days: 90, reward: 250,
    fieldsEn: ['Completion rates per category', 'Streak patterns', 'Drop-off points'],
    fieldsHe: ['שיעורי השלמה לפי קטגוריה', 'דפוסי רצף', 'נקודות נשירה'],
  },
  {
    id: 'mood', type: 'mood_signals', icon: '🧠',
    labelEn: 'Mood & Energy Signals', labelHe: 'אותות מצב רוח ואנרגיה',
    descEn: 'Advance mental wellness research anonymously',
    descHe: 'קדם מחקר בריאות נפשית באופן אנונימי',
    days: 60, reward: 150,
    fieldsEn: ['Daily energy averages', 'Mood trend curves', 'Activity correlations'],
    fieldsHe: ['ממוצעי אנרגיה יומיים', 'עקומות מגמת מצב רוח', 'מתאמי פעילות'],
  },
  {
    id: 'training', type: 'training_results', icon: '💪',
    labelEn: 'Training & Session Data', labelHe: 'נתוני אימון וסשנים',
    descEn: 'Help optimize coaching and training programs',
    descHe: 'עזור לשפר תכניות אימון וקואצ׳ינג',
    days: 60, reward: 180,
    fieldsEn: ['Session completion rates', 'Engagement metrics', 'Outcome scores'],
    fieldsHe: ['שיעורי השלמת סשנים', 'מדדי מעורבות', 'ציוני תוצאה'],
  },
];

export default function FMContribute() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data: existing = [] } = useQuery({
    queryKey: ['fm-data-contributions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fm_data_contributions')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const getContribution = (type: string) => existing.find((c: any) => c.data_type === type && !c.revoked_at);

  const handleShare = async (offer: DataOffer) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('fm_data_contributions').insert({
        user_id: user.id,
        data_type: offer.type,
        days_shared: offer.days,
        reward_mos: offer.reward,
        consent_hash: `consent_${user.id}_${offer.type}_${Date.now()}`,
        status: 'active',
      });
      if (error) throw error;
      toast.success(isHe ? `${offer.reward} MOS יתווספו לארנק שלך!` : `${offer.reward} MOS will be added to your wallet!`);
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  const handleRevoke = async (contributionId: string) => {
    try {
      const { error } = await supabase
        .from('fm_data_contributions')
        .update({ revoked_at: new Date().toISOString(), status: 'revoked' })
        .eq('id', contributionId);
      if (error) throw error;
      toast.success(isHe ? 'הגישה בוטלה.' : 'Access revoked.');
      queryClient.invalidateQueries({ queryKey: ['fm-data-contributions'] });
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  const activeCount = existing.filter((c: any) => !c.revoked_at).length;
  const totalEarned = existing.filter((c: any) => !c.revoked_at).reduce((sum: number, c: any) => sum + c.reward_mos, 0);

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'שתף והרוויח' : 'Share & Earn'}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isHe ? 'הנתונים שלך, הערך שלך.' : 'Your data, your value.'}
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'שיתופים פעילים' : 'Active Shares'}</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-accent">{totalEarned}</p>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'MOS שהרווחת' : 'MOS Earned'}</p>
        </div>
      </div>

      {/* Philosophy callout */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex items-start gap-3">
        <BarChart3 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">
            {isHe ? 'אנחנו לא לוקחים — אנחנו מבקשים.' : "We don't take — we ask."}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isHe
              ? 'כל מידע אנונימי. אתה בוחר מה לשתף ויכול לבטל בכל עת.'
              : 'All data is anonymized. You choose what to share and can revoke anytime.'}
          </p>
        </div>
      </div>

      {/* Data offers */}
      <div className="space-y-3">
        {DATA_OFFERS.map((offer) => {
          const contribution = getContribution(offer.type);
          const isActive = !!contribution;
          const expanded = expandedId === offer.id;
          const confirming = confirmId === offer.id;

          return (
            <motion.div
              key={offer.id}
              layout
              className="bg-card border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{offer.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{isHe ? offer.labelHe : offer.labelEn}</h3>
                      <p className="text-[11px] text-muted-foreground">{isHe ? offer.descHe : offer.descEn}</p>
                    </div>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> {isHe ? 'פעיל' : 'Active'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-accent" />
                      <span className="font-semibold text-foreground">{offer.reward} MOS</span>
                    </span>
                    <span>{offer.days} {isHe ? 'ימים' : 'days'}</span>
                  </div>
                </div>
              </div>

              {/* What's shared */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-muted/50 rounded-lg p-3 space-y-1.5 overflow-hidden"
                  >
                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" /> {isHe ? 'מה בדיוק משותף:' : "Exactly what's shared:"}
                    </p>
                    <ul className="space-y-1">
                      {(isHe ? offer.fieldsHe : offer.fieldsEn).map((f, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-accent shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/50">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">
                        {isHe ? 'ללא שם, אימייל, או מידע מזהה אישי' : 'No name, email, or personally identifiable info'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm consent step */}
              <AnimatePresence>
                {confirming && !isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-accent/5 border border-accent/20 rounded-lg p-3 space-y-2 overflow-hidden"
                  >
                    <p className="text-xs font-medium text-foreground">
                      {isHe ? 'אני מאשר/ת:' : 'I confirm:'}
                    </p>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li>✓ {isHe ? 'הנתונים שלי ישותפו באופן אנונימי' : 'My data will be shared anonymously'}</li>
                      <li>✓ {isHe ? 'אני יכול/ה לבטל בכל עת' : 'I can revoke access anytime'}</li>
                      <li>✓ {isHe ? `אקבל ${offer.reward} MOS כתגמול` : `I'll receive ${offer.reward} MOS as reward`}</li>
                    </ul>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => handleShare(offer)} className="gap-1 text-xs">
                        <Shield className="w-3.5 h-3.5" /> {isHe ? 'אישור ושיתוף' : 'Confirm & Share'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)} className="text-xs">
                        {isHe ? 'ביטול' : 'Cancel'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedId(expanded ? null : offer.id)}
                  className="gap-1 text-xs text-muted-foreground"
                >
                  {expanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {expanded ? (isHe ? 'הסתר' : 'Hide') : (isHe ? 'מה משותף?' : "What's shared?")}
                </Button>
                {isActive ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevoke(contribution!.id)}
                    className="gap-1 text-xs text-destructive hover:text-destructive"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {isHe ? 'בטל גישה' : 'Revoke'}
                  </Button>
                ) : confirming ? null : (
                  <Button size="sm" onClick={() => setConfirmId(offer.id)} className="gap-1 text-xs">
                    <Coins className="w-3.5 h-3.5" /> {isHe ? 'שתף →' : 'Share →'}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer trust badge */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 pt-2 pb-4">
        <Shield className="w-4 h-4 shrink-0" />
        <span>{isHe ? 'MindOS לא מוכרת מידע אישי. לעולם.' : 'MindOS never sells personal data. Ever.'}</span>
      </div>
    </div>
  );
}
