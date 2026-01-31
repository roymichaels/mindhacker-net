/**
 * PDF Page: Hawkins Scale Consciousness Analysis
 * Visual representation of user's consciousness level on Hawkins scale
 */

import { Brain, Zap, Heart, Sun, Star } from 'lucide-react';

interface PDFHawkinsPageProps {
  consciousnessScore: number;
  dominantPatterns?: string[];
  strengths?: string[];
  growthEdges?: string[];
  blindSpots?: string[];
  currentState?: string;
  language: string;
}

// Hawkins scale levels for visualization
const HAWKINS_LEVELS = [
  { min: 0, max: 20, name: { en: 'Shame', he: 'בושה' }, color: '#4a1c1c' },
  { min: 20, max: 30, name: { en: 'Guilt', he: 'אשמה' }, color: '#5c2323' },
  { min: 30, max: 50, name: { en: 'Apathy', he: 'אדישות' }, color: '#6b3030' },
  { min: 50, max: 75, name: { en: 'Grief', he: 'צער' }, color: '#4a4a5e' },
  { min: 75, max: 100, name: { en: 'Fear', he: 'פחד' }, color: '#5e5e4a' },
  { min: 100, max: 125, name: { en: 'Desire', he: 'תשוקה' }, color: '#7a6b3d' },
  { min: 125, max: 150, name: { en: 'Anger', he: 'כעס' }, color: '#8b4513' },
  { min: 150, max: 175, name: { en: 'Pride', he: 'גאווה' }, color: '#6b8e23' },
  { min: 175, max: 200, name: { en: 'Courage', he: 'אומץ' }, color: '#2e8b57' },
  { min: 200, max: 250, name: { en: 'Neutrality', he: 'ניטרליות' }, color: '#3cb371' },
  { min: 250, max: 310, name: { en: 'Willingness', he: 'נכונות' }, color: '#4682b4' },
  { min: 310, max: 350, name: { en: 'Acceptance', he: 'קבלה' }, color: '#6495ed' },
  { min: 350, max: 400, name: { en: 'Reason', he: 'היגיון' }, color: '#7b68ee' },
  { min: 400, max: 500, name: { en: 'Love', he: 'אהבה' }, color: '#9370db' },
  { min: 500, max: 540, name: { en: 'Joy', he: 'שמחה' }, color: '#ba55d3' },
  { min: 540, max: 600, name: { en: 'Peace', he: 'שלום' }, color: '#da70d6' },
  { min: 600, max: 700, name: { en: 'Enlightenment', he: 'הארה' }, color: '#ffd700' },
];

export function PDFHawkinsPage({
  consciousnessScore,
  dominantPatterns = [],
  strengths = [],
  growthEdges = [],
  blindSpots = [],
  currentState,
  language,
}: PDFHawkinsPageProps) {
  const isRTL = language === 'he';

  // Map 0-100 score to Hawkins scale (20-700 range, with most people in 175-500)
  const hawkinsValue = Math.round(175 + (consciousnessScore / 100) * 325);
  
  // Find current level
  const currentLevel = HAWKINS_LEVELS.find(
    level => hawkinsValue >= level.min && hawkinsValue < level.max
  ) || HAWKINS_LEVELS[HAWKINS_LEVELS.length - 1];

  // Get position on scale (0-100%)
  const scalePosition = Math.min(100, Math.max(0, (hawkinsValue - 20) / (700 - 20) * 100));

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-violet-300">
            {isRTL ? 'ניתוח רמת התודעה' : 'Consciousness Level Analysis'}
          </h2>
          <p className="text-sm text-white/50">
            {isRTL ? 'לפי סולם הוקינס' : 'Based on Hawkins Scale'}
          </p>
        </div>
      </div>

      {/* Hawkins Scale Visual */}
      <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
        {/* Scale bar */}
        <div className="relative h-8 rounded-full overflow-hidden mb-3" style={{ background: 'linear-gradient(to right, #4a1c1c 0%, #6b3030 15%, #8b4513 25%, #2e8b57 35%, #4682b4 50%, #9370db 70%, #ffd700 100%)' }}>
          {/* Position marker */}
          <div 
            className="absolute top-0 h-full w-1 bg-white shadow-lg"
            style={{ left: `${scalePosition}%` }}
          />
          <div 
            className="absolute -top-2 w-4 h-4 rounded-full bg-white border-2 border-violet-500 shadow-lg"
            style={{ left: `calc(${scalePosition}% - 8px)` }}
          />
        </div>
        
        {/* Labels */}
        <div className="flex justify-between text-xs text-white/50 mb-4">
          <span>20</span>
          <span>175</span>
          <span>350</span>
          <span>500</span>
          <span>700</span>
        </div>

        {/* Current Level */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">
            {isRTL ? 'הרמה הנוכחית שלך' : 'Your Current Level'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <span 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: currentLevel.color }}
            />
            <span className="text-2xl font-bold text-white">
              {isRTL ? currentLevel.name.he : currentLevel.name.en}
            </span>
            <span className="text-xl text-violet-400 font-medium">({hawkinsValue})</span>
          </div>
        </div>
      </div>

      {/* Current State */}
      {currentState && (
        <div className="mb-5 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-white/60 mb-2">
            {isRTL ? 'מצב נוכחי' : 'Current State'}
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">{currentState}</p>
        </div>
      )}

      {/* Analysis Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-green-400" />
              <h3 className="font-medium text-green-300 text-sm">
                {isRTL ? 'חוזקות' : 'Strengths'}
              </h3>
            </div>
            <div className="space-y-1">
              {strengths.slice(0, 4).map((s, i) => (
                <p key={i} className="text-xs text-green-200/80">• {s}</p>
              ))}
            </div>
          </div>
        )}

        {/* Growth Edges */}
        {growthEdges.length > 0 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-medium text-emerald-300 text-sm">
                {isRTL ? 'קצוות צמיחה' : 'Growth Edges'}
              </h3>
            </div>
            <div className="space-y-1">
              {growthEdges.slice(0, 4).map((g, i) => (
                <p key={i} className="text-xs text-emerald-200/80">• {g}</p>
              ))}
            </div>
          </div>
        )}

        {/* Dominant Patterns */}
        {dominantPatterns.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-blue-300 text-sm">
                {isRTL ? 'דפוסים דומיננטיים' : 'Dominant Patterns'}
              </h3>
            </div>
            <div className="space-y-1">
              {dominantPatterns.slice(0, 4).map((p, i) => (
                <p key={i} className="text-xs text-blue-200/80">• {p}</p>
              ))}
            </div>
          </div>
        )}

        {/* Blind Spots */}
        {blindSpots.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-amber-400" />
              <h3 className="font-medium text-amber-300 text-sm">
                {isRTL ? 'נקודות עיוורון' : 'Blind Spots'}
              </h3>
            </div>
            <div className="space-y-1">
              {blindSpots.slice(0, 4).map((b, i) => (
                <p key={i} className="text-xs text-amber-200/80">• {b}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Decorative */}
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-violet-600/5 blur-3xl" />
    </div>
  );
}
