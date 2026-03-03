/**
 * LearnLayoutWrapper - Registers Learn-specific sidebar and renders Learn page.
 * Passes action callbacks to sidebar via a shared ref approach.
 */
import { Suspense, lazy, useCallback, useState, useRef, useEffect } from 'react';
import { LearnActivitySidebar } from '@/components/learn/LearnActivitySidebar';
import { useSidebars } from '@/hooks/useSidebars';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';

const Learn = lazy(() => import('@/pages/Learn'));

export default function LearnLayoutWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LearnLayoutInner />
    </Suspense>
  );
}

function LearnLayoutInner() {
  const auroraChat = useAuroraChatContextSafe();
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [recalibrating, setRecalibrating] = useState(false);

  const openWizardInDock = useCallback(() => {
    if (!auroraChat) return;
    auroraChat.setActivePillar('learn');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '🔥 שלום! אני Aurora, ואני הולכת לבנות לך תוכנית לימודים אינטנסיבית.\n\nזה לא קורס רגיל — זה **Boot Camp**. אני אדחוף אותך מאפס למקצוען.\n\n**מה אתה רוצה ללמוד?**\n\nתהיה ספציפי — "Python לData Science", "גיטרה קלאסית", "שיווק דיגיטלי" — כל מה שתרצה.'
        : "🔥 Hey! I'm Aurora, and I'm about to build you an intensive learning curriculum.\n\nThis isn't a casual course — this is a **Boot Camp**. I'll push you from zero to pro.\n\n**What do you want to learn?**\n\nBe specific — \"Python for Data Science\", \"Classical Guitar\", \"Digital Marketing\" — anything you want to master."
    );
  }, [auroraChat, isHe]);

  // Recalibrate is handled by dispatching a custom event that Learn.tsx picks up
  const handleRecalibrate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('learn:recalibrate'));
  }, []);

  // Listen for recalibrate state changes from Learn page
  useEffect(() => {
    const onState = (e: Event) => setRecalibrating((e as CustomEvent).detail);
    window.addEventListener('learn:recalibrating', onState);
    return () => window.removeEventListener('learn:recalibrating', onState);
  }, []);

  useSidebars(
    <LearnActivitySidebar
      onNewCourse={openWizardInDock}
      onRecalibrate={handleRecalibrate}
      recalibrating={recalibrating}
    />,
    null
  );

  return <Learn />;
}
