import React from 'react';
import { useEnvironment } from './EnvironmentProvider';
import type { ChromeId } from './types';

interface ChromeGateProps {
  id: ChromeId;
  /** When true, never hide regardless of state. Useful during migration. */
  alwaysShow?: boolean;
  children: React.ReactNode;
}

/**
 * Gates a piece of chrome based on the active environment state.
 * Default behavior is to render children — only hides when the AOL is enabled
 * AND the current state explicitly suppresses this chrome id.
 */
export function ChromeGate({ id, alwaysShow, children }: ChromeGateProps) {
  const { state, enabled } = useEnvironment();
  if (!enabled || alwaysShow) return <>{children}</>;
  if (state.hidden.includes(id)) return null;
  return <>{children}</>;
}