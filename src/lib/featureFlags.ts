export interface FeatureFlags {
  enableGameLayer: boolean;
  enableHubWorld: boolean;
  enableMultiplayer: boolean;
  enableQuests: boolean;
  enableNftInventory: boolean;
}

function readFlag(value: string | undefined, defaultValue = false) {
  if (value == null) return defaultValue;
  return value === 'true' || value === '1';
}

export const featureFlags: FeatureFlags = {
  enableGameLayer: readFlag(import.meta.env.VITE_ENABLE_GAME_LAYER, false),
  enableHubWorld: readFlag(import.meta.env.VITE_ENABLE_HUB_WORLD, false),
  enableMultiplayer: readFlag(import.meta.env.VITE_ENABLE_MULTIPLAYER, false),
  enableQuests: readFlag(import.meta.env.VITE_ENABLE_QUESTS, false),
  enableNftInventory: readFlag(import.meta.env.VITE_ENABLE_NFT_INVENTORY, false),
};

export function isFeatureEnabled(flag: keyof FeatureFlags) {
  return featureFlags[flag];
}
