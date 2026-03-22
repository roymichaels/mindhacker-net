/**
 * NFTDetailCard — Frosted glass Web3 collectible card modal.
 * Pokemon/Yu-Gi-Oh inspired with holographic shimmer, traits, and stats.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Sparkles, Shield, Flame, Star, Zap, Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export type NFTType = 'orb' | 'avatar' | 'dna';

interface NFTStat {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

interface NFTTrait {
  name: string;
  value: number; // 0-100
  color: string;
}

interface NFTDetailCardProps {
  open: boolean;
  onClose: () => void;
  type: NFTType;
  title: string;
  subtitle: string;
  rarity: string;
  rarityColor: string; // hsl string like "270 70% 55%"
  serial?: string;
  visual: React.ReactNode;
  stats: NFTStat[];
  traits: NFTTrait[];
  description?: string;
}

export function NFTDetailCard({
  open, onClose, type, title, subtitle, rarity, rarityColor,
  serial, visual, stats, traits, description,
}: NFTDetailCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[340px] rounded-3xl overflow-hidden"
            style={{
              transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Frosted glass background */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(145deg, 
                  hsla(${rarityColor} / 0.12) 0%, 
                  hsla(0 0% 8% / 0.85) 30%,
                  hsla(0 0% 5% / 0.92) 100%)`,
                backdropFilter: 'blur(40px)',
              }}
            />

            {/* Holographic shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{
                background: `linear-gradient(${105 + tilt.x * 3}deg, 
                  transparent 20%, 
                  hsla(${rarityColor} / 0.8) 45%, 
                  hsla(${(parseInt(rarityColor) + 60) || 0} 80% 60% / 0.4) 55%,
                  transparent 80%)`,
              }}
            />

            {/* Rainbow edge refraction */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                border: '1px solid transparent',
                background: `linear-gradient(hsl(0 0% 10%), hsl(0 0% 10%)) padding-box,
                             linear-gradient(135deg, 
                               hsla(${rarityColor} / 0.5), 
                               hsla(${rarityColor} / 0.15) 30%,
                               hsla(${rarityColor} / 0.3) 60%,
                               hsla(${rarityColor} / 0.5)) border-box`,
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 end-3 z-20 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* Rarity badge */}
            <div className="absolute top-3 start-3 z-20">
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm"
                style={{
                  color: `hsl(${rarityColor})`,
                  borderColor: `hsl(${rarityColor} / 0.4)`,
                  background: `linear-gradient(135deg, hsl(${rarityColor} / 0.2), hsl(${rarityColor} / 0.05))`,
                }}
              >
                {rarity}
              </span>
            </div>

            <div className="relative z-10 p-5 pt-12 flex flex-col items-center gap-4">
              {/* Visual centerpiece */}
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-full opacity-20 blur-2xl"
                  style={{ background: `hsl(${rarityColor})` }}
                />
                <div className="relative w-[140px] h-[140px] flex items-center justify-center rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                  {visual}
                </div>
              </div>

              {/* Title block */}
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-white tracking-wide">{title}</h2>
                <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-semibold">{subtitle}</p>
              </div>

              {/* Description */}
              {description && (
                <p className="text-[11px] text-white/50 text-center leading-relaxed max-w-[260px]">
                  {description}
                </p>
              )}

              {/* Stats row */}
              {stats.length > 0 && (
                <div className="w-full grid grid-cols-3 gap-2">
                  {stats.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span style={{ color: s.color }}>{s.icon}</span>
                      <span className="text-sm font-black text-white tabular-nums">{s.value}</span>
                      <span className="text-[8px] text-white/40 uppercase tracking-wider">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Traits — Pokemon-style bars */}
              {traits.length > 0 && (
                <div className="w-full space-y-1.5">
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold text-center mb-2">
                    Traits
                  </p>
                  {traits.map((t, i) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-[10px] text-white/60 font-semibold w-20 text-end truncate">{t.name}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}99)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${t.value}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] text-white/40 font-mono w-7 tabular-nums">{t.value}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Footer — serial / type */}
              <div className="w-full pt-3 mt-1 border-t border-white/[0.06] flex justify-between items-center">
                <span className="text-[9px] text-white/25 uppercase tracking-wider font-mono">
                  {type.toUpperCase()} · MIND OS
                </span>
                {serial && (
                  <span className="text-[9px] text-white/25 font-mono">#{serial}</span>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
