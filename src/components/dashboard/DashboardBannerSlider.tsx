import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Sparkles, Flame, Zap, MessageCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

const banners = [
  {
    id: 'level-up',
    icon: Sparkles,
    titleKey: 'dashboard.banners.levelUpTitle',
    subtitleKey: 'dashboard.banners.levelUpSubtitle',
    gradient: 'from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-700 dark:via-purple-800 dark:to-indigo-900',
    accentColor: 'bg-violet-400/20',
    dotColor: 'bg-violet-400',
    shapes: (
      <>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-0 left-1/4 w-20 h-20 rounded-full bg-indigo-400/15 blur-lg" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 rounded-full bg-yellow-300/60 animate-pulse" />
        <div className="absolute top-4 right-1/4 w-2 h-2 rounded-full bg-yellow-200/80 animate-pulse delay-300" />
        <div className="absolute bottom-6 right-1/2 w-2.5 h-2.5 rounded-full bg-amber-300/50 animate-pulse delay-700" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </>
    ),
  },
  {
    id: 'streak',
    icon: Flame,
    titleKey: 'dashboard.banners.streakTitle',
    subtitleKey: 'dashboard.banners.streakSubtitle',
    gradient: 'from-amber-500 via-orange-500 to-red-600 dark:from-amber-600 dark:via-orange-700 dark:to-red-800',
    accentColor: 'bg-amber-300/20',
    dotColor: 'bg-amber-400',
    shapes: (
      <>
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-yellow-300/15 blur-xl" />
        <div className="absolute top-0 right-1/3 w-16 h-16 rounded-full bg-red-400/10 blur-lg" />
        {/* Flame shapes */}
        <div className="absolute bottom-4 right-12 w-6 h-10 bg-yellow-400/20 rounded-full blur-sm rotate-12" />
        <div className="absolute bottom-2 right-20 w-4 h-8 bg-orange-300/15 rounded-full blur-sm -rotate-6" />
        <div className="absolute top-6 left-1/3 w-8 h-3 bg-white/10 rounded-full blur-sm" />
      </>
    ),
  },
  {
    id: 'potential',
    icon: Zap,
    titleKey: 'dashboard.banners.potentialTitle',
    subtitleKey: 'dashboard.banners.potentialSubtitle',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-800',
    accentColor: 'bg-emerald-300/20',
    dotColor: 'bg-emerald-400',
    shapes: (
      <>
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-cyan-300/10 blur-2xl" />
        <div className="absolute bottom-2 left-1/3 w-24 h-24 rounded-full bg-emerald-400/10 blur-xl" />
        {/* DNA helix pattern */}
        <div className="absolute inset-y-0 right-8 w-px opacity-20">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="absolute w-3 h-3 border border-white/30 rounded-full" style={{ top: `${15 + i * 18}%`, left: i % 2 === 0 ? '-6px' : '4px' }} />
          ))}
        </div>
        <div className="absolute top-3 left-1/4 w-2 h-2 rounded-full bg-cyan-200/60 animate-pulse" />
      </>
    ),
  },
  {
    id: 'aurora',
    icon: MessageCircle,
    titleKey: 'dashboard.banners.auroraTitle',
    subtitleKey: 'dashboard.banners.auroraSubtitle',
    gradient: 'from-rose-500 via-pink-500 to-fuchsia-600 dark:from-rose-700 dark:via-pink-700 dark:to-fuchsia-800',
    accentColor: 'bg-rose-300/20',
    dotColor: 'bg-rose-400',
    shapes: (
      <>
        <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-pink-300/15 blur-xl" />
        <div className="absolute bottom-0 right-1/4 w-20 h-20 rounded-full bg-fuchsia-400/10 blur-lg" />
        {/* Chat bubble motifs */}
        <div className="absolute top-4 right-16 w-8 h-6 bg-white/10 rounded-xl rounded-br-none" />
        <div className="absolute bottom-8 right-28 w-6 h-4 bg-white/8 rounded-xl rounded-bl-none" />
        <div className="absolute top-1/2 right-10 w-2 h-2 rounded-full bg-pink-200/60 animate-pulse" />
        <div className="absolute top-8 right-1/3 w-1.5 h-1.5 rounded-full bg-fuchsia-200/50 animate-pulse delay-500" />
      </>
    ),
  },
  {
    id: 'transformation',
    icon: Target,
    titleKey: 'dashboard.banners.transformTitle',
    subtitleKey: 'dashboard.banners.transformSubtitle',
    gradient: 'from-slate-700 via-gray-800 to-slate-900 dark:from-slate-800 dark:via-gray-900 dark:to-black',
    accentColor: 'bg-slate-400/20',
    dotColor: 'bg-slate-400',
    shapes: (
      <>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-4 left-1/4 w-16 h-16 rounded-full bg-primary/5 blur-lg" />
        {/* Timeline dots */}
        <div className="absolute bottom-5 left-8 right-8 flex items-center gap-1 opacity-30">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => (
            <div key={i} className={cn("h-1.5 rounded-full flex-1", i < 4 ? "bg-primary" : "bg-white/30")} />
          ))}
        </div>
        {/* Shimmer line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </>
    ),
  },
];

export function DashboardBannerSlider() {
  const { t, isRTL } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      direction: isRTL ? 'rtl' : 'ltr',
      align: 'center',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {banners.map((banner) => {
            const Icon = banner.icon;
            return (
              <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                <div className={cn(
                  "relative overflow-hidden rounded-xl p-5 sm:p-7",
                  "bg-gradient-to-br", banner.gradient,
                  "text-white min-h-[120px] sm:min-h-[140px]"
                )}>
                  {/* Decorative shapes */}
                  {banner.shapes}

                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1px]" />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                    <div className={cn("shrink-0 p-2.5 sm:p-3 rounded-xl", banner.accentColor, "backdrop-blur-sm")}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-tight drop-shadow-sm">
                        {t(banner.titleKey)}
                      </h3>
                      <p className="text-sm sm:text-base text-white/75 mt-0.5 leading-snug">
                        {t(banner.subtitleKey)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === selectedIndex
                ? cn("w-6", banner.dotColor)
                : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
