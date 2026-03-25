import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { featureFlags } from '@/lib/featureFlags';
import { getStoryScenePreset, type StoryMode, type StoryScene, type StorySurface } from '@/lib/storyWorld';

interface StoryWorldContextValue {
  scene: StoryScene;
  activeSurface: StorySurface;
  activeMode: StoryMode;
  loading: boolean;
  openSurface: (surface: Exclude<StorySurface, null>, mode?: StoryMode) => void;
  closeSurface: () => void;
  setSceneKey: (sceneKey: string) => void;
  refreshScene: (sceneKey?: string) => Promise<void>;
}

const StoryWorldContext = createContext<StoryWorldContextValue | null>(null);

interface StoryRouteState {
  openSurface?: boolean;
  storyMode?: StoryMode;
}

function resolveSurface(pathname: string): StorySurface {
  if (pathname.startsWith('/fm')) return 'fm';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/learn')) return 'study';
  if (pathname.startsWith('/mindos')) return 'mindos';
  if (pathname.startsWith('/strategy')) return 'assessment';
  if (pathname.startsWith('/work')) return 'plan';
  return null;
}

function resolveSceneKey(pathname: string) {
  if (pathname.startsWith('/onboarding')) return 'onboarding';
  if (pathname.startsWith('/ceremony')) return 'ceremony';
  if (pathname.startsWith('/fm')) return 'fm';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/learn')) return 'study';
  return 'mindos';
}

export function StoryWorldProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, session } = useAuth();
  const { language } = useTranslation();
  const [scene, setScene] = useState<StoryScene>(getStoryScenePreset(resolveSceneKey(location.pathname)));
  const [activeSurface, setActiveSurface] = useState<StorySurface>(null);
  const [activeMode, setActiveMode] = useState<StoryMode>('fullscreen');
  const [loading, setLoading] = useState(false);
  const [manualSceneKey, setManualSceneKey] = useState<string | null>(null);
  const routeState = (location.state as StoryRouteState | null) || null;

  const refreshScene = useCallback(
    async (sceneKey?: string) => {
      const resolvedSceneKey = sceneKey || manualSceneKey || resolveSceneKey(location.pathname);
      const shouldGenerateForRoute =
        !!user || location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/ceremony');

      if (!featureFlags.enableStoryWorld) {
        setScene(getStoryScenePreset(resolvedSceneKey));
        return;
      }

      if (!featureFlags.enableAiSceneGeneration || !shouldGenerateForRoute) {
        setScene(getStoryScenePreset(resolvedSceneKey));
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/story/generate-scene', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            scene_type: resolvedSceneKey,
            phase: location.pathname.startsWith('/onboarding') ? 'onboarding' : 'world',
            language,
            user_id: user?.id || null,
            context: {
              pathname: location.pathname,
              surface: resolveSurface(location.pathname),
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Scene request failed: ${response.status}`);
        }

        const nextScene = (await response.json()) as StoryScene;
        setScene(nextScene);
      } catch (error) {
        console.error('[story-world] scene fallback', error);
        setScene(getStoryScenePreset(resolvedSceneKey));
      } finally {
        setLoading(false);
      }
    },
    [language, location.pathname, manualSceneKey, session?.access_token, user]
  );

  useEffect(() => {
    if (!manualSceneKey) {
      void refreshScene(resolveSceneKey(location.pathname));
    }
  }, [location.pathname, manualSceneKey, refreshScene]);

  useEffect(() => {
    if (!routeState?.openSurface) return;

    const nextSurface = resolveSurface(location.pathname);
    if (!nextSurface) return;

    setActiveSurface(nextSurface);
    setActiveMode(routeState.storyMode || 'fullscreen');
  }, [location.pathname, routeState?.openSurface, routeState?.storyMode]);

  const openSurface = useCallback((surface: Exclude<StorySurface, null>, mode: StoryMode = 'fullscreen') => {
    setActiveSurface(surface);
    setActiveMode(mode);
  }, []);

  const closeSurface = useCallback(() => {
    setActiveSurface(null);
  }, []);

  const setSceneKey = useCallback((sceneKey: string) => {
    setManualSceneKey(sceneKey);
    setScene(getStoryScenePreset(sceneKey));
  }, []);

  const value = useMemo<StoryWorldContextValue>(
    () => ({
      scene,
      activeSurface,
      activeMode,
      loading,
      openSurface,
      closeSurface,
      setSceneKey,
      refreshScene,
    }),
    [scene, activeSurface, activeMode, loading, openSurface, closeSurface, setSceneKey, refreshScene]
  );

  return <StoryWorldContext.Provider value={value}>{children}</StoryWorldContext.Provider>;
}

export function useStoryWorld() {
  const context = useContext(StoryWorldContext);
  if (!context) {
    throw new Error('useStoryWorld must be used within StoryWorldProvider');
  }
  return context;
}
