import { forwardRef } from 'react';
import { PDFCoverPage } from './PDFCoverPage';
import { PDFScoresPage } from './PDFScoresPage';
import { PDFLifeDirectionPage } from './PDFLifeDirectionPage';
import { PDFConsciousnessPage } from './PDFConsciousnessPage';
import { PDFIdentityPage } from './PDFIdentityPage';
import { PDFBehavioralPage } from './PDFBehavioralPage';
import { PDFLifePlanPage } from './PDFLifePlanPage';
import { PDFDashboardPage } from './PDFDashboardPage';
import { PDFHawkinsPage } from './PDFHawkinsPage';
import { PDFOrbPage } from './PDFOrbPage';
import type { MultiThreadOrbProfile } from '@/lib/orbDNAThreads';

export interface GuestPDFData {
  summary: {
    life_direction?: {
      core_aspiration?: string;
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
      suggested_ego_state?: string;
      dominant_traits?: string[];
      values_hierarchy?: string[];
      identity_title?: {
        title?: string;
        title_en?: string;
        icon?: string;
      };
    };
    behavioral_insights?: {
      habits_to_transform?: string[];
      habits_to_cultivate?: string[];
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
  plan?: {
    months?: Array<{
      number: number;
      title: string;
      title_he?: string;
      focus: string;
      milestone: string;
      weeks?: Array<{
        number: number;
        title: string;
        description: string;
        tasks: string[];
        goal: string;
        challenge: string;
        hypnosis_recommendation: string;
      }>;
    }>;
  };
  // Milestones in the same format as ProfilePDFData for the plan pages
  milestones?: Array<{
    week_number: number;
    title?: string;
    goal?: string;
    tasks?: string[];
    weekly_challenge?: string;
    hypnosis_recommendation?: string;
  }>;
  planTitle?: string;
  language: string;
  orbProfile?: MultiThreadOrbProfile;
  identityTitle?: {
    title: string;
    icon: string;
  } | null;
  // Dashboard data for life model page
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

interface GuestPDFRendererProps {
  data: GuestPDFData;
}

// Split milestones into chunks (3 per page)
const MILESTONES_PER_PAGE = 3;

export const GuestPDFRenderer = forwardRef<HTMLDivElement, GuestPDFRendererProps>(
  ({ data }, ref) => {
    const isRTL = data.language === 'he';
    
    // Get identity title for display
    const identityTitle = data.summary.identity_profile?.identity_title ? {
      title: isRTL 
        ? (data.summary.identity_profile.identity_title.title || data.summary.identity_profile.identity_title.title_en || '')
        : (data.summary.identity_profile.identity_title.title_en || data.summary.identity_profile.identity_title.title || ''),
      icon: data.summary.identity_profile.identity_title.icon || '✨',
    } : data.identityTitle || null;

    // Map consciousness analysis to PDF format
    const consciousnessAnalysis = data.summary.consciousness_analysis ? {
      current_state: data.summary.consciousness_analysis.current_state,
      dominant_patterns: data.summary.consciousness_analysis.dominant_patterns,
      strengths: data.summary.consciousness_analysis.strengths,
      growth_edges: data.summary.consciousness_analysis.growth_edges,
      blind_spots: data.summary.consciousness_analysis.blind_spots,
    } : undefined;

    // Map identity profile to PDF format
    const identityProfile = data.summary.identity_profile ? {
      suggested_ego_state: data.summary.identity_profile.suggested_ego_state 
        ? [data.summary.identity_profile.suggested_ego_state as string] 
        : [],
      dominant_traits: data.summary.identity_profile.dominant_traits,
      values_hierarchy: data.summary.identity_profile.values_hierarchy,
    } : undefined;

    // Map life direction - handle both field name variants
    const lifeDirection = data.summary.life_direction ? {
      central_aspiration: data.summary.life_direction.core_aspiration || data.summary.life_direction.central_aspiration,
      vision_summary: data.summary.life_direction.vision_summary,
      clarity_score: data.summary.life_direction.clarity_score,
    } : undefined;

    // Map behavioral insights - handle both field name variants
    const behavioralInsights = data.summary.behavioral_insights ? {
      habits_to_break: data.summary.behavioral_insights.habits_to_break || data.summary.behavioral_insights.habits_to_transform,
      habits_to_develop: data.summary.behavioral_insights.habits_to_develop || data.summary.behavioral_insights.habits_to_cultivate,
      resistance_patterns: data.summary.behavioral_insights.resistance_patterns,
    } : undefined;

    // Prepare milestones for PDF pages
    const milestones = data.milestones || [];
    const sortedMilestones = [...milestones].sort((a, b) => a.week_number - b.week_number);
    const milestonePages: typeof milestones[] = [];
    
    for (let i = 0; i < sortedMilestones.length; i += MILESTONES_PER_PAGE) {
      milestonePages.push(sortedMilestones.slice(i, i + MILESTONES_PER_PAGE));
    }

    const guestName = isRTL ? 'אורח' : 'Guest';

    return (
      <div 
        ref={ref}
        className="pdf-container"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{ 
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '595px',
          backgroundColor: '#0f0f14',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {/* Page 1: Cover */}
        <div data-page="cover">
          <PDFCoverPage 
            userName={guestName} 
            language={data.language} 
          />
        </div>

        {/* Page 2: Orb / Digital DNA */}
        {data.orbProfile && (
          <div data-page="orb">
            <PDFOrbPage 
              profile={data.orbProfile} 
              identityTitle={identityTitle}
              userName={guestName}
              language={data.language} 
            />
          </div>
        )}

        {/* Page 3: Scores */}
        <div data-page="scores">
          <PDFScoresPage scores={data.scores} language={data.language} />
        </div>

        {/* Page 4: Hawkins Scale */}
        {consciousnessAnalysis && (
          <div data-page="hawkins">
            <PDFHawkinsPage 
              consciousnessScore={data.scores.consciousness}
              dominantPatterns={consciousnessAnalysis.dominant_patterns}
              strengths={consciousnessAnalysis.strengths}
              growthEdges={consciousnessAnalysis.growth_edges}
              blindSpots={consciousnessAnalysis.blind_spots}
              currentState={consciousnessAnalysis.current_state}
              language={data.language} 
            />
          </div>
        )}

        {/* Page 5: Life Direction */}
        {lifeDirection && (
          <div data-page="direction">
            <PDFLifeDirectionPage 
              direction={lifeDirection} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 6: Consciousness Analysis */}
        {consciousnessAnalysis && (
          <div data-page="consciousness">
            <PDFConsciousnessPage 
              analysis={consciousnessAnalysis} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 7: Identity Profile */}
        {identityProfile && (
          <div data-page="identity">
            <PDFIdentityPage 
              profile={identityProfile} 
              language={data.language} 
            />
          </div>
        )}

        {/* Page 8: Behavioral Insights & Career */}
        {(behavioralInsights || data.summary.career_path) && (
          <div data-page="behavioral">
            <PDFBehavioralPage 
              insights={behavioralInsights}
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

        {/* Life Plan Pages - 90 Day Plan */}
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

GuestPDFRenderer.displayName = 'GuestPDFRenderer';
