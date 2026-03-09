/**
 * AuroraSearchBar — search across all Aurora chat history
 */
import { useState, useRef, useEffect } from 'react';
import { Search, X, MessageSquare, Loader2 } from 'lucide-react';
import { useConversationSearch, SearchResult } from '@/hooks/aurora/useConversationSearch';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function AuroraSearchBar() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const { results, isSearching, query, search, clearSearch } = useConversationSearch();
  const { openChatAndScrollToMessage } = useAuroraChatContext();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleInput = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.trim().length >= 2) search(val);
      else clearSearch();
    }, 300);
  };

  const handleSelect = (result: SearchResult) => {
    openChatAndScrollToMessage(result.conversationId, result.messageId);
    setIsOpen(false);
    setInputValue('');
    clearSearch();
  };

  const close = () => {
    setIsOpen(false);
    setInputValue('');
    clearSearch();
  };

  const pillarLabel = (ctx: string | null) => {
    if (!ctx) return isHe ? 'כללי' : 'General';
    return ctx.replace('pillar:', '').replace('all', isHe ? 'כללי' : 'General');
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx < 0) return text.slice(0, 120);
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + q.length + 60);
    const snippet = text.slice(start, end);
    const parts = snippet.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="bg-primary/20 text-primary font-semibold rounded px-0.5">{p}</mark> : p
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
        title={isHe ? 'חיפוש בשיחות' : 'Search chats'}
      >
        <Search className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col">
      {/* Search input */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={isHe ? 'חפש בכל השיחות...' : 'Search all conversations...'}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          dir={isHe ? 'rtl' : 'ltr'}
        />
        <button onClick={close} className="p-1 rounded hover:bg-muted/50">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {!isSearching && query && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            {isHe ? 'לא נמצאו תוצאות' : 'No results found'}
          </p>
        )}

        <AnimatePresence>
          {results.map((r, i) => (
            <motion.button
              key={r.messageId}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border/30 transition-colors"
              dir={isHe ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-primary capitalize">
                  {pillarLabel(r.context)}
                </span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {format(new Date(r.createdAt), 'MMM d, HH:mm')}
                </span>
              </div>
              <p className="text-xs text-foreground/90 line-clamp-2">
                {highlight(r.content, query)}
              </p>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
