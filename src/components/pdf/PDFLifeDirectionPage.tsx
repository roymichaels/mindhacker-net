import { Compass, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LifeDirection {
  central_aspiration?: string;
  vision_summary?: string;
  clarity_score?: number;
}

interface PDFLifeDirectionPageProps {
  direction: LifeDirection;
  language: string;
}

export function PDFLifeDirectionPage({ direction, language }: PDFLifeDirectionPageProps) {
  const isRTL = language === 'he';

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
          <Compass className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          {isRTL ? 'כיוון החיים שלך' : 'Your Life Direction'}
        </h2>
      </div>

      {/* Central Aspiration */}
      {direction.central_aspiration && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-300">
              {isRTL ? 'שאיפה מרכזית' : 'Central Aspiration'}
            </h3>
          </div>
          <p className="text-white/80 leading-relaxed text-lg">
            "{direction.central_aspiration}"
          </p>
          
          {/* Decorative quote marks */}
          <div className="absolute top-4 right-4 text-6xl text-blue-500/10 font-serif">"</div>
        </div>
      )}

      {/* Vision Summary */}
      {direction.vision_summary && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-violet-300">
              {isRTL ? 'סיכום החזון' : 'Vision Summary'}
            </h3>
          </div>
          <p className="text-white/70 leading-relaxed">
            {direction.vision_summary}
          </p>
        </div>
      )}

      {/* Clarity Score */}
      {direction.clarity_score !== undefined && (
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
            <span className="text-white/60 text-sm">
              {isRTL ? 'ציון בהירות' : 'Clarity Score'}
            </span>
            <span className="text-2xl font-bold text-blue-400">{direction.clarity_score}%</span>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-blue-600/5 blur-3xl" />
      <div className="absolute top-40 right-10 w-32 h-32 rounded-full bg-cyan-600/5 blur-3xl" />
    </div>
  );
}
