import { forwardRef } from 'react';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFScoresPage } from './PDFScoresPage';
import { PDFLifeDirectionPage } from './PDFLifeDirectionPage';
import { PDFConsciousnessPage } from './PDFConsciousnessPage';
import { PDFIdentityPage } from './PDFIdentityPage';
import { PDFBehavioralPage } from './PDFBehavioralPage';
import { PDFLifePlanPage } from './PDFLifePlanPage';
import { PDFOrbPage } from './PDFOrbPage';
import { PDFDashboardPage } from './PDFDashboardPage';
import { PDFHawkinsPage } from './PDFHawkinsPage';
import type { MultiThreadOrbProfile } from '@/lib/orbDNAThreads';

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
  // New data for enhanced PDF
  orbProfile?: MultiThreadOrbProfile;
  identityTitle?: {
    title: string;
    icon: string;
  } | null;
  dashboard?: {
    values: string[];
    principles: string[];
    selfConcepts: string[];
    characterTraits: string[];
    fiveYearVision?: { title: string; description: string | null } | null;
    tenYearVision?: { title: string; description: string | null } | null;
    activeCommitments: Array<{ title: string; description: string | null }>;
    dailyAnchors: Array<{ title: string; category: string | null }>;
  };
}

interface ProfilePDFRendererProps {
  data: ProfilePDFData;
}

// Split milestones into chunks that fit on a page (3 milestones per page for better spacing)
const MILESTONES_PER_PAGE = 3;

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

        {/* Page 2: Orb / Digital DNA */}
        {data.orbProfile && (
          <div data-page="orb">
            <PDFOrbPage 
              profile={data.orbProfile} 
              identityTitle={data.identityTitle}
              userName={data.userName}
              language={data.language} 
            />
          </div>
        )}

        {/* Page 3: Scores */}
        <div data-page="scores">
          <PDFScoresPage scores={data.scores} language={data.language} />
        </div>

        {/* Page 4: Hawkins Scale & Consciousness Analysis */}
        {data.summary.consciousness_analysis && (
          <div data-page="hawkins">
            <PDFHawkinsPage 
              consciousnessScore={data.scores.consciousness}
              dominantPatterns={data.summary.consciousness_analysis.dominant_patterns}
              strengths={data.summary.consciousness_analysis.strengths}
              growthEdges={data.summary.consciousness_analysis.growth_edges}
              blindSpots={data.summary.consciousness_analysis.blind_spots}
              currentState={data.summary.consciousness_analysis.current_state}
              language={data.language} 
            />
          </div>
        )}

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

        {/* Dashboard / Life Model Page */}
        {data.dashboard && (
          <div data-page="dashboard">
            <PDFDashboardPage 
              values={data.dashboard.values}
              principles={data.dashboard.principles}
              selfConcepts={data.dashboard.selfConcepts}
              characterTraits={data.dashboard.characterTraits}
              fiveYearVision={data.dashboard.fiveYearVision}
              tenYearVision={data.dashboard.tenYearVision}
              activeCommitments={data.dashboard.activeCommitments}
              dailyAnchors={data.dashboard.dailyAnchors}
              language={data.language}
            />
          </div>
        )}

        {/* Life Plan Pages */}
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
