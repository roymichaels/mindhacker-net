import { Sparkles, Rocket, Brain, Users, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useUserRoles } from '@/hooks/useUserRoles';
import PromoUpgradeModal from '@/components/subscription/PromoUpgradeModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, lazy, Suspense } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { CoachHudSidebar } from '@/components/coach/CoachHudSidebar';
import { CoachActivitySidebar } from '@/components/coach/CoachActivitySidebar';

const CoachHub = lazy(() => import('./CoachHub'));

const FEATURES = [
  {
    icon: Brain,
    titleHe: 'בונה תוכניות AI',
    titleEn: 'AI Plan Builder',
    descHe: 'צרו תוכניות אימון מותאמות אישית בעזרת בינה מלאכותית',
    descEn: 'Create personalized coaching plans powered by AI',
  },
  {
    icon: Users,
    titleHe: 'ניהול מתאמנים',
    titleEn: 'Client Management',
    descHe: 'נהלו את כל המתאמנים שלכם במקום אחד',
    descEn: 'Manage all your coachees in one place',
  },
  {
    icon: Store,
    titleHe: 'חנות דיגיטלית',
    titleEn: 'Your Storefront',
    descHe: 'מכרו תכנים, קורסים ושירותים ישירות מהפלטפורמה',
    descEn: 'Sell content, courses & services directly from the platform',
  },
];

// Hook to provide coach-specific sidebars when user is a practitioner
export function useCoachSidebars(
  selectedClientId?: string | null,
  onSelectClient?: (id: string | null) => void,
  activeTab?: string,
  onTabChange?: (tab: string) => void,
) {
  const { hasRole, loading } = useUserRoles();
  const { user } = useAuth();
  const isPractitioner = !loading && user && hasRole('practitioner');

  if (!isPractitioner) {
    return { leftSidebar: undefined, rightSidebar: undefined };
  }

  return {
    leftSidebar: <CoachHudSidebar activeTab={activeTab} onTabChange={onTabChange} />,
    rightSidebar: <CoachActivitySidebar selectedClientId={selectedClientId} onSelectClient={onSelectClient} />,
  };
}

interface CoachesProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

export default function Marketplace({ selectedClientId, onClearClient, activeTab = 'marketing' }: CoachesProps) {
  const { t, isRTL, language } = useTranslation();
  const { data: myProfile, isLoading: profileLoading } = useMyPractitionerProfile();
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPromo, setShowPromo] = useState(false);

  const isPractitioner = hasRole('practitioner');

  if (rolesLoading || profileLoading) {
    return <PageSkeleton />;
  }

  if (user && isPractitioner) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CoachHub selectedClientId={selectedClientId} onClearClient={onClearClient} activeTab={activeTab} />
      </Suspense>
    );
  }

  // Landing page for non-coaches
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Coach Pro</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">
          {language === 'he' ? 'בנו את העסק שלכם כמאמנים' : 'Build Your Coaching Business'}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {language === 'he'
            ? 'הפלטפורמה המלאה לניהול, צמיחה ומכירה של שירותי אימון – מונע בינה מלאכותית'
            : 'The complete platform to manage, grow & sell your coaching services – powered by AI'}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.titleEn} className="rounded-xl border bg-card p-5 space-y-3 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <f.icon className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="font-semibold">{language === 'he' ? f.titleHe : f.titleEn}</h3>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? f.descHe : f.descEn}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={() => {
            if (!user) { navigate('/auth'); return; }
            setShowPromo(true);
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white"
          size="lg"
        >
          <Rocket className="h-5 w-5 me-2" />
          {language === 'he' ? 'הפכו למאמנים' : 'Become a Coach'}
        </Button>
      </div>

      <PromoUpgradeModal open={showPromo} onDismiss={() => setShowPromo(false)} />
    </div>
  );
}
