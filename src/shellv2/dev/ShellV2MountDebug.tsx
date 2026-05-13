import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { useDiagnosticsFlag } from '@/diagnostics/useDiagnosticsFlag';

function hasQueryFlag(name: string) {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get(name) === '1';
}

export default function ShellV2MountDebug() {
  const location = useLocation();
  const overlay = useOverlay();
  const diagnostics = useDiagnosticsFlag();
  const enabled = import.meta.env.DEV || diagnostics || hasQueryFlag('shell_debug');

  const snapshot = useMemo(() => {
    const activeOverlays = [
      'drawer',
      'aion',
      'env',
      'settings',
      'profile',
    ].filter((kind) => overlay.isOpen(kind as Parameters<typeof overlay.isOpen>[0]));

    const mounted = {
      activeShell: 'ShellV2',
      mountedOverlays: ['UnifiedOverlayHost', 'ShellV2Menu', 'ChatHistorySheet', ...(activeOverlays.length ? activeOverlays.map((kind) => `active:${kind}`) : [])],
      mountedHomeWidgets: [],
      activeComposer: 'GlobalChatInput',
      activeChatLayer: location.pathname === '/brain' ? 'BrainView' : 'AuroraChatBubbles',
    };

    console.info('[shell-debug]', {
      route: location.pathname,
      ...mounted,
      forbiddenLegacy: {
        dashboardLayout: false,
        userDashboard: false,
        osDrawer: false,
        mindosSheet: false,
        hubModalHost: false,
      },
    });

    return mounted;
  }, [location.pathname, overlay]);

  if (!enabled) return null;

  return (
    <aside className="pointer-events-none fixed left-3 top-14 z-[88] max-w-[320px] rounded-xl border border-border/60 bg-background/85 px-3 py-2 text-[11px] text-foreground/85 backdrop-blur-md">
      <div className="font-semibold">Shell debug</div>
      <div>shell: {snapshot.activeShell}</div>
      <div>chat: {snapshot.activeChatLayer}</div>
      <div>composer: {snapshot.activeComposer}</div>
      <div>overlays: {snapshot.mountedOverlays.join(', ') || 'none'}</div>
      <div>home widgets: {snapshot.mountedHomeWidgets.join(', ') || 'none'}</div>
    </aside>
  );
}