import { useState } from 'react';
import { Search, Filter, Users, Sparkles, Rocket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioners, useMyPractitionerProfile, type Practitioner } from '@/hooks/usePractitioners';
import PractitionerCard from '@/components/practitioners/PractitionerCard';
import PractitionerDetailView from '@/components/practitioners/PractitionerDetailView';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SPECIALTIES = [
  { key: 'all', labelHe: 'הכל', labelEn: 'All' },
  { key: 'hypnotherapy', labelHe: 'היפנותרפיה', labelEn: 'Hypnotherapy' },
  { key: 'coaching', labelHe: 'אימון תודעתי', labelEn: 'Coaching' },
  { key: 'nlp', labelHe: 'NLP', labelEn: 'NLP' },
  { key: 'meditation', labelHe: 'מדיטציה', labelEn: 'Meditation' },
];

export default function Marketplace() {
  const { t, isRTL, language } = useTranslation();
  const { data: practitioners, isLoading } = usePractitioners();
  const { data: myProfile } = useMyPractitionerProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const isAlreadyCoach = !!myProfile;

  const filteredPractitioners = practitioners?.filter((p) => {
    const matchesSearch =
      p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.display_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (selectedPractitioner) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedPractitioner(null)} className="mb-4">
          ← {language === 'he' ? 'חזרה' : 'Back'}
        </Button>
        <PractitionerDetailView
          practitioner={selectedPractitioner}
          onBack={() => setSelectedPractitioner(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('practitioners.directoryTitle')}</h1>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'מצאו את המאמן המתאים לכם' : 'Find the right coach for you'}
            </p>
          </div>
        </div>

        {/* Become a Coach CTA */}
        {user && !isAlreadyCoach && (
          <Button
            onClick={() => navigate('/coaching/journey')}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white"
            size="sm"
          >
            <Rocket className="h-4 w-4 me-1" />
            {language === 'en' ? 'Become a Coach' : 'הפוך למאמן'}
          </Button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('practitioners.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 h-10"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Filter className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {SPECIALTIES.map((specialty) => (
            <Badge
              key={specialty.key}
              variant={selectedSpecialty === specialty.key ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap text-xs"
              onClick={() => setSelectedSpecialty(specialty.key)}
            >
              {language === 'en' ? specialty.labelEn : specialty.labelHe}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : filteredPractitioners && filteredPractitioners.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            {filteredPractitioners.length} {t('practitioners.resultsFound')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPractitioners.map((practitioner) => (
              <PractitionerCard
                key={practitioner.id}
                practitioner={practitioner}
                onSelect={setSelectedPractitioner}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">{t('practitioners.noResults')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('practitioners.noResultsHint')}</p>
          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); }}>
            {t('practitioners.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  );
}
