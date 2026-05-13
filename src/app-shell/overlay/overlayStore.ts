/**
 * Tiny imperative overlay store (no extra deps).
 *
 * Usage (after P2 wiring):
 *   import { overlay } from "@/app-shell/overlay/overlayStore";
 *   overlay.open("auth");
 *   overlay.open("coach-detail", { slug });
 *   overlay.close("auth");
 */
import { useEffect, useState } from "react";

export type OverlayKind = "sheet" | "dialog" | "drawer" | "fullscreen" | "toast";

export interface OverlayEntry {
  key: string;          // unique stack key
  id: string;           // registry id
  kind: OverlayKind;
  props?: Record<string, unknown>;
}

let stack: OverlayEntry[] = [];
const listeners = new Set<() => void>();
let nextKey = 1;

function emit() {
  for (const l of listeners) l();
}

export const overlay = {
  open(id: string, props?: Record<string, unknown>, kind: OverlayKind = "sheet") {
    const key = `${id}#${nextKey++}`;
    stack = [...stack, { key, id, kind, props }];
    emit();
    return key;
  },
  close(idOrKey: string) {
    stack = stack.filter((e) => e.key !== idOrKey && e.id !== idOrKey);
    emit();
  },
  closeAll() {
    stack = [];
    emit();
  },
  getStack(): readonly OverlayEntry[] {
    return stack;
  },
};

export function useOverlayStack(): readonly OverlayEntry[] {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return stack;
}