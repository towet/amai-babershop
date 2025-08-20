import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star, Calendar, Users, Scissors, Instagram, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "./BookingModal";

export const FeaturedBarbersSection = () => {
  const [activeBarber, setActiveBarber] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  
  // Barber profiles with stunning images and details
  const barbers = [
    {
      id: 1,
      name: "Julian Hayes",
      specialty: "Classic Cuts & Fades",
      rating: 4.9,
      reviews: 234,
      waitTime: "5 min",
      image: "https://images.unsplash.com/photo-1587897471941-329692b28689?q=80&w=1374&auto=format&fit=crop",
      instagramFollowers: "32K",
      award: "Best Fade Specialist 2024",
      color: "from-blue-500 to-indigo-600",
      styles: ["Classic", "Business", "Fade"],
      available: true
    },
    {
      id: 2,
      name: "Marcus Johnson",
      specialty: "Artistic Styling & Design",
      rating: 5.0,
      reviews: 187,
      waitTime: "25 min",
      image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1374&auto=format&fit=crop",
      instagramFollowers: "45K",
      award: "Most Creative Barber 2024",
      color: "from-purple-500 to-violet-600",
      styles: ["Creative", "Modern", "Artistic"],
      available: true
    },
    {
      id: 3,
      name: "Victor Reyes",
      specialty: "Precision Scissor Work",
      rating: 4.8,
      reviews: 156,
      waitTime: "10 min",
      image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1470&auto=format&fit=crop",
      instagramFollowers: "27K",
      award: "Precision Master 2024",
      color: "from-amber-500 to-orange-600",
      styles: ["Textured", "Scissor Cut", "Detailed"],
      available: false
    },
    {
      id: 4,
      name: "Andre Thompson",
      specialty: "Beard Sculpting & Design",
      rating: 4.9,
      reviews: 203,
      waitTime: "15 min",
      image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?q=80&w=1374&auto=format&fit=crop",
      instagramFollowers: "38K",
      award: "Beard Master 2024",
      color: "from-rose-500 to-pink-600",
      styles: ["Beard", "Clean", "Detailed"],
      available: true
    }
  ];
  
  // Auto-rotate through barbers
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBarber(prev => (prev + 1) % barbers.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle parallax effect for background elements
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
      
      const moveX = x * speedX;
      const moveY = y * speedY;
      
      el.setAttribute('style', `transform: translate(${moveX}px, ${moveY}px)`);
    });
  };
  
  return (
    <section 
      ref={sectionRef}
      className="py-28 px-6 bg-black relative overflow-hidden"
      onMouseMove={handleSectionMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="parallax-element absolute top-20 left-[10%] w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] animate-float-slow"
          data-speed-x="30"
          data-speed-y="20"
        ></div>
        <div 
          className="parallax-element absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] animate-float"
          data-speed-x="-30"
          data-speed-y="-20"
        ></div>
        <div 
          className="parallax-element absolute top-[40%] right-[30%] w-64 h-64 rounded-full bg-blue-500/10 blur-[80px] animate-float-horizontal"
          data-speed-x="20"
          data-speed-y="-15"
        ></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with animated gradient underline */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Bebas_Neue'] text-6xl md:text-7xl tracking-tight inline-block relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">FEATURED</span>
              <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                BARBERS
                <motion.span 
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                ></motion.span>
              </span>
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Connect with award-winning barbers who specialize in exactly the style you're looking for. Book directly or join their waitlist in seconds.
          </motion.p>
        </div>
        
        {/* Main barber showcase with 3D effect */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Large spotlight view - occupies 7/12 columns on large screens */}
          <div className="lg:col-span-7 order-1">
            <motion.div
              key={activeBarber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden"
            >
              {/* 3D tilting card effect */}
              <div 
                className="relative group cursor-pointer rounded-3xl p-1 transition-transform duration-300 transform-gpu"
                style={{ 
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                  transform: hovered === activeBarber 
                    ? `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)` 
                    : 'rotateY(0) rotateX(0)'
                }}
                onMouseEnter={() => setHovered(activeBarber)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Main content */}
                <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-xl">
                  {/* Barber image with overlay */}
                  <div className="relative h-[400px] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent z-10"></div>
                    <motion.img 
                      src={barbers[activeBarber].image} 
                      alt={barbers[activeBarber].name}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    
                    {/* Floating award badge */}
                    <motion.div
                      className={`absolute top-4 right-4 rounded-full py-1 px-3 bg-gradient-to-r ${barbers[activeBarber].color} z-20 flex items-center shadow-lg`}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <Sparkles className="w-4 h-4 text-white mr-1" />
                      <span className="text-white text-xs font-medium">{barbers[activeBarber].award}</span>
                    </motion.div>
                    
                    {/* Availability indicator */}
                    {barbers[activeBarber].available ? (
                      <motion.div
                        className="absolute top-4 left-4 flex items-center space-x-2 z-20"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs">Available Now</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="absolute top-4 left-4 flex items-center space-x-2 z-20"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-orange-400 text-xs">Booked Until 3PM</span>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Content section */}
                  <div className="p-6 relative z-20 -mt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
                      <div>
                        <motion.h3 
                          className="text-white text-3xl font-bold"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          {barbers[activeBarber].name}
                        </motion.h3>
                        <motion.p 
                          className="text-gray-400 mt-1"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                        >
                          {barbers[activeBarber].specialty}
                        </motion.p>
                      </div>
                      
                      <motion.div 
                        className="flex items-center mt-3 md:mt-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        <div className="flex items-center mr-4">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span className="text-white font-medium">{barbers[activeBarber].rating}</span>
                          <span className="text-gray-500 text-sm ml-1">({barbers[activeBarber].reviews})</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-blue-400 mr-1" />
                          <span className="text-white text-sm">{barbers[activeBarber].waitTime} wait</span>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Style chips */}
                    <motion.div 
                      className="flex flex-wrap gap-2 mb-6"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      {barbers[activeBarber].styles.map((style, index) => (
                        <div 
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${barbers[activeBarber].color} bg-opacity-10 text-white`}
                        >
                          {style}
                        </div>
                      ))}
                    </motion.div>
                    
                    {/* Instagram and booking stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <motion.div 
                        className="bg-gray-800 rounded-xl p-4 flex items-center"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${barbers[activeBarber].color} flex items-center justify-center mr-4`}>
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Instagram</p>
                          <p className="text-white font-bold">{barbers[activeBarber].instagramFollowers} Followers</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gray-800 rounded-xl p-4 flex items-center"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${barbers[activeBarber].color} flex items-center justify-center mr-4`}>
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Appointments</p>
                          <p className="text-white font-bold">90% Booked Today</p>
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.div 
                        className="flex-1"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                      >
                        <Button 
                          onClick={() => setIsBookingModalOpen(true)}
                          className={`w-full py-6 bg-gradient-to-r ${barbers[activeBarber].color} hover:shadow-lg hover:shadow-blue-500/20 text-white`}
                        >
                          Book Appointment
                        </Button>
                      </motion.div>
                      
                      <motion.div 
                        className="flex-1"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full py-6 border-gray-700 text-white hover:bg-gray-800"
                        >
                          View Portfolio
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Barber selection sidebar - 5/12 columns */}
          <div className="lg:col-span-5 order-2">
            <div className="space-y-4">
              {barbers.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative p-0.5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${activeBarber === index ? 'scale-105 shadow-lg z-10' : 'opacity-80 hover:opacity-100'}`}
                  onClick={() => setActiveBarber(index)}
                  whileHover={{ scale: activeBarber === index ? 1.05 : 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient border that shows when active */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${barber.color} ${activeBarber === index ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
                  
                  {/* Card content */}
                  <div className={`relative bg-gray-900 p-4 rounded-xl ${activeBarber === index ? 'bg-opacity-80' : 'bg-opacity-100'}`}>
                    <div className="flex items-center gap-4">
                      {/* Avatar with glow effect */}
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-sm ${activeBarber === index ? 'bg-white/30' : 'bg-transparent'} transition-colors duration-300`}></div>
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700">
                          <img 
                            src={barber.image}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                          {barber.available && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Barber info */}
                      <div className="flex-grow">
                        <h3 className="font-bold text-white">{barber.name}</h3>
                        <p className="text-gray-400 text-sm">{barber.specialty}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-xs ml-1">{barber.rating}</span>
                          <span className="mx-2 text-gray-600">•</span>
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span className="text-white text-xs ml-1">{barber.waitTime}</span>
                        </div>
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className={`w-8 h-8 rounded-full ${activeBarber === index ? `bg-gradient-to-br ${barber.color}` : 'bg-gray-800'} flex items-center justify-center transition-colors duration-300`}>
                        <ChevronRight className={`w-5 h-5 ${activeBarber === index ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* View all barbers button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6"
            >
              <Button variant="outline" className="w-full py-6 border-gray-700 text-white hover:bg-gray-800">
                View All Barbers
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
            
            {/* Featured locations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-8"
            >
              <h3 className="text-white font-bold mb-4">Featured Locations</h3>
              <div className="space-y-3">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-4 flex items-start cursor-pointer hover:bg-gray-750 transition-all duration-300"
                >
                  <MapPin className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Eastern Bull</span>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">ÇAKIRAGA CAMII ARALIGI sk, No:3-A, Aksaray, Fatih mah, Istanbul/Turkey</p>
                  </div>
                </motion.div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["Sultanahmet", "Beyoğlu", "Kadıköy", "Üsküdar"].map((district, index) => (
                    <motion.div
                      key={district}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-gray-800 rounded-xl p-3 flex items-center cursor-pointer hover:bg-gray-750 transition-all duration-300"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-white text-sm">{district}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
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
