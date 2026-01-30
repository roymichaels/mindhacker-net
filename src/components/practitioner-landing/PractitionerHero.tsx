import { Link } from "react-router-dom";
import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Languages, 
  Calendar,
  MessageCircle,
  Globe,
  Instagram,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { PractitionerWithDetails } from "@/hooks/usePractitioners";
import { motion } from "framer-motion";

interface PractitionerHeroProps {
  practitioner: PractitionerWithDetails;
}

const PractitionerHero = ({ practitioner }: PractitionerHeroProps) => {
  const { t, isRTL, language } = useTranslation();
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const displayName = language === 'en' && practitioner.display_name_en 
    ? practitioner.display_name_en 
    : practitioner.display_name;
    
  const title = language === 'en' && practitioner.title_en 
    ? practitioner.title_en 
    : practitioner.title;

  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center px-4 py-12 md:py-20 overflow-hidden">
      {/* Background with gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background"
      />
      
      {/* Hero image background if exists */}
      {practitioner.hero_image_url && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${practitioner.hero_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link 
            to="/practitioners" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowIcon className="h-4 w-4 me-1" />
            {t('practitionerLanding.backToDirectory')}
          </Link>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Avatar with glow effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow behind avatar */}
            <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
            
            <Avatar className="relative h-40 w-40 md:h-52 md:w-52 border-4 border-primary/30 shadow-2xl shadow-primary/20">
              <AvatarImage src={practitioner.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Verified badge overlay */}
            {practitioner.is_verified && (
              <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-start flex-1"
          >
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">{displayName}</h1>
              {practitioner.is_featured && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="h-3 w-3 me-1" />
                  {t('practitioners.featured')}
                </Badge>
              )}
            </div>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4">{title}</p>

            {/* Rating */}
            {practitioner.reviews_count > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(practitioner.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-lg">{practitioner.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({practitioner.reviews_count} {t('practitioners.reviews')})
                </span>
              </div>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
              {practitioner.country && (
                <Badge variant="secondary" className="text-sm py-1.5 px-3">
                  <MapPin className="h-4 w-4 me-1" />
                  {practitioner.country}
                </Badge>
              )}
              {practitioner.languages?.map((lang) => (
                <Badge key={lang} variant="outline" className="text-sm py-1.5 px-3">
                  <Languages className="h-4 w-4 me-1" />
                  {lang === 'he' ? 'עברית' : lang === 'en' ? 'English' : lang}
                </Badge>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {practitioner.calendly_url && (
                <Button size="lg" className="font-bold" asChild>
                  <a href={practitioner.calendly_url} target="_blank" rel="noopener noreferrer">
                    <Calendar className="h-5 w-5 me-2" />
                    {t('practitionerLanding.bookNow')}
                  </a>
                </Button>
              )}
              {practitioner.intro_video_url && (
                <Button size="lg" variant="outline" className="font-bold" asChild>
                  <a href={practitioner.intro_video_url} target="_blank" rel="noopener noreferrer">
                    <Play className="h-5 w-5 me-2" />
                    {t('practitionerLanding.watchIntro')}
                  </a>
                </Button>
              )}
              {practitioner.whatsapp && (
                <Button size="lg" variant="outline" asChild>
                  <a href={`https://wa.me/${practitioner.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {practitioner.instagram_url && (
                <Button size="lg" variant="ghost" asChild>
                  <a href={practitioner.instagram_url} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
              )}
              {practitioner.website_url && (
                <Button size="lg" variant="ghost" asChild>
                  <a href={practitioner.website_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-5 w-5" />
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PractitionerHero;
