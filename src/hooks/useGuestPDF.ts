import { useState, useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { GuestPDFData } from '@/components/pdf/GuestPDFRenderer';
import { generateOrbThreads, DEFAULT_MULTI_THREAD_PROFILE } from '@/lib/orbDNAThreads';

interface GuestResult {
  summary: {
    consciousness_analysis?: {
      current_state: string;
      dominant_patterns: string[];
      blind_spots: string[];
      strengths: string[];
      growth_edges: string[];
    };
    identity_profile?: {
      dominant_traits: string[];
      suggested_ego_state: string;
      values_hierarchy: string[];
      identity_title?: {
        title?: string;
        title_en?: string;
        icon?: string;
      };
    };
    behavioral_insights?: {
      habits_to_transform: string[];
      habits_to_cultivate: string[];
      habits_to_break?: string[];
      habits_to_develop?: string[];
      resistance_patterns: string[];
    };
    life_direction?: {
      core_aspiration?: string;
      central_aspiration?: string;
      vision_summary?: string;
      clarity_score?: number;
    };
    career_path?: {
      current_status?: string;
      aspirations?: string[];
      next_steps?: string[];
    };
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
        description?: string;
        tasks?: string[];
        goal?: string;
        challenge?: string;
        weekly_challenge?: string;
        hypnosis_recommendation?: string;
      }>;
    }>;
    milestones?: Array<{
      week_number: number;
      title?: string;
      goal?: string;
      tasks?: string[];
      weekly_challenge?: string;
      challenge?: string;
      hypnosis_recommendation?: string;
    }>;
  };
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
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

export function useGuestPDF() {
  const { language } = useTranslation();
  const [generating, setGenerating] = useState(false);
  const [pdfData, setPdfData] = useState<GuestPDFData | null>(null);
  const [showRenderer, setShowRenderer] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const preparePDFData = useCallback((result: GuestResult): GuestPDFData => {
    const isRTL = language === 'he';
    
    // Try to get profile data from localStorage
    let hobbies: string[] = [];
    let values: string[] = [];
    let principles: string[] = [];
    let selfConcepts: string[] = [];
    let characterTraits: string[] = [];
    
    try {
      const profileData = localStorage.getItem('launchpad_personal_profile');
      if (profileData) {
        const parsed = JSON.parse(profileData);
        hobbies = parsed.hobbies || [];
      }
    } catch (e) {
      console.error('Error parsing profile data:', e);
    }

    // Extract values from identity profile
    if (result.summary.identity_profile?.values_hierarchy) {
      values = result.summary.identity_profile.values_hierarchy;
    }
    
    // Extract traits from identity profile
    if (result.summary.identity_profile?.dominant_traits) {
      characterTraits = result.summary.identity_profile.dominant_traits;
    }

    // Generate orb profile
    const orbProfile = generateOrbThreads(
      result.summary as any,
      hobbies,
      result.scores.consciousness
    );

    // Get identity title
    const identityTitle = result.summary.identity_profile?.identity_title ? {
      title: isRTL 
        ? (result.summary.identity_profile.identity_title.title || result.summary.identity_profile.identity_title.title_en || '')
        : (result.summary.identity_profile.identity_title.title_en || result.summary.identity_profile.identity_title.title || ''),
      icon: result.summary.identity_profile.identity_title.icon || '✨',
    } : null;

    // Extract milestones from plan - handle both formats
    let milestones: GuestPDFData['milestones'] = [];
    
    if (result.plan?.milestones) {
      // Direct milestones array
      milestones = result.plan.milestones.map(m => ({
        week_number: m.week_number,
        title: m.title,
        goal: m.goal,
        tasks: m.tasks,
        weekly_challenge: m.weekly_challenge || m.challenge,
        hypnosis_recommendation: m.hypnosis_recommendation,
      }));
    } else if (result.plan?.months) {
      // Extract from months -> weeks structure
      result.plan.months.forEach(month => {
        if (month.weeks) {
          month.weeks.forEach(week => {
            milestones!.push({
              week_number: week.number,
              title: week.title,
              goal: week.goal,
              tasks: week.tasks,
              weekly_challenge: week.weekly_challenge || week.challenge,
              hypnosis_recommendation: week.hypnosis_recommendation,
            });
          });
        }
      });
    }

    // Build dashboard data from what we have
    const dashboard: GuestPDFData['dashboard'] = {
      values,
      principles,
      selfConcepts,
      characterTraits,
      fiveYearVision: null,
      tenYearVision: null,
      activeCommitments: [],
      dailyAnchors: [],
    };

    // Plan title
    const planTitle = isRTL ? 'תוכנית הטרנספורמציה שלך' : 'Your Transformation Plan';

    return {
      summary: result.summary,
      scores: result.scores,
      milestones,
      planTitle,
      language,
      orbProfile,
      identityTitle,
      dashboard,
    };
  }, [language]);

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

  const downloadPDF = useCallback(async (result: GuestResult) => {
    setGenerating(true);

    try {
      // Step 1: Prepare data
      const data = preparePDFData(result);

      // Step 2: Set data and show renderer
      setPdfData(data);
      setShowRenderer(true);

      // Step 3: Wait for DOM to be ready with retry logic
      await waitForElement(containerRef);

      const pdf = await capturePDF();
      
      // Step 4: Save PDF with Hebrew-friendly filename
      const fileName = language === 'he' 
        ? 'פרופיל_טרנספורמציה.pdf'
        : 'transformation_profile.pdf';
      
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
  }, [language, preparePDFData, capturePDF]);

  return { 
    downloadPDF, 
    generating, 
    containerRef, 
    pdfData, 
    showRenderer 
  };
}
