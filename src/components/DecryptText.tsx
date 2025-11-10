import { useEffect, useState, useRef } from "react";

interface DecryptTextProps {
  text: string;
  className?: string;
}

const DecryptText = ({ text, className = "" }: DecryptTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const glyphs = "אבגדהוזחטיכלמנסעפצקרשת✶◇⊙△✦";

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    setIsDecrypting(true);

    const chars = text.split("");
    const scrambleIterations = 8;

    chars.forEach((finalChar, index) => {
      // Stagger each character by 60ms
      const startDelay = index * 60;

      for (let iteration = 0; iteration < scrambleIterations; iteration++) {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => {
            const current = prev.split("");
            current[index] = glyphs[Math.floor(Math.random() * glyphs.length)];
            return current.join("");
          });
        }, startDelay + iteration * 50);

        timeoutsRef.current.push(timeout);
      }

      // Lock in final character
      const finalTimeout = setTimeout(() => {
        setDisplayText((prev) => {
          const current = prev.split("");
          current[index] = finalChar;
          return current.join("");
        });

        // If this is the last character, mark decryption as complete
        if (index === chars.length - 1) {
          setTimeout(() => setIsDecrypting(false), 100);
        }
      }, startDelay + scrambleIterations * 50);

      timeoutsRef.current.push(finalTimeout);
    });

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [text]);

  return (
    <span
      className={`${className} ${
        isDecrypting ? "decrypt-glow-scramble" : "decrypt-glow-locked"
      } transition-all duration-100`}
      style={{ minWidth: "200px", display: "inline-block" }}
    >
      {displayText}
    </span>
  );
};

export default DecryptText;
