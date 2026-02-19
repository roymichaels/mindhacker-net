/**
 * OrbDebugOverlay - Debug panel for orb profile inspection
 * Toggle via: localStorage.setItem('ORB_DEBUG', 'true')
 */

import React, { useState, useEffect } from 'react';
import type { OrbProfile } from './types';

interface OrbDebugOverlayProps {
  profile: OrbProfile;
  userId?: string;
  seed: number;
  missedFields?: string[];
  diagnosticState?: string;
}

function isOrbDebug(): boolean {
  try { return localStorage.getItem('ORB_DEBUG') === 'true'; } catch { return false; }
}

export function OrbDebugOverlay({ profile, userId, seed, missedFields, diagnosticState }: OrbDebugOverlayProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(isOrbDebug() || diagnosticState === 'missing_data');
  }, [diagnosticState]);

  if (!visible) return null;

  const cf = profile.computedFrom;

  return (
    <div 
      className="absolute top-0 right-0 z-50 max-w-[240px] max-h-[420px] overflow-auto rounded-lg border border-border/50 bg-background/90 backdrop-blur-sm p-2 text-[9px] font-mono leading-tight shadow-lg"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-foreground/80">ORB DEBUG</span>
        <button onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground">✕</button>
      </div>

      {diagnosticState === 'missing_data' && (
        <div className="mb-1 rounded bg-destructive/20 px-1 py-0.5 text-destructive font-bold">
          ⚠ MISSING DATA
        </div>
      )}

      <Row label="user_id" value={userId?.slice(0, 8) + '...'} />
      <Row label="seed" value={String(seed)} />
      <Row label="diagnostic" value={diagnosticState || 'ok'} />
      
      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Archetypes</div>
      <Row label="dominant" value={cf.dominantArchetype || '-'} />
      <Row label="secondary" value={cf.secondaryArchetype || '-'} />
      {cf.archetypeWeights?.slice(0, 3).map((w, i) => (
        <Row key={i} label={`  ${w.id}`} value={w.weight.toFixed(2)} />
      ))}

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Gradient Stops</div>
      <div className="flex gap-0.5 flex-wrap mb-1">
        {(profile.gradientStops || []).map((stop, i) => (
          <div key={i} className="flex items-center gap-0.5">
            <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: `hsl(${stop})` }} />
            <span className="text-foreground/60 text-[8px]">{i}</span>
          </div>
        ))}
      </div>
      <Row label="mode" value={profile.gradientMode || 'vertical'} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Material</div>
      <Row label="type" value={profile.materialType || 'glass'} />
      <Row label="metalness" value={(profile.materialParams?.metalness ?? 0).toFixed(2)} />
      <Row label="roughness" value={(profile.materialParams?.roughness ?? 0).toFixed(2)} />
      <Row label="clearcoat" value={(profile.materialParams?.clearcoat ?? 0).toFixed(2)} />
      <Row label="transmission" value={(profile.materialParams?.transmission ?? 0).toFixed(2)} />
      <Row label="emissive" value={(profile.materialParams?.emissiveIntensity ?? 0).toFixed(2)} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Pattern</div>
      <Row label="type" value={profile.patternType || 'fractal'} />
      <Row label="intensity" value={(profile.patternIntensity ?? 0).toFixed(2)} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Effects</div>
      <Row label="bloom" value={(profile.bloomStrength ?? 0).toFixed(2)} />
      <Row label="chromaShift" value={(profile.chromaShift ?? 0).toFixed(2)} />
      <Row label="dayNight" value={(profile.dayNightBias ?? 0.5).toFixed(2)} />
      <ColorRow label="rimLight" hsl={profile.rimLightColor || '40 80% 65%'} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Particles</div>
      <Row label="behavior" value={profile.particleBehavior || 'orbit'} />
      <Row label="mode" value={profile.particleMode || 'cycle'} />
      <div className="flex gap-0.5 flex-wrap mb-1">
        {(profile.particlePalette || []).map((stop, i) => (
          <div key={i} className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: `hsl(${stop})` }} />
        ))}
      </div>

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Colors</div>
      <ColorRow label="primary" hsl={profile.primaryColor} />
      <ColorRow label="secondary" hsl={profile.secondaryColors[0]} />
      <ColorRow label="accent" hsl={profile.accentColor} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Geometry</div>
      <Row label="family" value={profile.geometryFamily || 'default'} />
      <Row label="detail" value={String(profile.geometryDetail)} />
      <Row label="texture" value={profile.textureType || 'flowing'} />
      <Row label="layers" value={String(profile.layerCount)} />

      <div className="border-t border-border/30 my-1" />
      <div className="font-bold text-foreground/70 mb-0.5">Motion</div>
      <Row label="morph" value={(profile.morphIntensity).toFixed(2)} />
      <Row label="speed" value={(profile.motionSpeed ?? 1).toFixed(2)} />
      <Row label="pulse" value={(profile.pulseRate ?? 1).toFixed(2)} />
      <Row label="smooth" value={(profile.smoothness ?? 0.6).toFixed(2)} />

      {missedFields && missedFields.length > 0 && (
        <>
          <div className="border-t border-border/30 my-1" />
          <div className="font-bold text-destructive/80 mb-0.5">Missing Fields</div>
          {missedFields.map(f => (
            <div key={f} className="text-destructive/70">• {f}</div>
          ))}
        </>
      )}

      <div className="border-t border-border/30 my-1" />
      <Row label="level" value={String(cf.level)} />
      <Row label="streak" value={String(cf.streak)} />
      <Row label="clarity" value={String(cf.clarityScore)} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground/90 truncate text-right">{value}</span>
    </div>
  );
}

function ColorRow({ label, hsl }: { label: string; hsl: string }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-full border border-border/50" style={{ backgroundColor: `hsl(${hsl})` }} />
        <span className="text-foreground/90 truncate">{hsl}</span>
      </div>
    </div>
  );
}

export default OrbDebugOverlay;
