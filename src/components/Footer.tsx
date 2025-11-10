import { Instagram, Send, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative py-20 px-4 border-t border-primary/20" style={{ zIndex: 2 }}>
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-3xl font-black mb-8 cyber-glow">
          הקוד שלך מחכה שתפעיל אותו.
        </p>

        <div className="flex justify-center gap-8 mb-12">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
          >
            <Instagram className="w-8 h-8 text-primary group-hover:text-primary-glow transition-colors" />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
          >
            <Send className="w-8 h-8 text-primary group-hover:text-primary-glow transition-colors" />
          </a>
          <a
            href="mailto:contact@consciousness-hacker.com"
            className="w-16 h-16 rounded-full glass-panel flex items-center justify-center hover:scale-110 transition-all duration-300 cyber-border group"
          >
            <Mail className="w-8 h-8 text-primary group-hover:text-primary-glow transition-colors" />
          </a>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>© 2025 האקר תודעה. כל הזכויות שמורות.</p>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "0s" }} />
        <div className="absolute top-20 right-20 w-2 h-2 bg-secondary rounded-full animate-ping" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-primary-glow rounded-full animate-ping" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: "3s" }} />
      </div>
    </footer>
  );
};

export default Footer;
