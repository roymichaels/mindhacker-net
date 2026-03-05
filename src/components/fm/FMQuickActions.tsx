import { Target, Briefcase, BarChart3, Wallet, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

const ACTIONS = [
  { id: 'earn',       icon: Target,     labelEn: 'Earn',    labelHe: 'הרוויח',  descEn: 'Bounties & tasks', descHe: 'באונטיז ומשימות',     path: '/fm/earn' },
  { id: 'work',       icon: Briefcase,  labelEn: 'Work',    labelHe: 'עבודה',   descEn: 'Freelance gigs',   descHe: 'עבודות פרילנס',       path: '/fm/work' },
  { id: 'coaches',    icon: Users,      labelEn: 'Coaches', labelHe: 'מאמנים',  descEn: 'Find a coach',     descHe: 'מצא מאמן',            path: '/coaches' },
  { id: 'share',      icon: BarChart3,   labelEn: 'Share',   labelHe: 'שתף',     descEn: 'Anonymous data',   descHe: 'נתונים אנונימיים',   path: '/fm/share' },
  { id: 'wallet',     icon: Wallet,     labelEn: 'Wallet',  labelHe: 'ארנק',    descEn: 'Balance & withdraw', descHe: 'יתרה ומשיכה',       path: '/fm/wallet' },
];

export function FMQuickActions() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          onClick={() => navigate(a.path)}
          className="bg-card border border-border rounded-xl p-4 text-start hover:border-accent/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center mb-2 group-hover:bg-accent/15 transition-colors">
            <a.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
          </div>
          <p className="font-semibold text-sm text-foreground">{isHe ? a.labelHe : a.labelEn}</p>
          <p className="text-xs text-muted-foreground">{isHe ? a.descHe : a.descEn}</p>
        </button>
      ))}
    </div>
  );
}
