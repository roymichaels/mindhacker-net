/**
 * LandingPagePreview — React-Native-inspired coach landing page renderer.
 * Clean card-based layout with generous spacing, rounded corners, and smooth feel.
 */
import { Star, Heart, Target, Zap, CheckCircle, ChevronDown, Quote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  page: {
    title: string;
    content: any;
    template_id: string;
  };
}

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  heart: Heart,
  target: Target,
  zap: Zap,
  check: CheckCircle,
};

export default function LandingPagePreview({ page }: Props) {
  const c = page.content || {};

  return (
    <div className="bg-background min-h-[60vh] pb-8">
      {/* Hero */}
      {c.hero && (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-primary/5 to-transparent px-4 pt-12 pb-10 sm:px-6 sm:pt-20 sm:pb-16">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-snug tracking-tight">
              {c.hero.headline}
            </h1>
            {c.hero.subheadline && (
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {c.hero.subheadline}
              </p>
            )}
            {c.hero.cta_text && (
              <div className="pt-2">
                <Button size="lg" className="text-base px-8 h-12 rounded-2xl shadow-lg shadow-primary/20">
                  {c.hero.cta_text}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Benefits */}
      {c.benefits?.length > 0 && (
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-lg sm:max-w-4xl mx-auto space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {c.benefits.map((b: any, i: number) => {
              const Icon = ICON_MAP[b.icon] || Star;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* About */}
      {c.about && (
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-lg sm:max-w-2xl mx-auto rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold">{c.about.headline}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{c.about.text}</p>
            {c.about.credentials?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {c.about.credentials.map((cred: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <CheckCircle className="h-3 w-3" /> {cred}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {c.testimonials?.length > 0 && (
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-lg sm:max-w-3xl mx-auto space-y-4">
            {c.testimonials_headline && (
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">{c.testimonials_headline}</h2>
            )}
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              {c.testimonials.map((t: any, i: number) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-sm">
                  <Quote className="h-4 w-4 text-primary/40" />
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {t.text}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {t.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{t.name}</p>
                      {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offer */}
      {c.offer && (
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-lg sm:max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 sm:p-8 space-y-5 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold text-center">{c.offer.headline}</h2>
            {c.offer.items?.length > 0 && (
              <ul className="space-y-2.5 max-w-md mx-auto">
                {c.offer.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {c.offer.price_text && (
              <p className="text-center text-lg sm:text-xl font-bold text-primary">{c.offer.price_text}</p>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faq?.length > 0 && (
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-lg sm:max-w-2xl mx-auto space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">FAQ</h2>
            {c.faq.map((item: any, i: number) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      {c.cta_final && (
        <section className="px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-lg sm:max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 p-8 sm:p-10 text-center space-y-4 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold">{c.cta_final.headline}</h2>
            {c.cta_final.text && (
              <p className="text-muted-foreground text-sm sm:text-base">{c.cta_final.text}</p>
            )}
            {c.cta_final.button_text && (
              <div className="pt-2">
                <Button size="lg" className="text-base px-8 h-12 rounded-2xl shadow-lg shadow-primary/20">
                  {c.cta_final.button_text}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-medium text-sm hover:bg-muted/30 transition-colors"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
