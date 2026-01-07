import { useEffect, useRef, useCallback, ReactNode, ElementType } from "react";
import { trackEvent } from "@/lib/analytics";

interface SectionTrackingOptions {
  sectionId: string;
  sectionName: string;
  threshold?: number; // Visibility threshold (0-1)
  engageTime?: number; // Time in ms to count as "engaged"
}

export const useSectionTracking = ({
  sectionId,
  sectionName,
  threshold = 0.5,
  engageTime = 5000,
}: SectionTrackingOptions) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasTrackedView = useRef(false);
  const hasTrackedEngage = useRef(false);
  const enterTime = useRef<number | null>(null);
  const engageTimer = useRef<NodeJS.Timeout | null>(null);

  const trackSectionView = useCallback(() => {
    if (!hasTrackedView.current) {
      trackEvent("section_view", "engagement", sectionId, { sectionName });
      hasTrackedView.current = true;
      enterTime.current = Date.now();

      // Start engagement timer
      engageTimer.current = setTimeout(() => {
        if (!hasTrackedEngage.current) {
          trackEvent("section_engage", "engagement", sectionId, { 
            sectionName,
            timeSpent: engageTime 
          });
          hasTrackedEngage.current = true;
        }
      }, engageTime);
    }
  }, [sectionId, sectionName, engageTime]);

  const trackSectionExit = useCallback(() => {
    if (enterTime.current && hasTrackedView.current) {
      const timeSpent = Date.now() - enterTime.current;
      trackEvent("section_exit", "engagement", sectionId, { 
        sectionName,
        timeSpent 
      });
      
      // Clear engagement timer if still running
      if (engageTimer.current) {
        clearTimeout(engageTimer.current);
        engageTimer.current = null;
      }
    }
  }, [sectionId, sectionName]);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackSectionView();
          } else if (hasTrackedView.current) {
            trackSectionExit();
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (engageTimer.current) {
        clearTimeout(engageTimer.current);
      }
    };
  }, [threshold, trackSectionView, trackSectionExit]);

  // Reset tracking when component unmounts (for SPA navigation)
  useEffect(() => {
    return () => {
      hasTrackedView.current = false;
      hasTrackedEngage.current = false;
      enterTime.current = null;
    };
  }, []);

  return { sectionRef };
};

interface TrackedSectionProps {
  children: ReactNode;
  id: string;
  name: string;
  className?: string;
  as?: ElementType;
}

// Wrapper component for easier use
export const TrackedSection = ({ 
  children, 
  id, 
  name,
  className = "",
  as: Component = "section"
}: TrackedSectionProps) => {
  const { sectionRef } = useSectionTracking({ sectionId: id, sectionName: name });
  
  return (
    <Component ref={sectionRef} id={id} className={className}>
      {children}
    </Component>
  );
};
