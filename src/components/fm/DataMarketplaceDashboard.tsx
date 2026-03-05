/**
 * DataMarketplaceDashboard — user-facing data consent + revenue dashboard.
 * Shown in the Contribute tab of FM.
 */
import { useState } from 'react';
import { Shield, ToggleLeft, ToggleRight, Coins, TrendingUp, Database, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useDataConsent, useDataRevenue, useDataListings } from '@/hooks/fm/useDataMarketplace';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { key: 'sleep_patterns', emoji: '😴', labelEn: 'Sleep Patterns', labelHe: 'דפוסי שינה', descEn: 'Session duration, consistency scores', descHe: 'משך סשנים, ציוני עקביות' },
  { key: 'habit_trends', emoji: '🎯', labelEn: 'Habit Trends', labelHe: 'מגמות הרגלים', descEn: 'Completion rates, streak patterns', descHe: 'שיעורי השלמה, דפוסי רצף' },
  { key: 'mood_signals', emoji: '🧠', labelEn: 'Mood & Energy', labelHe: 'מצב רוח ואנרגיה', descEn: 'Energy distribution, daily averages', descHe: 'פיזור אנרגיה, ממוצעים יומיים' },
  { key: 'training_results', emoji: '💪', labelEn: 'Training Data', labelHe: 'נתוני אימון', descEn: 'Lesson completions, XP metrics', descHe: 'השלמות שיעורים, מדדי XP' },
];

export default function DataMarketplaceDashboard() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { consents, isLoading, toggleConsent } = useDataConsent();
  const { data: revenue } = useDataRevenue();
  const { data: listings = [] } = useDataListings();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const getConsent = (cat: string) => consents.find(c => c.category === cat);
  const activeCount = consents.filter(c => c.is_opted_in).length;

  const handleToggle = async (category: string, currentlyOptedIn: boolean) => {
    try {
      await toggleConsent.mutateAsync({ category, optIn: !currentlyOptedIn });
      toast.success(
        !currentlyOptedIn
          ? (isHe ? 'שיתוף הופעל — תרוויח MOS מרכישות נתונים!' : 'Sharing enabled — you\'ll earn MOS from data purchases!')
          : (isHe ? 'שיתוף בוטל.' : 'Sharing disabled.')
      );
    } catch {
      toast.error(isHe ? 'שגיאה' : 'Error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{activeCount}</p>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'קטגוריות פעילות' : 'Active Categories'}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-accent">{revenue?.totalEarned ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'MOS מנתונים' : 'MOS from Data'}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-foreground">{listings.length}</p>
          <p className="text-[10px] text-muted-foreground">{isHe ? 'מאגרים פעילים' : 'Active Datasets'}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-3.5 flex items-start gap-3">
        <Database className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-foreground">
            {isHe ? 'שוק הנתונים — הרוויח פסיבית' : 'Data Marketplace — Earn Passively'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isHe
              ? 'הפעל קטגוריות → נתונים אנונימיים נאספים → כשחוקרים קונים → אתה מרוויח MOS אוטומטית'
              : 'Enable categories → anonymized data aggregated → when researchers buy → you earn MOS automatically'}
          </p>
        </div>
      </div>

      {/* Consent Toggles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">{isHe ? 'ניהול שיתוף נתונים' : 'Data Sharing Controls'}</h3>
        {CATEGORIES.map(cat => {
          const consent = getConsent(cat.key);
          const isOptedIn = consent?.is_opted_in ?? false;
          const isExpanded = expandedCat === cat.key;

          return (
            <motion.div key={cat.key} layout className="bg-card border border-border rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{isHe ? cat.labelHe : cat.labelEn}</p>
                  <p className="text-[11px] text-muted-foreground">{isHe ? cat.descHe : cat.descEn}</p>
                </div>
                <button
                  onClick={() => handleToggle(cat.key, isOptedIn)}
                  disabled={toggleConsent.isPending}
                  className="shrink-0"
                >
                  {isOptedIn
                    ? <ToggleRight className="w-8 h-8 text-accent" />
                    : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                  }
                </button>
              </div>

              {/* Expandable details */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setExpandedCat(isExpanded ? null : cat.key)}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> {isExpanded ? (isHe ? 'הסתר' : 'Hide') : (isHe ? 'פרטים' : 'Details')}
                </button>
                {isOptedIn && consent?.opted_in_at && (
                  <span className="text-[10px] text-muted-foreground/50">
                    {isHe ? 'פעיל מאז' : 'Active since'} {new Date(consent.opted_in_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 bg-muted/50 rounded-lg p-3 space-y-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground">
                        {isHe ? 'רק נתונים מצטברים ואנונימיים — מינימום 10 משתתפים לכל סנאפשוט' : 'Only aggregated anonymized data — minimum 10 contributors per snapshot'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3 h-3 text-accent" />
                      <p className="text-[10px] text-muted-foreground">
                        {isHe ? '80% מההכנסה מחולקת לתורמים באופן שווה' : '80% of revenue distributed equally to contributors'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue History */}
      {(revenue?.shares?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-accent" />
            {isHe ? 'היסטוריית הכנסות' : 'Revenue History'}
          </h3>
          <div className="space-y-1.5">
            {revenue!.shares.slice(0, 10).map(share => (
              <div key={share.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-foreground capitalize">
                    {share.category.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {share.paid_at ? new Date(share.paid_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className="text-sm font-bold text-accent">+{share.share_mos} MOS</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust footer */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 pt-2 pb-4">
        <Shield className="w-4 h-4 shrink-0" />
        <span>{isHe ? 'כל הנתונים אנונימיים. מינימום 10 משתתפים לכל קטגוריה. ביטול בכל עת.' : 'All data anonymized. Minimum 10 contributors per category. Revoke anytime.'}</span>
      </div>
    </div>
  );
}
