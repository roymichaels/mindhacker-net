/**
 * HeaderBrand — platform identity in the header.
 * Shows "MindOS" as the platform anchor with the current environment
 * label (Strategy, Hypnosis, Free Market, etc.) as a subtle subtitle.
 * Strictly platform identity — never the user avatar.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { OS_TABS, COACH_TAB, ADMIN_TAB } from '@/navigation/osNav';

const STATIC_TITLES: Record<string, { en: string; he: string }> = {
  '/': { en: 'MindOS', he: 'MindOS' },
  '/aurora': { en: 'Home', he: 'בית' },
  '/mindos/chat': { en: 'AION', he: 'אוֹריוֹן' },
  '/profile': { en: 'Profile', he: 'פרופיל' },
  '/messages': { en: 'Messages', he: 'הודעות' },
  '/panel': { en: 'Admin', he: 'ניהול' },
  '/coach': { en: 'Coach', he: 'מאמן' },
  '/affiliate': { en: 'Affiliate', he: 'שותפים' },
  '/learn': { en: 'Study', he: 'לימוד' },
};

function useEnvironmentLabel(): string | null {
  const { language } = useTranslation();
  const { pathname } = useLocation();
  const isHe = language === 'he';

  // Match the most specific OS tab first
  const allTabs = [...OS_TABS, COACH_TAB, ADMIN_TAB];
  const match = allTabs
    .filter((t) => pathname === t.path || pathname.startsWith(t.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];
  if (match) return isHe ? match.labelHe : match.labelEn;

  // Static page titles
  for (const [path, label] of Object.entries(STATIC_TITLES)) {
    if (pathname === path) return isHe ? label.he : label.en;
  }
  return null;
}

export function HeaderBrand() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const env = useEnvironmentLabel();

  return (
    <button
      type="button"
      onClick={() => navigate('/aurora')}
      className="flex items-baseline gap-2 min-w-0 text-start"
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label="MindOS home"
    >
      <span className="text-[15px] font-semibold tracking-tight text-foreground">MindOS</span>
      {env && env !== 'MindOS' && (
        <>
          <span className="text-muted-foreground/40 text-[13px]">·</span>
          <span className="text-[13px] font-medium text-muted-foreground truncate">{env}</span>
        </>
      )}
    </button>
  );
}

export default HeaderBrand;