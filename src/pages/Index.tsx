import MatrixRain from "@/components/MatrixRain";
import HeroSection from "@/components/HeroSection";
import WhatSection from "@/components/WhatSection";
import HowSection from "@/components/HowSection";
import BookingSection from "@/components/BookingSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen">
      {/* Matrix rain background effect */}
      <MatrixRain />
      
      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.02)_50%)] bg-[length:100%_4px] opacity-30" style={{ zIndex: 1 }} />
      
      {/* Main content */}
      <main className="relative">
        <HeroSection />
        <WhatSection />
        <HowSection />
        <BookingSection />
        <AboutSection />
        <TestimonialsSection />
        <FAQSection />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
