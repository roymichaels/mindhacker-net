import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { generateProfilePDF } from '@/lib/profilePdfGenerator';
import { toast } from 'sonner';

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

export function useProfilePDF() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [generating, setGenerating] = useState(false);

  async function downloadPDF() {
    if (!user?.id) {
      toast.error(language === 'he' ? 'נא להתחבר תחילה' : 'Please log in first');
      return;
    }

    setGenerating(true);

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
        setGenerating(false);
        return;
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
      
      // Type assertion for summary_data
      const summaryData = summary.summary_data as Record<string, unknown>;
      const typedPlan = plan as unknown as LifePlan | null;

      // Generate PDF
      await generateProfilePDF({
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
      });

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
    }
  }

  return { downloadPDF, generating };
}

// Type for the PDF generator
interface ProfilePDFData {
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
}
