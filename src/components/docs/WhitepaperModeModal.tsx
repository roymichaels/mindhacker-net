import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

interface Props {
  onSelect: (mode: 'simple' | 'visual') => void;
  isHe: boolean;
}

export function WhitepaperModeModal({ onSelect, isHe }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-2xl w-full">
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight" style={{ lineHeight: 1.1 }}>
            {isHe ? 'בחר מצב קריאה' : 'Choose Your Experience'}
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            {isHe ? 'איך תרצה לקרוא את הנייר הלבן?' : 'How would you like to explore the whitepaper?'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* Simple Mode */}
          <motion.button
            onClick={() => onSelect('simple')}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10">
              <FileText className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                {isHe ? 'קריאה קלאסית' : 'Classic Reading'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isHe ? 'מסמך מלא עם ניווט ותוכן עניינים' : 'Full document with navigation & table of contents'}
              </p>
            </div>
          </motion.button>

          {/* Visual Mode */}
          <motion.button
            onClick={() => onSelect('visual')}
            className="group relative flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm text-center transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Shimmer edge */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </div>
            <div className="relative w-16 h-16 rounded-xl bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10">
              <Sparkles className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="relative space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">
                {isHe ? 'חוויה ויזואלית' : 'Visual Experience'}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isHe ? 'מצגת אינטראקטיבית עם אנימציות תלת-מימד' : 'Interactive presentation with 3D animations'}
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
