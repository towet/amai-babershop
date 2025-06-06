
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, useAnimation, useInView } from "framer-motion";
import { Sparkles, Star, Instagram, Calendar, Users, DollarSign, Quote, ChevronLeft, ChevronRight } from "lucide-react";

// Use motion.div directly from framer-motion
const MotionDiv = motion.div;

export const ShopStoriesSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inViewRef = useRef(null);
  const isInView = useInView(inViewRef, { once: false, amount: 0.3 });
  
  // Update mouse position for parallax effect
  const handleMouseMove = (e: MouseEvent) => {
    if (!sectionRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
  };
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle touch start for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  // Handle touch end for swipe detection
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    
    // Swipe threshold - change testimonial if swipe is significant
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe left - next testimonial
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      } else {
        // Swipe right - previous testimonial
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
    }
  };

  // Go to next testimonial
  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Go to previous testimonial
  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Set up mouse move listener and check for mobile viewport
  useEffect(() => {
    if (!sectionRef.current) return;
    
    // Check if mobile viewport
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Animate elements when they come into view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Updated testimonials focused on Amari Barbershop management features
  const testimonials = [
    {
      id: 1,
      name: "Elliott Chester",
      business: "Chester's Premium Cuts",
      quote: "Amari's commission tracking has revolutionized how I pay my barbers. The automated calculations save me hours of work each week and eliminate payment disputes.",
      avatar: "https://images.unsplash.com/photo-1585977291171-a3ccd32dc6c6?q=80&w=1374&auto=format&fit=crop",
      featured: true,
      background: "gradient-blue",
      icon: <DollarSign className="w-5 h-5" />,
      feature: "Commission Tracking"
    },
    {
      id: 2,
      name: "Simon Chercuitte",
      business: "Uptown Barber Lounge",
      quote: "The real-time dashboard gives me instant visibility on daily appointments, walk-ins, and revenue. I can make staffing decisions on the fly based on actual data.",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=1480&auto=format&fit=crop",
      featured: false,
      background: "gradient-purple",
      icon: <Star className="w-5 h-5" />,
      feature: "Real-time Dashboard"
    },
    {
      id: 3,
      name: "Joshua Diamante",
      business: "Throne Barbershop",
      quote: "My clients love being able to choose their preferred barber when booking. It's increased our repeat business by 30% since we started using Amari's booking system.",
      avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1374&auto=format&fit=crop",
      featured: false,
      background: "gradient-pink",
      icon: <Instagram className="w-5 h-5" />,
      feature: "Barber Selection"
    },
    {
      id: 4,
      name: "Hayden Cassidy",
      business: "Elite Cuts Collective",
      quote: "Amari's detailed performance reports show me exactly which services are most profitable and which barbers are top performers. This data has been invaluable for business planning and growth.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1374&auto=format&fit=crop",
      featured: false,
      background: "gradient-amber",
      icon: <Users className="w-5 h-5" />,
      feature: "Performance Analytics"
    }
  ];

  // Get background gradient based on the testimonial
  const getGradient = (background: string) => {
    switch (background) {
      case 'gradient-blue':
        return 'from-blue-600 to-indigo-700';
      case 'gradient-purple':
        return 'from-purple-600 to-indigo-700';
      case 'gradient-pink':
        return 'from-pink-500 to-rose-600';
      case 'gradient-amber':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-blue-600 to-indigo-700';
    }
  };

  return (
    <section 
      id="shop-stories"
      ref={sectionRef} 
      className="py-16 md:py-24 bg-gray-900 relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background decoration elements with animation */}
      <motion.div 
        className="absolute top-40 left-[5%] md:left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"
        animate={{
          x: isHovering && !isMobile ? [0, 10, 0] : 0,
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-40 right-[5%] md:right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"
        animate={{
          x: isHovering && !isMobile ? [0, -10, 0] : 0,
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title with animated sparkles */}
        <div className="relative mb-16 text-center">
          <h2 className="font-['Bebas_Neue'] text-6xl md:text-7xl tracking-tight inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SUCCESS</span>
            <span className="relative ml-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
              STORIES
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"></span>
            </span>
          </h2>
          {/* Animated sparkles */}
          <div className="absolute -top-8 -right-8 text-pink-500 animate-float">
            <Sparkles className="w-8 h-8 opacity-60" />
          </div>
          <div className="absolute bottom-0 left-1/4 text-purple-500 animate-float-slow">
            <Sparkles className="w-6 h-6 opacity-50" />
          </div>
        </div>
        
        {/* Responsive testimonials layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Featured large testimonial - mobile: full width, desktop: 8/12 columns */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <MotionDiv 
              className={`h-full bg-gradient-to-br ${getGradient(testimonials[activeIndex].background)} rounded-3xl p-1 shadow-lg overflow-hidden transform transition-all duration-500 cursor-pointer group`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative h-full bg-gray-900 rounded-3xl p-8 overflow-hidden">
                {/* Background pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/20"></div>
                  <div className="absolute right-40 bottom-20 w-40 h-40 rounded-full border border-white/10"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Quote icon */}
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 text-white">
                      <Quote className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Quote text */}
                  <div className="mb-8 flex-grow">
                    <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed">
                      "{testimonials[activeIndex].quote}"
                    </p>
                  </div>
                  
                  {/* User info with animated hover effect */}
                  <div className="flex items-center">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30">
                        <img 
                          src={testimonials[activeIndex].avatar}
                          alt={testimonials[activeIndex].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-bold text-lg text-white">{testimonials[activeIndex].name}</h3>
                      <p className="text-gray-400">{testimonials[activeIndex].business}</p>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
          
          {/* Right side testimonial selector - mobile: stacked, desktop: 4/12 columns */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 order-1 lg:order-2">
            <div className="text-white text-lg md:text-xl font-medium mb-2 ml-2">
              Barbershop Owners Love Amari
            </div>
            
            {/* Testimonial selectors */}
            <div className="space-y-3" ref={cardsContainerRef}>
              {testimonials.map((testimonial, index) => (
                <MotionDiv
                  key={testimonial.id}
                  className={`relative p-0.5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${activeIndex === index ? 'scale-105 shadow-lg z-10' : 'opacity-80 hover:opacity-100'}`}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: activeIndex === index ? 1.05 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    transform: activeIndex === index 
                      ? `scale(1.05) translateX(${mousePosition.x * 5}px) translateY(${mousePosition.y * 5}px)` 
                      : 'scale(1)',
                  }}
                >
                  {/* Background gradient that shows when active */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(testimonial.background)} ${activeIndex === index ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
                  
                  {/* Card content */}
                  <div className={`relative bg-gray-800 p-4 rounded-xl border border-gray-700 ${activeIndex === index ? 'bg-opacity-50 backdrop-blur-sm' : 'bg-opacity-90'}`}>
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-sm ${activeIndex === index ? 'bg-white/30' : 'bg-transparent'} transition-colors duration-300`}></div>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-600">
                          <img 
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Name and business */}
                      <div className="flex-grow">
                        <h3 className="font-medium text-white">{testimonial.name}</h3>
                        <p className="text-gray-400 text-sm">{testimonial.business}</p>
                      </div>
                      
                      {/* Feature icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeIndex === index ? 'bg-white text-gray-900' : 'bg-gray-700 text-gray-300'} transition-colors duration-300`}>
                        {testimonial.icon}
                      </div>
                    </div>
                    
                    {/* Feature tag */}
                    <div className="mt-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${activeIndex === index ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-300'} transition-colors duration-300`}>
                        {testimonial.feature}
                      </span>
                    </div>
                  </div>
                </MotionDiv>
              ))}
            </div>
            
            {/* Pagination indicators */}
            <div className="flex justify-center space-x-2 mt-6 px-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-gradient-to-r from-pink-500 to-purple-600 w-8' : 'bg-gray-600 hover:bg-gray-500'}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View testimonial ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
