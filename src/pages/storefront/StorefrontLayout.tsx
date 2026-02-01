import { Outlet, useParams } from 'react-router-dom';
import { PractitionerProvider } from '@/contexts/PractitionerContext';
import { PractitionerAuthProvider } from '@/contexts/PractitionerAuthContext';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import { usePractitioner } from '@/contexts/PractitionerContext';
import { useEffect } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';

const StorefrontContent = () => {
  const { practitioner, settings, isLoading, error } = usePractitioner();
  
  // Apply custom branding
  useEffect(() => {
    if (settings) {
      // Set favicon
      if (settings.favicon_url) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = settings.favicon_url;
        }
      }
      
      // Set page title
      if (settings.meta_title || practitioner?.display_name) {
        document.title = settings.meta_title || practitioner?.display_name || 'Storefront';
      }
      
      // Set meta description
      if (settings.meta_description) {
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'description');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', settings.meta_description);
      }
      
      // Apply brand colors as CSS variables
      if (settings.brand_color) {
        document.documentElement.style.setProperty('--storefront-primary', settings.brand_color);
      }
      if (settings.brand_color_secondary) {
        document.documentElement.style.setProperty('--storefront-secondary', settings.brand_color_secondary);
      }
    }
    
    return () => {
      // Reset on unmount
      document.documentElement.style.removeProperty('--storefront-primary');
      document.documentElement.style.removeProperty('--storefront-secondary');
    };
  }, [settings, practitioner]);
  
  if (isLoading) {
    return <PageSkeleton />;
  }
  
  if (error || !practitioner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground mb-4">Practitioner not found</p>
          <a href="/" className="text-primary hover:underline">
            Return to main site
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <PractitionerAuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <StorefrontHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <StorefrontFooter />
      </div>
    </PractitionerAuthProvider>
  );
};

const StorefrontLayout = () => {
  const { practitionerSlug } = useParams();
  
  return (
    <PractitionerProvider slug={practitionerSlug}>
      <StorefrontContent />
    </PractitionerProvider>
  );
};

export default StorefrontLayout;
