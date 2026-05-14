/**
 * Course / Learning catalog — read-only (Phase 2 · Batch 2).
 *
 * - recommendCourses: surface published content_products of type 'course'
 * - summarizeCurriculum: latest learning_curricula row for the user
 */
import { supabase } from '@/integrations/supabase/client';

export interface CourseCard {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  thumbnail_url?: string | null;
  difficulty_level?: string | null;
}

export interface CourseRecommendation {
  total: number;
  pick: CourseCard | null;
  samples: CourseCard[];
  text: string;
}

export async function recommendCourses(query?: string, limit = 5): Promise<CourseRecommendation> {
  let q = supabase
    .from('content_products')
    .select('id, title, slug, category, thumbnail_url, difficulty_level', { count: 'exact' })
    .eq('content_type', 'course')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('order_index', { ascending: true })
    .limit(limit);

  if (query && query.trim()) {
    const term = `%${query.trim().slice(0, 60)}%`;
    q = q.or(`title.ilike.${term},description.ilike.${term},category.ilike.${term}`);
  }

  const { data, count } = await q;
  const samples = (data ?? []) as CourseCard[];
  const pick = samples[0] ?? null;
  const text = samples.length
    ? `נמצאו ${count ?? samples.length} קורסים${query ? ` עבור "${query.slice(0, 30)}"` : ''}${pick ? ` · מומלץ: ${pick.title}` : ''}.`
    : 'אין כרגע קורסים זמינים.';
  return { total: count ?? samples.length, pick, samples, text };
}

export interface CurriculumSummary {
  hasCurriculum: boolean;
  curriculum?: {
    id: string;
    title: string;
    topic: string;
    progress_percentage?: number | null;
    total_modules?: number | null;
    status?: string | null;
  } | null;
  text: string;
}

export async function summarizeCurriculum(userId: string): Promise<CurriculumSummary> {
  if (!userId) return { hasCurriculum: false, text: 'אין משתמש.' };
  const { data } = await supabase
    .from('learning_curricula')
    .select('id, title, topic, progress_percentage, total_modules, status')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);
  const c = data?.[0];
  if (!c) {
    return {
      hasCurriculum: false,
      curriculum: null,
      text: 'אין עדיין מסלול לימוד אישי. אפשר ליצור טיוטה.',
    };
  }
  return {
    hasCurriculum: true,
    curriculum: c,
    text: `מסלול: "${c.title}" · ${c.progress_percentage ?? 0}% · ${c.total_modules ?? 0} מודולים`,
  };
}