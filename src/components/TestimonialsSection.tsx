import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "שרה כהן",
    role: "יזמת ומנהלת",
    image: "https://i.pravatar.cc/150?img=1",
    quote: "אחרי שלושה מפגשים הרגשתי שינוי עמוק. זה לא טיפול רגיל - זה ממש עדכון תודעתי. דין יודע איך לגעת בנקודות הנכונות.",
    initials: "ש"
  },
  {
    name: "יונתן לוי",
    role: "מפתח תוכנה",
    image: "https://i.pravatar.cc/150?img=12",
    quote: "כמו למחוק קוד ישן ולהריץ גרסה חדשה. הגישה של דין משלבת טכנולוגיה עם עומק רוחני בצורה שעובדת ממש.",
    initials: "י"
  },
  {
    name: "מיכל ברק",
    role: "מעצבת UI/UX",
    image: "https://i.pravatar.cc/150?img=5",
    quote: "ההיפנוזה המודעת שינתה לי את האמונות הכי עמוקות על עצמי. תוצאות מהירות, תהליך עדין, שינוי אמיתי.",
    initials: "מ"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-6 cyber-glow">
            קולות מתוך המטריקס
          </h2>
          <p className="text-xl text-muted-foreground">
            אנשים שבחרו לשכתב את הקוד שלהם
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="glass-panel border-primary/30 hover:border-primary/60 transition-all duration-500 cyber-border"
            >
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-primary opacity-50" />
                  
                  {/* Avatar */}
                  <Avatar className="w-20 h-20 border-2 border-primary/50">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Quote */}
                  <p className="text-lg leading-relaxed text-foreground/90 italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Divider */}
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

                  {/* Name & Role */}
                  <div>
                    <p className="font-bold text-xl text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-secondary">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <div className="w-8 h-px bg-primary/30" />
            <span>תוצאות אמיתיות · שינוי מודע</span>
            <div className="w-8 h-px bg-primary/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;