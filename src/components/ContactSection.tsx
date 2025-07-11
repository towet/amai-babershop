import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "./BookingModal";

export const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  const days = [
    { name: "Monday", hours: "10:00 – 23:00" },
    { name: "Tuesday", hours: "10:00 – 23:00" },
    { name: "Wednesday", hours: "10:00 – 23:00" },
    { name: "Thursday", hours: "10:00 – 23:00" },
    { name: "Friday", hours: "10:00 – 23:00" },
    { name: "Saturday", hours: "10:00 – 23:00" },
    { name: "Sunday", hours: "10:00 – 23:00" }
  ];
  
  return (
    <section 
      ref={sectionRef}
      id="contact-us"
      className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px] animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/5 rounded-full blur-[130px] animate-float"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          style={{ y, opacity }}
        >
          <h2 className="text-6xl md:text-7xl font-['Bebas_Neue'] leading-none tracking-tight mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">FIND</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 ml-3">US</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-500 to-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Visit us and experience the premium grooming service you deserve
          </p>
        </motion.div>
        
        {/* Main container with two rows */}
        <div className="space-y-12">
          {/* Row 1: Contact Info & Map side by side */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Contact Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl space-y-6">
              <h3 className="text-3xl font-bold text-white mb-6">Contact Information</h3>
              
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Our Location</h4>
                  <p className="text-gray-300">
                    ÇAKIRAGA CAMII ARALIGI sk , No:3-A,<br />
                    Aksaray, Fatih mah,<br />
                    Istanbul, Turkey
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Phone Number</h4>
                  <p className="text-gray-300">+90 542 515 29 93</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="mt-1 p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Email Address</h4>
                  <p className="text-gray-300">amaimancare@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors duration-300"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-colors duration-300"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
              </div>
              
              <Button 
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-6 text-lg rounded-lg flex items-center justify-center space-x-2 mt-6"
              >
                <span>Book Your Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
            
            {/* Map */}
            <div className="h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-gray-800/80">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3010.9400781235125!2d28.946582115416176!3d41.00624897930169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9be39079901%3A0x68e6c44a59e0fc4a!2sAksaray%2C%20Fatih%2FIstanbul%2C%20Turkey!5e0!3m2!1sen!2sus!4v1653419325244!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Amai Men's Care Location"
              ></iframe>
            </div>
          </div>
          
          {/* Row 2: Opening Hours & Hiring Form side by side */}
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Hours */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl">
              <div className="flex items-start space-x-4 mb-6">
                <div className="mt-1 p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">Opening Hours</h3>
              </div>
              
              <div className="space-y-4">
                {days.map((day, index) => (
                  <div 
                    key={day.name}
                    className={`flex justify-between p-3 rounded-lg transition-colors duration-300 ${index === activeDay ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20' : 'hover:bg-gray-700/50'}`}
                    onClick={() => setActiveDay(index)}
                  >
                    <span className={`font-medium ${index === activeDay ? 'text-amber-400' : 'text-white'}`}>{day.name}</span>
                    <span className={`${index === activeDay ? 'text-amber-400' : 'text-gray-300'}`}>{day.hours}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* We Are Hiring Form */}
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm p-8 rounded-xl space-y-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/><path d="M12 11v4"/><path d="M10 13h4"/></svg>
                </div>
                <h3 className="text-3xl font-bold text-white">We Are Hiring</h3>
              </div>
              
              <p className="text-gray-300 mb-6">
                Join our team of talented professionals at Amai Men's Care. We're looking for passionate barbers to be part of our growing family.
              </p>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium">First Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Years of Experience</label>
                  <select 
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200"
                  >
                    <option value="" className="bg-gray-800">Select years of experience</option>
                    <option value="0-1" className="bg-gray-800">0-1 years</option>
                    <option value="1-3" className="bg-gray-800">1-3 years</option>
                    <option value="3-5" className="bg-gray-800">3-5 years</option>
                    <option value="5+" className="bg-gray-800">5+ years</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm font-medium">Tell us about yourself</label>
                  <textarea 
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition duration-200 min-h-[120px]"
                    placeholder="Share your skills, specialties, and why you want to join Amai Men's Care..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 group"
                  >
                    <span>Submit Application</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </form>
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
