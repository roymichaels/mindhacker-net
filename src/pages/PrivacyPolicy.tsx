import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Shield, Building2, Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";

const PrivacyPolicy = () => {
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useSEO({
    title: t('legal.privacy.seoTitle'),
    description: t('legal.privacy.seoDescription'),
    url: `${window.location.origin}/privacy-policy`,
    type: "website",
  });

  return (
    <div className="min-h-screen py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link 
          to="/" 
          className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <ArrowIcon className="w-4 h-4 rotate-180" />
          {t('auth.backToHome')}
        </Link>

        {/* Header */}
        <div className="glass-panel p-8 md:p-12 rounded-2xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-black cyber-glow">
              {t('legal.privacy.title')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('legal.privacy.lastUpdated')}: {new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Company Info */}
          <section className="glass-panel p-6 md:p-8 rounded-xl border border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">{t('legal.company.title')}</h2>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-semibold">{t('legal.company.name')}</p>
              <p>{t('legal.company.country')}</p>
              <p className="text-sm">{t('legal.company.registrationNote')}</p>
              <p className="text-sm">{t('legal.company.contact')}</p>
            </div>
          </section>

          {/* Introduction */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.introTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.introText')}
            </p>
          </section>

          {/* Data Collection */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.dataCollectionTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.privacy.dataCollectionIntro')}
            </p>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.privacy.dataName')}</li>
              <li className="list-disc">{t('legal.privacy.dataEmail')}</li>
              <li className="list-disc">{t('legal.privacy.dataPhone')}</li>
              <li className="list-disc">{t('legal.privacy.dataPayment')}</li>
              <li className="list-disc">{t('legal.privacy.dataUsage')}</li>
            </ul>
          </section>

          {/* Legal Basis */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.legalBasisTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.privacy.legalBasisIntro')}
            </p>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.privacy.legalBasisConsent')}</li>
              <li className="list-disc">{t('legal.privacy.legalBasisContract')}</li>
              <li className="list-disc">{t('legal.privacy.legalBasisLegal')}</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.usageTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.privacy.usageIntro')}
            </p>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.privacy.usageService')}</li>
              <li className="list-disc">{t('legal.privacy.usageCommunication')}</li>
              <li className="list-disc">{t('legal.privacy.usageImprovement')}</li>
              <li className="list-disc">{t('legal.privacy.usageLegal')}</li>
            </ul>
          </section>

          {/* Data Security */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.securityTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.securityText')}
            </p>
          </section>

          {/* Data Retention */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.retentionTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.retentionText')}
            </p>
          </section>

          {/* Your Rights (GDPR) */}
          <section className="glass-panel p-6 md:p-8 rounded-xl border border-primary/30">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.rightsTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.privacy.rightsIntro')}
            </p>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.privacy.rightsAccess')}</li>
              <li className="list-disc">{t('legal.privacy.rightsCorrect')}</li>
              <li className="list-disc">{t('legal.privacy.rightsDelete')}</li>
              <li className="list-disc">{t('legal.privacy.rightsObject')}</li>
              <li className="list-disc">{t('legal.privacy.rightsPortability')}</li>
              <li className="list-disc">{t('legal.privacy.rightsRestrict')}</li>
            </ul>
          </section>

          {/* International Transfers */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">{t('legal.privacy.internationalTitle')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.internationalText')}
            </p>
          </section>

          {/* Cookies */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.cookiesTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.cookiesText')}
            </p>
          </section>

          {/* Contact */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.privacy.contactTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.privacy.contactText')}
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="mt-12 text-center">
          <Link 
            to="/terms-of-service" 
            className="text-primary hover:underline"
          >
            {t('legal.terms.title')} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;