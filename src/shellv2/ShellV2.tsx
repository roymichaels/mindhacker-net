/**
 * ShellV2 — the new root layout for authenticated AION surfaces.
 *
 * Layer contract (top → bottom in DOM, z-index in {@link ./zindex}):
 *
 *   BackgroundLayer  z=10   — orb canvas + bg-background paint
 *   ChatLayer        z=20   — conversation + inline artifacts
 *   ComposerLayer    z=30   — input + composer actions
 *   ChromeLayer      z=40   — minimal top bar
 *   OverlayLayer     z=55–80 — unified overlay manager
 *   BlockingLayer    z=90   — critical gates only
 *
 * No other shell may render alongside ShellV2 in the same tree. When a
 * caller gates rendering with `ff_shell_v2`, the legacy `DashboardLayout`
 * branch must be skipped.
 */
import BackgroundLayer from './layers/BackgroundLayer';
import AtmosphereLayer from './layers/AtmosphereLayer';
import ChatLayer from './layers/ChatLayer';
import ComposerLayer from './layers/ComposerLayer';
import ChromeLayer from './layers/ChromeLayer';
import OverlayLayer from './layers/OverlayLayer';
import BlockingLayer from './layers/BlockingLayer';
import NavLayer from './layers/NavLayer';
import { ChamberIdleProvider } from './hooks/useChamberIdle';
import StrategyApprovalCard from '@/components/aurora/StrategyApprovalCard';

export interface ShellV2Props {
  /** Optional override for the chat surface. Defaults to placeholder. */
  children?: React.ReactNode;
}

export default function ShellV2({ children }: ShellV2Props) {
  return (
    <ChamberIdleProvider>
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
        <BackgroundLayer />
        <AtmosphereLayer />
        {/* Chat slot — children override the default placeholder so route-level
            summon pages can swap their own artifact stage in. */}
        {children ?? <ChatLayer />}
        <NavLayer />
        <ComposerLayer />
        <ChromeLayer />
        <OverlayLayer />
        <BlockingLayer />
        <StrategyApprovalCard />
      </div>
    </ChamberIdleProvider>
  );
}