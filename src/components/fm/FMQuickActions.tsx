import { Target, Wallet, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useWalletModal } from '@/contexts/WalletModalContext';

const ACTIONS = [
  { id: 'earn',   icon: Target,  labelEn: 'Earn',    labelHe: 'הרוויח', descEn: 'Bounties, gigs & data', descHe: 'באונטיז, עבודות ונתונים', path: '/fm',   rarity: 'epic' },
  { id: 'wallet', icon: Wallet,  labelEn: 'Wallet',  labelHe: 'ארנק',   descEn: 'Balance & withdraw',    descHe: 'יתרה ומשיכה',            path: null,     rarity: 'rare' },
];

const RARITY_STYLES: Record<string, string> = {
  epic: 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:border-amber-400/60 hover:shadow-amber-500/10',
  rare: 'border-sky-500/40 bg-gradient-to-br from-sky-500/10 to-blue-500/5 hover:border-sky-400/60 hover:shadow-sky-500/10',
};

export function FMQuickActions() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { openWallet } = useWalletModal();

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          onClick={() => a.path ? navigate(a.path) : openWallet()}
          className={`rounded-xl p-4 text-center border-2 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg ${RARITY_STYLES[a.rarity]}`}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center mx-auto mb-2.5 border border-amber-500/20">
            <a.icon className="w-5 h-5 text-amber-400" />
          </div>
          <p className="font-bold text-sm text-foreground">{isHe ? a.labelHe : a.labelEn}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{isHe ? a.descHe : a.descEn}</p>
        </button>
      ))}
    </div>
  );
}
