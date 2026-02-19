import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle, Calendar, MessageCircle,
  Instagram, Globe, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/useTranslation';
import { PractitionerWithDetails } from '@/hooks/usePractitioners';

interface Props {
  practitioner: PractitionerWithDetails;
  postsCount: number;
}

const PractitionerProfileHeader = ({ practitioner, postsCount }: Props) => {
  const { t, isRTL, language } = useTranslation();
  const [bioExpanded, setBioExpanded] = useState(false);
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const displayName = language === 'en' && practitioner.display_name_en
    ? practitioner.display_name_en
    : practitioner.display_name;

  const title = language === 'en' && practitioner.title_en
    ? practitioner.title_en
    : practitioner.title;

  const bio = language === 'en' && practitioner.bio_en
    ? practitioner.bio_en
    : practitioner.bio;

  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  const stats = [
    { value: postsCount, label: language === 'he' ? 'פוסטים' : 'Posts' },
    { value: practitioner.clients_count || 0, label: language === 'he' ? 'לקוחות' : 'Clients' },
    { value: practitioner.rating > 0 ? practitioner.rating.toFixed(1) : '—', label: language === 'he' ? 'דירוג' : 'Rating' },
  ];

  return (
    <section className="pt-20 pb-2 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          to="/practitioners"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowIcon className="h-4 w-4 me-1" />
          {t('practitionerLanding.backToDirectory')}
        </Link>

        {/* Avatar + Stats row */}
        <div className="flex items-center gap-6 mb-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-primary/30">
              <AvatarImage src={practitioner.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {practitioner.is_verified && (
              <div className="absolute -bottom-1 -end-1 bg-blue-500 text-white rounded-full p-0.5 shadow">
                <CheckCircle className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-1 justify-around text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="text-lg font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Name + Title + Bio */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold leading-tight">{displayName}</h1>
            {practitioner.is_verified && (
              <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{title}</p>

          {bio && (
            <div className="mt-1">
              <p className={`text-sm whitespace-pre-line ${!bioExpanded ? 'line-clamp-2' : ''}`}>
                {bio}
              </p>
              {bio.length > 120 && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {bioExpanded
                    ? (language === 'he' ? 'פחות' : 'less')
                    : (language === 'he' ? 'עוד...' : 'more...')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action buttons row */}
        <div className="flex items-center gap-2 mb-2">
          {practitioner.calendly_url && (
            <Button size="sm" className="flex-1 font-semibold" asChild>
              <a href={practitioner.calendly_url} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4 me-1.5" />
                {t('practitionerLanding.bookNow')}
              </a>
            </Button>
          )}
          {practitioner.whatsapp && (
            <Button size="sm" variant="outline" asChild>
              <a href={`https://wa.me/${practitioner.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          )}
          {practitioner.instagram_url && (
            <Button size="sm" variant="outline" asChild>
              <a href={practitioner.instagram_url} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          )}
          {practitioner.website_url && (
            <Button size="sm" variant="outline" asChild>
              <a href={practitioner.website_url} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PractitionerProfileHeader;
