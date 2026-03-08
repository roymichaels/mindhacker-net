/**
 * ProfilePage — Full-page version of the Character Profile.
 * Renders the same content as CharacterProfileModal but as a routed page.
 */
import { useState } from 'react';
import { CharacterProfileModal } from '@/components/modals/CharacterProfileModal';

export default function ProfilePage() {
  // Render the modal as permanently open — it already handles full-screen portal
  return <CharacterProfileModal open={true} onOpenChange={() => {}} isPage />;
}
