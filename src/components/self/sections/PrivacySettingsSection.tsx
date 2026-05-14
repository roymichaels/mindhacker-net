import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown } from 'lucide-react';

interface Props { onOpenAdvanced?: () => void; }

export default function PrivacySettingsSection({ onOpenAdvanced }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [open, setOpen] = useState(false);
  return (
    <section className="space-y-2 px-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-[12px] text-foreground/55 hover:text-foreground/80 transition-colors"
      >
        <span>{isHe ? 'פרטיות והגדרות' : 'Privacy & settings'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-1.5 pl-3 text-[12px] text-foreground/60">
          <div>{isHe ? 'חשבון' : 'Account'}</div>
          <div>{isHe ? 'התראות' : 'Notifications'}</div>
          <div>{isHe ? 'מידע' : 'Data'}</div>
        </div>
      )}
      {onOpenAdvanced && (
        <button
          type="button"
          onClick={onOpenAdvanced}
          className="text-[12px] text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          {isHe ? 'מתקדם →' : 'Advanced →'}
        </button>
      )}
    </section>
  );
}
