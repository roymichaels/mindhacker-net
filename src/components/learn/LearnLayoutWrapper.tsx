/**
 * LearnLayoutWrapper - Registers Learn-specific dual sidebars and renders Learn page.
 * Left: courses list | Right: curriculum/milestones for selected course
 */
import { Suspense, lazy, useCallback, useState, useEffect } from 'react';
import { LearnCoursesSidebar } from '@/components/learn/LearnCoursesSidebar';
import { LearnCurriculumSidebar } from '@/components/learn/LearnCurriculumSidebar';
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
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);

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

  const handleRecalibrate = useCallback(() => {
    window.dispatchEvent(new CustomEvent('learn:recalibrate'));
  }, []);

  useEffect(() => {
    const onState = (e: Event) => setRecalibrating((e as CustomEvent).detail);
    window.addEventListener('learn:recalibrating', onState);
    return () => window.removeEventListener('learn:recalibrating', onState);
  }, []);

  // Listen for curriculum selection from Learn page
  useEffect(() => {
    const handler = (e: Event) => setSelectedCurriculumId((e as CustomEvent).detail);
    window.addEventListener('learn:select-curriculum', handler);
    return () => window.removeEventListener('learn:select-curriculum', handler);
  }, []);

  // Listen for lesson selection from right sidebar  
  const handleSelectLesson = useCallback((lesson: any) => {
    window.dispatchEvent(new CustomEvent('learn:open-lesson', { detail: lesson }));
  }, []);

  useSidebars(
    <LearnCurriculumSidebar
      selectedCurriculumId={selectedCurriculumId}
      onSelectLesson={handleSelectLesson}
      onRecalibrate={handleRecalibrate}
      recalibrating={recalibrating}
    />,
    <LearnCoursesSidebar
      selectedCurriculumId={selectedCurriculumId}
      onSelectCurriculum={(id) => {
        setSelectedCurriculumId(id);
        window.dispatchEvent(new CustomEvent('learn:select-curriculum', { detail: id }));
      }}
      onNewCourse={openWizardInDock}
    />
  );

  return <Learn />;
}
