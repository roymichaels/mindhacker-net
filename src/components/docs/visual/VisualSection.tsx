import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  index: number;
  isActive: boolean;
  number?: string;
  title: string;
  children: ReactNode;
  isHe: boolean;
}

export function VisualSection({ index, isActive, number, title, children, isHe }: Props) {
  return (
    <section
      className="min-h-[100svh] w-full snap-start snap-always flex items-center justify-center relative px-6 py-16"
      data-section={index}
    >
      <motion.div
        className="max-w-3xl w-full space-y-8"
        dir={isHe ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 24, filter: 'blur(6px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Section number */}
        {number && (
          <motion.span
            className="block text-6xl md:text-8xl font-black text-primary/15 select-none"
            style={{ lineHeight: 0.9 }}
            initial={{ opacity: 0, x: isHe ? 30 : -30 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {number}
          </motion.span>
        )}

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-foreground tracking-tight"
          style={{ lineHeight: 1.1, textWrap: 'balance' }}
          initial={{ opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h2>

        {/* Content */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
