
import { Button } from "@/components/ui/button";
import { Search, MapPin, Calendar, Users, Smartphone, TrendingUp } from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { AboutUsSection } from "@/components/AboutUsSection";
import { BarbersTeamSection } from "@/components/BarbersTeamSection";
import { ContactSection } from "@/components/ContactSection";
import { ServicesSection } from "@/components/ServicesSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { NavigationBar } from "@/components/NavigationBar";
import { ChairSection } from "@/components/ChairSection";
import { ShopStoriesSection } from "@/components/ShopStoriesSection";
import { BarbersBusinessSection } from "@/components/BarbersBusinessSection";
import { GetPaidFastSection } from "@/components/GetPaidFastSection";
import { MobileAppShowcaseSection } from "@/components/MobileAppShowcaseSection";
import { FeaturedBarbersSection } from "@/components/FeaturedBarbersSection";
import { Footer } from "@/components/Footer";
import { SmoothScroll, ScrollProgress } from "@/components/animations/SmoothScroll";
import { FloatingElement } from "@/components/animations/ParallaxEffect";
import { ScrollReveal, StaggerContainer } from "@/components/animations/ScrollReveal";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileViewportMeta, MobileOptimizedContainer } from "@/components/MobileResponsive";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading delay for a smooth intro animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SmoothScroll>
      <MobileViewportMeta />
      <ScrollProgress />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="font-['Lato'] text-6xl font-light tracking-[0.3em] text-orange-400 uppercase relative z-10 transform -rotate-2 pr-1">
                A M A I
              </div>
              <div className="font-['Lato'] text-sm font-light uppercase tracking-[0.3em] text-white transform translate-y-1 pl-1 border-l-2 border-orange-400">
                MEN'S CARE
              </div>
              <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-full blur-xl animate-pulse" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <div className="min-h-screen bg-black text-white overflow-hidden">
        <NavigationBar />
        
        <ScrollReveal>
          <HeroSection />
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <AboutUsSection />
        </ScrollReveal>
        
        <ScrollReveal direction="right" delay={0.3}>
          <ServicesSection />
        </ScrollReveal>
        
        <ScrollReveal direction="left" delay={0.3}>
          <BarbersTeamSection />
        </ScrollReveal>
        
        <ScrollReveal direction="left" delay={0.2}>
          <MobileAppShowcaseSection />
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <FeaturesSection />
        </ScrollReveal>
        
        <ScrollReveal direction="up" delay={0.2}>
          <ContactSection />
        </ScrollReveal>
        
        <ScrollReveal direction="up">
          <Footer />
        </ScrollReveal>
        
        {/* Floating decorative elements */}
        <div className="fixed -bottom-32 -left-32 w-64 h-64 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none z-0" />
        <FloatingElement 
          direction="random" 
          amplitude={50} 
          duration={20} 
          className="fixed top-1/4 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none z-0"
        >
          <div className="w-full h-full" />
        </FloatingElement>
        <FloatingElement 
          direction="circular" 
          amplitude={40} 
          duration={25} 
          className="fixed -bottom-20 right-1/4 w-64 h-64 rounded-full bg-pink-600/10 blur-[100px] pointer-events-none z-0"
        >
          <div className="w-full h-full" />
        </FloatingElement>
      </div>
    </SmoothScroll>
  );
};

export default Index;
