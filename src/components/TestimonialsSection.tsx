import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  avatar_url: string | null;
  initials: string | null;
}

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .limit(6);

      if (!error && data) {
        setTestimonials(data);
      }
      setLoading(false);
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="relative py-32 px-4" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }
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
                    <AvatarImage src={testimonial.avatar_url || undefined} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                      {testimonial.initials || testimonial.name.charAt(0)}
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