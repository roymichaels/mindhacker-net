/**
 * Static avatar asset configuration — replaces PocketBase dynamic fetch.
 * 
 * Each category maps to the original CustomizationGroups collection.
 * Each asset maps to the original CustomizationAssets collection.
 * 
 * To add more assets: just add entries to the assets array with url pointing
 * to the GLB file in /models/assets/ and thumbnail in /models/thumbnails/.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  url: string;           // GLB file path relative to public/
  thumbnail: string;     // thumbnail image path
  group: string;         // category id
  lockedGroups?: string[];  // category IDs that this asset locks
}

export interface CameraPlacement {
  position: [number, number, number];
  target: [number, number, number];
}

export interface AvatarCategory {
  id: string;
  name: string;
  removable: boolean;
  startingAsset?: string;  // asset id
  colorPalette?: string[];
  cameraPlacement?: CameraPlacement;
  assets: AvatarAsset[];
}

// ─── Category definitions ───
// These match the original PocketBase CustomizationGroups.
// Camera placements are from the original project's cameraPlacement records.

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: "cat_head",
    name: "Head",
    removable: false,
    colorPalette: [
      "#f5c6a5", "#e8b094", "#d4956b", "#c68642", "#8d5524",
      "#6b3a19", "#4a2511", "#ffdbac", "#f1c27d", "#e0ac69",
    ],
    cameraPlacement: {
      position: [0, 0.8, 2.5],
      target: [0, 0.6, 0],
    },
    assets: [],
  },
  {
    id: "cat_hair",
    name: "Hair",
    removable: true,
    colorPalette: [
      "#090806", "#2c222b", "#71635a", "#b7a69e", "#d6c4c2",
      "#cabfb1", "#dcd0ba", "#fff5e1", "#e6cea8", "#e5c8a8",
      "#debc99", "#b89778", "#a56b46", "#b55239", "#8d4a43",
    ],
    cameraPlacement: {
      position: [0, 1.0, 2.5],
      target: [0, 0.8, 0],
    },
    assets: [],
  },
  {
    id: "cat_face",
    name: "Face",
    removable: true,
    cameraPlacement: {
      position: [0, 0.7, 2.0],
      target: [0, 0.6, 0],
    },
    assets: [],
  },
  {
    id: "cat_eyes",
    name: "Eyes",
    removable: false,
    colorPalette: [
      "#2c3e50", "#1a5276", "#117a65", "#6c3483",
      "#784212", "#1c2833", "#4a235a", "#0e6655",
    ],
    cameraPlacement: {
      position: [0, 0.7, 1.8],
      target: [0, 0.65, 0],
    },
    assets: [],
  },
  {
    id: "cat_top",
    name: "Top",
    removable: true,
    colorPalette: [
      "#1a1a2e", "#16213e", "#0f3460", "#533483",
      "#e94560", "#f38181", "#fce38a", "#eaffd0",
      "#95e1d3", "#aa96da", "#fcbad3", "#ffffd2",
    ],
    cameraPlacement: {
      position: [0, 0.4, 3.0],
      target: [0, 0.3, 0],
    },
    assets: [],
  },
  {
    id: "cat_bottom",
    name: "Bottom",
    removable: false,
    colorPalette: [
      "#1a1a2e", "#16213e", "#0f3460", "#2c3e50",
      "#34495e", "#5d6d7e", "#85929e", "#aab7b8",
    ],
    cameraPlacement: {
      position: [0, -0.2, 3.5],
      target: [0, -0.3, 0],
    },
    startingAsset: "bottom_001",
    assets: [
      {
        id: "bottom_001",
        name: "Pants 1",
        url: "/models/assets/Bottom.001.glb",
        thumbnail: "/models/thumbnails/bottom.jpg",
        group: "cat_bottom",
      },
      {
        id: "bottom_002",
        name: "Pants 2",
        url: "/models/assets/Bottom.002.glb",
        thumbnail: "/models/thumbnails/bottom.jpg",
        group: "cat_bottom",
      },
      {
        id: "bottom_003",
        name: "Pants 3",
        url: "/models/assets/Bottom.003.glb",
        thumbnail: "/models/thumbnails/bottom.jpg",
        group: "cat_bottom",
      },
    ],
  },
  {
    id: "cat_shoes",
    name: "Shoes",
    removable: true,
    colorPalette: [
      "#1a1a2e", "#e94560", "#ffffff", "#0f3460",
      "#533483", "#2c3e50",
    ],
    cameraPlacement: {
      position: [0, -0.5, 3.0],
      target: [0, -0.5, 0],
    },
    assets: [],
  },
  {
    id: "cat_accessory",
    name: "Accessory",
    removable: true,
    cameraPlacement: {
      position: [0, 0.5, 3.0],
      target: [0, 0.4, 0],
    },
    assets: [],
  },
];

/**
 * Get a flat list of all assets across all categories
 */
export function getAllAssets(): AvatarAsset[] {
  return AVATAR_CATEGORIES.flatMap((cat) => cat.assets);
}

/**
 * Find a category by id
 */
export function getCategoryById(id: string): AvatarCategory | undefined {
  return AVATAR_CATEGORIES.find((cat) => cat.id === id);
}
