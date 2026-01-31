import { Calendar, Target, Zap } from 'lucide-react';

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
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14] flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '32px', boxSizing: 'border-box' }}
    >
      {/* Header - only show on first page */}
      {pageNumber === 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-300">
              {isRTL ? 'תוכנית 90 יום' : '90-Day Plan'}
            </h2>
          </div>
          {planTitle && (
            <p className="text-white/50 text-xs mr-14">{planTitle}</p>
          )}
        </div>
      )}

      {/* Milestones - flex-1 to push footer down */}
      <div className="flex-1 space-y-3">
        {milestones.map((milestone) => (
          <div 
            key={milestone.week_number}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
            style={{ breakInside: 'avoid' }}
          >
            {/* Week Header - compact */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                {isRTL ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
              </span>
              {milestone.title && (
                <span className="text-white/80 font-medium text-xs">
                  {milestone.title}
                </span>
              )}
            </div>

            {/* Goal - compact */}
            {milestone.goal && (
              <div className="mb-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <Target className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium">
                    {isRTL ? 'מטרה' : 'Goal'}
                  </span>
                </div>
                <p className="text-white/70 text-xs leading-snug">{milestone.goal}</p>
              </div>
            )}

            {/* Tasks - no truncation */}
            {milestone.tasks && milestone.tasks.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-white/50">
                  {isRTL ? 'משימות:' : 'Tasks:'}
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {milestone.tasks.slice(0, 5).map((task, i) => (
                    <span 
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-xs border border-white/10"
                    >
                      {task}
                    </span>
                  ))}
                  {milestone.tasks.length > 5 && (
                    <span className="text-white/40 text-xs">
                      +{milestone.tasks.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Challenge */}
            {milestone.weekly_challenge && (
              <div className="flex items-center gap-1 text-xs text-amber-400/70">
                <Zap className="w-3 h-3" />
                <span>{milestone.weekly_challenge}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - not absolute, pushed to bottom by flex */}
      <div className="mt-4 text-center">
        <span className="text-xs text-white/30">
          {isRTL ? `תוכנית 90 יום - עמוד ${pageNumber + 1}` : `90-Day Plan - Page ${pageNumber + 1}`}
        </span>
      </div>
    </div>
  );
}
