import { Heart, Sparkles, Star, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityProfile {
  suggested_ego_state?: string[];
  dominant_traits?: string[];
  values_hierarchy?: string[];
}

interface PDFIdentityPageProps {
  profile: IdentityProfile;
  language: string;
}

export function PDFIdentityPage({ profile, language }: PDFIdentityPageProps) {
  const isRTL = language === 'he';

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
          <Heart className="w-6 h-6 text-rose-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">
          {isRTL ? 'פרופיל זהות' : 'Identity Profile'}
        </h2>
      </div>

      {/* Ego State */}
      {profile.suggested_ego_state && profile.suggested_ego_state.length > 0 && (
        <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h3 className="font-medium text-rose-300">
              {isRTL ? 'מצב אגו מומלץ' : 'Suggested Ego State'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.suggested_ego_state.map((state, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 text-sm border border-rose-500/30 font-medium"
              >
                {state}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dominant Traits */}
      {profile.dominant_traits && profile.dominant_traits.length > 0 && (
        <div className="mb-6 p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="font-medium text-amber-300">
              {isRTL ? 'תכונות דומיננטיות' : 'Dominant Traits'}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.dominant_traits.map((trait, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-200/80 text-sm border border-amber-500/20"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Values Hierarchy */}
      {profile.values_hierarchy && profile.values_hierarchy.length > 0 && (
        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <h3 className="font-medium text-violet-300">
              {isRTL ? 'היררכיית ערכים' : 'Values Hierarchy'}
            </h3>
          </div>
          <div className="space-y-2">
            {profile.values_hierarchy.map((value, i) => (
              <div 
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              >
                <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-white/80 text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative */}
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-rose-600/5 blur-3xl" />
    </div>
  );
}
