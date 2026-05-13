/**
 * OverlayHost — single portal target for the OverlayManager.
 *
 * Replaces:
 *   - src/shellv2/UnifiedOverlayHost.tsx
 *   - src/shell/overlay/OverlayController.tsx
 *   - the trailing global modals at the bottom of App.tsx
 *     (SubscriptionsModal, WalletModal, ProfilePage, AvatarRequiredModal,
 *      SoulAvatarMintWizardGlobal, CloudAuthModal).
 *
 * Phase 1: structural placeholder. Subscribe wiring lands in P2.
 */
import { useOverlayStack } from "@/app-shell/overlay/overlayStore";
import { OVERLAY_REGISTRY } from "@/app-shell/overlay/registry";

export default function OverlayHost() {
  const stack = useOverlayStack();
  if (stack.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {stack.map((entry) => {
        const Comp = OVERLAY_REGISTRY[entry.id];
        if (!Comp) return null;
        return (
          <div key={entry.key} className="pointer-events-auto">
            <Comp {...(entry.props ?? {})} />
          </div>
        );
      })}
    </div>
  );
}