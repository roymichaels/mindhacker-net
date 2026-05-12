/**
 * ComposerActions — bottom-sheet that turns the chat composer into the
 * primary launcher. Each action prefills the chat with an intent prompt
 * and submits it; AION (the orchestrator) then drives the flow.
 *
 * This replaces the role of permanent "module" navigation: users summon
 * capabilities through conversation, not through menus.
 */
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { CAPABILITIES, type CapabilityId } from '@/lib/aion/capabilities';
import { cn } from '@/lib/utils';

interface ComposerActionsProps {
  /** Send a prompt to AION (will be auto-submitted). */
  onSend: (prompt: string) => void;
  /** Optional handler for voice mode. */
  onVoice?: () => void;
  /** Optional handler for file upload. */
  onUpload?: () => void;
  disabled?: boolean;
}

const PROMPT_IDS: CapabilityId[] = [
  'business',
  'landing_page',
  'blog',
  'course',
  'strategy',
  'mind_map',
  'fitness_plan',
  'content_plan',
  'deep_dive',
  'workflow',
];

export default function ComposerActions({ onSend, onVoice, onUpload, disabled }: ComposerActionsProps) {
  const { language, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleCapability = (id: CapabilityId) => {
    const cap = CAPABILITIES[id];
    if (!cap) return;
    setOpen(false);
    const prompt = language === 'he' ? cap.promptHe : cap.promptEn;
    if (prompt) onSend(prompt);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={language === 'he' ? 'פעולות יוצר' : 'Composer actions'}
          className={cn(
            'shrink-0 h-11 w-11 rounded-full inline-flex items-center justify-center',
            'bg-muted ring-1 ring-border text-foreground/80',
            'hover:bg-muted/80 hover:text-foreground transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <Plus className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 bg-card/95 backdrop-blur-2xl ring-1 ring-white/[0.08] p-0 max-h-[85vh]"
      >
        <div className="px-4 pt-3 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mx-auto h-1 w-10 rounded-full bg-white/15 mb-4" />

          {(onUpload || onVoice) && (
            <>
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 px-1">
                {language === 'he' ? 'ערוצים' : 'Channels'}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {onUpload && (
                  <ActionTile
                    cap={CAPABILITIES.upload}
                    he={language === 'he'}
                    onClick={() => { setOpen(false); onUpload(); }}
                  />
                )}
                {onVoice && (
                  <ActionTile
                    cap={CAPABILITIES.voice}
                    he={language === 'he'}
                    onClick={() => { setOpen(false); onVoice(); }}
                  />
                )}
              </div>
            </>
          )}

          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 px-1">
            {language === 'he' ? 'מה ניצור?' : 'What shall we build?'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PROMPT_IDS.map((id) => {
              const cap = CAPABILITIES[id];
              return (
                <ActionTile
                  key={id}
                  cap={cap}
                  he={language === 'he'}
                  onClick={() => handleCapability(id)}
                />
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActionTile({
  cap,
  he,
  onClick,
}: {
  cap: (typeof CAPABILITIES)[CapabilityId];
  he: boolean;
  onClick: () => void;
}) {
  const Icon = cap.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex items-start gap-3 rounded-2xl px-3 py-3 text-start',
        'ring-1 ring-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:ring-white/[0.12]',
        'transition-all active:scale-[0.98]',
      )}
    >
      <div className="h-8 w-8 rounded-xl bg-white/[0.06] inline-flex items-center justify-center text-foreground/85 group-hover:bg-primary/15 group-hover:text-primary transition-colors shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-foreground leading-tight">
          {he ? cap.labelHe : cap.labelEn}
        </div>
        <div className="text-[11px] text-muted-foreground/80 mt-0.5 line-clamp-2 leading-snug">
          {he ? cap.descHe : cap.descEn}
        </div>
      </div>
    </button>
  );
}