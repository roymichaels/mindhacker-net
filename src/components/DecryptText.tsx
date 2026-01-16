import { useEffect, useState, useRef } from "react";

interface DecryptTextProps {
  text: string;
  className?: string;
}

const DecryptText = ({ text, className = "" }: DecryptTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const rafRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const glyphs = "אבגדהוזחטיכלמנסעפצקרשת✶◇⊙△✦";

  useEffect(() => {
    // Cancel any existing animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // CRITICAL FIX: Reset display text to spaces to prevent character overflow
    setDisplayText(" ".repeat(text.length));
    setIsDecrypting(true);

    const chars = text.split("");
    const scrambleIterations = 10;
    const charStagger = 80; // ms delay between each character starting
    const iterationDuration = 60; // ms per scramble iteration
    const totalCharDuration = scrambleIterations * iterationDuration;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      let newText = "";
      let allComplete = true;

      chars.forEach((finalChar, index) => {
        const charStartTime = index * charStagger;
        const charElapsed = elapsed - charStartTime;

        if (charElapsed < 0) {
          // Character hasn't started yet
          newText += " ";
          allComplete = false;
        } else if (charElapsed < totalCharDuration) {
          // Character is scrambling
          newText += glyphs[Math.floor(Math.random() * glyphs.length)];
          allComplete = false;
        } else {
          // Character is locked in
          newText += finalChar;
        }
      });

      setDisplayText(newText);

      if (!allComplete) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setIsDecrypting(false);
        startTimeRef.current = 0;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      startTimeRef.current = 0;
    };
  }, [text]);

  return (
    <span
      className={`${className} font-black transition-all duration-100`}
    >
      {displayText}
    </span>
  );
};

export default DecryptText;
