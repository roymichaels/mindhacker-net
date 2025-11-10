const HowSection = () => {
  const steps = [
    {
      number: "01",
      title: "שיחה ראשונית",
      description: "להבין את הקוד שלך.",
    },
    {
      number: "02",
      title: "סשן היפנוזה מודעת",
      description: "כניסה לתכנות עמוק.",
    },
    {
      number: "03",
      title: "תרגול יומי קצר",
      description: "מייצב את השינוי.",
    },
  ];

  return (
    <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-black mb-16 text-center cyber-glow">
          איך זה עובד?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="glass-panel p-10 relative overflow-hidden group hover:scale-105 transition-all duration-300"
            >
              <div className="absolute top-4 right-4 text-7xl font-black text-primary/10 group-hover:text-primary/20 transition-colors">
                {step.number}
              </div>
              <div className="relative">
                <h3 className="text-2xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -left-4 w-8 h-px bg-primary/50" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-xl text-secondary font-medium">
            תוצאות מורגשות מהמפגש הראשון.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowSection;
