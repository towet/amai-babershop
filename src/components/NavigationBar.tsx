
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { BookingModal } from "./BookingModal";

export const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Function to check if the device is mobile
  const checkIsMobile = () => {
    return window.innerWidth < 768;
  };
  
  // Close menu when resizing from mobile to desktop
  useEffect(() => {
    const handleResize = () => {
      if (!checkIsMobile() && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('prevent-scroll');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('prevent-scroll');
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.classList.remove('prevent-scroll');
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  
  // Log menu state changes for debugging
  useEffect(() => {
    console.log('Mobile menu state:', isMenuOpen ? 'open' : 'closed');
  }, [isMenuOpen]);
  
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <div 
              className="font-['Bebas_Neue'] text-3xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 relative z-10 transform -rotate-2 pr-1"
              style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}
            >
              AMAI
            </div>
            <div 
              className="font-['Lato'] text-xs font-light uppercase tracking-[0.3em] text-white transform translate-y-1 pl-1 border-l-2 border-orange-400"
              style={{ letterSpacing: '0.3em' }}
            >
              MEN'S CARE
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 ml-8">
            <a href="#about-us" className="text-white hover:text-amber-400 transition-colors duration-300" onClick={(e) => {
              e.preventDefault();
              document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
            }}>About Us</a>
            <a href="#services" className="text-white hover:text-amber-400 transition-colors duration-300" onClick={(e) => {
              e.preventDefault();
              document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }}>Services</a>
            <a href="#barbers-team" className="text-white hover:text-amber-400 transition-colors duration-300" onClick={(e) => {
              e.preventDefault();
              document.getElementById('barbers-team')?.scrollIntoView({ behavior: 'smooth' });
            }}>Our Barbers</a>
            
            <a href="#contact-us" className="text-white hover:text-amber-400 transition-colors duration-300" onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
            }}>Contact Us</a>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-4">
          <Button variant="ghost" className="hidden md:flex text-white hover:text-amber-400 hover:bg-transparent" onClick={() => navigate('/dashboard/login')}>Log in</Button>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-1.5 rounded-lg bg-gray-800/80 text-white hover:bg-gray-700/80 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Mobile menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu - fixed implementation */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-full z-[100] bg-neutral-900 backdrop-blur-xl flex flex-col">
          <div className="absolute top-4 right-4 z-10"> {/* Ensure close button is above content */} 
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full bg-gray-700/80 text-white hover:bg-gray-600/80 transition-colors duration-300"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Scrollable content area */} 
          <div className="flex-1 overflow-y-auto pt-20 px-6 pb-8"> {/* Adjusted top padding */} 
            <div className="space-y-3 mb-8"> {/* Buttons now first, with margin below */} 
              <Button 
                variant="default" 
                className="w-full justify-center bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-3"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/dashboard/login');
                }}
              >
                Log in
              </Button>
              <Button 
                className="w-full justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsBookingModalOpen(true);
                }}
              >
                Book now
              </Button>
            </div>
            
            <div className="flex flex-col space-y-6"> {/* Nav links second */} 
              <a 
                href="#about-us" 
                className="text-xl font-medium text-white border-b border-gray-800 pb-4 hover:text-amber-400 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about-us')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
              >
                About Us
              </a>
              
              <a 
                href="#services" 
                className="text-xl font-medium text-white border-b border-gray-800 pb-4 hover:text-amber-400 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
              >
                Services
              </a>
              
              <a 
                href="#barbers-team" 
                className="text-xl font-medium text-white border-b border-gray-800 pb-4 hover:text-amber-400 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('barbers-team')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
              >
                Our Barbers
              </a>
              
              <a 
                href="#contact-us" 
                className="text-xl font-medium text-white border-b border-gray-800 pb-4 hover:text-amber-400 transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact-us')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </nav>
  );
};
