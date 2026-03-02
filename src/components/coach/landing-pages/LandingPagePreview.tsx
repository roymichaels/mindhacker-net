/**
 * LandingPagePreview — Renders a coach landing page from JSON content.
 * Supports all template sections: hero, benefits, about, testimonials, offer, faq, cta.
 */
import { Star, Heart, Target, Zap, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="bg-background min-h-[60vh]">
      {/* Hero */}
      {c.hero && (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">{c.hero.headline}</h1>
            {c.hero.subheadline && (
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{c.hero.subheadline}</p>
            )}
            {c.hero.cta_text && (
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg">
                {c.hero.cta_text}
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Benefits */}
      {c.benefits?.length > 0 && (
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {c.benefits.map((b: any, i: number) => {
              const Icon = ICON_MAP[b.icon] || Star;
              return (
                <div key={i} className="rounded-xl border bg-card p-6 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* About */}
      {c.about && (
        <section className="px-6 py-12 md:py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">{c.about.headline}</h2>
            <p className="text-muted-foreground leading-relaxed">{c.about.text}</p>
            {c.about.credentials?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {c.about.credentials.map((cred: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> {cred}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {c.testimonials?.length > 0 && (
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-center">
              {c.testimonials_headline || ''}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {c.testimonials.map((t: any, i: number) => (
                <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
                  <p className="text-sm italic text-muted-foreground leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {t.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
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
        <section className="px-6 py-12 md:py-16 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">{c.offer.headline}</h2>
            {c.offer.items?.length > 0 && (
              <ul className="space-y-2 text-start max-w-md mx-auto">
                {c.offer.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {c.offer.price_text && (
              <p className="text-xl font-bold text-primary">{c.offer.price_text}</p>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faq?.length > 0 && (
        <section className="px-6 py-12 md:py-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">FAQ</h2>
            {c.faq.map((item: any, i: number) => (
              <FaqItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      {c.cta_final && (
        <section className="px-6 py-16 md:py-20 bg-gradient-to-br from-primary/10 to-primary/20 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">{c.cta_final.headline}</h2>
            {c.cta_final.text && (
              <p className="text-muted-foreground">{c.cta_final.text}</p>
            )}
            {c.cta_final.button_text && (
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg">
                {c.cta_final.button_text}
              </Button>
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
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-medium text-sm hover:bg-muted/50 transition-colors"
      >
        {question}
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted-foreground">{answer}</div>
      )}
    </div>
  );
}
