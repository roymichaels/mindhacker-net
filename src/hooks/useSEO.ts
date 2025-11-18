import { useEffect } from 'react';
import { updateMetaTags, addStructuredData, type SEOConfig, type StructuredData } from '@/lib/seo';

interface UseSEOOptions extends SEOConfig {
  structuredData?: StructuredData | StructuredData[];
}

/**
 * Custom hook to manage SEO for a page
 */
export const useSEO = (options: UseSEOOptions) => {
  useEffect(() => {
    // Update meta tags
    updateMetaTags(options);

    // Add structured data if provided
    if (options.structuredData) {
      addStructuredData(options.structuredData);
    }

    // Cleanup function - restore default meta tags when component unmounts
    return () => {
      // Optional: Reset to default values if needed
    };
  }, [
    options.title,
    options.description,
    options.keywords,
    options.image,
    options.url,
    options.type,
  ]);
};
