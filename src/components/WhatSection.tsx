import { Code2, Sparkles, Zap } from "lucide-react";

const WhatSection = () => {
  const features = [
    { icon: Code2, label: "קוד פנימי" },
    { icon: Sparkles, label: "תודעה מורחבת" },
    { icon: Zap, label: "שינוי מיידי" },
  ];

  return (
    <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-12">
          <h2 className="text-5xl font-black mb-8 text-center cyber-glow">
            מה זה אימון תודעתי?
          </h2>

          <div className="text-center mb-12">
            <p className="text-2xl leading-relaxed text-foreground mb-6">
              התודעה שלך היא מערכת הפעלה.
            </p>
            <p className="text-xl leading-relaxed text-muted-foreground">
              אימון תודעתי הוא עדכון גרסה — שינוי קוד פנימי, שכתוב הרגלים, פתיחת גישה לחופש אמיתי.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-panel p-8 text-center group hover:scale-105 transition-all duration-300 cyber-border"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:text-primary-glow transition-colors" />
                  <p className="text-lg font-medium text-foreground">{feature.label}</p>
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
