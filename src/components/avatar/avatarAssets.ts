/**
 * Static avatar asset configuration — replaces PocketBase dynamic fetch.
 */

export interface AvatarAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  group: string;
  lockedGroups?: string[];
}

export interface CameraPlacement {
  position: [number, number, number];
  target: [number, number, number];
}

export interface AvatarCategory {
  id: string;
  name: string;
  removable: boolean;
  startingAsset?: string;
  colorPalette?: string[];
  cameraPlacement?: CameraPlacement;
  assets: AvatarAsset[];
}

// Skin tones
const SKIN_COLORS = [
  "#f5c6a5", "#e8b094", "#d4956b", "#c68642", "#8d5524",
  "#6b3a19", "#4a2511", "#ffdbac", "#f1c27d", "#e0ac69",
];

// Hair colors
const HAIR_COLORS = [
  "#090806", "#2c222b", "#71635a", "#b7a69e", "#d6c4c2",
  "#cabfb1", "#dcd0ba", "#fff5e1", "#e6cea8", "#e5c8a8",
  "#debc99", "#b89778", "#a56b46", "#b55239", "#8d4a43",
];

// Eye colors
const EYE_COLORS = [
  "#2c3e50", "#1a5276", "#117a65", "#6c3483",
  "#784212", "#1c2833", "#4a235a", "#0e6655",
];

// Clothing colors
const CLOTH_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
  "#e94560", "#f38181", "#fce38a", "#eaffd0",
  "#95e1d3", "#aa96da", "#fcbad3", "#ffffd2",
];

// Neutral clothing colors
const NEUTRAL_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#2c3e50",
  "#34495e", "#5d6d7e", "#85929e", "#aab7b8",
];

// Shoe colors
const SHOE_COLORS = [
  "#1a1a2e", "#e94560", "#ffffff", "#0f3460",
  "#533483", "#2c3e50",
];

// Accessory/metallic colors
const ACCESSORY_COLORS = [
  "#ffd700", "#c0c0c0", "#cd7f32", "#e5e4e2",
  "#b87333", "#aaa9ad",
];

