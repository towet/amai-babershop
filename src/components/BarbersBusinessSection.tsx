
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, DollarSign, Users, BarChart, Star, Camera, ChevronRight } from "lucide-react";

export const BarbersBusinessSection = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Management features data
  const features = [
    { 
      id: 1, 
      icon: <Users className="w-5 h-5" />, 
      title: "Barber Management", 
      description: "Track performance metrics for each barber, including appointments vs. walk-ins, total haircuts, and real-time commission calculations."
    },
    { 
      id: 2, 
      icon: <Calendar className="w-5 h-5" />, 
      title: "Appointment System", 
      description: "Comprehensive system that manages bookings, walk-ins, waiting lists, and sends automatic notifications to clients and barbers."
    },
    { 
      id: 3, 
      icon: <DollarSign className="w-5 h-5" />, 
      title: "Commission Control", 
      description: "Set custom commission rates per barber, service type, or client. Automatically calculate payouts and generate payment reports."
    },
    { 
      id: 4, 
      icon: <BarChart className="w-5 h-5" />, 
      title: "Performance Dashboard", 
      description: "Access detailed reports showing revenue trends, service popularity, peak hours, and individual barber performance metrics."
    }
  ];
  
  // Management app screenshots for the interactive phone mockup
  const appScreens = [
    { 
      id: 1,
      name: "Barber Performance",
      image: "https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?q=80&w=2564&auto=format&fit=crop",
      icon: <Users className="w-4 h-4" />
    },
    { 
      id: 2,
      name: "Appointment Board",
      image: "https://images.unsplash.com/photo-1565618754118-fdd47bbf2a41?q=80&w=2574&auto=format&fit=crop",
      icon: <Calendar className="w-4 h-4" />
    },
    { 
      id: 3,
      name: "Commission Setup",
      image: "https://images.unsplash.com/photo-1597954554095-a25c5656d280?q=80&w=2575&auto=format&fit=crop",
      icon: <DollarSign className="w-4 h-4" />
    },
    { 
      id: 4,
      name: "Admin Dashboard",
      image: "https://images.unsplash.com/photo-1621607430093-a83321567465?q=80&w=2574&auto=format&fit=crop",
      icon: <BarChart className="w-4 h-4" />
    }
  ];
  
  // Platform icons with proper names and designs
  const platforms = [
    { id: 1, name: "Windows", color: "bg-blue-600", letter: "W" },
    { id: 2, name: "Web App", color: "bg-blue-500", letter: "W" },
    { id: 3, name: "Google", color: "bg-red-500", letter: "G" },
    { id: 4, name: "App Store", color: "bg-green-500", content: "99+" },
    { id: 5, name: "Firebase", color: "bg-orange-500", content: "6" }
  ];
  
  // Auto-rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageContainerRef.current || !hovered) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };
  
  // Parallax effect for background elements
  const handleSectionMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    const elements = document.querySelectorAll('.parallax-element');
    elements.forEach(el => {
      const speedX = parseFloat(el.getAttribute('data-speed-x') || '0');
      const speedY = parseFloat(el.getAttribute('data-speed-y') || '0');
      
      (el as HTMLElement).style.transform = `translate(${x * speedX}px, ${y * speedY}px)`;
    });
  };

  return (
    <section
      id="barbers-business"
      ref={sectionRef}
      className="py-24 px-4 sm:px-6 md:px-8 bg-black relative overflow-hidden"
      onMouseMove={handleSectionMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="parallax-element absolute top-20 left-[10%] w-96 h-96 rounded-full bg-blue-600/5 blur-[80px] animate-float-slow" data-speed-x="30" data-speed-y="20"></div>
        <div className="parallax-element absolute bottom-40 right-[10%] w-80 h-80 rounded-full bg-indigo-600/5 blur-[100px] animate-float" data-speed-x="-40" data-speed-y="-20"></div>
        <div className="parallax-element absolute top-[40%] right-[30%] w-4 h-4 rounded-full bg-blue-400 opacity-20 animate-pulse-slow" data-speed-x="-10" data-speed-y="50"></div>
        <div className="parallax-element absolute top-[30%] left-[20%] w-3 h-3 rounded-full bg-indigo-400 opacity-30 animate-pulse-slow" data-speed-x="60" data-speed-y="-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left side - Interactive image mockups (5 columns on large screens) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div 
              ref={imageContainerRef}
              className="relative mx-auto max-w-[280px] sm:max-w-xs md:max-w-md"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* Phone frame with 3D effect */}
              <motion.div 
                className="relative z-20 transform transition-all duration-200 ease-out"
                animate={{
                  rotateY: hovered ? mousePosition.x * 10 : 0,
                  rotateX: hovered ? -mousePosition.y * 10 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {/* Phone mockup */}
                <div className="relative mx-auto w-[200px] sm:w-[220px] md:w-[240px] lg:w-[260px] h-[400px] sm:h-[440px] md:h-[480px] lg:h-[500px] rounded-[30px] sm:rounded-[36px] bg-gradient-to-b from-gray-800 to-gray-900 p-1 shadow-2xl overflow-hidden">
                  {/* Inner border */}
                  <div className="absolute inset-0 rounded-[35px] border border-gray-700 overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>
                    
                    {/* Screen content */}
                    <div className="relative h-full w-full bg-gradient-to-b from-gray-900 to-black overflow-hidden">
                      {/* Status bar */}
                      <div className="relative z-10 flex justify-between items-center px-4 h-8 bg-black/40 backdrop-blur-sm">
                        <div className="text-white text-xs">9:41</div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                      
                      {/* App header */}
                      <div className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/60 backdrop-blur-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                          <span className="text-white text-sm font-medium">AMAI Business</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Background image (changes based on active feature) */}
                      <div className="absolute inset-0 z-0 opacity-20 transition-opacity duration-500">
                        <img 
                          src={appScreens[activeFeature % appScreens.length].image}
                          alt="App background"
                          className="w-full h-full object-cover transition-transform duration-700 ease-out transform scale-110"
                        />
                      </div>
                      
                      {/* Main content */}
                      <div className="relative z-10 p-4 h-full">
                        <div className="mb-4">
                          <h3 className="text-white text-lg font-bold">
                            {features[activeFeature].title}
                          </h3>
                          <p className="text-gray-400 text-xs mt-1">
                            {appScreens[activeFeature % appScreens.length].name} View
                          </p>
                        </div>
                        
                        {/* Feature specific UI */}
                        <div className="rounded-xl bg-white/5 backdrop-blur-sm p-3 border border-white/10 mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 flex items-center justify-center">
                              {appScreens[activeFeature % appScreens.length].icon}
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{features[activeFeature].title}</div>
                              <div className="text-gray-400 text-xs">Active feature</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Feature cards */}
                        <div className="space-y-2">
                          {features.map((feature, index) => (
                            <div 
                              key={feature.id}
                              className={`rounded-lg p-3 transition-all duration-300 ${activeFeature === index ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
                              onClick={() => setActiveFeature(index)}
                            >
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${activeFeature === index ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-800'}`}>
                                  {feature.icon}
                                </div>
                                <div className="flex-grow">
                                  <div className="text-white text-xs">{feature.title}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around phone */}
                <div className="absolute -bottom-4 sm:-bottom-5 md:-bottom-6 -right-8 sm:-right-10 md:-right-12 z-10 transform rotate-12">
                  <motion.div 
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20, rotate: -5 }}
                    animate={{ opacity: 1, y: 0, rotate: 5 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ perspective: '1000px' }}
                  >
                    <div className="h-full w-full bg-gray-900 rounded-2xl p-2 flex flex-col items-center justify-center">
                      <BarChart className="text-blue-400 w-6 h-6 mb-1" />
                      <div className="text-white text-[8px] font-medium">Analytics</div>
                    </div>
                  </motion.div>
                </div>
                
                <div className="absolute -top-6 sm:-top-8 md:-top-10 -left-8 sm:-left-10 md:-left-14 z-10 transform -rotate-6">
                  <motion.div 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 lg:w-24 lg:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-0.5 shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: -20, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: -8 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{ perspective: '1000px' }}
                  >
                    <div className="h-full w-full bg-gray-900 rounded-full flex items-center justify-center">
                      <Calendar className="text-blue-400 w-6 h-6" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Right side - Text content (7 columns on large screens) */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-6">
              <motion.h2 
                className="font-['Bebas_Neue'] text-6xl md:text-7xl tracking-tight leading-none mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">COMPLETE</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">MANAGEMENT SYSTEM</span>
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-300 max-w-2xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Streamline your barbershop operations with powerful tools for tracking barbers, appointments, walk-ins, and commissions. Get detailed reports and give your barbers personalized access to their schedules and performance data.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button className="group bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-6 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] mt-4">
                  <span>Get Your Shop on Amari</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
            
            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  className={`rounded-xl p-4 cursor-pointer transition-all duration-300 border ${activeFeature === index ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/40 shadow-lg' : 'bg-gray-900/50 border-gray-800 hover:bg-gray-900/80'}`}
                  onClick={() => setActiveFeature(index)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${activeFeature === index ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-gray-800'}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Platform availability with enhanced design */}
            <motion.div 
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="text-gray-400 text-sm mb-3">Available on</div>
              <div className="flex flex-wrap items-center gap-3">
                {platforms.map(platform => (
                  <motion.div 
                    key={platform.id}
                    className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-200`}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-white font-bold text-xs">{platform.letter || platform.content}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
