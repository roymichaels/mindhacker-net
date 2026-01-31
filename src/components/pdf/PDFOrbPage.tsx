/**
 * PDF Page: Visual representation of user's Identity DNA Orb
 * Static gradient-based visualization for PDF export
 */

import { cn } from '@/lib/utils';
import type { MultiThreadOrbProfile } from '@/lib/orbDNAThreads';

interface PDFOrbPageProps {
  profile: MultiThreadOrbProfile;
  identityTitle?: {
    title: string;
    icon: string;
  } | null;
  userName: string;
  language: string;
}

// Hebrew translations for thread labels (hobbies, traits, etc.)
const THREAD_LABEL_TRANSLATIONS: Record<string, string> = {
  // Hobbies
  'martial-arts': 'אומנויות לחימה',
  'martial_arts': 'אומנויות לחימה',
  'fitness': 'כושר',
  'sports': 'ספורט',
  'hiking': 'טיולים',
  'dancing': 'ריקוד',
  'science': 'מדע',
  'psychology': 'פסיכולוגיה',
  'reading': 'קריאה',
  'technology': 'טכנולוגיה',
  'philosophy': 'פילוסופיה',
  'meditation': 'מדיטציה',
  'yoga': 'יוגה',
  'tarot': 'טארוט',
  'magic': 'מאגיה',
  'music': 'מוזיקה',
  'art': 'אומנות',
  'writing': 'כתיבה',
  'photography': 'צילום',
  'gaming': 'משחקים',
  'mentoring': 'חונכות',
  'teaching': 'הוראה',
  'volunteering': 'התנדבות',
  // Personality traits
  'analytical': 'אנליטי',
  'intuitive': 'אינטואיטיבי',
  'decisive': 'נחוש',
  'morning': 'בוקר',
  'evening': 'ערב',
  'fluctuates': 'משתנה',
  'structured': 'מסודר',
  'flexible': 'גמיש',
  'balanced': 'מאוזן',
  // Sources
  'trait': 'תכונה',
  'hobby': 'תחביב',
  'strength': 'חוזקה',
  'growth_edge': 'תחום צמיחה',
};

// Helper to translate thread label
function translateLabel(label: string, language: string): string {
  if (language !== 'he') return label;
  return THREAD_LABEL_TRANSLATIONS[label.toLowerCase()] || 
         THREAD_LABEL_TRANSLATIONS[label.replace(/-/g, '_').toLowerCase()] || 
         label;
}

export function PDFOrbPage({ profile, identityTitle, userName, language }: PDFOrbPageProps) {
  const isRTL = language === 'he';

  // Extract colors from threads for the orb visualization
  const threadColors = profile.threads.slice(0, 6).map(t => {
    const [h, s, l] = t.color.split(' ').map(v => parseFloat(v));
    return `hsl(${h}, ${s}%, ${l}%)`;
  });

  // Build gradient stops from thread colors
  const gradientStops = threadColors.length > 0
    ? threadColors.map((color, i) => {
        const percent = (i / (threadColors.length - 1)) * 100;
        return `${color} ${percent}%`;
      }).join(', ')
    : 'hsl(260, 70%, 50%) 0%, hsl(200, 80%, 50%) 50%, hsl(300, 60%, 55%) 100%';

  // Shape labels
  const shapeLabels: Record<string, { en: string; he: string }> = {
    octahedron: { en: 'Emerging', he: 'מתהווה' },
    icosahedron: { en: 'Developing', he: 'מתפתח' },
    dodecahedron: { en: 'Expanding', he: 'מתרחב' },
    sphere: { en: 'Harmonized', he: 'מאוזן' },
    torus: { en: 'Transcendent', he: 'מתעלה' },
  };

  const shapeLabel = shapeLabels[profile.shape.baseGeometry] || shapeLabels.octahedron;

  return (
    <div 
      className="pdf-page flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-violet-300 mb-2">
          {isRTL ? 'ה-DNA הדיגיטלי שלך' : 'Your Digital DNA'}
        </h2>
        <p className="text-white/60 text-sm">
          {isRTL ? 'ייצוג ויזואלי של הזהות הייחודית שלך' : 'A visual representation of your unique identity'}
        </p>
      </div>

      {/* Orb Visualization */}
      <div className="relative mb-8">
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full blur-3xl opacity-30"
          style={{
            background: `radial-gradient(circle, ${threadColors[0] || 'hsl(260, 70%, 50%)'}, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Main orb */}
        <div 
          className="relative w-48 h-48 rounded-full shadow-2xl"
          style={{
            background: `radial-gradient(ellipse at 30% 30%, ${gradientStops})`,
            boxShadow: `
              0 0 60px ${threadColors[0] || 'hsl(260, 70%, 50%)'}40,
              0 0 100px ${threadColors[1] || 'hsl(200, 80%, 50%)'}30,
              inset 0 0 40px rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Inner highlight */}
          <div 
            className="absolute top-4 left-6 w-16 h-10 rounded-full opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 60%)',
            }}
          />
          
          {/* Identity icon in center */}
          {identityTitle?.icon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">{identityTitle.icon}</span>
            </div>
          )}
        </div>

        {/* Orbiting threads (decorative) */}
        {profile.threads.slice(0, 4).map((thread, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const [h, s, l] = thread.color.split(' ').map(v => parseFloat(v));
          
          return (
            <div
              key={thread.id}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: `calc(50% + ${x}px - 8px)`,
                top: `calc(50% + ${y}px - 8px)`,
                background: `hsl(${h}, ${s}%, ${l}%)`,
                boxShadow: `0 0 15px hsl(${h}, ${s}%, ${l}%)`,
              }}
            />
          );
        })}
      </div>

      {/* Identity Title */}
      {identityTitle && (
        <div className="text-center mb-8">
          <p className="text-white/50 text-sm mb-1">
            {isRTL ? 'הזהות הייחודית שלך' : 'Your Unique Identity'}
          </p>
          <h3 className="text-2xl font-bold text-white">
            {identityTitle.title}
          </h3>
        </div>
      )}

      {/* Shape & Consciousness */}
      <div className="flex gap-6 mb-8">
        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-1">
            {isRTL ? 'צורת התודעה' : 'Consciousness Shape'}
          </p>
          <p className="text-lg font-medium text-white">
            {isRTL ? shapeLabel.he : shapeLabel.en}
          </p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-1">
            {isRTL ? 'רמת התודעה' : 'Consciousness Level'}
          </p>
          <p className="text-lg font-medium text-violet-400">
            {profile.consciousnessLevel}%
          </p>
        </div>
        <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/50 text-xs mb-1">
            {isRTL ? 'שכבות DNA' : 'DNA Threads'}
          </p>
          <p className="text-lg font-medium text-cyan-400">
            {profile.threads.length}
          </p>
        </div>
      </div>

      {/* Thread Legend */}
      <div className="w-full max-w-md">
        <h4 className="text-sm font-medium text-white/60 mb-3 text-center">
          {isRTL ? 'שכבות הזהות' : 'Identity Layers'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {profile.threads.slice(0, 8).map((thread) => {
            const [h, s, l] = thread.color.split(' ').map(v => parseFloat(v));
            const translatedLabel = translateLabel(thread.label, language);
            return (
              <div 
                key={thread.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: `hsl(${h}, ${s}%, ${l}%)` }}
                />
                <span className="text-xs text-white/70 truncate">{translatedLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-violet-600/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-cyan-600/5 blur-3xl" />
    </div>
  );
}
