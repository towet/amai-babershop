
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, DollarSign, ZapIcon, Wifi, Calendar, ChevronsUp, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const GetPaidFastSection = () => {
  const [hoveredAmount, setHoveredAmount] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [amountCounter, setAmountCounter] = useState(0);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Reset payment states after completion
  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        setIsCompleted(false);
        setIsProcessing(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);
  
  // Animate amount counter effect
  useEffect(() => {
    if (hoveredAmount && amountCounter < 35) {
      const timer = setTimeout(() => {
        setAmountCounter(prev => Math.min(prev + 1, 35));
      }, 30);
      
      return () => clearTimeout(timer);
    } else if (!hoveredAmount) {
      setAmountCounter(0);
    }
  }, [hoveredAmount, amountCounter]);
  
  // Handle 3D card rotation effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      setMousePosition({ x, y });
    };
    
    const handleMouseLeave = () => {
      if (!cardRef.current) return;
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);
  
  // Parallax background effect
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
  
  // Simulate payment processing
  const handlePaymentClick = () => {
    if (isProcessing || isCompleted) return;
    
    setHasInteracted(true);
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
    }, 2000);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-24 px-6 bg-black relative overflow-hidden"
      onMouseMove={handleSectionMouseMove}
    >
      {/* Background elements with parallax effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="parallax-element absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] animate-pulse-slow" data-speed-x="30" data-speed-y="20"></div>
        <div className="parallax-element absolute -top-40 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-float" data-speed-x="-40" data-speed-y="-20"></div>
        <div className="parallax-element absolute top-[40%] right-[30%] w-4 h-4 rounded-full bg-orange-400 opacity-20 animate-pulse-slow" data-speed-x="-10" data-speed-y="50"></div>
        <div className="parallax-element absolute top-[30%] left-[20%] w-3 h-3 rounded-full bg-yellow-400 opacity-30 animate-pulse-slow" data-speed-x="60" data-speed-y="-30"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content - Text and button */}
          <motion.div 
            className="space-y-6 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-['Bebas_Neue'] text-5xl md:text-7xl leading-none text-white tracking-tight">
              <motion.span 
                className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                GET PAID
              </motion.span>
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 mt-1 relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                FAST
                <span className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-orange-500 to-yellow-500"></span>
              </motion.span>
            </h2>
            
            <motion.p 
              className="text-xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Online and In-person payments with same-day deposits available instantly to your bank account
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button className="group bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-6 rounded-full flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] mt-6">
                <span>Make more money</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
            
            {/* Payment features */}
            <motion.div 
              className="pt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {[
                { icon: <DollarSign className="w-5 h-5" />, text: "Instant transfers" },
                { icon: <CheckCircle2 className="w-5 h-5" />, text: "Secure transactions" },
                { icon: <Calendar className="w-5 h-5" />, text: "Scheduled payments" },
                { icon: <ChevronsUp className="w-5 h-5" />, text: "Low processing fees" }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 text-gray-300 group cursor-pointer transition-all duration-300 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right content - Interactive payment card */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Animated background shape */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-3xl transform rotate-6 scale-105 shadow-xl animate-pulse-slow"></div>
            
            {/* Payment interface mockup with 3D effects */}
            <div 
              ref={cardRef}
              className="relative bg-gray-900/90 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                transform: isHovered ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale3d(1.02, 1.02, 1.02)` : 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
                transition: 'transform 0.2s ease-out'
              }}
            >
              {/* Animated glowing effects */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-yellow-600/20 rounded-[32px] blur-xl opacity-70 animate-pulse-slow"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-600/10 via-transparent to-yellow-600/10 rounded-[40px] blur-xl opacity-50"></div>
              
              {/* Credit card with glass effect */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-2xl p-6 mb-6 relative shadow-lg border border-gray-700/50 overflow-hidden"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Background glass pattern */}
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 blur-3xl opacity-70"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl"></div>
                
                {/* NFC chip and holographic effect */}
                <div className="absolute top-6 left-6 w-12 h-8 bg-gradient-to-br from-yellow-300/80 to-orange-400/80 rounded-md grid grid-cols-3 grid-rows-2 gap-px p-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-yellow-200/60 rounded-sm"></div>
                  ))}
                </div>
                
                {/* WIFI symbol with animation */}
                <div className="absolute top-6 left-20 opacity-60">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                
                {/* Card content */}
                <div className="flex justify-between items-start mb-16">
                  <div className="w-14 h-9"></div>
                  <motion.span 
                    className="text-white font-bold text-xl tracking-wider"
                    animate={{ y: [0, -2, 0], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    VISA
                  </motion.span>
                </div>
                <div className="text-white">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-light tracking-wider">Darrell Steward</p>
                    <p className="text-xs text-gray-400">EXPIRES 05/28</p>
                  </div>
                  <p className="text-sm font-light mt-1 tracking-widest opacity-60">•••• •••• •••• 4242</p>
                </div>
                
                {/* Holographic foil effect */}
                <div className="absolute bottom-0 right-0 w-20 h-16 bg-gradient-to-br from-orange-500/10 via-yellow-500/10 to-orange-500/10 rounded-tl-xl blur-sm"></div>
              </motion.div>
              
              {/* NFC payment area with interactive animations */}
              <motion.div 
                className="relative bg-gradient-to-br from-blue-600/90 to-indigo-700/90 backdrop-blur-xl rounded-2xl p-6 mb-6 text-center shadow-lg border border-blue-500/30 overflow-hidden cursor-pointer"
                onClick={handlePaymentClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                animate={isProcessing ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-70"></div>
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/5 to-transparent"></div>
                
                {/* Interactive NFC animation */}
                <div 
                  className={`w-16 h-16 mx-auto mb-4 rounded-full relative ${isProcessing ? 'animate-spin-slow' : ''}`}
                >
                  <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                    <div className="w-10 h-10 border-2 border-white/80 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Pulse animation rings */}
                  {isProcessing && [
                    { delay: 0, size: 'scale-100 opacity-80' },
                    { delay: 0.5, size: 'scale-150 opacity-60' },
                    { delay: 1, size: 'scale-200 opacity-40' },
                    { delay: 1.5, size: 'scale-250 opacity-20' },
                  ].map((ring, index) => (
                    <motion.div 
                      key={index}
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        delay: ring.delay,
                        ease: 'easeOut'
                      }}
                    />
                  ))}
                </div>
                
                {/* Dynamic text based on payment state */}
                <motion.p 
                  className="text-white text-sm mb-3 font-medium"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {isProcessing ? "Processing Payment..." : 
                   isCompleted ? "Payment Complete!" : 
                   "Hold Here to Pay"}
                </motion.p>
                
                {/* Progress indicators */}
                <div className="flex justify-center space-x-2">
                  {isCompleted ? (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    [...Array(4)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className={`w-2 h-2 bg-white rounded-full ${i === 3 || isProcessing ? 'opacity-100' : 'opacity-60'}`}
                        animate={isProcessing ? { 
                          opacity: i === (Math.floor(Date.now() / 300) % 4) ? 1 : 0.4
                        } : {}}
                      />
                    ))
                  )}
                </div>
              </motion.div>
              
              {/* Payment amount with interactive animations */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg border border-gray-700/50 transition-all duration-300 relative overflow-hidden"
                whileHover={{ scale: 1.03 }}
                onMouseEnter={() => setHoveredAmount(true)}
                onMouseLeave={() => setHoveredAmount(false)}
              >
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 opacity-30"></div>
                <div className="absolute -bottom-10 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                
                {/* Dollar icon with animations */}
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DollarSign className="w-8 h-8 text-white" />
                </motion.div>
                
                <p className="text-gray-400 text-sm mb-1">Pay Barber</p>
                
                {/* Animated amount counter */}
                <div className="text-white text-4xl font-bold transition-all duration-500 flex items-center justify-center gap-1 overflow-hidden relative">
                  <motion.span 
                    className={`transition-all duration-300 relative ${hoveredAmount ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 scale-110' : ''}`}
                    animate={hoveredAmount ? {
                      y: [0, -2, 0],
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ${hoveredAmount ? amountCounter.toFixed(2) : "35.00"}
                    
                    {/* Floating dollar particles on hover */}
                    {hoveredAmount && [
                      { x: -20, y: -15, size: 'text-xs', delay: 0.1 },
                      { x: 15, y: -25, size: 'text-xs', delay: 0.3 },
                      { x: -10, y: -30, size: 'text-xs', delay: 0.5 },
                      { x: 25, y: -10, size: 'text-xs', delay: 0.7 },
                    ].map((particle, index) => (
                      <motion.span
                        key={index}
                        className={`absolute ${particle.size} text-orange-500/80`}
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{ 
                          x: particle.x, 
                          y: particle.y, 
                          opacity: [0, 1, 0],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2, 
                          delay: particle.delay, 
                          ease: 'easeOut' 
                        }}
                      >
                        $
                      </motion.span>
                    ))}
                  </motion.span>
                  
                  {hoveredAmount && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="ml-2"
                    >
                      <ZapIcon className="h-6 w-6 text-yellow-500 animate-pulse" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
