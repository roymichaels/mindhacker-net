/**
 * useSwipeNavigation — swipe left/right to switch between bottom tab pages
 */
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

const TAB_ORDER = ['/fm', '/play', '/community', '/study'];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = TAB_ORDER.findIndex(path => {
    if (path === '/play') return location.pathname === '/play' || location.pathname === '/plan' || location.pathname === '/now' || location.pathname === '/dashboard';
    if (path === '/fm') return location.pathname.startsWith('/fm');
    return location.pathname.startsWith(path);
  });

  const goTo = useCallback((direction: 'left' | 'right') => {
    if (currentIndex < 0) return;
    const nextIndex = direction === 'left' 
      ? Math.min(currentIndex + 1, TAB_ORDER.length - 1)
      : Math.max(currentIndex - 1, 0);
    if (nextIndex !== currentIndex) {
      navigate(TAB_ORDER[nextIndex]);
    }
  }, [currentIndex, navigate]);

  const handlers = useSwipeable({
    onSwipedLeft: () => goTo('left'),
    onSwipedRight: () => goTo('right'),
    trackMouse: false,
    delta: 50,
    preventScrollOnSwipe: false,
  });

  return handlers;
}
