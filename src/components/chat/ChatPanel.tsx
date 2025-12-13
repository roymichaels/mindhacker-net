import { useState, useEffect, useRef } from "react";
import { X, Trash2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "mind-hacker-chat-history";
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

const GREETING_MESSAGE: Message = {
  role: "assistant",
  content: "היי! 👋 אני כאן לעזור. רוצה לשאול משהו על אימון תודעתי או להכיר את הגישה של דין?"
};

const ChatPanel = ({ isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.length > 0 ? parsed : [GREETING_MESSAGE]);
      } catch {
        setMessages([GREETING_MESSAGE]);
      }
    } else {
      setMessages([GREETING_MESSAGE]);
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    setMessages([GREETING_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage].filter(m => m.content !== GREETING_MESSAGE.content || m.role === "user")
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "סליחה, משהו השתבש. נסה שוב בבקשה 🙏" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-40 md:bottom-28 left-4 md:left-auto md:right-4 z-50 w-[calc(100%-2rem)] md:w-96 max-h-[70vh] flex flex-col glass-panel rounded-2xl border border-border/50 shadow-2xl animate-scale-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">העוזר של דין</h3>
            <p className="text-xs text-muted-foreground">כאן לעזור 24/7</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[50vh]">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            role={message.role} 
            content={message.content}
            isStreaming={isLoading && index === messages.length - 1 && message.role === "assistant"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatPanel;
