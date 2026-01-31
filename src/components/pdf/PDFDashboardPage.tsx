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
  
  // Remove duplicates from arrays
  const uniqueValues = [...new Set(values)];
  const uniquePrinciples = [...new Set(principles)];
  const uniqueSelfConcepts = [...new Set(selfConcepts)];
  const uniqueCharacterTraits = [...new Set(characterTraits)];

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '32px', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Compass className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-emerald-300">
          {isRTL ? 'מודל החיים שלי' : 'My Life Model'}
        </h2>
      </div>

      {/* Values & Principles Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Values */}
        {uniqueValues.length > 0 && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3 h-3 text-rose-400" />
              <h3 className="font-medium text-rose-300 text-xs">
                {isRTL ? 'הערכים שלי' : 'My Values'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {uniqueValues.slice(0, 6).map((value, i) => (
                <span 
                  key={`value-${i}`}
                  className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 text-[10px]"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Principles */}
        {uniquePrinciples.length > 0 && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3 h-3 text-blue-400" />
              <h3 className="font-medium text-blue-300 text-xs">
                {isRTL ? 'העקרונות שלי' : 'My Principles'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {uniquePrinciples.slice(0, 6).map((principle, i) => (
                <span 
                  key={`principle-${i}`}
                  className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 text-[10px]"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Self Concepts & Character Traits Row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Self Concepts */}
        {uniqueSelfConcepts.length > 0 && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <h3 className="font-medium text-purple-300 text-xs">
                {isRTL ? 'תפיסות עצמיות' : 'Self Concepts'}
              </h3>
            </div>
            <div className="space-y-0.5">
              {uniqueSelfConcepts.slice(0, 3).map((concept, i) => (
                <p key={`concept-${i}`} className="text-[10px] text-purple-200/80 leading-tight">
                  • {concept}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Character Traits */}
        {uniqueCharacterTraits.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-3 h-3 text-amber-400" />
              <h3 className="font-medium text-amber-300 text-xs">
                {isRTL ? 'תכונות אופי' : 'Character Traits'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {uniqueCharacterTraits.slice(0, 6).map((trait, i) => (
                <span 
                  key={`trait-${i}`}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px]"
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
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3 h-3 text-cyan-400" />
            <h3 className="font-medium text-cyan-300 text-xs">
              {isRTL ? 'החזון שלי' : 'My Vision'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fiveYearVision && (
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-[10px] text-cyan-400 mb-0.5">
                  {isRTL ? '5 שנים' : '5 Years'}
                </p>
                <p className="text-xs text-white font-medium leading-tight">{fiveYearVision.title}</p>
                {fiveYearVision.description && (
                  <p className="text-[10px] text-white/60 leading-tight mt-0.5 line-clamp-2">{fiveYearVision.description}</p>
                )}
              </div>
            )}
            {tenYearVision && (
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-400 mb-0.5">
                  {isRTL ? '10 שנים' : '10 Years'}
                </p>
                <p className="text-xs text-white font-medium leading-tight">{tenYearVision.title}</p>
                {tenYearVision.description && (
                  <p className="text-[10px] text-white/60 leading-tight mt-0.5 line-clamp-2">{tenYearVision.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Commitments */}
      {activeCommitments.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3 h-3 text-green-400" />
            <h3 className="font-medium text-green-300 text-xs">
              {isRTL ? 'התחייבויות פעילות' : 'Active Commitments'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activeCommitments.slice(0, 6).map((commitment, i) => (
              <div 
                key={i}
                className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <p className="text-xs text-white font-medium leading-tight">{commitment.title}</p>
                {commitment.description && (
                  <p className="text-[10px] text-white/60 mt-0.5 leading-tight line-clamp-1">{commitment.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Anchors */}
      {dailyAnchors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <h3 className="font-medium text-violet-300 text-xs">
              {isRTL ? 'עוגנים יומיים' : 'Daily Anchors'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dailyAnchors.slice(0, 10).map((anchor, i) => (
              <span 
                key={i}
                className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-200 text-[10px] border border-violet-500/30"
              >
                {anchor.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
