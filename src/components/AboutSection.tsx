import { User } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-12">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center cyber-border">
              <User className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-5xl font-black mb-8 text-center cyber-glow">
            מי עומד מאחורי הקוד?
          </h2>

          <div className="text-center space-y-6">
            <p className="text-2xl font-bold text-foreground">
              רוי מיכאלס
            </p>
            
            <p className="text-xl leading-relaxed text-muted-foreground">
              מאמן תודעתי, יוצר שיטות פרקטיות לשינוי תת-מודע, המשלבות היפנוזה מודעת, דמיון מודרך ו־Reframe.
            </p>

            <p className="text-lg text-secondary font-medium">
              לא טיפול, אלא חוויית תכנות תודעה.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
