import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Settings, ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuroraChat } from '@/hooks/aurora/useAuroraChat';
import { cn } from '@/lib/utils';
import AuroraChatMessage from './AuroraChatMessage';
import AuroraChatInput from './AuroraChatInput';
import AuroraTypingIndicator from './AuroraTypingIndicator';
import AuroraDashboardModal from './AuroraDashboardModal';
import AuroraSettingsModal from './AuroraSettingsModal';
import AuroraChecklistModal from './AuroraChecklistModal';
import AuroraWelcome from './AuroraWelcome';

interface AuroraMessageThreadProps {
  conversationId: string;
}

const AuroraMessageThread = ({ conversationId }: AuroraMessageThreadProps) => {
  const { user } = useAuth();
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChecklists, setShowChecklists] = useState(false);

  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
  } = useAuroraChat(conversationId);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
            </Button>
            
            {/* Aurora Avatar */}
            <Avatar className="h-10 w-10">
              <div className="h-full w-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{t('aurora.name')}</h1>
              <p className="text-xs text-muted-foreground">{t('aurora.subtitle')}</p>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDashboard(true)}
              title={t('aurora.dashboard.title')}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChecklists(true)}
              title={t('aurora.checklists.title')}
            >
              <ListChecks className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              title={t('aurora.settings.title')}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {messages.length === 0 && !isStreaming ? (
          <AuroraWelcome onSuggestionClick={handleSuggestionClick} />
        ) : (
          <>
            {messages.map((message) => (
              <AuroraChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                isOwn={message.sender_id === user?.id}
                isAI={message.is_ai_message}
                timestamp={message.created_at}
              />
            ))}
            
            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <AuroraChatMessage
                id="streaming"
                content={streamingContent}
                isOwn={false}
                isAI
                isStreaming
              />
            )}

            {/* Typing indicator */}
            {isStreaming && !streamingContent && (
              <AuroraTypingIndicator />
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <AuroraChatInput
        onSend={sendMessage}
        disabled={isStreaming}
      />

      {/* Modals */}
      <AuroraDashboardModal
        open={showDashboard}
        onOpenChange={setShowDashboard}
      />
      <AuroraSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      <AuroraChecklistModal
        open={showChecklists}
        onOpenChange={setShowChecklists}
      />
    </div>
  );
};

export default AuroraMessageThread;
