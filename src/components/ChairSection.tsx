
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Search, MapPin, Users, Calendar, User } from "lucide-react";
import { BookingModal } from "./BookingModal";

export const ChairSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const deviceRef = useRef<HTMLDivElement>(null);
  
  // Auto-rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 3D floating effect for the device
  useEffect(() => {
    const device = deviceRef.current;
    if (!device) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;
      
      const rect = device.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / 15;
      const moveY = (y - centerY) / 15;
      
      device.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateX(${-moveY/2}deg) rotateY(${moveX/2}deg)`;
    };
    
    const handleMouseLeave = () => {
      device.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0)';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    device.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      device.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered]);
  
  const featuresData = [
    { id: 0, icon: <Calendar className="w-4 h-4" />, label: "Book appointment" },
    { id: 1, icon: <User className="w-4 h-4" />, label: "Choose your barber" },
    { id: 2, icon: <Users className="w-4 h-4" />, label: "Style specialists" },
    { id: 3, icon: <MapPin className="w-4 h-4" />, label: "Shop location" }
  ];

  return (
    <section className="py-24 px-6 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] animate-float-slow"></div>
        <div className="absolute bottom-[10%] left-[15%] w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] animate-float"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content - Text and CTA */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="font-['Bebas_Neue'] text-6xl lg:text-7xl leading-none tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">BOOK YOUR</span>
                <span className="block mt-1 relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">CHAIR SESSION</span>
                  <span className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></span>
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Reserve your spot with our expert barbers who specialize in your preferred style. Choose your barber, select your service, and book your appointment in seconds.
              </p>
              
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 rounded-full flex items-center gap-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] mt-4"
              >
                <span>Book appointment</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Feature bullets */}
            <div className="pt-6 space-y-3">
              {featuresData.map((feature, index) => (
                <div 
                  key={feature.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${activeFeature === index ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30' : 'hover:bg-white/5'}`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeFeature === index ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-800'}`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <div className="text-white font-medium">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right content - Interactive device mockup */}
          <div 
            className="relative max-w-md mx-auto lg:ml-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Device container with 3D effects */}
            <div 
              ref={deviceRef} 
              className="relative transition-all duration-300 ease-out"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              {/* Orange gradient background */}
              <div className="absolute -inset-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-[32px] shadow-lg transform rotate-2"></div>
              
              {/* Device frame */}
              <div className="relative bg-black/30 backdrop-blur-md rounded-[24px] p-4 shadow-inner overflow-hidden">
                {/* Screen content */}
                <div className="bg-black rounded-[18px] overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] p-5">
                  {/* Main content area */}
                  <div className="space-y-4">
                    {/* Logo and app header */}
                    <div className="bg-black flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        <h3 className="text-white text-sm font-bold">FILL YOUR CHAIR</h3>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Featured content banner */}
                    <div className="relative overflow-hidden rounded-xl h-28 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 rounded-2xl p-6 flex flex-col justify-end">
                        <img 
                          src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1374&auto=format&fit=crop" 
                          alt="Barber working" 
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                        <div>
                          <div className="font-bold text-white text-sm mb-1">PERFECT MATCH</div>
                          <div className="text-white/80 text-xs mb-2">Find barbers who specialize in exactly the style you want</div>
                          <div className="mt-3">
                            <div className="text-[8px] bg-orange-500 text-white px-2 py-0.5 rounded-full flex items-center">
                              <span className="mr-1">Browse Experts</span>
                              <ArrowRight className="w-2 h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Search bar */}
                    <div 
                      className={`bg-white/10 rounded-full p-3 flex items-center space-x-2 transition-all duration-300 ${searchFocused ? 'ring-2 ring-orange-500 bg-white/15' : 'hover:bg-white/15'}`}
                      onClick={() => setSearchFocused(true)}
                      onMouseLeave={() => setSearchFocused(false)}
                    >
                      <Search className="h-4 w-4 text-white/70" />
                      <div className="text-white/70 text-sm">Find available time slots</div>
                    </div>
                    
                    {/* Feature indicators */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {featuresData.map((feature, index) => (
                        <div 
                          key={feature.id}
                          className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${activeFeature === index ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg scale-110' : 'bg-white/10 hover:bg-white/20'}`}
                          onClick={() => setActiveFeature(index)}
                        >
                          <div className="text-white">{feature.icon}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Option chips */}
                    <div className="pt-2">
                      <div className="text-white text-xs font-medium mb-2 text-center">Quick filters</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 p-2 rounded-lg text-center text-white text-xs hover:bg-white/15 cursor-pointer transition-colors duration-300">
                          <div className="flex items-center justify-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Available today</span>
                          </div>
                        </div>
                        <div className="bg-white/10 p-2 rounded-lg text-center text-white text-xs hover:bg-white/15 cursor-pointer transition-colors duration-300">
                          <div className="flex items-center justify-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Top rated barbers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -right-2 -top-3 transform rotate-12 z-10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg animate-float">
                  <div className="w-full h-full bg-black/60 backdrop-blur-sm rounded-[14px] flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="absolute -left-4 bottom-10 transform -rotate-6 z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg animate-float-slow flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </section>
  );
};
