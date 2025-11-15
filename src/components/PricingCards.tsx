import { useState } from "react";
import { Calendar, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CheckoutDialog from "./CheckoutDialog";

interface PricingOption {
  id: "single" | "package_4";
  sessions: number;
  price: number;
  pricePerSession: number;
  savings?: number;
  recommended?: boolean;
  features: string[];
}

const pricingOptions: PricingOption[] = [
  {
    id: "single",
    sessions: 1,
    price: 250,
    pricePerSession: 250,
    features: [
      "מפגש אחד של 90 דקות",
      "תיאום מיידי",
      "ליווי אישי מלא",
    ],
  },
  {
    id: "package_4",
    sessions: 4,
    price: 800,
    pricePerSession: 200,
    savings: 200,
    recommended: true,
    features: [
      "4 מפגשים של 90 דקות כל אחד",
      "200₪ למפגש (חיסכון של 200₪!)",
      "ליווי מתמשך",
      "גמישות בתיאום",
    ],
  },
];

const PricingCards = () => {
  const [selectedPackage, setSelectedPackage] = useState<PricingOption | null>(null);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mt-12" dir="rtl">
        {pricingOptions.map((option) => (
          <div
            key={option.id}
            className={`glass-panel p-8 relative group transition-all duration-300 ${
              option.recommended
                ? "border-primary/50 cyber-border"
                : "hover:border-primary/30"
            }`}
          >
            {option.recommended && (
              <Badge className="absolute -top-3 right-6 bg-primary text-primary-foreground cyber-glow">
                <Sparkles className="w-3 h-3 ml-1" />
                מומלץ ביותר
              </Badge>
            )}

            <div className="flex items-center justify-center mb-6">
              {option.sessions === 1 ? (
                <Calendar className="w-12 h-12 text-primary" />
              ) : (
                <Package className="w-12 h-12 text-primary" />
              )}
            </div>

            <h3 className="text-3xl font-bold text-center mb-2">
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

            {option.id === "single" && (
              <div className="text-center mt-4 text-xs text-muted-foreground">
                Demo Mode - לא יתבצע חיוב אמיתי
              </div>
            )}
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
