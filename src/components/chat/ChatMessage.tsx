import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useThemeSettings } from "@/hooks/useThemeSettings";

// Default logo from public folder (new orb logo)
const defaultLogo = "/logo.png?v=9";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const { theme } = useThemeSettings();
  const logoUrl = theme.logo_url || defaultLogo;
  const isUser = role === "user";

  return (
    <div className={cn(
      "flex gap-3 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-primary/20 text-primary" 
          : "bg-accent/20"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <img src={logoUrl} alt="Assistant" className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-md" 
          : "bg-muted/80 text-foreground rounded-bl-md border border-border/50"
      )}>
        {content}
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current animate-pulse mr-1" />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
