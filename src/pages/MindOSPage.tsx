import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Brain, ClipboardList, Target, Briefcase, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAIONDisplayName } from '@/hooks/useAIONDisplayName';

const MINDOS_SECTIONS = [
  { to: '/mindos/chat', key: 'chat', labelEn: 'Chat', labelHe: 'צ׳אט', icon: Brain },
  { to: '/mindos/tactics', labelEn: 'Tactics', labelHe: 'טקטיקה', icon: ClipboardList },
  { to: '/mindos/strategy', labelEn: 'Strategy', labelHe: 'אסטרטגיה', icon: Target },
  { to: '/mindos/work', labelEn: 'Work', labelHe: 'עבודה', icon: Briefcase },
  { to: '/mindos/journal', labelEn: 'Journal', labelHe: 'יומן', icon: BookOpen },
];

export default function MindOSPage() {
  const { language, isRTL } = useTranslation();
  const { displayName: aionName } = useAIONDisplayName();
  const location = useLocation();

  if (location.pathname === '/mindos/tactics') {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-full flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Evolve</p>
            <h1 className="text-2xl font-bold text-foreground">MindOS</h1>
            <p className="text-sm text-muted-foreground">
              {language === 'he'
                ? 'מרכז האימון, הביצוע וההתפתחות שלך.'
                : 'Your coaching, execution, and growth hub.'}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {MINDOS_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <NavLink
                  key={section.to}
                  to={section.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {section.key === 'chat'
                      ? aionName
                      : (language === 'he' ? section.labelHe : section.labelEn)}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
