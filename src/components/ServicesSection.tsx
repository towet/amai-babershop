import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Scissors, Sparkles, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "./BookingModal";

type Service = {
  id: number;
  name: string;
  description?: string;
  duration: string;
  price: string;
  popular?: boolean;
  image?: string;
  category: "haircut" | "beard" | "combo" | "special" | "addon";
};

export const ServicesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  
  // Parallax effect for section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  // Service data
  const services: Service[] = [
    {
      id: 1,
      name: "Taper fade & beard + hair wash",
      duration: "1 hr",
      price: "600 Lira",
      popular: true,
      category: "combo",
      image: "https://thebeardclub.com/cdn/shop/articles/how_to_beard_fade_eabfb66a-ef50-4c31-91c9-50a27a3cd162_1200x630.jpg?v=1651237897"
    },
    {
      id: 2,
      name: "Skin fade & beard + hair wash",
      duration: "1 hr",
      price: "600 Lira",
      category: "combo",
      image: "https://www.beardbeasts.com/cdn/shop/articles/The_High_Skin_Fade_Buzz_Cut_Featured_Style_Guide_1.png?crop=center&height=1200&v=1744367491&width=1200"
    },
    {
      id: 3,
      name: "Taper fade + hair wash",
      duration: "1 hr",
      price: "450 Lira",
      category: "haircut",
      image: "https://i.pinimg.com/736x/39/1b/f2/391bf2cfd57e187b0952a83918bb4fb1.jpg"
    },
    {
      id: 4,
      name: "Beard + hair wash",
      duration: "30 mins",
      price: "250 Lira",
      category: "beard",
      image: "https://media.istockphoto.com/id/872361244/photo/man-getting-his-beard-trimmed-with-electric-razor.jpg?s=612x612&w=0&k=20&c=_IjZcrY0Gp-2z6AWTQederZCA9BLdl-iqWkH0hGMTgg="
    },
    {
      id: 5,
      name: "Kids haircut + hair wash",
      duration: "45 mins",
      price: "350 Lira",
      category: "haircut",
      image: "https://www.barberstake.com/wp-content/uploads/2025/02/Side-Spiky-Hair-with-Mid-Fade-and-Line-Up.jpg"
    },
    {
      id: 6,
      name: "Braids and haircut + hair wash",
      duration: "1.5 hr",
      price: "1800 Lira",
      category: "special",
      image: "https://helibeauty.com/wp-content/uploads/2023/03/1-Hair-braid-styles-in-Istanbul-with-Heli-beauty-1024x576.jpg"
    },
    {
      id: 7,
      name: "Hair color (black)",
      duration: "45 mins",
      price: "200 Lira",
      category: "addon",
      image: "https://www.apetogentleman.com/wp-content/uploads/2022/03/hair-dye-men-salon.jpg"
    }
  ];
  
  // Filter services based on active category
  const filteredServices = activeCategory === "all" 
    ? services 
    : services.filter(service => service.category === activeCategory);
    
  // Categories for filter
  const categories = [
    { id: "all", name: "All Services" },
    { id: "haircut", name: "Haircuts" },
    { id: "beard", name: "Beard" },
    { id: "combo", name: "Combos" },
    { id: "special", name: "Specialty" },
    { id: "addon", name: "Add-ons" },
  ];
  
  return (
    <section 
      ref={sectionRef} 
      id="services"
      className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/2 w-80 h-80 bg-amber-400/5 rounded-full blur-[130px] animate-float"></div>
      </div>
      
      {/* Floating scissors */}
      <motion.div 
        className="absolute hidden md:block top-20 right-[10%] w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-0.5 shadow-lg"
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full bg-black/40 backdrop-blur-sm rounded-[7px] flex items-center justify-center">
          <Scissors className="w-6 h-6 text-white" />
        </div>
      </motion.div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          style={{ y, opacity }}
        >
          <h2 className="text-6xl md:text-7xl font-['Bebas_Neue'] leading-none tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">OUR</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 ml-3">SERVICES</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Premium grooming services tailored to enhance your style and confidence
          </p>
        </motion.div>
        
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full transition-all duration-300 ${activeCategory === category.id ? 
                'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105' : 
                'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`relative bg-gradient-to-br ${hoveredService === service.id ? 'from-gray-800/95 to-gray-900/95' : 'from-gray-800/70 to-gray-900/70'} 
                backdrop-blur-sm rounded-xl overflow-hidden group perspective-1000 transform transition-all duration-500
                ${hoveredService === service.id ? 'scale-[1.02] shadow-xl shadow-orange-500/10' : 'shadow-lg'}`}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Border gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Popular tag */}
              {service.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>POPULAR</span>
                  </div>
                </div>
              )}
              
              <div className="relative">
                {/* Service Image with overlay */}
                {service.image && (
                  <div className="relative h-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent opacity-60 z-10"></div>
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                    
                    {/* Category tag overlay on image */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-xs text-white bg-gray-900/70 backdrop-blur-sm px-2 py-1 rounded">
                        {categories.find(cat => cat.id === service.category)?.name}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-5 relative">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {service.name}
                  </h3>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <div className="flex items-center mb-1 bg-gray-800/60 px-2 py-0.5 rounded-full inline-flex">
                        <Clock className="w-3 h-3 mr-1.5 text-amber-400" />
                        <span className="text-xs font-medium text-white">{service.duration}</span>
                      </div>
                      <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
                        {service.price}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setSelectedService(service.name);
                        setIsBookingModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm px-3 py-1.5 rounded-full shadow-md transition-all duration-300"
                    >
                      Book
                      <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Decorative element */}
              <div className="absolute bottom-3 left-3 w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity duration-300">
                {service.category === "haircut" && <Scissors className="w-full h-full text-orange-500" />}
                {service.category === "beard" && <Scissors className="w-full h-full text-amber-500" />}
                {service.category === "combo" && <Scissors className="w-full h-full text-amber-500" />}
                {service.category === "special" && <Sparkles className="w-full h-full text-orange-500" />}
                {service.category === "addon" && <Plus className="w-full h-full text-amber-500" />}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <Button 
            onClick={() => {
              setSelectedService("");
              setIsBookingModalOpen(true);
            }}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-6 rounded-full flex items-center gap-2 mx-auto group transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]"
          >
            <span className="text-lg">Book Your Appointment</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          <p className="text-gray-400 mt-4">
            Experience premium grooming at Amai Men Care
          </p>
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
