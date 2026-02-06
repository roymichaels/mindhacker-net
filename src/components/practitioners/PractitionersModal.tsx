import { useState } from 'react';
import { Search, Filter, Users, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { usePractitioners, type Practitioner } from '@/hooks/usePractitioners';
import PractitionerCard from './PractitionerCard';
import PractitionerDetailView from './PractitionerDetailView';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const SPECIALTIES = [
  { key: 'all', labelHe: 'הכל', labelEn: 'All' },
  { key: 'hypnotherapy', labelHe: 'היפנותרפיה', labelEn: 'Hypnotherapy' },
  { key: 'coaching', labelHe: 'אימון תודעתי', labelEn: 'Coaching' },
  { key: 'nlp', labelHe: 'NLP', labelEn: 'NLP' },
  { key: 'meditation', labelHe: 'מדיטציה', labelEn: 'Meditation' },
];

interface PractitionersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PractitionersModal({ open, onOpenChange }: PractitionersModalProps) {
  const { t, isRTL, language } = useTranslation();
  const { data: practitioners, isLoading } = usePractitioners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  const filteredPractitioners = practitioners?.filter((p) => {
    const matchesSearch =
      p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.display_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleBack = () => setSelectedPractitioner(null);
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const displayName = selectedPractitioner
    ? (language === 'en' && selectedPractitioner.display_name_en
        ? selectedPractitioner.display_name_en
        : selectedPractitioner.display_name)
    : '';

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) setSelectedPractitioner(null);
      onOpenChange(val);
    }}>
      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] max-h-[85vh] p-0 gap-0 overflow-hidden",
          "bg-background border-border"
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          {selectedPractitioner ? (
            /* Mini header with back + practitioner name */
            <DialogTitle className="flex items-center gap-2 text-lg">
              <button
                onClick={handleBack}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowIcon className="h-4 w-4" />
              </button>
              <span className="truncate">{displayName}</span>
            </DialogTitle>
          ) : (
            <>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-amber-500/10">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </div>
                {t('practitioners.directoryTitle')}
              </DialogTitle>

              <div className="relative mt-3">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('practitioners.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 h-10"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 no-scrollbar">
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
            </>
          )}
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 max-h-[calc(85vh-140px)]">
          <div className="p-5">
            {selectedPractitioner ? (
              <PractitionerDetailView
                practitioner={selectedPractitioner}
                onBack={handleBack}
              />
            ) : isLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-36 rounded-lg" />
                ))}
              </div>
            ) : filteredPractitioners && filteredPractitioners.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {filteredPractitioners.length} {t('practitioners.resultsFound')}
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
