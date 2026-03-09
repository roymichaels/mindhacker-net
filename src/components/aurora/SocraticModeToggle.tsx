/**
 * SocraticModeToggle — Toggle for Socratic questioning mode.
 * When enabled, Aurora asks progressively deeper questions instead of giving answers.
 */
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export default function SocraticModeToggle() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('aurora_preferences')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const prefs = data?.aurora_preferences as Record<string, unknown> | null;
        setEnabled(prefs?.socratic_mode === true);
        setLoading(false);
      });
  }, [user?.id]);

  const handleToggle = async (val: boolean) => {
    if (!user?.id) return;
    setEnabled(val);

    const { data: current } = await supabase
      .from('profiles')
      .select('aurora_preferences')
      .eq('id', user.id)
      .single();

    const existing = (current?.aurora_preferences as Record<string, unknown>) || {};
    const { error } = await supabase
      .from('profiles')
      .update({
        aurora_preferences: { ...existing, socratic_mode: val },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      setEnabled(!val);
      toast.error(isHe ? 'שגיאה בשמירה' : 'Failed to save');
    } else {
      toast.success(
        val
          ? (isHe ? 'מצב סוקרטי הופעל 🏛️' : 'Socratic Mode activated 🏛️')
          : (isHe ? 'מצב סוקרטי כבוי' : 'Socratic Mode deactivated')
      );
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <HelpCircle className={`w-4 h-4 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
        <div>
          <p className="text-sm font-medium text-foreground">
            {isHe ? 'מצב סוקרטי' : 'Socratic Mode'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isHe
              ? 'אורורה שואלת שאלות במקום לתת תשובות'
              : 'Aurora asks questions instead of giving answers'}
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
}
