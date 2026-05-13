/**
 * ShellV2Header — fixed top chrome for ShellV2 routes.
 *
 * Visual source: header block of `src/components/dashboard/DashboardLayout.tsx`
 * (orb-left brand badge, centered "מיינד OS" title, hamburger right).
 * Architecture: zero legacy deps — no AppNameDropdown, no MindOSSheet, no
 * dashboard logic. Hamburger and orb both open ShellV2Drawer via
 * OverlayController.
 */
import { useState } from 'react';
import { Menu, Sparkles, Info, Play, Pause, SkipBack, SkipForward, Volume2, Headphones } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useOverlay } from '@/shell/overlay/OverlayController';
import { OrbView } from '@/components/orb/v2/OrbView';
import { zStyle } from './zindex';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

export default function ShellV2Header() {
  const overlay = useOverlay();
  const { language, isRTL } = useTranslation();
  const [brandOpen, setBrandOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const brand = 'MindOS';
  const isHe = language === 'he';

  return (
    <>
    <header
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0',
        'bg-background/55 backdrop-blur-2xl backdrop-saturate-150',
        'border-b border-white/[0.06]',
        'pt-[env(safe-area-inset-top)] pb-1',
      )}
      style={zStyle('chrome')}
      data-shellv2-layer="chrome"
      data-shellv2-header
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-auto mx-auto flex h-11 w-full max-w-screen-md items-center justify-between gap-2 px-3">
        {/* Left: orb badge */}
        <button
          type="button"
          aria-label={isHe ? 'מצב אינטראקטיבי' : 'Interactive mode'}
          onClick={() => overlay.open('aion')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <OrbView size={28} neutral tintHue="hsl(0 0% 100%)" tier="presence" ariaLabel={isHe ? 'תפריט' : 'Menu'} />
        </button>

        {/* Center: brand (tap to open about sheet) */}
        <button
          type="button"
          onClick={() => setBrandOpen(true)}
          className="flex min-w-0 flex-1 items-center justify-center gap-1.5 select-none rounded-full px-3 py-1 active:scale-[0.97] transition"
          aria-label={isHe ? 'אודות' : 'About'}
        >
          <span className="truncate text-[15px] font-bold tracking-wide text-foreground/90">
            {brand}
          </span>
          <Sparkles className="h-3 w-3 text-foreground/40" />
        </button>

        {/* Right: hamburger */}
        <button
          type="button"
          aria-label={isHe ? 'נגן' : 'Player'}
          onClick={() => setPlayerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/85 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={language === 'he' ? 'תפריט' : 'Menu'}
          onClick={() => overlay.open('drawer')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-foreground/85 backdrop-blur-md transition-colors hover:bg-white/[0.08]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>

    <Sheet open={brandOpen} onOpenChange={setBrandOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1rem)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <OrbView size={32} neutral tintHue="hsl(0 0% 100%)" tier="presence" />
            <SheetTitle className="text-lg">{brand}</SheetTitle>
          </div>
          <SheetDescription className="text-foreground/70">
            {isHe
              ? 'מערכת ההפעלה של החיים שלך — משחק, מסע ותרגול יומי.'
              : 'The operating system for your life — game, journey, and daily practice.'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-xs text-foreground/60">
          <Info className="h-4 w-4 shrink-0" />
          <span>{isHe ? 'גרסה 2 · ShellV2' : 'Version 2 · ShellV2'}</span>
        </div>
      </SheetContent>
    </Sheet>

    <Sheet open={playerOpen} onOpenChange={setPlayerOpen}>
      <SheetContent
        side="bottom"
        dir={isRTL ? 'rtl' : 'ltr'}
        className="rounded-t-3xl border-white/10 bg-background/85 backdrop-blur-2xl pb-[max(env(safe-area-inset-bottom),1.25rem)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <SheetHeader className={isRTL ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-foreground/70" />
            <SheetTitle className="text-lg">{isHe ? 'נגן מדיה' : 'Media Player'}</SheetTitle>
          </div>
          <SheetDescription className="text-foreground/60">
            {isHe ? 'אין כעת מדיה בנגינה.' : 'Nothing currently playing.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 rounded-3xl bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.06] flex items-center justify-center">
              <OrbView size={48} neutral tintHue="hsl(0 0% 100%)" tier="presence" state={isPlaying ? 'responding' : 'idle'} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground/90">
                {isHe ? 'מוכן לנגינה' : 'Ready to play'}
              </div>
              <div className="truncate text-xs text-foreground/50">
                {isHe ? 'תרגולים, היפנוזה ושמע מודרך' : 'Practices, hypnosis & guided audio'}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Slider value={[progress]} onValueChange={(v) => setProgress(v[0])} max={100} step={1} />
            <div className="mt-1.5 flex justify-between text-[10px] text-foreground/40 tabular-nums" dir="ltr">
              <span>0:00</span>
              <span>--:--</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-6">
            <button type="button" aria-label="prev" className="text-foreground/70 active:scale-95">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'pause' : 'play'}
              onClick={() => setIsPlaying((v) => !v)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ms-0.5" />}
            </button>
            <button type="button" aria-label="next" className="text-foreground/70 active:scale-95">
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-foreground/50 shrink-0" />
            <Slider value={[volume]} onValueChange={(v) => setVolume(v[0])} max={100} step={1} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
