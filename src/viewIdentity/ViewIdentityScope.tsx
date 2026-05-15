/**
 * ViewIdentityScope — Phase 5C.8.
 *
 * Mount inside a main route to declare its consciousness mode. The
 * shared atmosphere/orb/motion layers re-tune themselves whenever the
 * active scope changes. Renders nothing.
 *
 *   <ViewIdentityScope id="brain" />
 */
import { useEffect } from 'react';
import { useViewIdentityStore } from './viewIdentityStore';
import type { ViewIdentityId } from './types';

interface Props {
  id: ViewIdentityId;
}

export default function ViewIdentityScope({ id }: Props) {
  useEffect(() => {
    const { push, pop } = useViewIdentityStore.getState();
    push(id);
    return () => pop(id);
  }, [id]);
  return null;
}