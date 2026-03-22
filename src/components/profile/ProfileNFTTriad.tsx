/**
 * ProfileNFTTriad — 3-column NFT card grid: Orb | Avatar | DNA
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { AvatarMiniPreview } from '@/components/avatar/AvatarMiniPreview';
import DNAViewer from '@/components/dna/DNAViewer';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  children: React.ReactNode;
  label: string;
  sublabel: string;
  accentColor: string;
  delay?: number;
}

function NFTCard({ children, label, sublabel, accentColor, delay = 0 }: NFTCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative rounded-2xl border border-border/30 dark:border-white/[0.06] overflow-hidden group"
      style={{
        background: 'linear-gradient(to bottom, hsl(var(--muted) / 0.4), hsl(var(--muted) / 0.15))',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 inset-x-0 h-[1px] opacity-40"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l rounded-tl-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute top-0 right-0 w-5 h-5 border-t border-r rounded-tr-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l rounded-bl-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r rounded-br-2xl pointer-events-none" style={{ borderColor: `${accentColor}40` }} />

      {/* Glow */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 30%, ${accentColor}, transparent 70%)` }}
      />

      <div className="flex flex-col items-center p-3 gap-2">
        {/* Visual */}
        <div className="w-full aspect-square flex items-center justify-center overflow-hidden rounded-xl bg-background/30">
          {children}
        </div>

        {/* Label */}
        <div className="text-center space-y-0.5">
          <p className="text-xs font-bold text-foreground/90 tracking-wide">{label}</p>
          <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">{sublabel}</p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="h-[2px] w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }}
      />
    </motion.div>
  );
}

export default function ProfileNFTTriad() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {/* Orb — left */}
      <NFTCard
        label={isHe ? 'אורב' : 'Orb'}
        sublabel={isHe ? 'גוף ויזואלי' : 'Visual Body'}
        accentColor="hsl(270 70% 55%)"
        delay={0}
      >
        <PersonalizedOrb size={90} state="idle" showGlow={false} />
      </NFTCard>

      {/* Avatar — center */}
      <NFTCard
        label={isHe ? 'אווטאר' : 'Avatar'}
        sublabel={isHe ? 'דמות 3D' : '3D Character'}
        accentColor="hsl(35 80% 50%)"
        delay={0.1}
      >
        <AvatarMiniPreview size={100} />
      </NFTCard>

      {/* DNA — right */}
      <NFTCard
        label="DNA"
        sublabel={isHe ? 'מבנה פנימי' : 'Inner Structure'}
        accentColor="hsl(220 80% 55%)"
        delay={0.2}
      >
        <DNAViewer height={100} />
      </NFTCard>
    </div>
  );
}
