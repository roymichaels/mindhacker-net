/**
 * @module contexts/CoachStorefrontContext
 * @purpose Detects and provides coach storefront context from URL (path, subdomain, custom domain).
 * Renamed from PractitionerContext → CoachStorefrontContext for vocabulary unification.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useParams } from 'react-router-dom';

interface CoachStorefrontSettings {
  id: string;
  practitioner_id: string;
  custom_domain: string | null;
  subdomain: string | null;
  domain_verified: boolean | null;
  logo_url: string | null;
  favicon_url: string | null;
  brand_color: string | null;
  brand_color_secondary: string | null;
  hero_heading_he: string | null;
  hero_heading_en: string | null;
  hero_subheading_he: string | null;
  hero_subheading_en: string | null;
  hero_image_url: string | null;
  about_section: unknown;
  enable_courses: boolean | null;
  enable_services: boolean | null;
  enable_products: boolean | null;
  enable_community: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  default_language: string | null;
  timezone: string | null;
  social_links: unknown;
  contact_email: string | null;
  contact_phone: string | null;
}

interface CoachStorefrontData {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  title?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_image_url?: string | null;
  specialties?: string[];
  is_featured?: boolean;
  is_verified?: boolean;
  status: string;
  settings?: CoachStorefrontSettings | null;
}

interface CoachStorefrontContextType {
  practitioner: CoachStorefrontData | null;
  settings: CoachStorefrontSettings | null;
  isLoading: boolean;
  isStandalone: boolean;
  practitionerSlug: string | null;
  error: Error | null;
  refetch: () => void;
}

const CoachStorefrontCtx = createContext<CoachStorefrontContextType>({
  practitioner: null,
  settings: null,
  isLoading: true,
  isStandalone: false,
  practitionerSlug: null,
  error: null,
  refetch: () => {},
});

/** Primary hook — use this name going forward */
export const useCoachStorefront = () => {
  const context = useContext(CoachStorefrontCtx);
  if (!context) {
    throw new Error('useCoachStorefront must be used within CoachStorefrontProvider');
  }
  return context;
};

/** @deprecated Use useCoachStorefront */
export const usePractitioner = useCoachStorefront;

/**
 * Detects coach context from:
 * 1. Custom domain (e.g., coach-dana.com)
 * 2. Subdomain (e.g., dana.mindos.app)
 * 3. Path-based routing (e.g., /p/dana/*)
 */
const detectCoachFromEnvironment = (): { 
  type: 'domain' | 'subdomain' | 'path' | null; 
  value: string | null 
} => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  const pathMatch = pathname.match(/^\/p\/([^/]+)/);
  if (pathMatch) {
    return { type: 'path', value: pathMatch[1] };
  }
  
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const subdomain = parts[0];
    const excludedSubdomains = ['www', 'app', 'api', 'admin', 'id-preview--6edc83df-25e0-44e9-b5db-cd1d60befc7c'];
    if (!excludedSubdomains.includes(subdomain) && subdomain !== 'mindhacker-net') {
      const baseDomain = parts.slice(1).join('.');
      if (baseDomain.includes('mindos') || baseDomain.includes('mindhacker') || baseDomain.includes('lovable.app')) {
        return { type: 'subdomain', value: subdomain };
      }
    }
  }
  
  if (!hostname.includes('mindos') && 
      !hostname.includes('mindhacker') && 
      !hostname.includes('lovable') && 
      !hostname.includes('localhost')) {
    return { type: 'domain', value: hostname };
  }
  
  return { type: null, value: null };
};

interface CoachStorefrontProviderProps {
  children: ReactNode;
  slug?: string;
}

export const CoachStorefrontProvider = ({ children, slug: manualSlug }: CoachStorefrontProviderProps) => {
  const [practitioner, setPractitioner] = useState<CoachStorefrontData | null>(null);
  const [settings, setSettings] = useState<CoachStorefrontSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [detectedSlug, setDetectedSlug] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const location = useLocation();
  const params = useParams();
  const pathSlug = params.practitionerSlug || null;
  
  const fetchCoach = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detection = detectCoachFromEnvironment();
      let slug = manualSlug || pathSlug;
      let standalone = false;
      
      if (!slug && detection.type) {
        if (detection.type === 'path') {
          slug = detection.value;
        } else if (detection.type === 'subdomain') {
          const { data: settingsData } = await supabase
            .from('practitioner_settings')
            .select('practitioner_id')
            .eq('subdomain', detection.value)
            .maybeSingle();
          
          if (settingsData) {
            const { data: practitionerData } = await supabase
              .from('practitioners')
              .select('slug')
              .eq('id', settingsData.practitioner_id)
              .maybeSingle();
            slug = practitionerData?.slug || null;
            standalone = true;
          }
        } else if (detection.type === 'domain') {
          const { data: settingsData } = await supabase
            .from('practitioner_settings')
            .select('practitioner_id')
            .eq('custom_domain', detection.value)
            .maybeSingle();
          
          if (settingsData) {
            const { data: practitionerData } = await supabase
              .from('practitioners')
              .select('slug')
              .eq('id', settingsData.practitioner_id)
              .maybeSingle();
            slug = practitionerData?.slug || null;
            standalone = true;
          }
        }
      }
      
      setDetectedSlug(slug);
      setIsStandalone(standalone);
      
      if (!slug) {
        setPractitioner(null);
        setSettings(null);
        setIsLoading(false);
        return;
      }
      
      const { data: practitionerData, error: practitionerError } = await supabase
        .from('practitioners')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle();
      
      if (practitionerError) throw practitionerError;
      
      if (!practitionerData) {
        setPractitioner(null);
        setSettings(null);
        setIsLoading(false);
        return;
      }
      
      const { data: settingsData, error: settingsError } = await supabase
        .from('practitioner_settings')
        .select('*')
        .eq('practitioner_id', practitionerData.id)
        .maybeSingle();
      
      if (settingsError) throw settingsError;
      
      setPractitioner({
        ...practitionerData,
        settings: settingsData,
      });
      setSettings(settingsData);
      
    } catch (err) {
      console.error('Error fetching coach storefront:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCoach();
  }, [manualSlug, pathSlug, location.pathname]);
  
  return (
    <CoachStorefrontCtx.Provider
      value={{
        practitioner,
        settings,
        isLoading,
        isStandalone,
        practitionerSlug: detectedSlug,
        error,
        refetch: fetchCoach,
      }}
    >
      {children}
    </CoachStorefrontCtx.Provider>
  );
};

/** @deprecated Use CoachStorefrontProvider */
export const PractitionerProvider = CoachStorefrontProvider;

export default CoachStorefrontCtx;
