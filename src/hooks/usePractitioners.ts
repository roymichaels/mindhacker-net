import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Practitioner {
  id: string;
  user_id: string;
  display_name: string;
  display_name_en: string | null;
  title: string;
  title_en: string | null;
  short_name: string | null;
  short_name_en: string | null;
  bio: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  hero_image_url: string | null;
  intro_video_url: string | null;
  whatsapp: string | null;
  calendly_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  country: string;
  languages: string[];
  timezone: string;
  slug: string;
  is_featured: boolean;
  is_verified: boolean;
  status: string;
  commission_rate: number;
  clients_count: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface PractitionerSpecialty {
  id: string;
  practitioner_id: string;
  specialty: string;
  specialty_label: string;
  specialty_label_en: string | null;
  years_experience: number;
  certification_name: string | null;
  certification_url: string | null;
  created_at: string;
}

export interface PractitionerService {
  id: string;
  practitioner_id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  service_type: 'session' | 'package' | 'product';
  price: number;
  price_currency: string;
  duration_minutes: number | null;
  sessions_count: number | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface PractitionerReview {
  id: string;
  practitioner_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface PractitionerWithDetails extends Practitioner {
  specialties: PractitionerSpecialty[];
  services: PractitionerService[];
  reviews: PractitionerReview[];
}

// Fetch all active practitioners
export const usePractitioners = (options?: { featured?: boolean }) => {
  return useQuery({
    queryKey: ['practitioners', options?.featured],
    queryFn: async () => {
      let query = supabase
        .from('practitioners')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Practitioner[];
    },
  });
};

// Fetch single practitioner by slug with all details
export const usePractitioner = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['practitioner', slug],
    queryFn: async () => {
      if (!slug) return null;

      // Fetch practitioner
      const { data: practitioner, error: practitionerError } = await supabase
        .from('practitioners')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (practitionerError) throw practitionerError;
      if (!practitioner) return null;

      // Fetch specialties and services in parallel
      const [specialtiesRes, servicesRes, reviewsRes] = await Promise.all([
        supabase
          .from('practitioner_specialties')
          .select('*')
          .eq('practitioner_id', practitioner.id),
        supabase
          .from('practitioner_services')
          .select('*')
          .eq('practitioner_id', practitioner.id)
          .eq('is_active', true)
          .order('order_index'),
        supabase
          .from('practitioner_reviews')
          .select('*')
          .eq('practitioner_id', practitioner.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
      ]);

      // Fetch profile info for reviews separately
      const reviews = reviewsRes.data || [];
      const reviewsWithProfiles = await Promise.all(
        reviews.map(async (review: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', review.user_id)
            .single();
          return { ...review, profiles: profile };
        })
      );

      return {
        ...practitioner,
        specialties: specialtiesRes.data || [],
        services: servicesRes.data || [],
        reviews: reviewsWithProfiles,
      } as PractitionerWithDetails;
    },
    enabled: !!slug,
  });
};

// Fetch current user's practitioner profile
export const useMyPractitionerProfile = () => {
  return useQuery({
    queryKey: ['my-practitioner-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return null;

      // Fetch related data
      const [specialtiesRes, servicesRes] = await Promise.all([
        supabase
          .from('practitioner_specialties')
          .select('*')
          .eq('practitioner_id', data.id),
        supabase
          .from('practitioner_services')
          .select('*')
          .eq('practitioner_id', data.id)
          .order('order_index'),
      ]);

      return {
        ...data,
        specialties: specialtiesRes.data || [],
        services: servicesRes.data || [],
        reviews: [],
      } as PractitionerWithDetails;
    },
  });
};
