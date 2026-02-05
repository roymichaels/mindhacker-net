import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import html2canvas from 'html2canvas';

export interface BugReportContext {
  pagePath: string;
  pageUrl: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  timestamp: string;
}

export interface BugReportData {
  title: string;
  description: string;
  category: 'ui' | 'performance' | 'feature' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  contactEmail?: string;
  screenshotUrl?: string;
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function detectOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown';
}

function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'Mobile';
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

export const useBugReport = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const captureContext = useCallback((): BugReportContext => {
    return {
      pagePath: location.pathname,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      deviceType: detectDeviceType(),
      browser: detectBrowser(),
      os: detectOS(),
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timestamp: new Date().toISOString(),
    };
  }, [location.pathname]);

  const captureScreenshot = useCallback(async (): Promise<void> => {
    try {
      // Hide the bug report widget temporarily
      const widget = document.getElementById('bug-report-widget');
      if (widget) widget.style.display = 'none';
      
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 0.75, // Reduce size for storage
      });
      
      // Show the widget again
      if (widget) widget.style.display = '';
      
      canvas.toBlob((blob) => {
        if (blob) {
          setScreenshotBlob(blob);
          setScreenshotPreview(URL.createObjectURL(blob));
        }
      }, 'image/png', 0.8);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      toast({
        title: t('bugReport.errorTitle'),
        description: 'Could not capture screenshot',
        variant: 'destructive',
      });
    }
  }, [t]);

  const clearScreenshot = useCallback(() => {
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
    }
    setScreenshotBlob(null);
    setScreenshotPreview(null);
  }, [screenshotPreview]);

  const submitReport = useCallback(async (data: BugReportData): Promise<boolean> => {
    setIsSubmitting(true);
    const context = captureContext();

    try {
      let screenshotUrl: string | null = null;

      // Upload screenshot if present
      if (screenshotBlob) {
        const fileName = `bug-report-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bug-screenshots')
          .upload(fileName, screenshotBlob, {
            contentType: 'image/png',
          });

        if (uploadError) {
          console.error('Screenshot upload failed:', uploadError);
          // Continue without screenshot
        } else if (uploadData) {
          const { data: publicUrl } = supabase.storage
            .from('bug-screenshots')
            .getPublicUrl(uploadData.path);
          screenshotUrl = publicUrl.publicUrl;
        }
      }

      // Insert the bug report
      const { error } = await supabase.from('bug_reports').insert({
        user_id: user?.id || null,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        page_path: context.pagePath,
        page_url: context.pageUrl,
        user_agent: context.userAgent,
        device_type: context.deviceType,
        browser: context.browser,
        os: context.os,
        screen_size: context.screenSize,
        contact_email: data.contactEmail || null,
        screenshot_url: screenshotUrl,
      });

      if (error) throw error;

      toast({
        title: t('bugReport.successTitle'),
        description: t('bugReport.successMessage'),
      });

      clearScreenshot();
      return true;
    } catch (error) {
      console.error('Bug report submission failed:', error);
      toast({
        title: t('bugReport.errorTitle'),
        description: t('bugReport.errorMessage'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [captureContext, screenshotBlob, user?.id, t, clearScreenshot]);

  return {
    captureContext,
    captureScreenshot,
    clearScreenshot,
    submitReport,
    isSubmitting,
    screenshotPreview,
    hasScreenshot: !!screenshotBlob,
  };
};
