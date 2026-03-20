import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  index: number;
  isActive: boolean;
  number?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  isHe: boolean;
  layout?: 'center' | 'left' | 'split';
  accent?: string;
}

export function VisualSection({ index, isActive, number, title, subtitle, children, isHe, layout = 'center', accent }: Props) {
  return (
    <section
      className="min-h-[100svh] w-full snap-start snap-always flex items-center justify-center relative px-6 md:px-12 py-16"
      data-section={index}
    >
      <motion.div
        className={cn(
          "w-full space-y-6",
          layout === 'center' && "max-w-3xl text-center mx-auto",
          layout === 'left' && "max-w-4xl",
          layout === 'split' && "max-w-5xl",
        )}
        dir={isHe ? 'rtl' : 'ltr'}
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={isActive ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 20, filter: 'blur(6px)' }}
        exit={{ opacity: 0, y: -16, filter: 'blur(4px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Section number */}
        {number && (
          <motion.span
            className="block text-7xl md:text-9xl font-black text-primary/10 select-none leading-none"
            initial={{ opacity: 0, x: isHe ? 40 : -40 }}
            animate={isActive ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {number}
          </motion.span>
        )}

        {/* Accent line */}
        {accent && (
          <motion.div
            className="h-1 w-16 rounded-full mx-auto"
            style={{ background: accent }}
            initial={{ scaleX: 0 }}
            animate={isActive ? { scaleX: 1 } : {}}
            transition={{ delay: 0.15, duration: 0.6 }}
          />
        )}

        {/* Title */}
        <motion.h2
          className={cn(
            "font-bold text-foreground tracking-tight",
            index === 0 ? "text-5xl md:text-7xl" : "text-3xl md:text-5xl",
          )}
          style={{ lineHeight: 1.05, textWrap: 'balance' }}
          initial={{ opacity: 0, y: 14 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h2>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-lg md:text-xl text-muted-foreground font-medium"
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Content */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 14 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
