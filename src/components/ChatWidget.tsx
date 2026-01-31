import { useState } from "react";
import ChatPanel from "./chat/ChatPanel";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings } from "@/hooks/useThemeSettings";

// Default logo from public folder (new orb logo)
const defaultLogo = "/logo.png?v=6";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { theme } = useThemeSettings();
  
  // Use theme logo or fallback to default (same pattern as Header)
  const logoUrl = theme.logo_url || defaultLogo;

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-20 md:bottom-8 md:right-8 z-50 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group bg-card border border-border"
        aria-label={t('chat.openChat')}
      >
        <img src={logoUrl} alt={t('chat.chatAlt')} className="w-10 h-10 md:w-14 md:h-14 object-contain" />
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full border-2 border-primary/50 animate-ping opacity-30" />
        
        {/* Glow effect on hover */}
        <span className="absolute inset-0 rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Chat Panel */}
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatWidget;