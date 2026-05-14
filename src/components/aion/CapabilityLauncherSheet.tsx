/**
 * CapabilityLauncherSheet — iOS-style bottom sheet listing AION capabilities.
 *
 * Triggered from the chat composer "+" button. Selecting a capability
 * dispatches the existing `aion:capability:invoke` event, which is handled
 * by `CapabilityInvokerBridge` and routed through confirmationBridge for
 * any mutation. Nothing here writes to the DB directly.
 */
import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  ListChecks, NotebookPen, Target, Headphones, Briefcase, LayoutTemplate,
  GraduationCap, Map as MapIcon, UserCheck, Store, Wallet, Users, MessageSquare,
  CreditCard, Timer, CalendarClock, IdCard, UserCog, Compass, Mic2, BookOpen,
  ShoppingCart, Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { CAPABILITIES, CONFIRM_REQUIRED_CAPABILITIES, type CapabilityId } from '@/orchestration/capabilities/registry';
import { cn } from '@/lib/utils';

type Group = 'plan' | 'capture' | 'heal' | 'work' | 'learn' | 'connect' | 'business' | 'wallet' | 'identity';

interface Item {
  id: CapabilityId;
  group: Group;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  params?: Record<string, unknown>;
}

const ITEMS: Item[] = [
  // Plan / today
  { id: 'daily.generate',      group: 'plan',    label: 'תכנן את היום',          icon: ListChecks },
  { id: 'journey.nextAction',  group: 'plan',    label: 'הצעד הבא',              icon: Target },
  { id: 'plan.summarize',      group: 'plan',    label: 'סיכום המסע',            icon: Compass },
  { id: 'schedule.block',      group: 'plan',    label: 'הוסף בלוק זמן',         icon: CalendarClock, hint: 'דורש אישור' },
  // Capture
  { id: 'journal.capture',     group: 'capture', label: 'נשמור ביומן',           icon: NotebookPen, hint: 'דורש אישור' },
  { id: 'journal.search',      group: 'capture', label: 'חיפוש ביומן',           icon: BookOpen },
  { id: 'voice.transcribe',    group: 'capture', label: 'תמלול קול',             icon: Mic2 },
  // Heal
  { id: 'hypnosis.recommend',  group: 'heal',    label: 'המלצת היפנוזה',         icon: Headphones },
  { id: 'hypnosis.start',      group: 'heal',    label: 'הפעל סשן היפנוזה',      icon: Headphones, hint: 'דורש אישור' },
  // Work
  { id: 'work.startSession',   group: 'work',    label: 'התחל סשן עבודה',        icon: Timer, hint: 'דורש אישור' },
  { id: 'work.summarize',      group: 'work',    label: 'סיכום העבודה היום',     icon: Timer },
  // Learn
  { id: 'course.recommend',    group: 'learn',   label: 'המלצת קורסים',          icon: GraduationCap },
  { id: 'curriculum.generate', group: 'learn',   label: 'בנה מסלול לימוד',       icon: MapIcon, hint: 'דורש אישור' },
  { id: 'coach.recommend',     group: 'learn',   label: 'מצא מאמן',              icon: UserCheck },
  // Connect
  { id: 'community.feed',      group: 'connect', label: 'מה קורה בקהילה',        icon: Users },
  { id: 'message.search',      group: 'connect', label: 'חפש בהודעות',           icon: MessageSquare },
  // Business
  { id: 'business.summarize',  group: 'business',label: 'סיכום העסק',            icon: Briefcase },
  { id: 'business.createDraft',group: 'business',label: 'טיוטת תוכנית עסקית',    icon: Briefcase, hint: 'דורש אישור' },
  { id: 'landing.preview',     group: 'business',label: 'תצוגת דף נחיתה',         icon: LayoutTemplate },
  { id: 'landing.generate',    group: 'business',label: 'בנה דף נחיתה',          icon: LayoutTemplate, hint: 'דורש אישור' },
  { id: 'fm.search',           group: 'business',label: 'חפש בשוק החופשי',       icon: Store },
  // Wallet
  { id: 'wallet.status',       group: 'wallet',  label: 'מצב הארנק',             icon: Wallet },
  { id: 'subscription.status', group: 'wallet',  label: 'מצב המנוי',             icon: CreditCard },
  { id: 'checkout.create',     group: 'wallet',  label: 'שדרוג מנוי',            icon: ShoppingCart, hint: 'דורש אישור' },
  // Identity
  { id: 'profile.summarize',   group: 'identity',label: 'סיכום זהות',            icon: IdCard },
  { id: 'identity.bootstrap',  group: 'identity',label: 'מצב פרופיל ו-DNA',      icon: IdCard },
  { id: 'avatar.configure',    group: 'identity',label: 'הגדרת אווטאר',          icon: UserCog, hint: 'דורש אישור' },
];

const GROUP_LABEL: Record<Group, string> = {
  plan: 'תכנון',
  capture: 'תיעוד',
  heal: 'התאוששות',
  work: 'עבודה',
  learn: 'למידה',
  connect: 'קהילה',
  business: 'עסק ויצירה',
  wallet: 'ארנק ומנוי',
  identity: 'זהות',
};

const GROUP_ORDER: Group[] = ['plan','capture','work','heal','learn','connect','business','wallet','identity'];

function invokeCapability(item: Item) {
  window.dispatchEvent(new CustomEvent('aion:capability:invoke', {
    detail: { capability: item.id, params: item.params ?? {} },
  }));
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CapabilityLauncherSheet({ open, onOpenChange }: Props) {
  const { isRTL } = useTranslation();

  // Filter to known capabilities only
  const available = useMemo(
    () => ITEMS.filter((it) => Boolean(CAPABILITIES[it.id])),
    [],
  );
  const grouped = useMemo(() => {
    const map = new Map<Group, Item[]>();
    for (const g of GROUP_ORDER) map.set(g, []);
    for (const it of available) map.get(it.group)?.push(it);
    return map;
  }, [available]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/90 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)] max-h-[85vh] overflow-y-auto"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <SheetTitle className="text-base">בקש מ-AION ליצור משהו…</SheetTitle>
          </div>
          <SheetDescription className="text-foreground/60 text-xs">
            כל פעולה רגישה תעבור אישור לפני ביצוע.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {GROUP_ORDER.map((g) => {
            const items = grouped.get(g) ?? [];
            if (items.length === 0) return null;
            return (
              <section key={g}>
                <h4 className="mb-2 text-[11px] uppercase tracking-wider text-foreground/45">
                  {GROUP_LABEL[g]}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((it) => {
                    const Icon = it.icon;
                    const needsConfirm = CONFIRM_REQUIRED_CAPABILITIES.has(it.id);
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          invokeCapability(it);
                          onOpenChange(false);
                        }}
                        className={cn(
                          'flex items-start gap-2.5 rounded-2xl border border-white/[0.06]',
                          'bg-white/[0.03] hover:bg-white/[0.06] active:scale-[0.98] transition',
                          'px-3 py-3 text-start',
                        )}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 border border-primary/20">
                          <Icon className="h-4 w-4 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground/95">
                            {it.label}
                          </span>
                          {(it.hint || needsConfirm) && (
                            <span className="mt-0.5 block text-[10px] text-foreground/45">
                              {it.hint ?? 'דורש אישור'}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default CapabilityLauncherSheet;