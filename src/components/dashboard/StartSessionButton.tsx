/**
 * StartSessionButton - Reusable "Start Session" CTA button with motivational greeting.
 */
import { useMemo } from 'react';
import { Play, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import { useAuth } from '@/contexts/AuthContext';

function getGreeting(language: string): { emoji: string; text: string } {
  const hour = new Date().getHours();
  const isHe = language === 'he';

  if (hour >= 5 && hour < 12) {
    const options = isHe
      ? [
          { emoji: '🌅', text: 'בוקר טוב — הגוף ער, הנפש מוכנה. בוא נתחיל' },
          { emoji: '☀️', text: 'בוקר של אפשרויות — היום הזה שלך' },
          { emoji: '🔥', text: 'הבוקר הוא שלך — תנצל אותו' },
        ]
      : [
          { emoji: '🌅', text: 'Good morning — your mind is fresh. Let\'s begin' },
          { emoji: '☀️', text: 'A morning of possibilities — this day is yours' },
          { emoji: '🔥', text: 'The morning is yours — make it count' },
        ];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (hour >= 12 && hour < 17) {
    const options = isHe
      ? [
          { emoji: '⚡', text: 'אמצע היום — זמן מושלם לטעינה מחדש' },
          { emoji: '🎯', text: 'עוד חצי יום של פוטנציאל — בוא נמקד' },
          { emoji: '💪', text: 'הצהריים שלך — רגע של עוצמה שקטה' },
        ]
      : [
          { emoji: '⚡', text: 'Midday — perfect time to recharge' },
          { emoji: '🎯', text: 'Half a day of potential left — let\'s focus' },
          { emoji: '💪', text: 'Your afternoon — a moment of quiet power' },
        ];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (hour >= 17 && hour < 21) {
    const options = isHe
      ? [
          { emoji: '🌇', text: 'ערב טוב — זה הזמן לשחרר ולהתמקד פנימה' },
          { emoji: '✨', text: 'היום עוד לא נגמר — יש עוד רגע של צמיחה' },
          { emoji: '🧘', text: 'הערב הוא שלך — בוא נסיים את היום בנקודה גבוהה' },
        ]
      : [
          { emoji: '🌇', text: 'Good evening — time to release and look inward' },
          { emoji: '✨', text: 'The day isn\'t over — there\'s still a moment for growth' },
          { emoji: '🧘', text: 'Your evening — let\'s end the day on a high note' },
        ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Night (21-5)
  const options = isHe
    ? [
        { emoji: '🌙', text: 'לילה טוב — סשן לפני השינה הוא מתנה לעצמך' },
        { emoji: '🌌', text: 'העולם שקט — הזמן המושלם לחיבור פנימי' },
        { emoji: '💫', text: 'הלילה הזה שייך לך — בוא ניצור שינוי שקט' },
      ]
    : [
        { emoji: '🌙', text: 'Good night — a session before sleep is a gift to yourself' },
        { emoji: '🌌', text: 'The world is quiet — perfect time for inner connection' },
        { emoji: '💫', text: 'This night is yours — let\'s create quiet change' },
      ];
  return options[Math.floor(Math.random() * options.length)];
}

export function StartSessionButton() {
  const { t, language } = useTranslation();
  const { impact } = useHaptics();
  const { openHypnosis } = useAuroraActions();
  const { canAccessHypnosis, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();
  const { user } = useAuth();

  // Stable per-render (changes on remount / navigation)
  const greeting = useMemo(() => getGreeting(language), [language]);

  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name;
  const firstName = displayName ? displayName.split(' ')[0] : null;

  const handleClick = () => {
    if (!canAccessHypnosis) {
      showUpgradePrompt('hypnosis');
      return;
    }
    impact('medium');
    openHypnosis();
  };

  return (
    <>
      {/* Motivational greeting */}
      <div className="text-center px-3 mb-2">
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          <span>{greeting.emoji} </span>
          {firstName && <span className="font-semibold text-foreground">{firstName}</span>}
          {firstName && <span className="text-muted-foreground">, </span>}
          <span>{greeting.text}</span>
        </p>
      </div>

      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-md"
      >
        <span className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
          <Clock className="w-4 h-4" />15 {t('dashboard.minutesShort')}
        </span>
        <span className="flex items-center gap-2 text-base font-bold text-primary-foreground">
          <Play className="w-5 h-5 fill-primary-foreground" />
          {t('dashboard.startSession')}
        </span>
      </button>
      {upgradeFeature && (
        <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
      )}
    </>
  );
}
