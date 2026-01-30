import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { User, Heart, Shield } from 'lucide-react';

interface IdentityProfileProps {
  profile: {
    dominant_traits: string[];
    suggested_ego_state: string;
    values_hierarchy: string[];
  };
  behavioral?: {
    habits_to_transform: string[];
    habits_to_cultivate: string[];
    resistance_patterns: string[];
  };
}

const EGO_STATE_ICONS: Record<string, string> = {
  warrior: '⚔️',
  guardian: '🛡️',
  creator: '🎨',
  seeker: '🔍',
  sage: '🧙',
};

const EGO_STATE_LABELS: Record<string, { en: string; he: string }> = {
  warrior: { en: 'Warrior', he: 'לוחם' },
  guardian: { en: 'Guardian', he: 'שומר' },
  creator: { en: 'Creator', he: 'יוצר' },
  seeker: { en: 'Seeker', he: 'מחפש' },
  sage: { en: 'Sage', he: 'חכם' },
};

export function IdentityProfile({ profile, behavioral }: IdentityProfileProps) {
  const { language, isRTL } = useTranslation();

  const egoState = profile.suggested_ego_state?.toLowerCase() || 'guardian';
  const egoIcon = EGO_STATE_ICONS[egoState] || '🛡️';
  const egoLabel = EGO_STATE_LABELS[egoState] || EGO_STATE_LABELS.guardian;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        {language === 'he' ? '🎭 פרופיל הזהות' : '🎭 Identity Profile'}
      </h3>

      <div className="grid gap-4">
        {/* Ego State */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 text-center"
        >
          <div className="text-4xl mb-2">{egoIcon}</div>
          <div className="text-sm text-muted-foreground">
            {language === 'he' ? 'מצב אגו מומלץ' : 'Suggested Ego State'}
          </div>
          <div className="text-xl font-bold text-primary">
            {language === 'he' ? egoLabel.he : egoLabel.en}
          </div>
        </motion.div>

        {/* Traits */}
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-sm">
              {language === 'he' ? 'תכונות מובילות' : 'Dominant Traits'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.dominant_traits?.map((trait, i) => (
              <span
                key={i}
                className="text-sm px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="p-4 rounded-xl bg-card/50 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-medium text-sm">
              {language === 'he' ? 'היררכיית ערכים' : 'Values Hierarchy'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {profile.values_hierarchy?.map((value, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {value}
                </span>
                {i < profile.values_hierarchy.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Insights */}
        {behavioral && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-xs font-medium text-red-500 mb-2">
                {language === 'he' ? '🚫 הרגלים לשינוי' : '🚫 Habits to Transform'}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {behavioral.habits_to_transform?.slice(0, 3).map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs font-medium text-green-500 mb-2">
                {language === 'he' ? '✅ הרגלים לפיתוח' : '✅ Habits to Cultivate'}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {behavioral.habits_to_cultivate?.slice(0, 3).map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
