import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { featureFlags } from '@/lib/featureFlags';
import { cn } from '@/lib/utils';
import { useStoryWorld } from '@/contexts/StoryWorldContext';

interface StorySurfaceHostProps {
  children: ReactNode;
}

function getSurfaceMeta(pathname: string) {
  if (pathname.startsWith('/fm')) return { title: 'Free Market', tone: 'amber' };
  if (pathname.startsWith('/community')) return { title: 'Community', tone: 'emerald' };
  if (pathname.startsWith('/learn')) return { title: 'Study', tone: 'violet' };
  if (pathname.startsWith('/mindos')) return { title: 'MindOS', tone: 'cyan' };
  if (pathname.startsWith('/strategy')) return { title: 'Assessment', tone: 'cyan' };
  if (pathname.startsWith('/work')) return { title: 'Work', tone: 'cyan' };
  return { title: 'Evolve', tone: 'cyan' };
}

export function StorySurfaceHost({ children }: StorySurfaceHostProps) {
  const location = useLocation();
  const { activeSurface } = useStoryWorld();
  const supported =
    location.pathname.startsWith('/mindos') ||
    location.pathname.startsWith('/fm') ||
    location.pathname.startsWith('/community') ||
    location.pathname.startsWith('/learn') ||
    location.pathname.startsWith('/strategy') ||
    location.pathname === '/work';

  if (!featureFlags.enableModalWorldShell || !supported) {
    return <>{children}</>;
  }

  const meta = getSurfaceMeta(location.pathname);
  const visible = !!activeSurface;

  return (
    <div className="relative z-20 flex min-h-full items-end justify-center px-2 pb-24 pt-20 md:px-6 md:pb-28">
      <div
        className={cn(
          'w-full max-w-[1380px] overflow-hidden border border-white/10 bg-slate-950/58 backdrop-blur-2xl shadow-[0_25px_120px_rgba(2,6,23,0.58)] transition-all duration-500',
          visible ? 'opacity-100 translate-y-0 rounded-[32px]' : 'opacity-0 translate-y-8 pointer-events-none',
          location.pathname.startsWith('/mindos/tactics') ? 'min-h-[72vh]' : 'min-h-[78vh]'
        )}
      >
        <div className="border-b border-white/8 bg-black/10 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2 text-white/85">
            <div className={cn('h-2.5 w-2.5 rounded-full', meta.tone === 'amber' ? 'bg-amber-400' : meta.tone === 'emerald' ? 'bg-emerald-400' : meta.tone === 'violet' ? 'bg-violet-400' : 'bg-cyan-400')} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">{meta.title}</span>
          </div>
        </div>
        <div className="relative min-h-[calc(72vh-48px)] max-h-[calc(100vh-190px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default StorySurfaceHost;
