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
      style={{ width: '595px', height: '842px', padding: '28px', boxSizing: 'border-box', overflow: 'hidden' }}
    >
      {/* Header - only show on first page */}
      {pageNumber === 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-emerald-300">
              {isRTL ? 'תוכנית 90 יום' : '90-Day Plan'}
            </h2>
          </div>
          {planTitle && (
            <p className="text-white/50 text-[10px] mr-10">{planTitle}</p>
          )}
        </div>
      )}

      {/* Milestones - flex-1 to push footer down */}
      <div className="flex-1 space-y-2">
        {milestones.map((milestone) => (
          <div 
            key={milestone.week_number}
            className="p-2.5 rounded-lg bg-white/5 border border-white/10"
            style={{ breakInside: 'avoid' }}
          >
            {/* Week Header - compact */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                {isRTL ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
              </span>
              {milestone.title && (
                <span className="text-white/80 font-medium text-[11px]">
                  {milestone.title}
                </span>
              )}
            </div>

            {/* Goal - compact */}
            {milestone.goal && (
              <div className="mb-1.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <Target className="w-2.5 h-2.5 text-violet-400" />
                  <span className="text-[10px] text-violet-400 font-medium">
                    {isRTL ? 'מטרה' : 'Goal'}
                  </span>
                </div>
                <p className="text-white/70 text-[10px] leading-snug">{milestone.goal}</p>
              </div>
            )}

            {/* Tasks - compact */}
            {milestone.tasks && milestone.tasks.length > 0 && (
              <div className="mb-1.5">
                <span className="text-[10px] text-white/50">
                  {isRTL ? 'משימות:' : 'Tasks:'}
                </span>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {milestone.tasks.slice(0, 4).map((task, i) => (
                    <span 
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-white/5 text-white/60 text-[9px] border border-white/10"
                    >
                      {task}
                    </span>
                  ))}
                  {milestone.tasks.length > 4 && (
                    <span className="text-white/40 text-[9px]">
                      +{milestone.tasks.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Challenge */}
            {milestone.weekly_challenge && (
              <div className="flex items-center gap-1 text-[10px] text-amber-400/70">
                <Zap className="w-2.5 h-2.5" />
                <span className="line-clamp-1">{milestone.weekly_challenge}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - not absolute, pushed to bottom by flex */}
      <div className="mt-2 text-center">
        <span className="text-[9px] text-white/30">
          {isRTL ? `תוכנית 90 יום - עמוד ${pageNumber + 1}` : `90-Day Plan - Page ${pageNumber + 1}`}
        </span>
      </div>
    </div>
  );
}
