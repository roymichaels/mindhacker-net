import { useEffect } from "react";

const BookingSection = () => {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="booking" className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-12">
          <h2 className="text-5xl font-black mb-6 text-center cyber-glow">
            תכנת את המציאות שלך.
          </h2>

          <p className="text-center text-xl text-muted-foreground mb-12">
            בחר מועד נוח ונתחיל את המסע
          </p>

          {/* Calendly inline widget */}
          <div 
            className="calendly-inline-widget rounded-2xl overflow-hidden border border-primary/30"
            data-url="https://calendly.com/your-link-here?hide_gdpr_banner=1&background_color=0a1420&text_color=ffffff&primary_color=00f0ff"
            style={{ minWidth: "320px", height: "700px" }}
          />

          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>תשלום מאובטח · ביטול עד 24 שעות מראש</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