export const AVATAR_CATEGORIES: AvatarCategory[] = [
  {
    id: "cat_head",
    name: "Head",
    removable: false,
    startingAsset: "head_001",
    colorPalette: SKIN_COLORS,
    cameraPlacement: { position: [0, 0.8, 2.5], target: [0, 0.6, 0] },
    assets: [
      { id: "head_001", name: "Head 1", url: "/models/assets/Head.001.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_head" },
      { id: "head_002", name: "Head 2", url: "/models/assets/Head.002.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_head" },
      { id: "head_003", name: "Head 3", url: "/models/assets/Head.003.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_head" },
      { id: "head_004", name: "Head 4", url: "/models/assets/Head.004.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_head" },
    ],
  },
  {
    id: "cat_hair",
    name: "Hair",
    removable: true,
    colorPalette: HAIR_COLORS,
    cameraPlacement: { position: [0, 1.0, 2.5], target: [0, 0.8, 0] },
    assets: [
      { id: "hair_001", name: "Hair 1", url: "/models/assets/Hair.001.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_002", name: "Hair 2", url: "/models/assets/Hair.002.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_003", name: "Hair 3", url: "/models/assets/Hair.003.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_004", name: "Hair 4", url: "/models/assets/Hair.004.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_005", name: "Hair 5", url: "/models/assets/Hair.005.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_006", name: "Hair 6", url: "/models/assets/Hair.006.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_007", name: "Hair 7", url: "/models/assets/Hair.007.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_008", name: "Hair 8", url: "/models/assets/Hair.008.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_009", name: "Hair 9", url: "/models/assets/Hair.009.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_010", name: "Hair 10", url: "/models/assets/Hair.010.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
      { id: "hair_011", name: "Hair 11", url: "/models/assets/Hair.011.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hair" },
    ],
  },
  {
    id: "cat_face",
    name: "Face",
    removable: true,
    cameraPlacement: { position: [0, 0.7, 2.0], target: [0, 0.6, 0] },
    assets: [
      { id: "face_001", name: "Face 1", url: "/models/assets/Face.001.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_002", name: "Face 2", url: "/models/assets/Face.002.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_003", name: "Face 3", url: "/models/assets/Face.003.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_004", name: "Face 4", url: "/models/assets/Face.004.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_005", name: "Face 5", url: "/models/assets/Face.005.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_006", name: "Face 6", url: "/models/assets/Face.006.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_007", name: "Face 7", url: "/models/assets/Face.007.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face" },
      { id: "face_mask", name: "Face Mask", url: "/models/assets/FaceMask.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face", lockedGroups: ["cat_nose", "cat_facial_hair"] },
      { id: "pumpkin_head", name: "Pumpkin Head", url: "/models/assets/PumpkinHead.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_face", lockedGroups: ["cat_nose", "cat_eyes", "cat_eyebrow", "cat_facial_hair", "cat_hair", "cat_glasses"] },
    ],
  },
  {
    id: "cat_eyes",
    name: "Eyes",
    removable: false,
    startingAsset: "eyes_001",
    colorPalette: EYE_COLORS,
    cameraPlacement: { position: [0, 0.7, 1.8], target: [0, 0.65, 0] },
    assets: [
      { id: "eyes_001", name: "Eyes 1", url: "/models/assets/Eyes.001.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_002", name: "Eyes 2", url: "/models/assets/Eyes.002.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_003", name: "Eyes 3", url: "/models/assets/Eyes.003.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_004", name: "Eyes 4", url: "/models/assets/Eyes.004.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_005", name: "Eyes 5", url: "/models/assets/Eyes.005.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_006", name: "Eyes 6", url: "/models/assets/Eyes.006.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_007", name: "Eyes 7", url: "/models/assets/Eyes.007.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_008", name: "Eyes 8", url: "/models/assets/Eyes.008.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_009", name: "Eyes 9", url: "/models/assets/Eyes.009.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_010", name: "Eyes 10", url: "/models/assets/Eyes.010.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_011", name: "Eyes 11", url: "/models/assets/Eyes.011.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
      { id: "eyes_012", name: "Eyes 12", url: "/models/assets/Eyes.012.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_eyes" },
    ],
  },
  {
    id: "cat_eyebrow",
    name: "Eyebrow",
    removable: true,
    colorPalette: HAIR_COLORS,
    cameraPlacement: { position: [0, 0.75, 1.8], target: [0, 0.7, 0] },
    assets: [
      { id: "eyebrow_001", name: "Eyebrow 1", url: "/models/assets/EyeBrow.001.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_002", name: "Eyebrow 2", url: "/models/assets/EyeBrow.002.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_003", name: "Eyebrow 3", url: "/models/assets/EyeBrow.003.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_004", name: "Eyebrow 4", url: "/models/assets/EyeBrow.004.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_005", name: "Eyebrow 5", url: "/models/assets/EyeBrow.005.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_006", name: "Eyebrow 6", url: "/models/assets/EyeBrow.006.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_007", name: "Eyebrow 7", url: "/models/assets/EyeBrow.007.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_008", name: "Eyebrow 8", url: "/models/assets/EyeBrow.008.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_009", name: "Eyebrow 9", url: "/models/assets/EyeBrow.009.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
      { id: "eyebrow_010", name: "Eyebrow 10", url: "/models/assets/EyeBrow.010.glb", thumbnail: "/models/thumbnails/eyebrows.jpg", group: "cat_eyebrow" },
    ],
  },
  {
    id: "cat_nose",
    name: "Nose",
    removable: true,
    colorPalette: SKIN_COLORS,
    cameraPlacement: { position: [0, 0.65, 1.8], target: [0, 0.6, 0] },
    assets: [
      { id: "nose_001", name: "Nose 1", url: "/models/assets/Nose.001.glb", thumbnail: "/models/thumbnails/nose.jpg", group: "cat_nose" },
      { id: "nose_002", name: "Nose 2", url: "/models/assets/Nose.002.glb", thumbnail: "/models/thumbnails/nose.jpg", group: "cat_nose" },
      { id: "nose_003", name: "Nose 3", url: "/models/assets/Nose.003.glb", thumbnail: "/models/thumbnails/nose.jpg", group: "cat_nose" },
      { id: "nose_004", name: "Nose 4", url: "/models/assets/Nose.004.glb", thumbnail: "/models/thumbnails/nose.jpg", group: "cat_nose" },
    ],
  },
  {
    id: "cat_facial_hair",
    name: "Facial Hair",
    removable: true,
    colorPalette: HAIR_COLORS,
    cameraPlacement: { position: [0, 0.6, 2.0], target: [0, 0.5, 0] },
    assets: [
      { id: "facial_hair_001", name: "Beard 1", url: "/models/assets/FacialHair.001.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_002", name: "Beard 2", url: "/models/assets/FacialHair.002.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_003", name: "Beard 3", url: "/models/assets/FacialHair.003.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_004", name: "Beard 4", url: "/models/assets/FacialHair.004.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_005", name: "Beard 5", url: "/models/assets/FacialHair.005.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_006", name: "Beard 6", url: "/models/assets/FacialHair.006.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
      { id: "facial_hair_007", name: "Beard 7", url: "/models/assets/FacialHair.007.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_facial_hair" },
    ],
  },
  {
    id: "cat_top",
    name: "Top",
    removable: true,
    colorPalette: CLOTH_COLORS,
    cameraPlacement: { position: [0, 0.4, 3.0], target: [0, 0.3, 0] },
    assets: [
      { id: "top_001", name: "Top 1", url: "/models/assets/Top.001.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_top" },
      { id: "top_002", name: "Top 2", url: "/models/assets/Top.002.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_top" },
      { id: "top_003", name: "Top 3", url: "/models/assets/Top.003.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_top" },
    ],
  },
  {
    id: "cat_bottom",
    name: "Bottom",
    removable: false,
    startingAsset: "bottom_001",
    colorPalette: NEUTRAL_COLORS,
    cameraPlacement: { position: [0, -0.2, 3.5], target: [0, -0.3, 0] },
    assets: [
      { id: "bottom_001", name: "Pants 1", url: "/models/assets/Bottom.001.glb", thumbnail: "/models/thumbnails/bottom.jpg", group: "cat_bottom" },
      { id: "bottom_002", name: "Pants 2", url: "/models/assets/Bottom.002.glb", thumbnail: "/models/thumbnails/bottom.jpg", group: "cat_bottom" },
      { id: "bottom_003", name: "Pants 3", url: "/models/assets/Bottom.003.glb", thumbnail: "/models/thumbnails/bottom.jpg", group: "cat_bottom" },
    ],
  },
  {
    id: "cat_shoes",
    name: "Shoes",
    removable: true,
    colorPalette: SHOE_COLORS,
    cameraPlacement: { position: [0, -0.5, 3.0], target: [0, -0.5, 0] },
    assets: [
      { id: "shoes_001", name: "Shoes 1", url: "/models/assets/Shoes.001.glb", thumbnail: "/models/thumbnails/shoes.jpg", group: "cat_shoes" },
      { id: "shoes_002", name: "Shoes 2", url: "/models/assets/Shoes.002.glb", thumbnail: "/models/thumbnails/shoes.jpg", group: "cat_shoes" },
      { id: "shoes_003", name: "Shoes 3", url: "/models/assets/Shoes.003.glb", thumbnail: "/models/thumbnails/shoes.jpg", group: "cat_shoes" },
    ],
  },
  {
    id: "cat_glasses",
    name: "Glasses",
    removable: true,
    cameraPlacement: { position: [0, 0.7, 1.8], target: [0, 0.65, 0] },
    assets: [
      { id: "glasses_001", name: "Glasses 1", url: "/models/assets/Glasses.001.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_glasses" },
      { id: "glasses_002", name: "Glasses 2", url: "/models/assets/Glasses.002.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_glasses" },
      { id: "glasses_003", name: "Glasses 3", url: "/models/assets/Glasses.003.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_glasses" },
      { id: "glasses_004", name: "Glasses 4", url: "/models/assets/Glasses.004.glb", thumbnail: "/models/thumbnails/eyes.jpg", group: "cat_glasses" },
    ],
  },
  {
    id: "cat_hat",
    name: "Hat",
    removable: true,
    colorPalette: CLOTH_COLORS,
    cameraPlacement: { position: [0, 1.0, 2.5], target: [0, 0.8, 0] },
    assets: [
      { id: "hat_001", name: "Hat 1", url: "/models/assets/Hat.001.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_002", name: "Hat 2", url: "/models/assets/Hat.002.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_003", name: "Hat 3", url: "/models/assets/Hat.003.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_004", name: "Hat 4", url: "/models/assets/Hat.004.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_005", name: "Hat 5", url: "/models/assets/Hat.005.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_006", name: "Hat 6", url: "/models/assets/Hat.006.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_hat", lockedGroups: ["cat_hair"] },
      { id: "hat_007", name: "Crown", url: "/models/assets/Hat.007.glb", thumbnail: "/models/thumbnails/thumbnail_crown.png", group: "cat_hat" },
    ],
  },
  {
    id: "cat_earring",
    name: "Earring",
    removable: true,
    colorPalette: ACCESSORY_COLORS,
    cameraPlacement: { position: [0, 0.7, 2.0], target: [0, 0.6, 0] },
    assets: [
      { id: "earring_001", name: "Earring 1", url: "/models/assets/Earring.001.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
      { id: "earring_002", name: "Earring 2", url: "/models/assets/Earring.002.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
      { id: "earring_003", name: "Earring 3", url: "/models/assets/Earring.003.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
      { id: "earring_004", name: "Earring 4", url: "/models/assets/Earring.004.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
      { id: "earring_005", name: "Earring 5", url: "/models/assets/Earring.005.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
      { id: "earring_006", name: "Earring 6", url: "/models/assets/Earring.006.glb", thumbnail: "/models/thumbnails/head.jpg", group: "cat_earring" },
    ],
  },
  {
    id: "cat_bow",
    name: "Bow",
    removable: true,
    colorPalette: CLOTH_COLORS,
    cameraPlacement: { position: [0, 0.9, 2.0], target: [0, 0.8, 0] },
    assets: [
      { id: "bow_001", name: "Bow 1", url: "/models/assets/Bow.001.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_bow" },
      { id: "bow_002", name: "Bow 2", url: "/models/assets/Bow.002.glb", thumbnail: "/models/thumbnails/hair.jpg", group: "cat_bow" },
    ],
  },
  {
    id: "cat_outfit",
    name: "Outfit",
    removable: true,
    colorPalette: CLOTH_COLORS,
    cameraPlacement: { position: [0, 0.2, 4.0], target: [0, 0.0, 0] },
    assets: [
      { id: "outfit_001", name: "Outfit 1", url: "/models/assets/Outfit.001.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_outfit", lockedGroups: ["cat_top", "cat_bottom"] },
      { id: "outfit_002", name: "Outfit 2", url: "/models/assets/Outfit.002.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_outfit", lockedGroups: ["cat_top", "cat_bottom"] },
      { id: "outfit_003", name: "Outfit 3", url: "/models/assets/Outfit.003.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_outfit", lockedGroups: ["cat_top", "cat_bottom"] },
      { id: "outfit_004", name: "Outfit 4", url: "/models/assets/Outfit.004.glb", thumbnail: "/models/thumbnails/top.jpg", group: "cat_outfit", lockedGroups: ["cat_top", "cat_bottom"] },
      { id: "wawa_dress", name: "Wawa Dress", url: "/models/assets/WawaDress.glb", thumbnail: "/models/thumbnails/thumbnail_wawadress.png", group: "cat_outfit", lockedGroups: ["cat_top", "cat_bottom", "cat_shoes"] },
    ],
  },
];

export function getAllAssets(): AvatarAsset[] {
  return AVATAR_CATEGORIES.flatMap((cat) => cat.assets);
}

export function getCategoryById(id: string): AvatarCategory | undefined {
  return AVATAR_CATEGORIES.find((cat) => cat.id === id);
}
