import { Code2, Sparkles, Zap } from "lucide-react";

const WhatSection = () => {
  const features = [
    { icon: Code2, label: "קוד פנימי" },
    { icon: Sparkles, label: "תודעה מורחבת" },
    { icon: Zap, label: "שינוי מיידי" },
  ];

  return (
    <section id="what" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 text-center cyber-glow">
            מה זה אימון תודעתי?
          </h2>

          <div className="text-center mb-8 md:mb-12">
            <p className="text-lg md:text-2xl leading-relaxed text-foreground mb-4 md:mb-6">
              התודעה שלך היא מערכת הפעלה.
            </p>
            <p className="text-base md:text-xl leading-relaxed text-muted-foreground">
              אימון תודעתי הוא עדכון גרסה — שינוי קוד פנימי, שכתוב הרגלים, פתיחת גישה לחופש אמיתי.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-panel p-6 md:p-8 text-center group hover:scale-105 transition-all duration-300 cyber-border"
                >
                  <Icon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-primary group-hover:text-primary-glow transition-colors" />
                  <p className="text-base md:text-lg font-medium text-foreground">{feature.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatSection;
