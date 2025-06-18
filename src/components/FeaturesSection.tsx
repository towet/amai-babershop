
import { Scissors, Calendar, TrendingUp, Smartphone, Users, MapPin, ChevronRight, Check, Star } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export const FeaturesSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  
  // Enhanced features data with images and detailed descriptions
  const features = [
    {
      icon: Scissors,
      title: "Expert Barber Selection",
      description: "Choose your preferred barber with confidence based on style specialties and ratings",
      color: "from-amber-500 to-orange-600",
      darkColor: "from-amber-600/20 to-orange-700/20",
      image: "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=1976&auto=format&fit=crop",
      benefits: [
        "Browse barber portfolios",
        "Filter by style expertise",
        "View real client reviews"
      ]
    },
    {
      icon: Calendar,
      title: "Effortless Booking",
      description: "Book your perfect appointment time in seconds, with instant confirmation",
      color: "from-blue-500 to-indigo-600",
      darkColor: "from-blue-600/20 to-indigo-700/20",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop",
      benefits: [
        "60-second booking process",
        "Instant notifications",
        "Easy rescheduling"
      ]
    },
    {
      icon: TrendingUp,
      title: "Wait Time Tracking",
      description: "See real-time shop capacity and get accurate wait time estimates for walk-ins",
      color: "from-green-500 to-emerald-600",
      darkColor: "from-green-600/20 to-emerald-700/20",
      image: "https://images.unsplash.com/photo-1638913662380-9799def8ffb1?q=80&w=2070&auto=format&fit=crop",
      benefits: [
        "Live shop capacity updates",
        "Walk-in wait estimations",
        "Queue position tracking"
      ]
    },
    {
      icon: Smartphone,
      title: "Virtual Check-in",
      description: "Check in from anywhere and get notified when your barber is ready for you",
      color: "from-purple-500 to-violet-600",
      darkColor: "from-purple-600/20 to-violet-700/20",
      image: "https://images.unsplash.com/photo-1579412692838-4207759f2e2c?q=80&w=1965&auto=format&fit=crop",
      benefits: [
        "Remote check-in",
        "Push notifications",
        "Arrive just in time"
      ]
    },
    {
      icon: Users,
      title: "Style Preferences",
      description: "Store your haircut preferences and photos for consistent results every visit",
      color: "from-pink-500 to-rose-600",
      darkColor: "from-pink-600/20 to-rose-700/20",
      image: "https://images.unsplash.com/photo-1534959174178-4b71ef87bef8?q=80&w=1974&auto=format&fit=crop",
      benefits: [
        "Photo gallery of past cuts",
        "Detailed style notes",
        "Barber access to history"
      ]
    },
    {
      icon: MapPin,
      title: "Shop Discovery",
      description: "Find the perfect barbershop near you with detailed filters and authentic reviews",
      color: "from-red-500 to-orange-600",
      darkColor: "from-red-600/20 to-orange-700/20",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=1780&auto=format&fit=crop",
      benefits: [
        "Distance-based search",
        "Style specialization filters",
        "Verified client reviews"
      ]
    }
  ];
  
  // Auto rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Parallax effect for background elements
  const handleSectionMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
    
    const elements = document.querySelectorAll('.parallax-element');
    elements.forEach(el => {
      const speedX = parseFloat(el.getAttribute('data-speed-x') || '0');
      const speedY = parseFloat(el.getAttribute('data-speed-y') || '0');
      
      (el as HTMLElement).style.transform = `translate(${x * speedX}px, ${y * speedY}px)`;
    });
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 bg-gray-900 relative overflow-hidden"
      onMouseMove={handleSectionMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="parallax-element absolute top-20 left-[10%] w-96 h-96 rounded-full bg-orange-600/5 blur-[100px] animate-float-slow" data-speed-x="30" data-speed-y="20"></div>
        <div className="parallax-element absolute bottom-20 right-[15%] w-80 h-80 rounded-full bg-blue-600/5 blur-[100px] animate-float" data-speed-x="-40" data-speed-y="-20"></div>
        <div className="parallax-element absolute top-[40%] right-[30%] w-64 h-64 rounded-full bg-purple-600/5 blur-[80px] animate-pulse-slow" data-speed-x="-10" data-speed-y="50"></div>
        
        {/* Decorative shapes */}
        <div className="parallax-element absolute top-40 left-[20%] w-8 h-8 rounded-md bg-orange-500/10 rotate-12" data-speed-x="60" data-speed-y="-30"></div>
        <div className="parallax-element absolute bottom-[30%] right-[25%] w-6 h-6 rounded-full bg-blue-500/10" data-speed-x="-20" data-speed-y="-40"></div>
        <div className="parallax-element absolute top-[35%] left-[30%] w-4 h-4 rounded-full bg-purple-500/10" data-speed-x="40" data-speed-y="60"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with animated elements */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-['Bebas_Neue'] text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Your Perfect Haircut</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 relative">
                Experience
                <motion.span 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-orange-500 to-amber-500"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                ></motion.span>
              </span>
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            From finding the right barber to skipping the wait, Amari transforms how you experience your haircut – before, during, and after your appointment.
          </motion.p>
        </motion.div>
        
        {/* Featured main section with large card and image */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          {/* Left side feature cards */}
          <motion.div 
            className="lg:col-span-4 space-y-4 order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className={`rounded-xl p-4 cursor-pointer transition-all duration-300 border ${activeFeature === index ? `bg-gradient-to-br ${feature.darkColor} border-${feature.color.split(' ')[1].replace('to-', '')}-500/40` : 'bg-gray-800/70 hover:bg-gray-800 border-gray-700'}`}
                onClick={() => setActiveFeature(index)}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeFeature === index ? `bg-gradient-to-br ${feature.color} shadow-lg` : 'bg-gray-700'}`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-white font-semibold">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${activeFeature === index ? 'text-white' : 'text-gray-600'} transition-all duration-300`} />
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Center/Right featured content with image and details */}
          <motion.div 
            className="lg:col-span-8 order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              {/* Animated background gradient */}
              <motion.div 
                className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${features[activeFeature].color} blur-sm opacity-30`}
                animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.3, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Main content card */}
              <motion.div 
                className="relative rounded-2xl p-1 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                <div className="flex flex-col md:flex-row rounded-xl overflow-hidden bg-gray-800">
                  {/* Feature image with overlay */}
                  <div className="w-full md:w-1/2 h-48 md:h-auto relative overflow-hidden">
                    {features.map((feature, idx) => (
                      <motion.div 
                        key={idx} 
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeFeature === idx ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/30 z-10" />
                        <img 
                          src={feature.image} 
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                    
                    {/* Featured label */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className={`px-3 py-1 rounded-full text-xs text-white bg-gradient-to-r ${features[activeFeature].color} shadow-lg`}>
                        Featured
                      </div>
                    </div>
                    
                    {/* Icon overlay */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <motion.div 
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${features[activeFeature].color} flex items-center justify-center shadow-lg`}
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {React.createElement(features[activeFeature].icon, { className: "h-8 w-8 text-white" })}
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Feature details */}
                  <div className="w-full md:w-1/2 p-6 lg:p-8">
                    <motion.div 
                      key={activeFeature} // Force re-render on feature change
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="h-full flex flex-col"
                    >
                      <h3 className={`text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${features[activeFeature].color}`}>
                        {features[activeFeature].title}
                      </h3>
                      
                      <p className="text-gray-300 mb-6 flex-grow">
                        {features[activeFeature].description}
                      </p>
                      
                      {/* Benefits list with animations */}
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Key Benefits</h4>
                        {features[activeFeature].benefits.map((benefit, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-r ${features[activeFeature].color}`}>
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-gray-300 text-sm">{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom section removed */}
      </div>
    </section>
  );
};
