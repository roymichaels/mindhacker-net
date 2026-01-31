import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ProfilePDFData } from '@/components/pdf/ProfilePDFRenderer';
import { generateOrbThreads, DEFAULT_MULTI_THREAD_PROFILE } from '@/lib/orbDNAThreads';

interface LaunchpadSummary {
  summary_data: Record<string, unknown>;
  consciousness_score: number;
  clarity_score: number;
  transformation_readiness: number;
}

interface LifePlanMilestone {
  week_number: number;
  title?: string;
  goal?: string;
  tasks?: string[];
  challenge?: string; // DB field name
  weekly_challenge?: string; // Alternative name
  hypnosis_recommendation?: string;
}

interface LifePlan {
  id: string;
  plan_data?: Record<string, unknown>;
  life_plan_milestones: LifePlanMilestone[];
}

interface IdentityElement {
  id: string;
  element_type: string;
  content: string;
  metadata?: Record<string, unknown> | null;
}

interface LifeVision {
  id: string;
  title: string;
  description: string | null;
  timeframe: string;
}

interface Commitment {
  id: string;
  title: string;
  description: string | null;
}

interface DailyMinimum {
  id: string;
  title: string;
  category: string | null;
}

// Helper function to wait for DOM to be ready
const waitForElement = (ref: React.RefObject<HTMLDivElement>, maxAttempts = 20): Promise<HTMLDivElement> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      if (ref.current && ref.current.querySelectorAll('[data-page]').length > 0) {
        resolve(ref.current);
      } else if (attempts >= maxAttempts) {
        reject(new Error('PDF container not ready after max attempts'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

export function useProfilePDF() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const [generating, setGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<ProfilePDFData | null>(null);
  const [showRenderer, setShowRenderer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (): Promise<ProfilePDFData | null> => {
    if (!user?.id) {
      toast.error(language === 'he' ? 'נא להתחבר תחילה' : 'Please log in first');
      return null;
    }

    try {
      // Fetch all data in parallel
      const [
        profileRes,
        summaryRes,
        planRes,
        identityRes,
        visionsRes,
        commitmentsRes,
        dailyMinimumsRes,
        launchpadProgressRes,
      ] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('launchpad_summaries').select('summary_data, consciousness_score, clarity_score, transformation_readiness').eq('user_id', user.id).single(),
        supabase.from('life_plans').select('id, plan_data, life_plan_milestones(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('aurora_identity_elements').select('*').eq('user_id', user.id),
        supabase.from('aurora_life_visions').select('*').eq('user_id', user.id),
        supabase.from('aurora_commitments').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('aurora_daily_minimums').select('*').eq('user_id', user.id).eq('is_active', true),
        supabase.from('launchpad_progress').select('step_2_profile_data').eq('user_id', user.id).single(),
      ]);

      const profile = profileRes.data;
      const summary = summaryRes.data;
      
      if (summaryRes.error || !summary) {
        toast.error(
          language === 'he' 
            ? 'לא נמצאו נתוני פרופיל. יש להשלים את מסע הטרנספורמציה תחילה.' 
            : 'No profile data found. Please complete the Transformation Journey first.'
        );
        return null;
      }

      const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
      const summaryData = summary.summary_data as Record<string, unknown>;
      const typedPlan = planRes.data as unknown as LifePlan | null;
      const identityElements = (identityRes.data || []) as IdentityElement[];
      const visions = (visionsRes.data || []) as LifeVision[];
      const commitments = (commitmentsRes.data || []) as Commitment[];
      const dailyMinimums = (dailyMinimumsRes.data || []) as DailyMinimum[];
      const launchpadProgress = launchpadProgressRes.data;

      // Map milestones and normalize the weekly_challenge field
      const milestones = (typedPlan?.life_plan_milestones || []).map(m => ({
        week_number: m.week_number,
        title: m.title,
        goal: m.goal,
        tasks: m.tasks,
        weekly_challenge: m.weekly_challenge || m.challenge,
        hypnosis_recommendation: m.hypnosis_recommendation,
      }));

      // Extract plan title from plan_data or use default
      const planData = typedPlan?.plan_data as Record<string, unknown> | undefined;
      const planTitle = (planData?.title as string) || (language === 'he' ? 'תוכנית הטרנספורמציה שלך' : 'Your Transformation Plan');

      // Parse identity elements
      const values = identityElements.filter(e => e.element_type === 'value').map(e => e.content);
      const principles = identityElements.filter(e => e.element_type === 'principle').map(e => e.content);
      const selfConcepts = identityElements.filter(e => e.element_type === 'self_concept').map(e => e.content);
      const characterTraits = identityElements.filter(e => e.element_type === 'character_trait').map(e => e.content);
      
      // Find identity title
      const identityTitleElement = identityElements.find(e => e.element_type === 'identity_title');
      const identityTitle = identityTitleElement ? {
        title: identityTitleElement.content,
        icon: (identityTitleElement.metadata as { icon?: string })?.icon || '✨',
      } : null;

      // Parse visions
      const fiveYearVision = visions.find(v => v.timeframe === '5-year');
      const tenYearVision = visions.find(v => v.timeframe === '10-year');

      // Generate orb profile from summary data
      const profileData = launchpadProgress?.step_2_profile_data as Record<string, unknown> | null;
      const hobbies = (profileData?.hobbies as string[]) || [];
      const orbProfile = generateOrbThreads(
        summaryData as any, 
        hobbies, 
        summary.consciousness_score || 50
      );

      return {
        userName,
        summary: {
          life_direction: summaryData?.life_direction as ProfilePDFData['summary']['life_direction'],
          consciousness_analysis: summaryData?.consciousness_analysis as ProfilePDFData['summary']['consciousness_analysis'],
          identity_profile: summaryData?.identity_profile as ProfilePDFData['summary']['identity_profile'],
          behavioral_insights: summaryData?.behavioral_insights as ProfilePDFData['summary']['behavioral_insights'],
          career_path: summaryData?.career_path as ProfilePDFData['summary']['career_path'],
        },
        scores: {
          consciousness: summary.consciousness_score || 0,
          clarity: summary.clarity_score || 0,
          readiness: summary.transformation_readiness || 0,
        },
        milestones,
        planTitle,
        language,
        // New enhanced data
        orbProfile,
        identityTitle,
        dashboard: {
          values,
          principles,
          selfConcepts,
          characterTraits,
          fiveYearVision: fiveYearVision ? { title: fiveYearVision.title, description: fiveYearVision.description } : null,
          tenYearVision: tenYearVision ? { title: tenYearVision.title, description: tenYearVision.description } : null,
          activeCommitments: commitments.map(c => ({ title: c.title, description: c.description })),
          dailyAnchors: dailyMinimums.map(d => ({ title: d.title, category: d.category })),
        },
      };
    } catch (error) {
      console.error('Error fetching PDF data:', error);
      toast.error(
        language === 'he' 
          ? 'שגיאה בטעינת הנתונים' 
          : 'Error loading data'
      );
      return null;
    }
  }, [user, language]);

  const capturePDF = useCallback(async () => {
    const container = containerRef.current;
    if (!container) {
      throw new Error('PDF container not ready');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    // Get all page elements
    const pageElements = container.querySelectorAll('[data-page]');
    
    for (let i = 0; i < pageElements.length; i++) {
      const pageEl = pageElements[i] as HTMLElement;
      
      if (i > 0) {
        pdf.addPage();
      }

      // Capture with html2canvas
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f0f14',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth / 2), pdfHeight / (imgHeight / 2));
      
      const scaledWidth = (imgWidth / 2) * ratio;
      const scaledHeight = (imgHeight / 2) * ratio;
      const x = (pdfWidth - scaledWidth) / 2;

      pdf.addImage(imgData, 'JPEG', x, 0, scaledWidth, scaledHeight);
    }

    return pdf;
  }, []);

  const downloadPDF = useCallback(async () => {
    if (!user?.id) {
      toast.error(language === 'he' ? 'נא להתחבר תחילה' : 'Please log in first');
      return;
    }

    setGenerating(true);

    try {
      // Step 1: Fetch data
      const data = await fetchData();
      if (!data) {
        setGenerating(false);
        return;
      }

      // Step 2: Set data and show renderer
      setPdfData(data);
      setShowRenderer(true);

      // Step 3: Wait for DOM to be ready with retry logic
      await waitForElement(containerRef);

      const pdf = await capturePDF();
      
      // Step 4: Save PDF with Hebrew-friendly filename
      const fileName = language === 'he' 
        ? `פרופיל_טרנספורמציה_${data.userName}.pdf`
        : `transformation_profile_${data.userName}.pdf`;
      
      pdf.save(fileName);

      toast.success(
        language === 'he' 
          ? 'הקובץ הורד בהצלחה!' 
          : 'PDF downloaded successfully!'
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(
        language === 'he' 
          ? 'שגיאה ביצירת הקובץ' 
          : 'Error generating PDF'
      );
    } finally {
      setGenerating(false);
      setShowRenderer(false);
      setPdfData(null);
    }
  }, [user, language, fetchData, capturePDF]);

  return { 
    downloadPDF, 
    generating, 
    containerRef, 
    pdfData, 
    showRenderer 
  };
}
