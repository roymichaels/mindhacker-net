/**
 * Phase-gated feature flag for the unified AppShell.
 * Off by default until phase P6 of the consolidation plan.
 */
export function useAppShellFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ls = window.localStorage.getItem("ff_app_shell");
    if (ls === "1" || ls === "true") return true;
  } catch {}
  return false;
}

export const APP_SHELL_FLAG_KEY = "ff_app_shell";