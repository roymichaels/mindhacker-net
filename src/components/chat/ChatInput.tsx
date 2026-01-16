import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-border bg-muted/30">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="כתוב הודעה..."
        disabled={disabled}
        className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        dir="rtl"
      />
      <Button
        type="submit"
        size="icon"
        disabled={disabled || !input.trim()}
        className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
