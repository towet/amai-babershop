
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Search, MapPin, Calendar, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { BookingModal } from "./BookingModal";

export const HeroSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [animateStars, setAnimateStars] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);
  
  // The text to type
  const fullText = "AMAI MEN CARE PREMIUM GROOMING EXPERIENCE";

  const barberProfiles = [
    {
      id: 1,
      name: "James Wilson",
      image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1374&auto=format&fit=crop",
      rating: 4.9,
      distance: "Amai"
    },
    {
      id: 2,
      name: "Alex Rodriguez",
      image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=1374&auto=format&fit=crop",
      rating: 4.8,
      distance: "Amai"
    },
    {
      id: 3,
      name: "Marcus Johnson",
      image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1374&auto=format&fit=crop",
      rating: 5.0,
      distance: "Amai"
    }
  ];

  const barberStyles = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1470&auto=format&fit=crop",
      label: "Fade"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1519421052252-d4de633a4613?q=80&w=1374&auto=format&fit=crop",
      label: "Classic"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=1374&auto=format&fit=crop",
      label: "Modern"
    }
  ];

  useEffect(() => {
    // Rotate through barber profiles
    const interval = setInterval(() => {
      setCurrentProfileIndex(prev => (prev + 1) % barberProfiles.length);
    }, 3000);

    // Animate stars periodically
    const starsInterval = setInterval(() => {
      setAnimateStars(true);
      setTimeout(() => setAnimateStars(false), 2000);
    }, 5000);
    
    // Start typing animation
    let typingTimer: NodeJS.Timeout;
    if (textIndex < fullText.length) {
      typingTimer = setTimeout(() => {
        setTypingText(prev => prev + fullText.charAt(textIndex));
        setTextIndex(prev => prev + 1);
      }, 100); // Control typing speed here
    } else if (textIndex === fullText.length) {
      typingTimer = setTimeout(() => {
        setIsTypingComplete(true);
      }, 500);
    }

    return () => {
      clearInterval(interval);
      clearInterval(starsInterval);
      clearTimeout(typingTimer);
    };
  }, [textIndex, fullText]);

  useEffect(() => {
    // Add 3D tilt effect on mouse move
    const app = appRef.current;
    if (!app) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = app.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const tiltX = (y - centerY) / 20;
      const tiltY = (centerX - x) / 20;
      
      app.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
    };

    const handleMouseLeave = () => {
      app.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    app.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      app.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered]);

  return (
    <section className="pt-32 pb-20 px-6 bg-black relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute top-[40%] right-[40%] w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] animate-float-horizontal"></div>
        
        {/* Small sparkling stars */}
        <div className={`absolute top-[15%] left-[20%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] ${animateStars ? 'scale-[2] opacity-100' : 'scale-[1] opacity-40'} transition-all duration-1000`}></div>
        <div className={`absolute top-[25%] left-[40%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] ${animateStars ? 'scale-[2] opacity-100' : 'scale-[1] opacity-40'} transition-all duration-1000 delay-100`}></div>
        <div className={`absolute top-[10%] right-[30%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] ${animateStars ? 'scale-[2] opacity-100' : 'scale-[1] opacity-40'} transition-all duration-1000 delay-200`}></div>
        <div className={`absolute bottom-[20%] left-[35%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] ${animateStars ? 'scale-[2] opacity-100' : 'scale-[1] opacity-40'} transition-all duration-1000 delay-300`}></div>
        <div className={`absolute bottom-[30%] right-[25%] w-1 h-1 bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] ${animateStars ? 'scale-[2] opacity-100' : 'scale-[1] opacity-40'} transition-all duration-1000 delay-400`}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Text and CTA */}
          <div className="space-y-10">
            <div className="group inline-flex items-center space-x-2 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 rounded-full px-5 py-2.5 text-sm border border-purple-500/30 cursor-pointer hover:bg-gradient-to-r hover:from-purple-800/40 hover:to-indigo-800/40 hover:border-purple-500/50 transition-all duration-300">
              <Sparkles className="h-4 w-4 text-purple-300 group-hover:text-purple-200 transition-all duration-300 mr-1" />
              <span className="text-purple-300 group-hover:text-purple-200 transition-colors duration-300">Book in 60 seconds</span>
              <ArrowRight className="h-4 w-4 text-purple-300 group-hover:text-purple-200 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            
            <div className="space-y-8">
              <h1 className="font-['Bebas_Neue'] text-6xl lg:text-8xl leading-none tracking-tight">
                {!isTypingComplete ? (
                  <div className="relative">
                    <div className="relative">
                      {/* Format the different parts of the text with appropriate colors */}
                      {typingText.includes('AMAI') && (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                          {typingText.substring(0, 'AMAI'.length)}
                        </span>
                      )}
                      
                      {typingText.length > 'AMAI'.length && typingText.includes("MEN'S CARE") && (
                        <span className="relative ml-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                          {typingText.substring('AMAI '.length, "AMAI MEN'S CARE".length)}
                        </span>
                      )}
                      
                      {typingText.length > "AMAI MEN'S CARE".length && (
                        <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                          {typingText.substring("AMAI MEN'S CARE ".length)}
                        </span>
                      )}
                      
                      <span className="inline-block w-1.5 h-12 bg-orange-400 animate-pulse ml-1"></span>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">AMAI</span>
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 ml-2">MEN'S CARE</span>
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">PREMIUM GROOMING</span>
                    <span className="relative block">
                      <span className="relative z-10 text-white">EXPERIENCE</span>
                      <span className="absolute bottom-2 left-0 w-full h-2 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0"></span>
                    </span>
                  </div>
                )}
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Experience grooming redefined at Amai Men's Care. Our master barbers blend traditional techniques with modern styles to deliver premium cuts, precise fades, and immaculate beard trims in a sophisticated atmosphere.
              </p>
              
              <div className="pt-4">
                <Button 
                  onClick={() => setIsBookingModalOpen(true)}
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-10 py-7 text-lg font-medium rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                >
                  <span className="mr-2">BOOK YOUR APPOINTMENT</span>
                  <ArrowRight className="h-5 w-5 inline-block transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Right Content - Interactive App Mockup */}
          <div 
            className="relative lg:ml-10 xl:ml-20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* 3D Transform Container */}
            <div 
              ref={appRef}
              className="relative transition-all duration-300"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* App background with glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 to-amber-500/30 rounded-[2.5rem] blur-xl animate-pulse-slow"></div>
              
              {/* Main app container */}
              <div className="relative bg-gradient-to-br from-orange-400 to-amber-500 rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                <div className="bg-black/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-inner">
                  {/* Search bar */}
                  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm m-4 p-3 rounded-xl border border-white/20">
                    <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <div className="text-white font-medium">Book your barber</div>
                      <div className="text-white/70 text-sm">Choose a style & time</div>
                    </div>
                  </div>
                  
                  {/* Barber profile carousel */}
                  <div className="px-4 pb-3">
                    <div className="relative h-[140px] overflow-hidden rounded-xl">
                      {barberProfiles.map((profile, index) => (
                        <div 
                          key={profile.id}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out flex ${index === currentProfileIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                        >
                          <div className="w-full h-full relative group cursor-pointer overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                            <img 
                              src={profile.image} 
                              alt={profile.name}
                              className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-110"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                              <div className="flex justify-between items-end">
                                <div>
                                  <h3 className="text-white font-bold text-lg">{profile.name}</h3>
                                  <div className="flex items-center text-amber-400 text-sm">
                                    <Star className="w-4 h-4 inline mr-1 fill-amber-400" />
                                    <span>{profile.rating}</span>
                                  </div>
                                </div>
                                <div className="flex items-center text-white/80 text-sm">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  <span>{profile.distance}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Carousel indicators */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30">
                        {barberProfiles.map((_, index) => (
                          <button
                            key={index}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentProfileIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                            onClick={() => setCurrentProfileIndex(index)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Style gallery */}
                  <div className="p-4 pt-0">
                    <div className="grid grid-cols-3 gap-3">
                      {barberStyles.map((style) => (
                        <div 
                          key={style.id} 
                          className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer"
                        >
                          <img 
                            src={style.image} 
                            alt={style.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">{style.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Book appointment button */}
                    <div className="mt-4">
                      <Button className="w-full bg-white hover:bg-blue-50 text-gray-900 rounded-xl py-5 font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        <Calendar className="w-4 h-4 mr-2 inline-block" />
                        Book new appointment
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-float z-10 rotate-6">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-float-slow z-10 -rotate-12">
                  <Star className="w-5 h-5 text-white" />
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
