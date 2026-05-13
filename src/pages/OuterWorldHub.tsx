/**
 * OuterWorldHub — index of the entire external/economy layer.
 *
 * This is intentionally a hub, not a wizard. Coaches is one tile here,
 * not the default. Inner OS (chat / brain / composer) stays untouched.
 */
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Wrench,
  GraduationCap,
  Users,
  MessageSquare,
  Wallet,
  Briefcase,
  Sparkles,
  Building2,
  Stethoscope,
  HandCoins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ShellHeader from '@/shellv2/ShellHeader';

interface Tile {
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

const TILES: { group: string; items: Tile[] }[] = [
  {
    group: 'Marketplace',
    items: [
      { label: 'Free Market', sub: 'Earn, share, contribute', icon: Store, to: '/fm' },
      { label: 'Services', sub: 'Browse practitioners', icon: Wrench, to: '/coaches' },
      { label: 'Coaches', sub: 'Find or become a coach', icon: Sparkles, to: '/coaches' },
      { label: 'Therapists', sub: 'Clinical practitioners', icon: Stethoscope, to: '/therapist' },
    ],
  },
  {
    group: 'Learn & connect',
    items: [
      { label: 'Learn', sub: 'Courses & boot camps', icon: GraduationCap, to: '/learn' },
      { label: 'Community', sub: 'Threads & topics', icon: Users, to: '/community' },
      { label: 'Messages', sub: 'Conversations', icon: MessageSquare, to: '/messages' },
    ],
  },
  {
    group: 'Build & earn',
    items: [
      { label: 'Creator', sub: 'Publish content', icon: Sparkles, to: '/creator' },
      { label: 'Freelancer', sub: 'Offer your work', icon: Briefcase, to: '/freelancer' },
      { label: 'Business', sub: 'Run an org', icon: Building2, to: '/business' },
      { label: 'Affiliate', sub: 'Earnings & referrals', icon: HandCoins, to: '/affiliate-signup' },
      { label: 'Wallet', sub: 'Cashout & bridge', icon: Wallet, to: '/fm/cashout' },
    ],
  },
];

export default function OuterWorldHub() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto w-full max-w-screen-sm px-4 pb-20 pt-[max(env(safe-area-inset-top),1rem)]">
      <ShellHeader
        title="Outer World"
        subtitle="The external economy layer. Inner OS stays in chat."
      />

      <div className="flex flex-col gap-6">
        {TILES.map((section) => (
          <section key={section.group}>
            <h2 className="mb-2 px-1 text-xs uppercase tracking-wider text-foreground/50">
              {section.group}
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {section.items.map(({ label, sub, icon: Icon, to }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => navigate(to)}
                    className={cn(
                      'flex h-full w-full flex-col items-start gap-2 rounded-2xl',
                      'border border-white/[0.06] bg-white/[0.03] p-4 text-start',
                      'backdrop-blur-md transition-colors hover:bg-white/[0.06]',
                    )}
                  >
                    <Icon className="h-5 w-5 text-foreground/80" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="text-xs text-foreground/55">{sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}