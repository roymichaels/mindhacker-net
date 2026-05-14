/**
 * atlasRooms — adapter that augments the hallway room registry with
 * "virtual" atlas-only clusters (Journey, Relationships, Outer World).
 *
 * Virtual rooms are NOT routed through `/hallway/:slug` and have no
 * RoomView. Tapping them in the consciousness atlas deep-links to their
 * canonical surface elsewhere in the app. They never appear in the
 * `brain_get_atlas` aggregates today, so they always render in the
 * "AION exploring" state until a future phase wires them up.
 */
import { listRooms } from "@/hallway/rooms";
import type { RoomDefinition } from "@/hallway/types";

export type AtlasRoomKind = "room" | "virtual";

export interface AtlasRoomEntry {
  id: string;
  slug: string;
  kind: AtlasRoomKind;
  /** Where to navigate when tapped (null = open RoomView via ?view=room). */
  deepLink: string | null;
  ambience: { hue: number; saturation: number; lightness: number };
  copy: {
    label: { en: string; he: string };
    tagline: { en: string; he: string };
  };
}

function fromRoom(r: RoomDefinition): AtlasRoomEntry {
  return {
    id: r.id,
    slug: r.slug,
    kind: "room",
    deepLink: null,
    ambience: {
      hue: r.ambience.hue,
      saturation: r.ambience.saturation,
      lightness: r.ambience.lightness,
    },
    copy: r.copy,
  };
}

const VIRTUAL: AtlasRoomEntry[] = [
  {
    id: "journey",
    slug: "journey",
    kind: "virtual",
    deepLink: "/play",
    ambience: { hue: 45, saturation: 60, lightness: 22 },
    copy: {
      label: { en: "Journey & Mission", he: "מסע ומשימה" },
      tagline: {
        en: "Where the 100-day arc lives.",
        he: "כאן חיה הקשת בת מאה הימים.",
      },
    },
  },
  {
    id: "relationships",
    slug: "relationships",
    kind: "virtual",
    deepLink: "/messages",
    ambience: { hue: 330, saturation: 55, lightness: 22 },
    copy: {
      label: { en: "Relationships", he: "מערכות יחסים" },
      tagline: {
        en: "The people in your field.",
        he: "האנשים שבשדה שלך.",
      },
    },
  },
  {
    id: "outer",
    slug: "outer",
    kind: "virtual",
    deepLink: "/outer-world",
    ambience: { hue: 195, saturation: 50, lightness: 22 },
    copy: {
      label: { en: "Outer World", he: "העולם החיצוני" },
      tagline: {
        en: "The world you act in.",
        he: "העולם שבו אתה פועל.",
      },
    },
  },
];

export function listAtlasRooms(): AtlasRoomEntry[] {
  return [...listRooms().map(fromRoom), ...VIRTUAL];
}

export function getAtlasRoom(id: string): AtlasRoomEntry | null {
  return listAtlasRooms().find((r) => r.id === id) ?? null;
}