import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useParams } from 'react-router-dom';

interface PractitionerSettings {
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

interface Practitioner {
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
  settings?: PractitionerSettings | null;
}

interface PractitionerContextType {
  practitioner: Practitioner | null;
  settings: PractitionerSettings | null;
  isLoading: boolean;
  isStandalone: boolean;
  practitionerSlug: string | null;
  error: Error | null;
  refetch: () => void;
}

const PractitionerContext = createContext<PractitionerContextType>({
  practitioner: null,
  settings: null,
  isLoading: true,
  isStandalone: false,
  practitionerSlug: null,
  error: null,
  refetch: () => {},
});

export const usePractitioner = () => {
  const context = useContext(PractitionerContext);
  if (!context) {
    throw new Error('usePractitioner must be used within PractitionerProvider');
  }
  return context;
};

/**
 * Detects practitioner context from:
 * 1. Custom domain (e.g., coach-dana.com)
 * 2. Subdomain (e.g., dana.mindos.app)
 * 3. Path-based routing (e.g., /p/dana/*)
 */
const detectPractitionerFromEnvironment = (): { 
  type: 'domain' | 'subdomain' | 'path' | null; 
  value: string | null 
} => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Check for path-based routing first: /p/:slug/*
  const pathMatch = pathname.match(/^\/p\/([^/]+)/);
  if (pathMatch) {
    return { type: 'path', value: pathMatch[1] };
  }
  
  // Check for subdomain (e.g., dean.mindos.app or dean.lovable.app)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const subdomain = parts[0];
    // Exclude common non-practitioner subdomains
    const excludedSubdomains = ['www', 'app', 'api', 'admin', 'id-preview--6edc83df-25e0-44e9-b5db-cd1d60befc7c'];
    if (!excludedSubdomains.includes(subdomain) && subdomain !== 'mindhacker-net') {
      // Check if it's a known platform domain
      const baseDomain = parts.slice(1).join('.');
      if (baseDomain.includes('mindos') || baseDomain.includes('mindhacker') || baseDomain.includes('lovable.app')) {
        return { type: 'subdomain', value: subdomain };
      }
    }
  }
  
  // Check for custom domain (not mindos/mindhacker or lovable)
  if (!hostname.includes('mindos') && 
      !hostname.includes('mindhacker') && 
      !hostname.includes('lovable') && 
      !hostname.includes('localhost')) {
    return { type: 'domain', value: hostname };
  }
  
  return { type: null, value: null };
};

interface PractitionerProviderProps {
  children: ReactNode;
  slug?: string; // Optional manual override
}

export const PractitionerProvider = ({ children, slug: manualSlug }: PractitionerProviderProps) => {
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [settings, setSettings] = useState<PractitionerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [detectedSlug, setDetectedSlug] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const location = useLocation();
  const params = useParams();
  
  // Get slug from path params if available
  const pathSlug = params.practitionerSlug || null;
  
  const fetchPractitioner = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detection = detectPractitionerFromEnvironment();
      let slug = manualSlug || pathSlug;
      let standalone = false;
      
      if (!slug && detection.type) {
        if (detection.type === 'path') {
          slug = detection.value;
        } else if (detection.type === 'subdomain') {
          // Lookup by subdomain
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
          // Lookup by custom domain
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
      
      // Fetch practitioner by slug
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
      
      // Fetch settings
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
      console.error('Error fetching practitioner:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPractitioner();
  }, [manualSlug, pathSlug, location.pathname]);
  
  return (
    <PractitionerContext.Provider
      value={{
        practitioner,
        settings,
        isLoading,
        isStandalone,
        practitionerSlug: detectedSlug,
        error,
        refetch: fetchPractitioner,
      }}
    >
      {children}
    </PractitionerContext.Provider>
  );
};

export default PractitionerContext;
