import { useRef, useState, useEffect } from "react";

const HowSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: '100px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
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
    <section ref={sectionRef} id="how" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-3xl md:text-5xl font-black mb-8 md:mb-16 text-center cyber-glow ${isVisible ? 'animate-fade-in-up' : ''}`}>
          איך זה עובד?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`glass-panel p-6 md:p-10 relative overflow-hidden group hover:scale-105 transition-all duration-300 hover-lift hover-glow ${
                isVisible ? 'animate-fade-in-up' : ''
              }`}
              style={{ animationDelay: `${0.1 + index * 0.15}s` }}
            >
              <div className="absolute top-3 right-3 md:top-4 md:right-4 text-5xl md:text-7xl font-black text-primary/10 group-hover:text-primary/20 transition-all duration-300 group-hover:scale-110">
                {step.number}
              </div>
              <div className="relative">
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">
                  {step.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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

        <div className={`text-center mt-8 md:mt-12 ${isVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.5s' }}>
          <p className="text-lg md:text-xl text-secondary font-medium">
            תוצאות מורגשות מהמפגש הראשון.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowSection;
