import { useAuth } from '@/contexts/AuthContext';
import { AuroraChatProvider, useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import AuroraChatBubbles from './AuroraChatBubbles';
import GlobalChatInput from '@/components/dashboard/GlobalChatInput';

/**
 * A self-contained Aurora chat dock for use in journey pages.
 * Wraps the chat input and bubbles with its own provider if needed.
 */
const JourneyChatDockInner = () => {
  const { user } = useAuth();
  
  // Don't render for guests
  if (!user) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-gradient-to-t from-background via-background to-transparent pb-safe">
      <div className="px-4">
        <AuroraChatBubbles />
        <GlobalChatInput />
      </div>
    </div>
  );
};

const JourneyChatDock = () => {
  const { user } = useAuth();
  const existingContext = useAuroraChatContextSafe();
  
  // Don't render for guests
  if (!user) return null;
  
  // If already in a provider, just render the dock
  if (existingContext) {
    return <JourneyChatDockInner />;
  }
  
  // Otherwise, wrap with provider
  return (
    <AuroraChatProvider>
      <JourneyChatDockInner />
    </AuroraChatProvider>
  );
};

export default JourneyChatDock;

