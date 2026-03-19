/**
 * CommunityForumBoard — iPhone-style widget grid for pillar selection.
 * 5 columns on mobile, no card backgrounds — just icons with labels.
 */
import { LIFE_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { useTranslation } from '@/hooks/useTranslation';
import { IPhoneWidget } from '@/components/ui/IPhoneWidget';

/** Map domain color names to gradient classes */
const GRADIENT_MAP: Record<string, string> = {
  violet:  'from-violet-500 to-violet-700',
  fuchsia: 'from-fuchsia-500 to-pink-600',
  red:     'from-red-500 to-red-700',
  amber:   'from-amber-500 to-orange-600',
  cyan:    'from-cyan-500 to-cyan-700',
  slate:   'from-slate-500 to-slate-700',
  indigo:  'from-indigo-500 to-indigo-700',
  emerald: 'from-emerald-500 to-emerald-700',
  purple:  'from-purple-500 to-purple-700',
  sky:     'from-sky-500 to-sky-700',
  orange:  'from-orange-500 to-orange-700',
  blue:    'from-blue-500 to-blue-700',
  lime:    'from-lime-500 to-lime-700',
  teal:    'from-teal-500 to-teal-700',
  rose:    'from-rose-500 to-rose-700',
  pink:    'from-pink-500 to-pink-700',
};

interface CommunityForumBoardProps {
  onNavigate: (pillarId: string, groupId: string) => void;
}

export default function CommunityForumBoard({ onNavigate }: CommunityForumBoardProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="grid grid-cols-5 gap-y-4 gap-x-2 py-2 justify-items-center">
      {LIFE_DOMAINS.map((domain: LifeDomain) => (
        <IPhoneWidget
          key={domain.id}
          icon={domain.icon}
          label={isHe ? domain.labelHe : domain.labelEn}
          gradient={GRADIENT_MAP[domain.color] || 'from-primary to-primary/80'}
          onClick={() => onNavigate(domain.id, 'all')}
          size="sm"
        />
      ))}
    </div>
  );
}
