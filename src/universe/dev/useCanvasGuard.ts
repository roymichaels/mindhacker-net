/**
 * useCanvasGuard — dev-only enforcer of the single shared WebGL canvas rule.
 *
 * Counts <canvas> elements present in the DOM after each render and warns
 * loudly when more than one is mounted simultaneously. SharedOrbStage is the
 * sanctioned exception (it owns the only Canvas in the app per
 * mem://architecture/unified-orb-stage-v4).
 *
 * No-ops in production. Pure observer — never mutates the DOM.
 */
import { useEffect } from 'react';

export function useCanvasGuard(): void {
  useEffect(() => {
    if (import.meta.env.PROD) return;
    if (typeof document === 'undefined') return;

    const check = () => {
      const count = document.getElementsByTagName('canvas').length;
      if (count > 1) {
        // eslint-disable-next-line no-console
        console.warn(
          `[universe/canvas-guard] ${count} <canvas> elements mounted. ` +
            `Single shared Canvas (SharedOrbStage) is the only sanctioned WebGL surface. ` +
            `See mem://architecture/unified-orb-stage-v4.`,
        );
      }
    };

    // Initial + observe DOM mutations so dynamic mounts are caught.
    check();
    const obs = new MutationObserver(() => check());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);
}