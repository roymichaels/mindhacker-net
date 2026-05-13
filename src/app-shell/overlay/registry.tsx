/**
 * OverlayRegistry — central map of overlay id → component.
 *
 * Populated incrementally during P2. Each migrated modal context is
 * deleted in favor of an entry here.
 */
import type { ComponentType } from "react";

export const OVERLAY_REGISTRY: Record<string, ComponentType<any>> = {
  // P2 entries (planned):
  // auth:           lazy(() => import("@/overlays/AuthOverlay")),
  // subscriptions:  lazy(() => import("@/overlays/SubscriptionsOverlay")),
  // wallet:         lazy(() => import("@/overlays/WalletOverlay")),
  // coach-detail:   lazy(() => import("@/overlays/CoachDetailOverlay")),
  // avatar-mint:    lazy(() => import("@/overlays/AvatarMintOverlay")),
};