/**
 * WorldRoute — `/worlds/:worldId` route wrapper.
 */
import { useParams, Navigate } from 'react-router-dom';
import WorldShell from '@/worlds/scene/WorldShell';
import { getWorld } from '@/worlds/registry';
import type { CognitiveWorldId } from '@/worlds/types';

export default function WorldRoute() {
  const { worldId } = useParams<{ worldId: string }>();
  const world = worldId ? getWorld(worldId) : undefined;
  if (!world) return <Navigate to="/aurora" replace />;
  return <WorldShell worldId={world.id as CognitiveWorldId} />;
}
