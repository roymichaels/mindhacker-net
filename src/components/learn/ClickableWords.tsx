/**
 * ClickableWords — Renders text with each word clickable.
 * Clicking a word triggers TTS from that word to the end of the full text.
 */
import { useCallback, memo } from 'react';

interface ClickableWordsProps {
  /** The visible text to render as clickable words */
  text: string;
  /** The full remaining text from this paragraph forward (used for TTS context) */
  fullTextFromHere: string;
  /** Called with the text from the clicked word to the end */
  onWordClick: (textFromWord: string) => void;
  className?: string;
  isPlaying?: boolean;
}

function ClickableWordsInner({ text, fullTextFromHere, onWordClick, className = '', isPlaying }: ClickableWordsProps) {
  // Split into words while preserving whitespace
  const tokens = text.split(/(\s+)/);

  const handleClick = useCallback((wordIndex: number) => {
    // Reconstruct from clicked word to end of this text fragment
    const wordsOnly = tokens.filter((_, i) => i % 2 === 0); // even indices are words
    const clickedWordText = wordsOnly[wordIndex];
    
    // Find this word's position in fullTextFromHere and play from there
    // We count non-space tokens to find the right word
    let wordCount = 0;
    let charIndex = 0;
    const fullWords = fullTextFromHere.split(/(\s+)/);
    
    // Find the position in fullTextFromHere that corresponds to this word
    // by matching the local word index to a position in the full text
    const localPrefix = tokens.slice(0, wordIndex * 2).join('');
    
    // Search for the local prefix + clicked word in fullTextFromHere
    const searchStr = localPrefix + clickedWordText;
    let startPos = fullTextFromHere.indexOf(searchStr);
    
    if (startPos !== -1) {
      startPos += localPrefix.length;
    } else {
      // Fallback: just find the word
      startPos = fullTextFromHere.indexOf(clickedWordText);
    }

    if (startPos >= 0) {
      onWordClick(fullTextFromHere.substring(startPos));
    } else {
      // Ultimate fallback: play from the word in just this text
      const remaining = tokens.slice(wordIndex * 2).join('');
      onWordClick(remaining);
    }
  }, [tokens, fullTextFromHere, onWordClick]);

  let wordIdx = 0;

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (i % 2 === 1) {
          // whitespace
          return <span key={i}>{token}</span>;
        }
        if (!token) return null;
        const idx = wordIdx++;
        return (
          <span
            key={i}
            onClick={() => handleClick(idx)}
            className="cursor-pointer rounded-sm transition-colors hover:bg-primary/15 hover:text-primary active:bg-primary/25"
            title="Click to read from here"
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}

export const ClickableWords = memo(ClickableWordsInner);
export default ClickableWords;
