import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Scissors, MapPin, Calendar, ArrowUpRight } from "lucide-react";

export const Footer = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const footerRef = useRef<HTMLElement>(null);
  
  // Handle parallax effect for background elements
  const handleFooterMouseMove = (e: React.MouseEvent) => {
    if (!footerRef.current) return;
    
    const { clientX, clientY } = e;
    const { left, top, width, height } = footerRef.current.getBoundingClientRect();
    
    const x = (clientX - left) / width - 0.5;
    const y = (clientY - top) / height - 0.5;
    
    setMousePosition({ x, y });
  };
  
  return (
    <footer 
      ref={footerRef}
      className="relative py-16 px-6 bg-black border-t border-gray-800 overflow-hidden"
      onMouseMove={handleFooterMouseMove}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-[80px]"
          style={{
            transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-[80px]"
          style={{
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          }}
        ></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Logo and tagline */}
          <div className="space-y-6">
            <div className="flex flex-col items-start">
              <div className="flex items-center">
                <div className="font-['Lato'] text-3xl md:text-4xl font-light tracking-[0.2em] text-orange-400 uppercase relative z-10 transform -rotate-2 pr-1">
                  Amai
                </div>
                <div 
                  className="font-['Lato'] text-xs md:text-sm font-light uppercase tracking-[0.3em] text-white transform translate-y-1 pl-1 border-l-2 border-orange-400"
                  style={{ letterSpacing: '0.3em' }}
                >
                  BARBERSHOP
                </div>
              </div>
              <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-orange-400 to-transparent mt-1"></div>
            </div>
            
            <p className="text-gray-400 text-sm">Modern, premium barbershop experience with expert stylists.</p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {[
                { icon: Instagram, color: "bg-gradient-to-br from-pink-500 to-purple-500" },
                { icon: Twitter, color: "bg-gradient-to-br from-blue-400 to-blue-600" },
                { icon: Facebook, color: "bg-gradient-to-br from-blue-600 to-indigo-600" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-full ${social.color} flex items-center justify-center shadow-lg`}
                >
                  <social.icon className="h-4 w-4 text-white" />
                </motion.a>
              ))}
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Find a Barber", icon: Scissors },
                { label: "Book Appointment", icon: Calendar },
                { label: "Locations", icon: MapPin },
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                  <a href="#" className="text-gray-400 hover:text-white flex items-center group transition-colors duration-300">
                    <link.icon className="w-4 h-4 mr-2 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" />
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Subscribe</h3>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button 
                className="absolute right-1 top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md px-3 text-white text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </div>
            <p className="text-gray-500 text-xs mt-2">Get exclusive offers and updates.</p>
          </div>
        </div>
        
        {/* Bottom copyright bar with hover effect */}
        <motion.div 
          className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm">© 2025 AMARI. All rights reserved.</p>
          
          {/* App store badges */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            {["App Store", "Google Play"].map((store, index) => (
              <motion.a
                key={store}
                href="#"
                className="bg-gray-900 border border-gray-800 rounded-lg py-1 px-3 text-xs text-white flex items-center hover:bg-gray-800 transition-colors duration-300"
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <span className="mr-1">Get on</span>
                <span className="font-medium">{store}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
        
        {/* Back to top button with hover effect */}
        <motion.button
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
          whileHover={{ y: -3, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <svg className="w-5 h-5 text-white transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.button>
      </div>
    </footer>
  );
};
