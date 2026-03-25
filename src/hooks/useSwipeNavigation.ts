/**
 * useSwipeNavigation — swipe left/right to switch between bottom tab pages
 */
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useStoryWorld } from '@/contexts/StoryWorldContext';

const TAB_ORDER = ['/fm', '/mindos/tactics', '/community', '/learn'];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSurface } = useStoryWorld();

  const currentIndex = TAB_ORDER.findIndex(path => {
    if (path === '/mindos/tactics') {
      return (
        location.pathname.startsWith('/mindos') ||
        location.pathname === '/play' ||
        location.pathname === '/aurora' ||
        location.pathname === '/work' ||
        location.pathname === '/now' ||
        location.pathname === '/plan' ||
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/strategy')
      );
    }
    if (path === '/fm') return location.pathname.startsWith('/fm');
    return location.pathname.startsWith(path);
  });

  const goTo = useCallback((direction: 'left' | 'right') => {
    if (currentIndex < 0) return;
    const nextIndex = direction === 'left' 
      ? Math.min(currentIndex + 1, TAB_ORDER.length - 1)
      : Math.max(currentIndex - 1, 0);
    if (nextIndex !== currentIndex) {
      const nextPath = TAB_ORDER[nextIndex];
      const nextSurface =
        nextPath === '/fm'
          ? 'fm'
          : nextPath === '/community'
            ? 'community'
            : nextPath === '/learn'
              ? 'study'
              : 'mindos';

      openSurface(nextSurface, 'fullscreen');
      navigate(nextPath, { state: { openSurface: true, storyMode: 'fullscreen' } });
    }
  }, [currentIndex, navigate, openSurface]);

  const handlers = useSwipeable({
    onSwipedLeft: () => goTo('left'),
    onSwipedRight: () => goTo('right'),
    trackMouse: false,
    delta: 50,
    preventScrollOnSwipe: false,
  });

  return handlers;
}
