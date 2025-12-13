import PricingCards from "./PricingCards";
import PersonalQuote from "./PersonalQuote";

const BookingSection = () => {
  return (
    <section id="pricing" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-center cyber-glow">
            בוא נתכנת את המציאות שלך.
          </h2>

          <p className="text-center text-base md:text-xl text-muted-foreground mb-2">
            בחר את החבילה המתאימה לך
          </p>

          {/* Personal Quote */}
          <PersonalQuote 
            settingKey="pricing_personal_quote" 
            defaultQuote="אני כאן כדי ללוות אותך בכל צעד"
            className="mb-6"
          />

          <PricingCards />

          <div className="text-center mt-8 space-y-2">
            <p className="text-lg font-semibold cyber-glow">
              אני בררן לגבי הלקוחות שלי
            </p>
            <p className="text-sm text-muted-foreground">
              לא ניתן לרכוש ישירות - נדבר קודם ונוודא שזה מתאים לך
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
