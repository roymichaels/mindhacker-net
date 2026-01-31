import { forwardRef } from 'react';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFScoresPage } from './PDFScoresPage';
import { PDFLifeDirectionPage } from './PDFLifeDirectionPage';
import { PDFConsciousnessPage } from './PDFConsciousnessPage';
import { PDFIdentityPage } from './PDFIdentityPage';
import { PDFBehavioralPage } from './PDFBehavioralPage';
import { PDFLifePlanPage } from './PDFLifePlanPage';

export interface ProfilePDFData {
  userName: string;
  summary: {
    life_direction?: {
      central_aspiration?: string;
      vision_summary?: string;
      clarity_score?: number;
    };
    consciousness_analysis?: {
      current_state?: string;
      dominant_patterns?: string[];
      strengths?: string[];
      growth_edges?: string[];
      blind_spots?: string[];
    };
    identity_profile?: {
      suggested_ego_state?: string[];
      dominant_traits?: string[];
      values_hierarchy?: string[];
    };
    behavioral_insights?: {
      habits_to_break?: string[];
      habits_to_develop?: string[];
      resistance_patterns?: string[];
    };
    career_path?: {
      current_status?: string;
      aspirations?: string[];
      next_steps?: string[];
    };
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
  milestones: Array<{
    week_number: number;
    title?: string;
    goal?: string;
    tasks?: string[];
    weekly_challenge?: string;
    hypnosis_recommendation?: string;
  }>;
  planTitle?: string;
  language: string;
}

interface ProfilePDFRendererProps {
  data: ProfilePDFData;
}

// Split milestones into chunks that fit on a page (4 milestones per page)
const MILESTONES_PER_PAGE = 4;

export const ProfilePDFRenderer = forwardRef<HTMLDivElement, ProfilePDFRendererProps>(
  ({ data }, ref) => {
    const sortedMilestones = [...data.milestones].sort((a, b) => a.week_number - b.week_number);
    const milestonePages: typeof data.milestones[] = [];
    
    for (let i = 0; i < sortedMilestones.length; i += MILESTONES_PER_PAGE) {
      milestonePages.push(sortedMilestones.slice(i, i + MILESTONES_PER_PAGE));
    }

    return (
      <div 
        ref={ref}
        className="pdf-container"
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '595px',
          backgroundColor: '#0f0f14',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Page 1: Cover */}
        <div data-page="cover">
          <PDFCoverPage userName={data.userName} language={data.language} />
        </div>

        {/* Page 2: Scores */}
        <div data-page="scores">
          <PDFScoresPage scores={data.scores} language={data.language} />
        </div>

        {/* Page 3: Life Direction */}
        {data.summary.life_direction && (
          <div data-page="direction">
            <PDFLifeDirectionPage 
              direction={data.summary.life_direction} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 4: Consciousness Analysis */}
        {data.summary.consciousness_analysis && (
          <div data-page="consciousness">
            <PDFConsciousnessPage 
              analysis={data.summary.consciousness_analysis} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 5: Identity Profile */}
        {data.summary.identity_profile && (
          <div data-page="identity">
            <PDFIdentityPage 
              profile={data.summary.identity_profile} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 6: Behavioral Insights & Career */}
        {(data.summary.behavioral_insights || data.summary.career_path) && (
          <div data-page="behavioral">
            <PDFBehavioralPage 
              insights={data.summary.behavioral_insights}
              career={data.summary.career_path}
              language={data.language} 
            />
          </div>
        )}

        {/* Pages 7+: Life Plan */}
        {milestonePages.map((pageMilestones, pageIndex) => (
          <div key={`plan-${pageIndex}`} data-page={`plan-${pageIndex}`}>
            <PDFLifePlanPage 
              milestones={pageMilestones}
              planTitle={pageIndex === 0 ? data.planTitle : undefined}
              language={data.language}
              pageNumber={pageIndex}
            />
          </div>
        ))}
      </div>
    );
  }
);

ProfilePDFRenderer.displayName = 'ProfilePDFRenderer';
