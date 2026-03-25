export type StorySurface =
  | 'mindos'
  | 'fm'
  | 'community'
  | 'study'
  | 'assessment'
  | 'plan'
  | 'journal'
  | null;

export type StoryMode = 'sheet' | 'dialog' | 'fullscreen';

export interface StoryTheme {
  accent: string;
  secondary: string;
  glow: string;
  overlay: string;
}

export interface StoryScene {
  sceneId: string;
  chapterKey: string;
  sceneType: string;
  headline: string;
  body: string;
  imageUrl: string;
  cacheHit?: boolean;
  theme: StoryTheme;
  ambientProps?: Record<string, unknown>;
}

export const DEFAULT_STORY_THEME: StoryTheme = {
  accent: '#22d3ee',
  secondary: '#8b5cf6',
  glow: 'rgba(34, 211, 238, 0.32)',
  overlay: 'rgba(4, 8, 20, 0.72)',
};

function encodeSvg(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildFallbackStoryScene(params: {
  chapterKey: string;
  sceneType: string;
  headline: string;
  body: string;
  accent?: string;
  secondary?: string;
}): StoryScene {
  const accent = params.accent || DEFAULT_STORY_THEME.accent;
  const secondary = params.secondary || DEFAULT_STORY_THEME.secondary;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#050816" />
          <stop offset="55%" stop-color="#0c1327" />
          <stop offset="100%" stop-color="#151030" />
        </linearGradient>
        <radialGradient id="glowA" cx="28%" cy="30%" r="45%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.45" />
          <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="glowB" cx="72%" cy="42%" r="44%">
          <stop offset="0%" stop-color="${secondary}" stop-opacity="0.32" />
          <stop offset="100%" stop-color="${secondary}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#bg)" />
      <rect width="1600" height="900" fill="url(#glowA)" />
      <rect width="1600" height="900" fill="url(#glowB)" />
      <g opacity="0.18" stroke="${accent}" stroke-width="2">
        <path d="M180 80v760" />
        <path d="M360 0v820" />
        <path d="M620 120v680" />
        <path d="M930 40v810" />
        <path d="M1180 160v680" />
        <path d="M1420 30v760" />
      </g>
      <g opacity="0.14" fill="none" stroke="${secondary}" stroke-width="3">
        <circle cx="400" cy="280" r="160" />
        <circle cx="1160" cy="520" r="220" />
      </g>
    </svg>
  `;

  return {
    sceneId: `fallback:${params.chapterKey}:${params.sceneType}`,
    chapterKey: params.chapterKey,
    sceneType: params.sceneType,
    headline: params.headline,
    body: params.body,
    imageUrl: encodeSvg(svg),
    cacheHit: true,
    theme: {
      accent,
      secondary,
      glow: `${accent}55`,
      overlay: DEFAULT_STORY_THEME.overlay,
    },
  };
}

export const storyScenePresets: Record<string, StoryScene> = {
  onboarding: buildFallbackStoryScene({
    chapterKey: 'act_1_awakening',
    sceneType: 'onboarding',
    headline: 'Awaken the next self',
    body: 'Your story begins with identity, pressure, and the first signal of who you are becoming.',
    accent: '#22d3ee',
    secondary: '#8b5cf6',
  }),
  ceremony: buildFallbackStoryScene({
    chapterKey: 'act_3_covenant',
    sceneType: 'ceremony',
    headline: 'The covenant is sealed',
    body: 'Your AION presence, avatar, and MindOS path lock into one visible direction.',
    accent: '#a855f7',
    secondary: '#22d3ee',
  }),
  mindos: buildFallbackStoryScene({
    chapterKey: 'chapter_mindos',
    sceneType: 'mindos',
    headline: 'Command your next move',
    body: 'MindOS interprets your state, pressure, and momentum into action.',
    accent: '#06b6d4',
    secondary: '#6366f1',
  }),
  fm: buildFallbackStoryScene({
    chapterKey: 'chapter_market',
    sceneType: 'fm',
    headline: 'Trade value in the market',
    body: 'Free Market is the external economy layer where skill, offers, and contribution become visible.',
    accent: '#f59e0b',
    secondary: '#22c55e',
  }),
  community: buildFallbackStoryScene({
    chapterKey: 'chapter_community',
    sceneType: 'community',
    headline: 'Enter the social constellation',
    body: 'Community surfaces stories, alliances, reflections, and proof of movement.',
    accent: '#10b981',
    secondary: '#06b6d4',
  }),
  study: buildFallbackStoryScene({
    chapterKey: 'chapter_study',
    sceneType: 'study',
    headline: 'Absorb the next upgrade',
    body: 'Study turns structure into learning loops, protocols, and embodied skill.',
    accent: '#8b5cf6',
    secondary: '#ec4899',
  }),
};

export function getStoryScenePreset(key: string) {
  return storyScenePresets[key] || storyScenePresets.mindos;
}
