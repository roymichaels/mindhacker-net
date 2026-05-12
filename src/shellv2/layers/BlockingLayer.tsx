/**
 * BlockingLayer — top-most layer reserved for full-screen gates that must
 * occlude everything (theme flash, naming gate, avatar required, network
 * reconnect). Phase 1 leaves this empty; Phase 7 migrates the existing
 * `z-[9999]` ad-hoc overlays into this layer at z=90.
 */
export default function BlockingLayer() {
  return null;
}