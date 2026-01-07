import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, FileText, AlertTriangle, Building2, Scale } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";

const TermsOfService = () => {
  const { t, isRTL } = useTranslation();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useSEO({
    title: t('legal.terms.seoTitle'),
    description: t('legal.terms.seoDescription'),
    url: `${window.location.origin}/terms-of-service`,
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
            <FileText className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-black cyber-glow">
              {t('legal.terms.title')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('legal.terms.lastUpdated')}: {new Date().toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
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

          {/* Acceptance */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.acceptanceTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.acceptanceText')}
            </p>
          </section>

          {/* Services Description */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.servicesTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.terms.servicesIntro')}
            </p>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.terms.servicesHypnosis')}</li>
              <li className="list-disc">{t('legal.terms.servicesDigital')}</li>
              <li className="list-disc">{t('legal.terms.servicesCoaching')}</li>
            </ul>
          </section>

          {/* Important Disclaimer */}
          <section className="glass-panel p-6 md:p-8 rounded-xl border-2 border-yellow-500/50">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-yellow-500">{t('legal.terms.disclaimerTitle')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.disclaimerText')}
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.responsibilitiesTitle')}</h2>
            <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'pr-6' : 'pl-6'}`}>
              <li className="list-disc">{t('legal.terms.responsibilitiesAccurate')}</li>
              <li className="list-disc">{t('legal.terms.responsibilitiesSecure')}</li>
              <li className="list-disc">{t('legal.terms.responsibilitiesLawful')}</li>
              <li className="list-disc">{t('legal.terms.responsibilitiesRespect')}</li>
              <li className="list-disc">{t('legal.terms.responsibilitiesHealth')}</li>
            </ul>
          </section>

          {/* Payment & Refunds */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.paymentTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.terms.paymentText')}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.refundText')}
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.ipTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.ipText')}
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.liabilityTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.liabilityText')}
            </p>
          </section>

          {/* Arbitration */}
          <section className="glass-panel p-6 md:p-8 rounded-xl border-2 border-primary/50">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-primary">{t('legal.terms.arbitrationTitle')}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.arbitrationText')}
            </p>
          </section>

          {/* Governing Law */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.governingTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.governingText')}
            </p>
          </section>

          {/* Contact */}
          <section className="glass-panel p-6 md:p-8 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-primary">{t('legal.terms.contactTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.terms.contactText')}
            </p>
          </section>
        </div>

        {/* Footer link */}
        <div className="mt-12 text-center">
          <Link 
            to="/privacy-policy" 
            className="text-primary hover:underline"
          >
            ← {t('legal.privacy.title')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;