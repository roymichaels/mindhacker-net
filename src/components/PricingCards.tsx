import { useState, useEffect } from "react";
import { Calendar, Package, Sparkles, Loader2, Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CheckoutDialog from "./CheckoutDialog";
import GuaranteeBadge from "./GuaranteeBadge";
import CountdownTimer from "./CountdownTimer";
import { supabase } from "@/integrations/supabase/client";

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
  const [selectedPackage, setSelectedPackage] = useState<PricingOption | null>(null);
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>([]);
  const [loading, setLoading] = useState(true);

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

        setPricingOptions([
          {
            id: "single",
            sessions: 1,
            price: singlePrice,
            pricePerSession: singlePrice,
            features: [
              settings.single_session_description || "מפגש אחד של 90 דקות",
              "תיאום מיידי",
              "ליווי אישי מלא",
            ],
          },
          {
            id: "package_4",
            sessions: 4,
            price: packagePrice,
            pricePerSession,
            savings,
            recommended: true,
            originalPrice: singlePrice * 4,
            features: [
              "🎁 המפגש הראשון - עלינו!",
              "3 מפגשי המשך של 90 דק' כ\"א",
              "ליווי מתמשך לאורך כל התהליך",
              "ליווי בוואטסאפ בין המפגשים",
              "הקלטת המפגשים",
              "תרגילים מותאמים אישית",
            ],
          },
        ]);
      }
      setLoading(false);
    };

    fetchPricing();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Feature comparison data
  const comparisonFeatures = [
    { name: "משך מפגש", single: "90 דק'", package: "90 דק'" },
    { name: "ליווי בוואטסאפ", single: false, package: true },
    { name: "הקלטת המפגש", single: false, package: true },
    { name: "תרגילים מותאמים", single: true, package: true },
    { name: "מעקב התקדמות", single: false, package: true },
  ];

  return (
    <>
      <CountdownTimer />
      <div className="grid md:grid-cols-2 gap-6 mt-8" dir="rtl">
        {pricingOptions.map((option) => (
          <div
            key={option.id}
            className={`glass-panel p-4 md:p-8 relative group transition-all duration-300 ${
              option.recommended
                ? "border-primary/60 cyber-border scale-[1.02] md:scale-105"
                : "hover:border-primary/30"
            }`}
          >
            {option.recommended && (
              <div className="absolute -top-4 right-4 md:right-6 flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground cyber-glow text-xs md:text-sm px-3 py-1 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  הכי פופולרי
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-center mb-4 md:mb-6">
              {option.sessions === 1 ? (
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              ) : (
                <Package className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
              {option.sessions === 1 ? "מפגש בודד" : "3 מפגשים + 1 במתנה 🎁"}
            </h3>

            <div className="text-center mb-6">
              {option.originalPrice && (
                <div className="text-muted-foreground line-through text-lg mb-1">
                  ₪{option.originalPrice}
                </div>
              )}
              <div className="text-5xl font-black cyber-glow mb-2">
                ₪{option.price}
              </div>
              {option.recommended && (
                <div className="inline-block bg-gradient-to-r from-accent/30 via-accent/50 to-accent/30 bg-[length:200%_100%] text-accent text-sm font-bold px-4 py-1.5 rounded-full animate-gift-bounce shadow-lg shadow-accent/20 border border-accent/40">
                  🎁 המפגש הראשון עלינו!
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {option.features.map((feature, index) => (
                <li key={index} className="flex items-start text-muted-foreground">
                  <span className="text-primary ml-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setSelectedPackage(option)}
              className={`w-full ${
                option.recommended
                  ? "bg-primary text-primary-foreground hover:bg-primary-glow pulse-glow"
                  : ""
              }`}
              size="lg"
            >
              {option.recommended && <Sparkles className="w-4 h-4 ml-2" />}
              {option.recommended ? "התחל עכשיו" : "בחר חבילה זו"}
            </Button>

            {option.recommended && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                💳 תשלום אחד פשוט - המפגש הראשון במתנה
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12 glass-panel p-6 rounded-xl overflow-hidden" dir="rtl">
        <h4 className="text-lg md:text-xl font-bold text-center mb-6 cyber-glow">השוואת חבילות</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/30">
                <th className="py-3 px-4 text-right font-semibold text-muted-foreground">תכונה</th>
                <th className="py-3 px-4 text-center font-semibold text-muted-foreground">מפגש בודד</th>
                <th className="py-3 px-4 text-center font-semibold text-primary">חבילת 4</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index} className="border-b border-primary/10">
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

      <CheckoutDialog
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageData={selectedPackage}
      />
    </>
  );
};

export default PricingCards;
