/**
 * PDF Page: Dashboard/Profile data - Values, Principles, Visions, Commitments
 */

import { Heart, Compass, Target, Star, Sparkles, BookOpen } from 'lucide-react';

interface PDFDashboardPageProps {
  values: string[];
  principles: string[];
  selfConcepts: string[];
  characterTraits: string[];
  fiveYearVision?: { title: string; description: string | null } | null;
  tenYearVision?: { title: string; description: string | null } | null;
  activeCommitments: Array<{ title: string; description: string | null }>;
  dailyAnchors: Array<{ title: string; category: string | null }>;
  language: string;
}

export function PDFDashboardPage({
  values,
  principles,
  selfConcepts,
  characterTraits,
  fiveYearVision,
  tenYearVision,
  activeCommitments,
  dailyAnchors,
  language,
}: PDFDashboardPageProps) {
  const isRTL = language === 'he';

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Compass className="w-5 h-5 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-emerald-300">
          {isRTL ? 'מודל החיים שלי' : 'My Life Model'}
        </h2>
      </div>

      {/* Values & Principles Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Values */}
        {values.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="font-medium text-rose-300 text-sm">
                {isRTL ? 'הערכים שלי' : 'My Values'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {values.slice(0, 6).map((value, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-200 text-xs"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Principles */}
        {principles.length > 0 && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-blue-300 text-sm">
                {isRTL ? 'העקרונות שלי' : 'My Principles'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {principles.slice(0, 6).map((principle, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-200 text-xs"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Self Concepts & Character Traits Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Self Concepts */}
        {selfConcepts.length > 0 && (
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="font-medium text-purple-300 text-sm">
                {isRTL ? 'תפיסות עצמיות' : 'Self Concepts'}
              </h3>
            </div>
            <div className="space-y-1">
              {selfConcepts.slice(0, 4).map((concept, i) => (
                <p key={i} className="text-xs text-purple-200/80">
                  • {concept}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Character Traits */}
        {characterTraits.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <h3 className="font-medium text-amber-300 text-sm">
                {isRTL ? 'תכונות אופי' : 'Character Traits'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {characterTraits.slice(0, 6).map((trait, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-200 text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visions */}
      {(fiveYearVision || tenYearVision) && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="font-medium text-cyan-300 text-sm">
              {isRTL ? 'החזון שלי' : 'My Vision'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {fiveYearVision && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-cyan-400 mb-1">
                  {isRTL ? '5 שנים' : '5 Years'}
                </p>
                <p className="text-sm text-white font-medium mb-1">{fiveYearVision.title}</p>
                {fiveYearVision.description && (
                  <p className="text-xs text-white/60 line-clamp-2">{fiveYearVision.description}</p>
                )}
              </div>
            )}
            {tenYearVision && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-xs text-indigo-400 mb-1">
                  {isRTL ? '10 שנים' : '10 Years'}
                </p>
                <p className="text-sm text-white font-medium mb-1">{tenYearVision.title}</p>
                {tenYearVision.description && (
                  <p className="text-xs text-white/60 line-clamp-2">{tenYearVision.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Commitments */}
      {activeCommitments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-green-400" />
            <h3 className="font-medium text-green-300 text-sm">
              {isRTL ? 'התחייבויות פעילות' : 'Active Commitments'}
            </h3>
          </div>
          <div className="space-y-2">
            {activeCommitments.slice(0, 4).map((commitment, i) => (
              <div 
                key={i}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <p className="text-sm text-white font-medium">{commitment.title}</p>
                {commitment.description && (
                  <p className="text-xs text-white/60 mt-1">{commitment.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Anchors */}
      {dailyAnchors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="font-medium text-violet-300 text-sm">
              {isRTL ? 'עוגנים יומיים' : 'Daily Anchors'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {dailyAnchors.slice(0, 8).map((anchor, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-200 text-xs border border-violet-500/30"
              >
                {anchor.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Decorative */}
      <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-emerald-600/5 blur-3xl" />
    </div>
  );
}
