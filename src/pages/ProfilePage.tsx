/**
 * ProfilePage — Fullscreen modal overlay for the Character Profile.
 * Renders via createPortal. Now opened via ProfileModalContext (no route).
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { X } from 'lucide-react';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import BackButton from '@/components/navigation/BackButton';
import SelfPanel from '@/components/self/SelfPanel';
import { artifactBus } from '@/lib/aion/artifactBus';
import { ViewIdentityScope } from '@/viewIdentity';

export default function ProfilePage() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { isOpen, closeProfile } = useProfileModal();

  // Lock body scroll while profile is mounted
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // "Advanced" closes this modal and summons the deep-stats artifact in chat.
  const openAdvanced = () => {
    closeProfile();
    artifactBus.summon('profile-stats', {}, { fullscreen: true, replaceKind: true });
  };

  const content = (
    <div
      className="fixed inset-0 z-[70] flex flex-col overflow-y-auto scrollbar-hide"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background-end, var(--background))) 40%, hsl(var(--background)) 100%)' }}
    >
      <ViewIdentityScope id="profile" />
      {/* ═══════ HEADER: Back + Close ═══════ */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-3">
        <BackButton onBack={closeProfile} />
        <button
          onClick={closeProfile}
          aria-label={isHe ? 'סגור' : 'Close'}
          className="w-9 h-9 rounded-full bg-muted/60 backdrop-blur-md flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Identity-first SelfPanel only. Stats live behind "Advanced",
          which summons the profile-stats artifact (Phase 3B). */}
      <SelfPanel onOpenAdvanced={openAdvanced} />
      <div className="h-16" />
    </div>
  );

  return createPortal(content, document.body);
}
