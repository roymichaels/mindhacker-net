import { Calendar, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  week_number: number;
  title?: string;
  goal?: string;
  tasks?: string[];
  weekly_challenge?: string;
  hypnosis_recommendation?: string;
}

interface PDFLifePlanPageProps {
  milestones: Milestone[];
  planTitle?: string;
  language: string;
  pageNumber: number;
}

export function PDFLifePlanPage({ milestones, planTitle, language, pageNumber }: PDFLifePlanPageProps) {
  const isRTL = language === 'he';

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header - only show on first page */}
      {pageNumber === 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {isRTL ? 'תוכנית 90 יום' : '90-Day Plan'}
            </h2>
          </div>
          {planTitle && (
            <p className="text-white/50 text-sm mr-16">{planTitle}</p>
          )}
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div 
            key={milestone.week_number}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            {/* Week Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                {isRTL ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
              </span>
              {milestone.title && (
                <span className="text-white/80 font-medium text-sm truncate">
                  {milestone.title}
                </span>
              )}
            </div>

            {/* Goal */}
            {milestone.goal && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium">
                    {isRTL ? 'מטרה' : 'Goal'}
                  </span>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{milestone.goal}</p>
              </div>
            )}

            {/* Tasks */}
            {milestone.tasks && milestone.tasks.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-white/50">
                  {isRTL ? 'משימות:' : 'Tasks:'}
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {milestone.tasks.slice(0, 4).map((task, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 truncate max-w-[150px]"
                    >
                      {task}
                    </span>
                  ))}
                  {milestone.tasks.length > 4 && (
                    <span className="text-white/40 text-xs">
                      +{milestone.tasks.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Challenge & Hypnosis */}
            <div className="flex gap-4 text-xs">
              {milestone.weekly_challenge && (
                <div className="flex items-center gap-1 text-amber-400/70">
                  <Zap className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{milestone.weekly_challenge}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-xs text-white/30">
          {isRTL ? `תוכנית 90 יום - עמוד ${pageNumber + 1}` : `90-Day Plan - Page ${pageNumber + 1}`}
        </span>
      </div>
    </div>
  );
}
