/**
 * SEO Utilities - Manage meta tags, Open Graph, and structured data
 * Data-driven: All brand information should be passed as parameters
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'course';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface BrandSettings {
  brandName: string;
  brandNameEn: string;
  founderName?: string;
  founderNameEn?: string;
  founderTitle?: string;
  founderTitleEn?: string;
  siteUrl?: string;
  ogImageUrl?: string;
}

/**
 * Update document meta tags for SEO
 */
export const updateMetaTags = (config: SEOConfig) => {
  const {
    title,
    description,
    keywords,
    image = 'https://mindos.app/og-image.png',
    url = window.location.href,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    siteName,
  } = config;

  // Update title
  document.title = title;

  // Helper to set meta tag
  const setMetaTag = (name: string, content: string, property?: boolean) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Basic meta tags
  setMetaTag('description', description);
  if (keywords) setMetaTag('keywords', keywords);
  if (author) setMetaTag('author', author);

  // Open Graph tags
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', description, true);
  setMetaTag('og:image', image, true);
  setMetaTag('og:url', url, true);
  setMetaTag('og:type', type, true);
  setMetaTag('og:locale', 'he_IL', true);
  if (siteName) setMetaTag('og:site_name', siteName, true);

  // Twitter Card tags
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', image);

  // Article specific tags
  if (type === 'article') {
    if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
    if (author) setMetaTag('article:author', author, true);
  }

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

/**
 * Add JSON-LD structured data to the page
 */
export const addStructuredData = (data: StructuredData | StructuredData[]) => {
  // Remove existing structured data scripts
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());

  // Add new structured data
  const scripts = Array.isArray(data) ? data : [data];
  
  scripts.forEach(structuredData => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  });
};

/**
 * Generate Organization structured data
 * @param brand - Optional brand settings. If not provided, uses defaults.
 */
export const getOrganizationSchema = (brand?: BrandSettings): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: brand?.brandName || 'מיינד OS',
  alternateName: brand?.brandNameEn || 'Mind OS',
  url: brand?.siteUrl || window.location.origin,
  logo: brand?.ogImageUrl || 'https://mindos.app/og-image.png',
  description: 'פלטפורמת התפתחות אישית מבוססת AI - אימון תודעתי, היפנוזה מותאמת וגיימיפיקציה',
  founder: brand?.founderName ? {
    '@type': 'Person',
    name: brand.founderName,
    jobTitle: brand?.founderTitle || 'מייסד',
  } : undefined,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
  },
  sameAs: [],
});

/**
 * Generate Course structured data
 */
export const getCourseSchema = (course: {
  name: string;
  description: string;
  provider: string;
  image?: string;
  price?: number;
  currency?: string;
}): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description,
  provider: {
    '@type': 'Organization',
    name: course.provider,
  },
  ...(course.image && { image: course.image }),
  ...(course.price && {
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: course.currency || 'ILS',
    },
  }),
});

/**
 * Generate Product structured data
 */
export const getProductSchema = (product: {
  name: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: string;
  rating?: number;
  ratingCount?: number;
}): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  ...(product.image && { image: product.image }),
  ...(product.price && {
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'ILS',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
    },
  }),
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.ratingCount || 0,
    },
  }),
});

/**
 * Generate WebSite structured data
 * @param brand - Optional brand settings. If not provided, uses defaults.
 */
export const getWebsiteSchema = (brand?: BrandSettings): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: brand?.brandName || 'מיינד OS',
  alternateName: brand?.brandNameEn || 'Mind OS',
  url: brand?.siteUrl || window.location.origin,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${brand?.siteUrl || window.location.origin}/courses?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Generate BreadcrumbList structured data
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});
