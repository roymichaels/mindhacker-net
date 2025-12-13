import PersonalQuote from "./PersonalQuote";
import LeadCaptureDialog from "./LeadCaptureDialog";
import { Phone, CheckCircle, Clock, Heart } from "lucide-react";

const BookingSection = () => {
  return (
    <section id="pricing" className="relative py-16 md:py-32 px-4" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto">
        <div className="glass-panel p-6 md:p-12">
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-center cyber-glow">
            רוצה לדעת אם אני יכול לעזור לך?
          </h2>

          <p className="text-center text-base md:text-xl text-muted-foreground mb-2">
            הצעד הראשון הוא שיחת היכרות קצרה - בלי התחייבות
          </p>

          {/* Personal Quote */}
          <PersonalQuote 
            settingKey="pricing_personal_quote" 
            defaultQuote="אני כאן כדי ללוות אותך בכל צעד"
            className="mb-6"
          />

          {/* Benefits of the consultation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 justify-center text-center">
              <Clock className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm text-muted-foreground">30 דקות שיחה</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-center">
              <Heart className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm text-muted-foreground">נבדוק התאמה הדדית</span>
            </div>
            <div className="flex items-center gap-3 justify-center text-center">
              <CheckCircle className="w-5 h-5 text-secondary shrink-0" />
              <span className="text-sm text-muted-foreground">100% בחינם וללא התחייבות</span>
            </div>
          </div>

          {/* Main CTA */}
          <div className="flex justify-center mb-8">
            <LeadCaptureDialog 
              source="pricing_section"
              triggerText="קבע שיחת היכרות בחינם"
              triggerVariant="default"
              triggerClassName="bg-primary hover:bg-primary-glow text-primary-foreground font-bold text-lg px-10 py-7 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3 shadow-lg shadow-primary/30"
              triggerIcon={<Phone className="w-6 h-6" />}
              showPreferredTime
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold cyber-glow">
              אני בררן לגבי הלקוחות שלי
            </p>
            <p className="text-sm text-muted-foreground">
              לא כל אחד מתאים לתהליך הזה — ולא אני לכל אחד. נדבר קודם ונראה אם זה בכלל נכון לנו.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
