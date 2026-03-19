/**
 * AIStoryViewer — Full-screen viewer for AI-generated stories (MindOS / Aurora).
 * Features AI image background, cinematic typography overlay, and branded identity.
 */
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';

export interface AIStoryData {
  id: string;
  source: 'mindos' | 'aurora';
  media_url: string;
  title_en: string;
  title_he: string;
  body_en: string;
  body_he: string;
  subtitle_en: string;
  subtitle_he: string;
  created_at: string;
  pillar: string;
}

interface AIStoryViewerProps {
  stories: AIStoryData[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

const PROGRESS_DURATION = 6000; // 6s per story

export default function AIStoryViewer({ stories, initialIndex, open, onClose }: AIStoryViewerProps) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const story = stories[index];

  // Auto-advance timer
  useEffect(() => {
    if (!open || !story) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (index < stories.length - 1) {
            setIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + (100 / (PROGRESS_DURATION / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [open, index, stories.length, onClose, story]);

  useEffect(() => { setIndex(initialIndex); }, [initialIndex]);

  const goNext = useCallback(() => {
    if (index < stories.length - 1) { setIndex(i => i + 1); setProgress(0); }
    else onClose();
  }, [index, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (index > 0) { setIndex(i => i - 1); setProgress(0); }
  }, [index]);

  if (!open || !story) return null;

  const isMindOS = story.source === 'mindos';
  const title = isHe ? story.title_he : story.title_en;
  const body = isHe ? story.body_he : story.body_en;
  const subtitle = isHe ? story.subtitle_he : story.subtitle_en;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black flex flex-col"
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-3">
          {stories.map((_, i) => (
            <div key={i} className="h-[3px] flex-1 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-3">
            {/* Brand identity */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden",
              isMindOS
                ? "bg-gradient-to-br from-primary/80 to-violet-600 border-2 border-white/20"
                : "border-2 border-violet-400/40"
            )}>
              {isMindOS ? (
                <span className="text-lg font-black text-white tracking-tighter">M</span>
              ) : (
                <StandaloneMorphOrb size={36} profile={AURORA_ORB_PROFILE} geometryFamily="octa" level={100} />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-bold tracking-wide">
                {isMindOS ? 'MindOS' : 'Aurora'}
              </p>
              <p className="text-white/50 text-[10px]">
                {new Date(story.created_at).toLocaleDateString(isHe ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={story.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
          <div className={cn(
            "absolute inset-0",
            isMindOS
              ? "bg-gradient-to-br from-primary/20 via-transparent to-violet-900/30"
              : "bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-900/30"
          )} />
        </div>

        {/* Content Overlay — Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-12 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          {/* Subtitle / tagline */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.2em] mb-3",
                isMindOS ? "text-primary/90" : "text-violet-300/90"
              )}
            >
              {subtitle}
            </motion.p>
          )}

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {title}
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-base text-white/85 leading-relaxed max-w-md"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}
          >
            {body}
          </motion.p>

          {/* Source badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 flex items-center gap-2"
          >
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm",
              isMindOS
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-violet-500/20 text-violet-300 border border-violet-400/30"
            )}>
              {isMindOS ? '🧠 MindOS Daily' : '✨ Aurora Insight'}
            </div>
          </motion.div>
        </div>

        {/* Navigation areas (tap left/right) */}
        <button
          onClick={goPrev}
          className="absolute left-0 top-20 bottom-20 w-1/3 z-10"
          aria-label="Previous"
        />
        <button
          onClick={goNext}
          className="absolute right-0 top-20 bottom-20 w-1/3 z-10"
          aria-label="Next"
        />
      </motion.div>
    </AnimatePresence>
  );
}
