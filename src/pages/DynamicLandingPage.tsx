import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DynamicHero,
  DynamicPainPoints,
  DynamicProcess,
  DynamicBenefits,
  DynamicForWho,
  DynamicTestimonials,
  DynamicFAQ,
  DynamicCTA,
} from "@/components/landing";

const DynamicLandingPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['dynamic-landing-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  const sectionsOrder = Array.isArray(page.sections_order) ? page.sections_order : [];

  const renderSection = (sectionKey: string, index: number) => {
    switch (sectionKey) {
      case 'hero':
        return (
          <DynamicHero
            key={index}
            heading_he={page.hero_heading_he}
            heading_en={page.hero_heading_en}
            subheading_he={page.hero_subheading_he}
            subheading_en={page.hero_subheading_en}
            badge_text_he={page.hero_badge_text_he}
            badge_text_en={page.hero_badge_text_en}
            image_url={page.hero_image_url}
            video_url={page.hero_video_url}
            brand_color={page.brand_color}
            cta_text_he={page.primary_cta_text_he}
            cta_text_en={page.primary_cta_text_en}
            cta_link={page.primary_cta_link}
            cta_type={page.primary_cta_type}
          />
        );
      case 'pain_points':
        return (
          <DynamicPainPoints
            key={index}
            items={(page.pain_points as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'process':
        return (
          <DynamicProcess
            key={index}
            items={(page.process_steps as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'benefits':
        return (
          <DynamicBenefits
            key={index}
            items={(page.benefits as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'for_who':
        return (
          <DynamicForWho
            key={index}
            for_who={(page.for_who as any[]) || []}
            not_for_who={(page.not_for_who as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'testimonials':
        return (
          <DynamicTestimonials
            key={index}
            items={(page.testimonials as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'faq':
        return (
          <DynamicFAQ
            key={index}
            items={(page.faqs as any[]) || []}
            brand_color={page.brand_color || undefined}
          />
        );
      case 'cta':
        return (
          <DynamicCTA
            key={index}
            brand_color={page.brand_color || undefined}
            cta_type={page.primary_cta_type}
            cta_text_he={page.primary_cta_text_he}
            cta_text_en={page.primary_cta_text_en}
            cta_link={page.primary_cta_link}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {sectionsOrder.map((sectionKey, index) => renderSection(sectionKey as string, index))}
      </main>
      <Footer />
    </div>
  );
};

export default DynamicLandingPage;
