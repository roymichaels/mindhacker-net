/**
 * FloatingBackButton — global iOS-style back chevron.
 *
 * Mounts on every route except primary shell tabs and public marketing.
 * Uses history when possible; falls back to /outer-world.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const HIDDEN_PREFIXES = [
  '/',          // exact root only — handled below
  '/aurora',
  '/brain',
  '/outer-world',
  '/auth',
  '/login',
  '/signup',
  '/go',
  '/founding',
  '/avatar',
];

function shouldHide(pathname: string): boolean {
  if (pathname === '/') return true;
  return HIDDEN_PREFIXES.some(
    (p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/')),
  );
}

export default function FloatingBackButton() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();

  if (shouldHide(pathname)) return null;

  const Chevron = isRTL ? ChevronRight : ChevronLeft;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/outer-world');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={isRTL ? 'חזרה' : 'Back'}
      className="fixed z-[55] h-9 w-9 inline-flex items-center justify-center rounded-full bg-background/70 backdrop-blur-xl border border-white/10 text-foreground/90 active:scale-95 transition shadow-sm"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 4.25rem)',
        insetInlineStart: 'calc(env(safe-area-inset-left, 0px) + 0.75rem)',
      }}
    >
      <Chevron className="h-5 w-5" />
    </button>
  );
}
