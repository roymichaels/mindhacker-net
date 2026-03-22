/**
 * Avatar Configurator Store — Zustand
 * 
 * Ported from original PocketBase-backed store.
 * Uses static asset config instead of PocketBase.
 */

import { create } from "zustand";
import { MeshStandardMaterial } from "three";
import { AVATAR_CATEGORIES, type AvatarAsset, type AvatarCategory, getCategoryById } from "./avatarAssets";

export const PHOTO_POSES: Record<string, string> = {
  Idle: "Idle",
  Chill: "Chill",
  Cool: "Cool",
  Punch: "Punch",
  Ninja: "Ninja",
  King: "King",
  Busy: "Busy",
};

export interface CategoryCustomization {
  asset?: AvatarAsset | null;
  color?: string;
}

export interface LockedGroupEntry {
  name: string;
  categoryName: string;
}

interface ConfiguratorState {
  loading: boolean;
  pose: string;
  setPose: (pose: string) => void;
  categories: AvatarCategory[];
  currentCategory: AvatarCategory | null;
  assets: AvatarAsset[];
  lockedGroups: Record<string, LockedGroupEntry[]>;
  skin: MeshStandardMaterial;
  customization: Record<string, CategoryCustomization>;
  updateColor: (color: string) => void;
  updateSkin: (color: string) => void;
  initializeCategories: () => void;
  setCurrentCategory: (category: AvatarCategory) => void;
  changeAsset: (categoryName: string, asset: AvatarAsset | null) => void;
  randomize: () => void;
  applyLockedAssets: () => void;
  // Serialization for DB persistence
  getCustomizationData: () => Record<string, { assetId?: string | null; color?: string }>;
  loadCustomizationData: (data: Record<string, { assetId?: string | null; color?: string }>) => void;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  loading: true,
  pose: PHOTO_POSES.Idle,
  setPose: (pose) => set({ pose }),
  categories: [],
  currentCategory: null,
  assets: [],
  lockedGroups: {},
  skin: new MeshStandardMaterial({ color: 0xf5c6a5, roughness: 1 }),
  customization: {},

  updateColor: (color: string) => {
    const currentCategory = get().currentCategory;
    if (!currentCategory) return;
    set((state) => ({
      customization: {
        ...state.customization,
        [currentCategory.name]: {
          ...state.customization[currentCategory.name],
          color,
        },
      },
    }));
    if (currentCategory.name === "Head") {
      get().updateSkin(color);
    }
  },

  updateSkin: (color: string) => {
    get().skin.color.set(color);
  },

  initializeCategories: () => {
    const categories = AVATAR_CATEGORIES;
    const allAssets = categories.flatMap((cat) => cat.assets);
    const customization: Record<string, CategoryCustomization> = {};

    categories.forEach((category) => {
      customization[category.name] = {
        color: category.colorPalette?.[0] || "",
      };
      if (category.startingAsset) {
        customization[category.name].asset = category.assets.find(
          (asset) => asset.id === category.startingAsset
        ) || null;
      }
    });

    set({
      categories,
      currentCategory: categories[0],
      assets: allAssets,
      customization,
      loading: false,
    });
    get().applyLockedAssets();
  },

  setCurrentCategory: (category) => set({ currentCategory: category }),

  changeAsset: (categoryName, asset) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [categoryName]: {
          ...state.customization[categoryName],
          asset,
        },
      },
    }));
    get().applyLockedAssets();
  },

  randomize: () => {
    const customization: Record<string, CategoryCustomization> = {};
    const categories = get().categories;

    categories.forEach((category) => {
      if (category.assets.length === 0) {
        customization[category.name] = {
          color: category.colorPalette?.[randInt(0, (category.colorPalette?.length || 1) - 1)] || "",
        };
        return;
      }

      let randomAsset: AvatarAsset | null = category.assets[randInt(0, category.assets.length - 1)];
      if (category.removable && randInt(0, category.assets.length) === 0) {
        randomAsset = null;
      }

      const randomColor = category.colorPalette
        ? category.colorPalette[randInt(0, category.colorPalette.length - 1)]
        : "";

      customization[category.name] = {
        asset: randomAsset,
        color: randomColor,
      };

      if (category.name === "Head") {
        get().updateSkin(randomColor);
      }
    });

    set({ customization });
    get().applyLockedAssets();
  },

  applyLockedAssets: () => {
    const customization = get().customization;
    const categories = get().categories;
    const lockedGroups: Record<string, LockedGroupEntry[]> = {};

    Object.values(customization).forEach((catCustom) => {
      if (catCustom.asset?.lockedGroups) {
        catCustom.asset.lockedGroups.forEach((groupId) => {
          const cat = getCategoryById(groupId);
          if (!cat) return;
          const lockingCat = categories.find(
            (c) => c.id === catCustom.asset?.group
          );
          if (!lockedGroups[cat.name]) {
            lockedGroups[cat.name] = [];
          }
          lockedGroups[cat.name].push({
            name: catCustom.asset!.name,
            categoryName: lockingCat?.name || "",
          });
        });
      }
    });

    set({ lockedGroups });
  },

  getCustomizationData: () => {
    const customization = get().customization;
    const data: Record<string, { assetId?: string | null; color?: string }> = {};
    Object.entries(customization).forEach(([key, val]) => {
      data[key] = {
        assetId: val.asset?.id || null,
        color: val.color,
      };
    });
    return data;
  },

  loadCustomizationData: (data) => {
    const categories = get().categories;
    const customization: Record<string, CategoryCustomization> = {};

    categories.forEach((category) => {
      const saved = data[category.name];
      if (saved) {
        const asset = saved.assetId
          ? category.assets.find((a) => a.id === saved.assetId) || null
          : null;
        customization[category.name] = {
          asset,
          color: saved.color || category.colorPalette?.[0] || "",
        };
        if (category.name === "Head" && saved.color) {
          get().updateSkin(saved.color);
        }
      } else {
        customization[category.name] = {
          color: category.colorPalette?.[0] || "",
        };
        if (category.startingAsset) {
          customization[category.name].asset = category.assets.find(
            (a) => a.id === category.startingAsset
          ) || null;
        }
      }
    });

    set({ customization });
    get().applyLockedAssets();
  },
}));
