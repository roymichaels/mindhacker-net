import { useState, useEffect, useRef } from "react";
import { Calendar, Package, Sparkles, Loader2, Check, X, Crown, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LeadCaptureDialog from "./LeadCaptureDialog";
import GuaranteeBadge from "./GuaranteeBadge";
import CountdownTimer from "./CountdownTimer";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { formatPrice } from "@/lib/currency";

interface PricingOption {
  id: "single" | "package_4";
  sessions: number;
  price: number;
  pricePerSession: number;
  savings?: number;
  recommended?: boolean;
  features: string[];
  originalPrice?: number;
}

const PricingCards = () => {
  const { t, language, isRTL } = useTranslation();
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fallback in case IntersectionObserver doesn't trigger on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isVisible) {
        setIsVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    const fetchPricing = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", [
          "single_session_price",
          "package_session_price",
          "single_session_description",
          "package_session_description",
        ]);

      if (!error && data) {
        const settings = data.reduce((acc: any, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {});

        const singlePrice = Number(settings.single_session_price) || 250;
        const packagePrice = Number(settings.package_session_price) || 800;
        const pricePerSession = packagePrice / 4;
        const savings = singlePrice * 4 - packagePrice;

        // Translated features based on language
        const singleFeatures = language === 'en' 
          ? [
              settings.single_session_description || "One 90-minute session",
              "Immediate scheduling",
              "Full personal guidance",
            ]
          : [
              settings.single_session_description || "מפגש אחד של 90 דקות",
              "תיאום מיידי",
              "ליווי אישי מלא",
            ];

        const packageFeatures = language === 'en'
          ? [
              "🎁 First session on us!",
              "3 follow-up sessions (90 min each)",
              "Ongoing support throughout the process",
              "WhatsApp support between sessions",
              "Session recordings",
              "Customized exercises",
            ]
          : [
              "🎁 המפגש הראשון - עלינו!",
              "3 מפגשי המשך של 90 דק' כ\"א",
              "ליווי מתמשך לאורך כל התהליך",
              "ליווי בוואטסאפ בין המפגשים",
              "הקלטת המפגשים",
              "תרגילים מותאמים אישית",
            ];

        setPricingOptions([
          {
            id: "single",
            sessions: 1,
            price: singlePrice,
            pricePerSession: singlePrice,
            features: singleFeatures,
          },
          {
            id: "package_4",
            sessions: 4,
            price: packagePrice,
            pricePerSession,
            savings,
            recommended: true,
            originalPrice: singlePrice * 4,
            features: packageFeatures,
          },
        ]);
      }
      setLoading(false);
    };

    fetchPricing();
  }, [language]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Feature comparison data - translated based on language
  const comparisonFeatures = language === 'en' 
    ? [
        { name: "Session Duration", single: "90 min", package: "90 min" },
        { name: "WhatsApp Support", single: false, package: true },
        { name: "Session Recording", single: false, package: true },
        { name: "Custom Exercises", single: true, package: true },
        { name: "Progress Tracking", single: false, package: true },
      ]
    : [
        { name: "משך מפגש", single: "90 דק'", package: "90 דק'" },
        { name: "ליווי בוואטסאפ", single: false, package: true },
        { name: "הקלטת המפגש", single: false, package: true },
        { name: "תרגילים מותאמים", single: true, package: true },
        { name: "מעקב התקדמות", single: false, package: true },
      ];

  return (
    <div ref={containerRef}>
      <CountdownTimer />
      <div className="grid md:grid-cols-2 gap-6 mt-8" dir={isRTL ? 'rtl' : 'ltr'}>
        {pricingOptions.map((option, index) => (
          <div
            key={option.id}
            className={`glass-panel p-4 md:p-8 relative group transition-all duration-500 hover-lift ${
              option.recommended
                ? "border-primary/60 cyber-border scale-[1.02] md:scale-105 animate-glow-pulse"
                : "hover:border-primary/30"
            } ${isVisible ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            {option.recommended && (
              <div className="absolute -top-4 right-4 md:right-6 flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground cyber-glow text-xs md:text-sm px-3 py-1 flex items-center gap-1 animate-attention-pulse">
                  <Crown className="w-3 h-3" />
                  {language === 'en' ? 'Most Popular' : 'הכי פופולרי'}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-center mb-4 md:mb-6">
              {option.sessions === 1 ? (
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <Package className="w-10 h-10 md:w-12 md:h-12 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
              {option.sessions === 1 
                ? (language === 'en' ? "Single Session" : "מפגש בודד") 
                : (language === 'en' ? "3 Sessions + 1 Free 🎁" : "3 מפגשים + 1 במתנה 🎁")}
            </h3>

            <div className="text-center mb-6">
              {option.originalPrice && (
                <div className="text-muted-foreground line-through text-lg mb-1">
                  {formatPrice(option.originalPrice, language)}
                </div>
              )}
              <div className="text-5xl font-black cyber-glow mb-2">
                {formatPrice(option.price, language)}
              </div>
              {option.recommended && (
                <div className="inline-block bg-gradient-to-r from-accent/30 via-accent/50 to-accent/30 bg-[length:200%_100%] text-accent text-sm font-bold px-4 py-1.5 rounded-full animate-gift-bounce shadow-lg shadow-accent/20 border border-accent/40">
                  {language === 'en' ? '🎁 First session on us!' : '🎁 המפגש הראשון עלינו!'}
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {option.features.map((feature, featureIndex) => (
                <li 
                  key={featureIndex} 
                  className={`flex items-start text-muted-foreground transition-all duration-300 ${
                    isVisible ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: `${0.3 + featureIndex * 0.05}s` }}
                >
                  <span className={`text-primary ${isRTL ? 'ml-2' : 'mr-2'}`}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <LeadCaptureDialog 
              source={`pricing_${option.id}`}
              triggerText={language === 'en' ? "Book Free Consultation" : "קבע שיחת ייעוץ בחינם"}
              triggerVariant="default"
              triggerClassName={`w-full transition-all duration-300 ${
                option.recommended
                  ? "bg-primary text-primary-foreground hover:bg-primary-glow pulse-glow hover:scale-105"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105"
              }`}
              triggerIcon={option.recommended ? <Sparkles className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              showPreferredTime
            />

            <p className="text-center text-xs text-muted-foreground mt-3">
              {language === 'en' ? "Cannot purchase directly - let's talk first" : "לא ניתן לרכוש ישירות - נדבר קודם"}
            </p>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div 
        className={`mt-12 glass-panel p-6 rounded-xl overflow-hidden ${isVisible ? 'animate-fade-in-up' : ''}`}
        style={{ animationDelay: '0.4s' }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <h4 className="text-lg md:text-xl font-bold text-center mb-6 cyber-glow">
          {language === 'en' ? 'Package Comparison' : 'השוואת חבילות'}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/30">
                <th className={`py-3 px-4 ${isRTL ? 'text-right' : 'text-left'} font-semibold text-muted-foreground`}>
                  {language === 'en' ? 'Feature' : 'תכונה'}
                </th>
                <th className="py-3 px-4 text-center font-semibold text-muted-foreground">
                  {language === 'en' ? 'Single Session' : 'מפגש בודד'}
                </th>
                <th className="py-3 px-4 text-center font-semibold text-primary">
                  {language === 'en' ? 'Package of 4' : 'חבילת 4'}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-primary/10 transition-colors hover:bg-primary/5 ${
                    isVisible ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  <td className="py-3 px-4 text-foreground">{feature.name}</td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.single === "boolean" ? (
                      feature.single ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                      )
                    ) : (
                      <span className="text-muted-foreground">{feature.single}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.package === "boolean" ? (
                      feature.package ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                      )
                    ) : (
                      <span className="text-primary font-medium">{feature.package}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guarantee Badge */}
      <GuaranteeBadge />

    </div>
  );
};

export default PricingCards;
