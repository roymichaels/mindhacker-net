/**
 * ArtifactLayer — renders floating artifact cards inside Interactive AION.
 *
 * Subscribes to the artifact bus (`aion:artifact`) and stacks up to 3 cards
 * in the lower-mid region of the screen, above the composer. Cards fade /
 * slide in, auto-dismiss after `ttl`, and can be tapped to expand the CTA.
 *
 * Mobile-native: rounded-2xl, backdrop-blur, no gradients/shadows beyond
 * subtle border + blur (per project design rules).
 */
import { useEffect, useState, useCallback } from 'react';
import {
  X, Sparkles, NotebookPen, Target, Lightbulb, ListChecks, Wand2, ShieldAlert,
  Compass, BookOpen, Headphones, Briefcase, LayoutTemplate, GraduationCap,
  Map as MapIcon, UserCheck, Store, Wallet, Users, MessageSquare, CreditCard,
  ShoppingCart, Timer, CalendarClock, IdCard, UserCircle2, UserCog,
} from 'lucide-react';
import type { AionArtifact, ArtifactKind } from './artifactBus';
import { onArtifact } from './artifactBus';
import { cn } from '@/lib/utils';

const MAX_VISIBLE = 3;

const ICONS: Record<ArtifactKind, React.ComponentType<{ className?: string }>> = {
  next_action: Target,
  journal_capture: NotebookPen,
  plan_summary: ListChecks,
  note: Sparkles,
  insight: Lightbulb,
  capability: Wand2,
  confirm: ShieldAlert,
  journey_workspace: Compass,
  journal_preview: BookOpen,
  hypnosis_player: Headphones,
  business_canvas: Briefcase,
  landing_preview: LayoutTemplate,
  course_card: GraduationCap,
  curriculum_preview: MapIcon,
  coach_recommendation: UserCheck,
  marketplace_card: Store,
  wallet_sheet: Wallet,
  community_preview: Users,
  message_preview: MessageSquare,
  subscription_card: CreditCard,
  checkout_confirmation: ShoppingCart,
  work_session: Timer,
  schedule_block_preview: CalendarClock,
  profile_triad: IdCard,
  identity_summary: UserCircle2,
  avatar_configurator: UserCog,
};

const KIND_LABEL: Record<ArtifactKind, string> = {
  next_action: 'הצעד הבא',
  journal_capture: 'נשמר ביומן',
  plan_summary: 'תוכנית',
  note: 'הערה',
  insight: 'תובנה',
  capability: 'יכולת',
  confirm: 'אישור נדרש',
  journey_workspace: 'מסע',
  journal_preview: 'יומן',
  hypnosis_player: 'היפנוזה',
  business_canvas: 'קנבס עסקי',
  landing_preview: 'דף נחיתה',
  course_card: 'קורס',
  curriculum_preview: 'מסלול לימוד',
  coach_recommendation: 'מאמן',
  marketplace_card: 'שוק חופשי',
  wallet_sheet: 'ארנק',
  community_preview: 'קהילה',
  message_preview: 'הודעות',
  subscription_card: 'מנוי',
  checkout_confirmation: 'תשלום',
  work_session: 'עבודה',
  schedule_block_preview: 'בלוק זמן',
  profile_triad: 'פרופיל',
  identity_summary: 'זהות',
  avatar_configurator: 'אווטאר',
};

interface ArtifactLayerProps {
  /** Vertical offset from bottom in px (so cards sit above composer). */
  bottomOffset?: number;
}

export default function ArtifactLayer({ bottomOffset = 220 }: ArtifactLayerProps) {
  const [items, setItems] = useState<AionArtifact[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
  }, []);

  useEffect(() => {
    return onArtifact((artifact) => {
      setItems((prev) => {
        // Replace if same id, otherwise prepend; cap to MAX_VISIBLE.
        const next = [artifact, ...prev.filter((a) => a.id !== artifact.id)].slice(0, MAX_VISIBLE);
        return next;
      });
      if (artifact.ttl && artifact.ttl > 0) {
        window.setTimeout(() => dismiss(artifact.id), artifact.ttl);
      }
    });
  }, [dismiss]);

  if (items.length === 0) return null;

  return (
    <div
      className="absolute inset-x-0 z-10 flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ bottom: bottomOffset }}
    >
      {items.map((art, idx) => {
        const Icon = ICONS[art.kind] ?? Sparkles;
        return (
          <div
            key={art.id}
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10',
              'bg-card/70 backdrop-blur-xl px-4 py-3 text-start',
              'animate-in fade-in slide-in-from-bottom-4 duration-300',
            )}
            style={{ opacity: 1 - idx * 0.15 }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-foreground/50">
                  {KIND_LABEL[art.kind]}
                </div>
                <div className="text-sm font-medium text-foreground/95 truncate">{art.title}</div>
                {art.body && (
                  <div className="text-xs text-foreground/70 mt-0.5 line-clamp-2">{art.body}</div>
                )}
                {art.meta?.source && (
                  <div className="text-[10px] text-foreground/50 mt-1">
                    מקור: {art.meta.source}
                  </div>
                )}
                {(art.cta || art.secondaryCta) && (
                  <div className="flex items-center gap-3 mt-2">
                    {art.cta && (
                      <button
                        type="button"
                        onClick={() => {
                          art.cta?.onClick?.();
                          if (art.cta?.href) window.location.href = art.cta.href;
                          dismiss(art.id);
                        }}
                        className="text-xs font-medium text-primary hover:text-primary/80"
                      >
                        {art.cta.label} →
                      </button>
                    )}
                    {art.secondaryCta && (
                      <button
                        type="button"
                        onClick={() => {
                          art.secondaryCta?.onClick?.();
                          dismiss(art.id);
                        }}
                        className="text-xs font-medium text-foreground/60 hover:text-foreground/80"
                      >
                        {art.secondaryCta.label}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(art.id)}
                aria-label="Dismiss"
                className="h-7 w-7 rounded-full hover:bg-white/5 flex items-center justify-center text-foreground/50 hover:text-foreground/80 shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}