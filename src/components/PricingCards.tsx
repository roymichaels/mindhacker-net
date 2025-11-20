import { useState, useEffect } from "react";
import { Calendar, Package, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CheckoutDialog from "./CheckoutDialog";
import { supabase } from "@/integrations/supabase/client";

interface PricingOption {
  id: "single" | "package_4";
  sessions: number;
  price: number;
  pricePerSession: number;
  savings?: number;
  recommended?: boolean;
  features: string[];
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
            features: [
              settings.package_session_description || "4 מפגשים של 90 דקות כל אחד",
              `₪${pricePerSession} למפגש (חיסכון של ₪${savings}!)`,
              "ליווי מתמשך",
              "גמישות בתיאום",
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

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mt-12" dir="rtl">
        {pricingOptions.map((option) => (
          <div
            key={option.id}
            className={`glass-panel p-4 md:p-8 relative group transition-all duration-300 ${
              option.recommended
                ? "border-primary/50 cyber-border"
                : "hover:border-primary/30"
            }`}
          >
            {option.recommended && (
              <Badge className="absolute -top-3 right-4 md:right-6 bg-primary text-primary-foreground cyber-glow text-xs md:text-sm">
                <Sparkles className="w-3 h-3 ml-1" />
                מומלץ ביותר
              </Badge>
            )}

            <div className="flex items-center justify-center mb-4 md:mb-6">
              {option.sessions === 1 ? (
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              ) : (
                <Package className="w-10 h-10 md:w-12 md:h-12 text-primary" />
              )}
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-center mb-2">
              {option.sessions === 1 ? "מפגש בודד" : "חבילת 4 מפגשים"}
            </h3>

            <div className="text-center mb-6">
              <div className="text-5xl font-black cyber-glow mb-2">
                ₪{option.price}
              </div>
              {option.savings && (
                <div className="text-accent text-sm font-medium">
                  חסוך ₪{option.savings}
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
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
              size="lg"
            >
              בחר חבילה זו
            </Button>
          </div>
        ))}
      </div>

      <CheckoutDialog
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageData={selectedPackage}
      />
    </>
  );
};

export default PricingCards;
