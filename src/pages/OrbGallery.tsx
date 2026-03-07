/**
 * OrbGallery – NFT-style collection gallery with trait-based filtering.
 * Uses a single shared WebGL context via R3F + drei View for all orbs.
 * Each orb smoothly morphs between geometric shapes.
 */
import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Orb } from '@/components/orb/Orb';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, ArrowRight, Filter, X, Sparkles, Dna, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GalleryOrbView, GalleryCanvas } from '@/components/orb/GalleryMorphOrb';
import { OrbFullscreenViewer } from '@/components/orb/OrbFullscreenViewer';
import {
  GALLERY_ORBS,
  TRAIT_CATEGORIES,
  RARITY_COLORS,
  RARITY_LABELS,
  type GalleryOrb,
} from '@/data/galleryOrbData';

export default function OrbGalleryPage() {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHe = isRTL;
  const containerRef = useRef<HTMLDivElement>(null!);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrb, setSelectedOrb] = useState<GalleryOrb | null>(null);
  const [fullscreenOrb, setFullscreenOrb] = useState<GalleryOrb | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  const activeFilterCount = Object.keys(filters).length;

  const filteredOrbs = useMemo(() => {
    return GALLERY_ORBS.filter(orb => {
      for (const [key, value] of Object.entries(filters)) {
        if (key === 'rarity') {
          if (orb.rarity !== value) return false;
        } else if (key === 'particles') {
          if (String(orb.traits.particles) !== value) return false;
        } else {
          if ((orb.traits as any)[key] !== value) return false;
        }
      }
      return true;
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredOrbs.length / PAGE_SIZE);
  const pagedOrbs = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredOrbs.slice(start, start + PAGE_SIZE);
  }, [filteredOrbs, page]);

  // Reset page when filters change
  const toggleFilter = (key: string, value: string) => {
    setPage(0);
    setFilters(prev => {
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => { setFilters({}); setPage(0); };

  

  // Rarity stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    GALLERY_ORBS.forEach(o => { counts[o.rarity] = (counts[o.rarity] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
    <GalleryCanvas containerRef={containerRef}>
      <Header />

      <main className="relative pt-20 pb-16">
        {/* Hero */}
        <div className="max-w-6xl mx-auto px-4 text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {isHe ? 'חזרה לדף הבית' : 'Back to Home'}
          </button>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Dna className="w-5 h-5 text-primary" />
            <span className="text-xs uppercase tracking-[0.25em] text-primary font-bold">
              {isHe ? 'אוסף האורבים' : 'Orb Collection'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-3">
            {isHe ? 'גלריית ה-Orbs' : 'Orb Gallery'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {isHe
              ? `${GALLERY_ORBS.length} ארכיטיפים ייחודיים. סנן לפי חומר, דפוס, צורה, זוהר ונדירות.`
              : `${GALLERY_ORBS.length} unique archetypes. Filter by material, pattern, shape, glow and rarity.`}
          </p>

          {/* Rarity stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as const).map(r => (
              <span
                key={r}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `hsl(${RARITY_COLORS[r]} / 0.1)`,
                  color: `hsl(${RARITY_COLORS[r]})`,
                  border: `1px solid hsl(${RARITY_COLORS[r]} / 0.25)`,
                }}
              >
                {stats[r] || 0} {isHe ? RARITY_LABELS[r].he : RARITY_LABELS[r].en}
              </span>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full text-xs"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              {isHe ? 'סינון תכונות' : 'Filter Traits'}
              {activeFilterCount > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />
                {isHe ? 'נקה הכל' : 'Clear all'}
              </button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {filteredOrbs.length} / {GALLERY_ORBS.length}
            </span>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 p-4 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm mb-4">
                  {TRAIT_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                        {isHe ? cat.labelHe : cat.labelEn}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.options.map(opt => {
                          const active = filters[cat.key] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggleFilter(cat.key, opt.value)}
                              className={cn(
                                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                                active
                                  ? 'bg-primary/15 border-primary/50 text-primary'
                                  : 'bg-muted/30 border-border/30 text-muted-foreground hover:border-border hover:text-foreground'
                              )}
                            >
                              {isHe ? opt.labelHe : opt.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-8">
              {pagedOrbs.map((orb, i) => {
                const rarityColor = RARITY_COLORS[orb.rarity];
                return (
                  <motion.div
                    key={orb.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.6) }}
                    onClick={() => setSelectedOrb(orb)}
                    className="relative cursor-pointer flex flex-col items-center group"
                  >
                    {/* Rarity badge */}
                    <span
                      className="relative z-[2] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                      style={{
                        backgroundColor: `hsl(${rarityColor} / 0.12)`,
                        color: `hsl(${rarityColor})`,
                        border: `1px solid hsl(${rarityColor} / 0.25)`,
                      }}
                    >
                      {isHe ? RARITY_LABELS[orb.rarity].he : RARITY_LABELS[orb.rarity].en}
                    </span>

                    {/* Orb - rendered via shared WebGL canvas */}
                    <div className="group-hover:scale-105 transition-transform duration-300">
                      <GalleryOrbView
                        profile={orb.profile}
                        geometryFamily={orb.traits.geometry}
                        size={isMobile ? 120 : 160}
                      />
                    </div>

                    {/* Name */}
                    <h3 className="relative z-[2] text-xs md:text-sm font-bold text-foreground text-center mt-2">
                      {isHe ? orb.nameHe : orb.nameEn}
                    </h3>
                    <p className="relative z-[2] text-[10px] text-muted-foreground text-center mt-0.5 line-clamp-1">
                      {isHe ? orb.descHe : orb.descEn}
                    </p>

                    {/* Trait pills */}
                    <div className="relative z-[2] flex flex-wrap gap-1 justify-center mt-1.5">
                      {[orb.traits.material, orb.traits.geometry].map(t => (
                        <span key={t} className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground capitalize">
                          {t}
                        </span>
                      ))}
                      {orb.traits.particles && (
                        <span className="text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground font-medium">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {filteredOrbs.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">{isHe ? 'לא נמצאו אורבים' : 'No orbs found'}</p>
              <p className="text-sm mt-1">{isHe ? 'נסה לשנות את הסינון' : 'Try adjusting your filters'}</p>
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-full">
                {isHe ? 'נקה סינון' : 'Clear Filters'}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedOrb && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedOrb(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedOrb(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                {/* Rarity */}
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
                  style={{
                    backgroundColor: `hsl(${RARITY_COLORS[selectedOrb.rarity]} / 0.12)`,
                    color: `hsl(${RARITY_COLORS[selectedOrb.rarity]})`,
                    border: `1px solid hsl(${RARITY_COLORS[selectedOrb.rarity]} / 0.3)`,
                  }}
                >
                  {isHe ? RARITY_LABELS[selectedOrb.rarity].he : RARITY_LABELS[selectedOrb.rarity].en}
                </span>

                {/* Orb – morphing WebGL, click for fullscreen */}
                <button
                  onClick={() => { setSelectedOrb(null); setFullscreenOrb(selectedOrb); }}
                  className="cursor-pointer hover:scale-105 transition-transform duration-200"
                  title={isHe ? 'לחץ למסך מלא' : 'Click for fullscreen'}
                >
                  <StandaloneMorphOrb
                    profile={selectedOrb.profile}
                    geometryFamily={selectedOrb.traits.geometry}
                    size={200}
                    level={100}
                  />
                </button>

                <h2 className="text-xl font-black text-foreground mt-4">
                  {isHe ? selectedOrb.nameHe : selectedOrb.nameEn}
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {isHe ? selectedOrb.descHe : selectedOrb.descEn}
                </p>

                {/* Traits grid */}
                <div className="grid grid-cols-2 gap-2 mt-5 w-full">
                  {Object.entries(selectedOrb.traits).map(([key, val]) => {
                    const cat = TRAIT_CATEGORIES.find(c => c.key === key);
                    const label = cat ? (isHe ? cat.labelHe : cat.labelEn) : key;
                    const displayVal = typeof val === 'boolean'
                      ? (val ? (isHe ? 'כן' : 'Yes') : (isHe ? 'לא' : 'No'))
                      : String(val);
                    return (
                      <div key={key} className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/20">
                        <span className="text-[10px] text-muted-foreground">{label}</span>
                        <span className="text-xs font-bold text-foreground capitalize">{displayVal}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Colors */}
                <div className="mt-4 w-full">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 text-center">
                    {isHe ? 'צבעים' : 'Colors'}
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[selectedOrb.profile.primaryColor, ...(selectedOrb.profile.secondaryColors || []), selectedOrb.profile.accentColor]
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((c, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-border/30 shadow-sm"
                          style={{ backgroundColor: `hsl(${c})` }}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen viewer for gallery orbs */}
      {fullscreenOrb && (
        <OrbFullscreenViewer
          open={!!fullscreenOrb}
          onClose={() => setFullscreenOrb(null)}
          profile={fullscreenOrb.profile}
        />
      )}

      <Footer />
    </GalleryCanvas>
    </div>
  );
}
