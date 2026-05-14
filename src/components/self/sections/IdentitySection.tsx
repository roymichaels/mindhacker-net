import { AionOrb } from '@/components/aion/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

export default function IdentitySection() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const name =
    (user?.user_metadata as any)?.first_name ||
    (user?.user_metadata as any)?.full_name ||
    (user?.email?.split('@')[0]) ||
    (isHe ? 'אתה' : 'You');
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <AionOrb size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-foreground truncate">{name}</div>
        <div className="text-[11px] text-foreground/55">
          {isHe ? 'AION לומד מי אתה' : 'AION is learning who you are'}
        </div>
      </div>
    </div>
  );
}
