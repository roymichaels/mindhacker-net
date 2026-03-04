import { ArrowLeft, Shield, Eye, RotateCcw, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

interface DataOffer {
  id: string;
  type: string;
  icon: string;
  labelEn: string;
  labelHe: string;
  days: number;
  reward: number;
  fieldsEn: string[];
  fieldsHe: string[];
}

const DATA_OFFERS: DataOffer[] = [
  {
    id: 'sleep', type: 'sleep_patterns', icon: '😴',
    labelEn: 'Sleep Patterns', labelHe: 'דפוסי שינה',
    days: 30, reward: 100,
    fieldsEn: ['Average sleep duration', 'Sleep consistency score', 'Wake frequency'],
    fieldsHe: ['ממוצע שעות שינה', 'ציון עקביות שינה', 'תדירות התעוררות'],
  },
  {
    id: 'habits', type: 'habit_trends', icon: '🎯',
    labelEn: 'Habit Completion Trends', labelHe: 'מגמות השלמת הרגלים',
    days: 90, reward: 250,
    fieldsEn: ['Completion rates per category', 'Streak patterns', 'Drop-off points'],
    fieldsHe: ['שיעורי השלמה לפי קטגוריה', 'דפוסי רצף', 'נקודות נשירה'],
  },
  {
    id: 'mood', type: 'mood_signals', icon: '🧠',
    labelEn: 'Mood & Energy Signals', labelHe: 'אותות מצב רוח ואנרגיה',
    days: 60, reward: 150,
    fieldsEn: ['Daily energy averages', 'Mood trend curves', 'Activity correlations'],
    fieldsHe: ['ממוצעי אנרגיה יומיים', 'עקומות מגמת מצב רוח', 'מתאמי פעילות'],
  },
];

export default function FMContribute() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const alreadyShared = (type: string) => existing.some((c: any) => c.data_type === type && !c.revoked_at);

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
      toast.success(isHe ? `הרווחת ${offer.reward} MOS! תודה על השיתוף.` : `Earned ${offer.reward} MOS! Thanks for sharing.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full py-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/fm')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">{isHe ? 'שתף והרוויח' : 'Share & Earn'}</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        {isHe
          ? 'הנתונים האנונימיים שלך עוזרים לשפר את MindOS עבור כולם.'
          : 'Your anonymous data helps improve MindOS for everyone.'}
      </p>

      <div className="space-y-3">
        {DATA_OFFERS.map((offer) => {
          const shared = alreadyShared(offer.type);
          const expanded = expandedId === offer.id;
          return (
            <div key={offer.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{offer.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{isHe ? offer.labelHe : offer.labelEn}</h3>
                    <p className="text-xs text-muted-foreground">
                      {isHe ? `שתף ${offer.days} ימים` : `Share ${offer.days} days`} → <span className="text-accent font-semibold">{offer.reward} MOS</span>
                    </p>
                  </div>
                </div>
              </div>

              {expanded && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> {isHe ? 'מה משותף:' : "What's shared:"}
                  </p>
                  <ul className="space-y-1">
                    {(isHe ? offer.fieldsHe : offer.fieldsEn).map((f, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {f}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 pt-1">
                    <Shield className="w-3 h-3" /> {isHe ? 'ללא מידע מזהה אישי (PII)' : 'No personally identifiable information (PII)'}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedId(expanded ? null : offer.id)}
                  className="gap-1 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> {isHe ? 'מה משותף?' : "What's shared?"}
                </Button>
                {shared ? (
                  <Button size="sm" variant="ghost" className="gap-1 text-xs text-muted-foreground" disabled>
                    <RotateCcw className="w-3.5 h-3.5" /> {isHe ? 'כבר שותף' : 'Already shared'}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleShare(offer)} className="gap-1 text-xs">
                    <Coins className="w-3.5 h-3.5" /> {isHe ? 'שתף →' : 'Share →'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground/60 pt-2">
        <Shield className="w-4 h-4 shrink-0" />
        <span>{isHe ? 'כל הנתונים אנונימיים. ניתן לבטל גישה בכל עת.' : 'All data is anonymized. You can revoke access anytime.'}</span>
      </div>
    </div>
  );
}
