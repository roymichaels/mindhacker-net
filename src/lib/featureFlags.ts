export interface FeatureFlags {
  enableGameLayer: boolean;
  enableHubWorld: boolean;
  enableMultiplayer: boolean;
  enableQuests: boolean;
  enableNftInventory: boolean;
  enableStoryWorld: boolean;
  enableCinematicOnboarding: boolean;
  enableModalWorldShell: boolean;
  enableAiSceneGeneration: boolean;
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
  enableStoryWorld: readFlag(import.meta.env.VITE_ENABLE_STORY_WORLD, true),
  enableCinematicOnboarding: readFlag(import.meta.env.VITE_ENABLE_CINEMATIC_ONBOARDING, true),
  enableModalWorldShell: readFlag(import.meta.env.VITE_ENABLE_MODAL_WORLD_SHELL, true),
  enableAiSceneGeneration: readFlag(import.meta.env.VITE_ENABLE_AI_SCENE_GENERATION, true),
};

export function isFeatureEnabled(flag: keyof FeatureFlags) {
  return featureFlags[flag];
}
