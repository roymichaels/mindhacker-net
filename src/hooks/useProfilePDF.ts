import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ProfilePDFData } from '@/components/pdf/ProfilePDFRenderer';

interface LaunchpadSummary {
  summary_data: Record<string, unknown>;
  consciousness_score: number;
  clarity_score: number;
  transformation_readiness: number;
}

interface LifePlan {
  title: string;
  life_plan_milestones: Array<{
    week_number: number;
    title?: string;
    goal?: string;
    tasks?: string[];
    weekly_challenge?: string;
    hypnosis_recommendation?: string;
  }>;
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
      // Fetch profile for user name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Fetch summary
      const { data: summary, error: summaryError } = await supabase
        .from('launchpad_summaries')
        .select('summary_data, consciousness_score, clarity_score, transformation_readiness')
        .eq('user_id', user.id)
        .single();

      if (summaryError || !summary) {
        toast.error(
          language === 'he' 
            ? 'לא נמצאו נתוני פרופיל. יש להשלים את Launchpad תחילה.' 
            : 'No profile data found. Please complete the Launchpad first.'
        );
        return null;
      }

      // Fetch plan + milestones
      const { data: plan } = await supabase
        .from('life_plans')
        .select('title, life_plan_milestones(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
      const summaryData = summary.summary_data as Record<string, unknown>;
      const typedPlan = plan as unknown as LifePlan | null;

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
        milestones: typedPlan?.life_plan_milestones || [],
        planTitle: typedPlan?.title,
        language,
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
