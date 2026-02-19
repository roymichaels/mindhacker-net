import { Link } from 'react-router-dom';
import { useCoachStorefront } from '@/contexts/PractitionerContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Mail, Phone, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

const socialIcons: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
};

const StorefrontFooter = () => {
  const { practitioner, settings, practitionerSlug } = useCoachStorefront();
  const { t, isRTL } = useTranslation();
  
  if (!practitioner) return null;
  
  const baseUrl = `/p/${practitionerSlug}`;
  const brandColor = settings?.brand_color || '#e91e63';
  const socialLinks = settings?.social_links || {};
  
  const navItems = [
    { label: t('courses'), href: `${baseUrl}/courses`, show: settings?.enable_courses !== false },
    { label: t('services'), href: `${baseUrl}/services`, show: settings?.enable_services !== false },
    { label: t('products'), href: `${baseUrl}/products`, show: settings?.enable_products !== false },
  ].filter(item => item.show);
  
  return (
    <footer 
      className="border-t bg-muted/30"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link to={baseUrl} className="flex items-center gap-3 mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt={practitioner.display_name} 
                  className="h-12 w-auto"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: brandColor }}
                >
                  {practitioner.display_name.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-xl">
                {practitioner.display_name}
              </span>
            </Link>
            {practitioner.bio && (
              <p className="text-muted-foreground text-sm max-w-md mb-4">
                {practitioner.bio}
              </p>
            )}
            
            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="flex gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  const Icon = socialIcons[platform.toLowerCase()];
                  if (!Icon || !url) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">{t('navigation')}</h4>
            <nav className="flex flex-col gap-2">
              <Link to={baseUrl} className="text-sm text-muted-foreground hover:text-foreground">
                {t('home')}
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t('contact')}</h4>
            <div className="flex flex-col gap-3">
              {settings?.contact_email && (
                <a 
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  {settings.contact_email}
                </a>
              )}
              {settings?.contact_phone && (
                <a 
                  href={`tel:${settings.contact_phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  {settings.contact_phone}
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {practitioner.display_name}. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default StorefrontFooter;
