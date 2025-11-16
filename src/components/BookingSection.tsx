import PricingCards from "./PricingCards";

const BookingSection = () => {

  return (
    <section id="pricing" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-center cyber-glow">
            תכנת את המציאות שלך.
          </h2>

          <p className="text-center text-base md:text-xl text-muted-foreground mb-4">
            בחר את החבילה המתאימה לך
          </p>

          <PricingCards />

          <div className="text-center mt-8 space-y-2">
            <p className="text-lg font-semibold cyber-glow">
              השקעה בעצמך היא ההשקעה הטובה ביותר
            </p>
            <p className="text-sm text-muted-foreground">
              💳 התשלום יתבצע לאחר הפגישה הראשונה דרך PayPal או העברה בנקאית
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
