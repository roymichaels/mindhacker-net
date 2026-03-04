import { Target, Briefcase, BarChart3, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const ACTIONS = [
  { id: 'earn',       icon: Target,     labelEn: 'Earn',    labelHe: 'הרוויח',  descEn: 'Bounties & tasks', descHe: 'באונטיז ומשימות',     hash: '#earn' },
  { id: 'work',       icon: Briefcase,  labelEn: 'Work',    labelHe: 'עבודה',   descEn: 'Freelance gigs',   descHe: 'עבודות פרילנס',       hash: '#work' },
  { id: 'contribute', icon: BarChart3,   labelEn: 'Share',   labelHe: 'שתף',     descEn: 'Anonymous data',   descHe: 'נתונים אנונימיים',   hash: '#contribute' },
  { id: 'wallet',     icon: Wallet,     labelEn: 'Wallet',  labelHe: 'ארנק',    descEn: 'Balance & withdraw', descHe: 'יתרה ומשיכה',       hash: '#wallet' },
];

export function FMQuickActions() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
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
