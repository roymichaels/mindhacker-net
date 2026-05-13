/**
 * Canonical surface registry — the 7 top-level surfaces of MindOS.
 * Anything not on this list must be a nested route, an overlay, or backend.
 */
export const SURFACES = [
  { id: "chat",        path: "/aurora",      label: "Chat" },
  { id: "brain",       path: "/brain",       label: "Brain" },
  { id: "hallway",     path: "/",            label: "Hallway" },
  { id: "strategy",    path: "/strategy",    label: "Strategy" },
  { id: "outer-world", path: "/outer-world", label: "Outer World" },
  { id: "me",          path: "/me",          label: "Profile" },
  { id: "settings",    path: "/settings",    label: "Settings" },
] as const;

export type SurfaceId = (typeof SURFACES)[number]["id"];