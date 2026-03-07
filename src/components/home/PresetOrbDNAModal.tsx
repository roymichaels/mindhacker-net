/**
 * PresetOrbDNAModal – Shows a specific orb preset's DNA breakdown.
 * Click the orb inside to open fullscreen viewer with that preset.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dna, Sparkles, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PresetOrbFullscreen } from './PresetOrbFullscreen';
import type { OrbProfile } from '@/components/orb/types';

interface PresetOrbDNAModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: {
    id: string;
    profile: OrbProfile;
  } | null;
  meta: {
    nameEn: string; nameHe: string;
    descEn: string; descHe: string;
    dnaEn: string; dnaHe: string;
    traitsEn: string[]; traitsHe: string[];
  } | null;
}

export function PresetOrbDNAModal({ open, onOpenChange, preset, meta }: PresetOrbDNAModalProps) {
  const { language } = useTranslation();
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenProfile, setFullscreenProfile] = useState<OrbProfile | null>(null);
  const isHe = language === 'he';

  const handleOrbClick = () => {
    if (preset) {
      setFullscreenProfile(preset.profile);
      setFullscreenOpen(true);
      onOpenChange(false);
    }
  };

  const handleFullscreenClose = () => {
    setFullscreenOpen(false);
    setFullscreenProfile(null);
  };

  // Build modal content only when we have data
  const canRenderModal = preset && meta;
  const profile = preset?.profile;

  // Build actual orb colors from profile
  const orbColors: { color: string; label: string }[] = [];
  if (profile) {
    const norm = (c: string | undefined) => {
      if (!c) return null;
      const t = c.trim();
      if (/^\d+\s+\d+%\s+\d+%$/.test(t)) return `hsl(${t})`;
      return t;
    };
    if (profile.primaryColor) orbColors.push({ color: norm(profile.primaryColor)!, label: isHe ? 'ראשי' : 'Primary' });
    profile.secondaryColors?.forEach((c, i) => { if (c) orbColors.push({ color: norm(c)!, label: isHe ? `משני ${i+1}` : `Secondary ${i+1}` }); });
    if (profile.accentColor) orbColors.push({ color: norm(profile.accentColor)!, label: isHe ? 'הדגשה' : 'Accent' });
    if (orbColors.length === 0 && profile.gradientStops?.length) {
      profile.gradientStops.slice(0, 5).forEach((stop, j) => orbColors.push({ color: `hsl(${stop})`, label: `${j+1}` }));
    }
  }

  const stats = profile ? [
    { labelEn: 'Material', labelHe: 'חומר', value: profile.materialType || 'glass' },
    { labelEn: 'Geometry', labelHe: 'גיאומטריה', value: profile.geometryFamily || 'sphere' },
    { labelEn: 'Texture', labelHe: 'טקסטורה', value: profile.textureType || 'none' },
    { labelEn: 'Complexity', labelHe: 'מורכבות', value: String(profile.geometryDetail || 64) },
  ] : [];

  return (
    <>
      <Dialog open={open && canRenderModal} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Dna className="w-4 h-4 text-primary" />
              {isHe ? meta?.nameHe : meta?.nameEn}
            </DialogTitle>
          </DialogHeader>

          {/* Orb preview — click to fullscreen */}
          <div className="flex justify-center py-4">
            <button
              onClick={handleOrbClick}
              className="relative cursor-pointer hover:scale-105 transition-transform duration-200 group"
              title={isHe ? 'לחץ לחוויה מלאה' : 'Click for full experience'}
            >
              {profile && (
                <Orb
                  profile={profile}
                  size={150}
                  state="breathing"
                  renderer="webgl"
                  showGlow={false}
                />
              )}
              {/* Hover hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground border border-border/50">
                  <Eye className="w-3.5 h-3.5" />
                  {isHe ? 'מסך מלא' : 'Full view'}
                </span>
              </div>
            </button>
          </div>

          <ScrollArea className="px-5 pb-5 max-h-[50vh]">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                {isHe ? meta?.descHe : meta?.descEn}
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-primary/80">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="italic">{isHe ? meta?.dnaHe : meta?.dnaEn}</span>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {isHe ? 'צבעי האורב' : 'Orb Colors'}
                </p>
                <div className="flex gap-3 justify-center">
                  {orbColors.map((c, j) => (
                    <div key={j} className="flex flex-col items-center gap-1">
                      <div
                        className="w-9 h-9 rounded-full border-2 border-border/30 shadow-md"
                        style={{ backgroundColor: c.color }}
                        title={c.color}
                      />
                      <span className="text-[9px] text-muted-foreground">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {isHe ? 'תכונות' : 'Traits'}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {(isHe ? meta?.traitsHe : meta?.traitsEn)?.map((trait) => (
                    <span key={trait} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {isHe ? 'מפרט טכני' : 'Technical Specs'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {stats.map(({ labelEn, labelHe: lh, value }) => (
                    <div key={labelEn} className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/20">
                      <span className="text-[10px] text-muted-foreground">{isHe ? lh : labelEn}</span>
                      <span className="text-xs font-bold text-foreground capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <PresetOrbFullscreen
        open={fullscreenOpen}
        onClose={handleFullscreenClose}
        profile={fullscreenProfile!}
      />
    </>
  );
}
