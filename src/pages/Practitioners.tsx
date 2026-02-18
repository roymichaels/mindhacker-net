import { useState } from 'react';
import { Search, Filter, Users, Sparkles, Rocket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioners, useMyPractitionerProfile } from '@/hooks/usePractitioners';
import { useSEO } from '@/hooks/useSEO';
import PractitionerCard from '@/components/practitioners/PractitionerCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';

const SPECIALTIES = [
  { key: 'all', labelHe: 'הכל', labelEn: 'All' },
  { key: 'hypnotherapy', labelHe: 'היפנותרפיה', labelEn: 'Hypnotherapy' },
  { key: 'coaching', labelHe: 'אימון תודעתי', labelEn: 'Coaching' },
  { key: 'nlp', labelHe: 'NLP', labelEn: 'NLP' },
  { key: 'meditation', labelHe: 'מדיטציה', labelEn: 'Meditation' },
];

const Practitioners = () => {
  const { t, isRTL, language } = useTranslation();
  const { data: practitioners, isLoading } = usePractitioners();
  const { data: myProfile } = useMyPractitionerProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const isAlreadyCoach = !!myProfile;
  const { canBeCoach, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();

  useSEO({
    title: t('practitioners.pageTitle'),
    description: t('practitioners.pageDescription'),
    keywords: t('practitioners.keywords'),
  });

  // Filter practitioners
  const filteredPractitioners = practitioners?.filter((p) => {
    const matchesSearch = 
      p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.display_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title_en?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For now, filter by specialty will be handled when we have specialties loaded
    // TODO: Join with specialties table for proper filtering
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t('practitioners.platformBadge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('practitioners.directoryTitle')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('practitioners.directorySubtitle')}
            </p>

            {/* Become a Coach CTA */}
            {user && !isAlreadyCoach && (
              <div className="mb-8">
                <Button
                  onClick={() => {
                    if (!canBeCoach) { showUpgradePrompt('coach'); return; }
                    navigate('/coaching/journey');
                  }}
                  className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white"
                  size="lg"
                >
                  <Rocket className="h-5 w-5 me-2" />
                  {language === 'en' ? 'Become a Coach' : 'הפוך למאמן'}
                </Button>
              </div>
            )}

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('practitioners.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-12 h-12 text-lg"
              />
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-6 px-4 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {SPECIALTIES.map((specialty) => (
                <Badge
                  key={specialty.key}
                  variant={selectedSpecialty === specialty.key ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedSpecialty(specialty.key)}
                >
                  {language === 'en' ? specialty.labelEn : specialty.labelHe}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-lg" />
                ))}
              </div>
            ) : filteredPractitioners && filteredPractitioners.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {filteredPractitioners.length} {t('practitioners.resultsFound')}
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPractitioners.map((practitioner) => (
                    <PractitionerCard key={practitioner.id} practitioner={practitioner} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{t('practitioners.noResults')}</h3>
                <p className="text-muted-foreground mb-6">{t('practitioners.noResultsHint')}</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); }}>
                  {t('practitioners.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
    </div>
  );
};

export default Practitioners;
