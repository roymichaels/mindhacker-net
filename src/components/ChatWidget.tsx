import { useState } from "react";
import ChatPanel from "./chat/ChatPanel";
import logo from "@/assets/logo.png";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-40 md:bottom-28 right-4 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 group"
        aria-label="פתח צ'אט עם העוזר של דין"
      >
        <img src={logo} alt="צ'אט" className="w-8 h-8 md:w-9 md:h-9" />
        
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping opacity-30" />
        
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
      </button>

      {/* Chat Panel */}
      <ChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatWidget;
