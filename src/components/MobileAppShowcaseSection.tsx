import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Star, Scissors, Zap, Award, TrendingUp } from "lucide-react";

export const MobileAppShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [animateProfit, setAnimateProfit] = useState(false);
  const [selectedService, setSelectedService] = useState(0);
  const [hoverCard, setHoverCard] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate profit chart when the component mounts
    setAnimateProfit(true);

    // Animate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 68) return prev + 1;
        return prev;
      });
    }, 30);

    // Tab rotation
    const tabInterval = setInterval(() => {
      setActiveTab(prev => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(tabInterval);
    };
  }, []);

  const services = [
    { name: "Clipper & beard special", duration: "1 hr", price: "$95", selected: true },
    { name: "Clipper, scissor & shave", duration: "1 hr", price: "$85", selected: false },
    { name: "Scissor cut", duration: "1 hr", price: "$75", selected: false },
  ];

  const appointmentSlots = [
    { day: "Mon", date: "24", time: "10:30 AM", available: true },
    { day: "Mon", date: "24", time: "1:00 PM", available: true },
    { day: "Tue", date: "25", time: "11:00 AM", available: false },
    { day: "Tue", date: "25", time: "2:30 PM", available: true },
    { day: "Wed", date: "26", time: "9:00 AM", available: true },
    { day: "Wed", date: "26", time: "4:00 PM", available: true },
  ];

  return (
    <section id="app-showcase" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 bg-black overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute -top-80 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left content - Text and award badges */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex space-x-3 items-center">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full p-2 shadow-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-300 uppercase tracking-wider text-sm font-medium">Online Booking</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Appointment</span> with Ease
              </h2>
              <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed">
                Amai Men's Care premium booking system makes finding and scheduling time with your favorite barber simple and fast. Select your style, choose your barber, and secure your spot in seconds.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">+43%</p>
                    <p className="text-gray-400 text-sm">Appointment rate</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">+68%</p>
                    <p className="text-gray-400 text-sm">Revenue growth</p>
                  </div>
                </div>
              </div>
              
              <Button className="group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-7 py-6 rounded-full flex items-center gap-3 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] mt-4">
                <span>Book Appointment</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          
          {/* Right content - Mobile App Mockups */}
          <div className="relative h-[500px] sm:h-[600px] md:h-[700px] flex justify-center">
            {/* Phone mockup shell */}
            <div className="absolute z-30 w-[220px] sm:w-[260px] md:w-[320px] h-[450px] sm:h-[550px] md:h-[650px] bg-black rounded-[40px] sm:rounded-[50px] p-2 sm:p-3 md:p-4 shadow-[0_0_50px_rgba(30,64,175,0.3)] transform rotate-[5deg] translate-x-8 sm:translate-x-12 md:translate-x-16">
              <div className="relative w-full h-full overflow-hidden rounded-[40px] border-8 border-gray-800">
                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900 z-10 flex items-center justify-between px-4">
                  <div className="text-white text-xs">9:41</div>
                  <div className="rounded-full bg-gray-600 w-10 h-10"></div>
                </div>
                
                {/* Content based on activeTab */}
                <div className="h-full w-full bg-gray-900 pt-10 pb-4 px-4">
                  {/* Barber profile section */}
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <img 
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                        alt="Barber Hawk" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white text-lg font-bold">Barber Select</h3>
                    <p className="text-gray-400 text-sm">Choose your stylist</p>
                  </div>
                  
                  {/* App grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        id: 0,
                        image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        label: "Barbers"
                      },
                      {
                        id: 1,
                        image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        label: "Dashboard"
                      },
                      {
                        id: 2,
                        image: "https://images.unsplash.com/photo-1484501893633-8e2e0cbc8cbb?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        label: "Reports"
                      },
                      {
                        id: 3,
                        image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                        label: "Commissions"
                      }
                    ].map((item) => (
                      <div 
                        key={item.id}
                        className="bg-gray-800 rounded-xl aspect-square flex items-center justify-center cursor-pointer overflow-hidden group relative hover:shadow-lg transition-all duration-300"
                        onClick={() => setActiveTab(0)}
                      >
                        <img 
                          src={item.image} 
                          alt={item.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white font-medium text-sm bg-black/50 px-2 py-1 rounded-md">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Book button */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <button 
                      className="bg-white text-gray-900 w-full py-3 rounded-xl font-medium transition-all duration-300 hover:bg-blue-500 hover:text-white"
                      onClick={() => setActiveTab(0)}
                    >
                      Admin Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Secondary phone showing barber profile */}
            <div className="absolute z-20 w-[220px] sm:w-[260px] md:w-[320px] h-[450px] sm:h-[550px] md:h-[650px] bg-black rounded-[40px] sm:rounded-[50px] p-2 sm:p-3 md:p-4 shadow-[0_0_40px_rgba(147,51,234,0.3)] transform rotate-[-8deg] -translate-x-6 sm:-translate-x-9 md:-translate-x-12 translate-y-2 sm:translate-y-3 md:translate-y-4">
              <div className="relative w-full h-full overflow-hidden rounded-[40px] border-8 border-gray-800">
                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900 z-10 flex items-center justify-between px-4">
                  <div className="text-white text-xs">9:41</div>
                </div>
                
                {/* Content */}
                <div className="h-full w-full bg-gray-900 pt-10 pb-4 px-4">
                  
                  <h2 className="text-white text-xl font-medium mb-4">Choose a service</h2>
                  
                  {/* Services list */}
                  <div className="space-y-3">
                    <div 
                      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                        selectedService === 0 
                          ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                          : 'bg-gray-800 hover:bg-gray-750'
                      }`}
                      onClick={() => setSelectedService(0)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-medium ${selectedService === 0 ? 'text-white' : 'text-white'}`}>
                            Clipper & beard special
                          </h3>
                          <p className={`text-sm ${selectedService === 0 ? 'text-blue-100' : 'text-gray-400'}`}>
                            1 hr
                          </p>
                        </div>
                        <div className={`font-bold ${selectedService === 0 ? 'text-white' : 'text-white'}`}>
                          $95
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                        selectedService === 1 
                          ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                          : 'bg-gray-800 hover:bg-gray-750'
                      }`}
                      onClick={() => setSelectedService(1)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-medium ${selectedService === 1 ? 'text-white' : 'text-white'}`}>
                            Clipper, scissor & shave
                          </h3>
                          <p className={`text-sm ${selectedService === 1 ? 'text-blue-100' : 'text-gray-400'}`}>
                            1 hr
                          </p>
                        </div>
                        <div className={`font-bold ${selectedService === 1 ? 'text-white' : 'text-white'}`}>
                          $85
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                        selectedService === 2 
                          ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                          : 'bg-gray-800 hover:bg-gray-750'
                      }`}
                      onClick={() => setSelectedService(2)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`font-medium ${selectedService === 2 ? 'text-white' : 'text-white'}`}>
                            Scissor cut
                          </h3>
                          <p className={`text-sm ${selectedService === 2 ? 'text-blue-100' : 'text-gray-400'}`}>
                            1 hr
                          </p>
                        </div>
                        <div className={`font-bold ${selectedService === 2 ? 'text-white' : 'text-white'}`}>
                          $75
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View order button */}
                  <div className="absolute bottom-6 left-4 right-4">
                    <button className="bg-blue-500 text-white w-full py-3 rounded-xl font-medium shadow-lg">
                      View order - $95
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Third phone showing barber profile */}
            <div className="absolute z-10 w-[180px] sm:w-[220px] md:w-[320px] h-[180px] sm:h-[220px] md:h-[300px] bg-black rounded-[30px] sm:rounded-[35px] md:rounded-[40px] p-2 sm:p-2.5 md:p-3 shadow-[0_0_30px_rgba(236,72,153,0.3)] transform translate-y-[280px] sm:translate-y-[350px] md:translate-y-[400px] translate-x-[-40px] sm:translate-x-[-60px] md:translate-x-[-80px] rotate-[-5deg]">
              <div className="relative w-full h-full overflow-hidden rounded-[32px] border-8 border-gray-800">
                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 z-10 flex items-center justify-between px-3">
                  <div className="text-white text-xs">9:41</div>
                </div>
                
                {/* Content */}
                <div className="h-full w-full bg-gray-900 pt-8 px-3">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-white text-xl font-medium">Tamaki</h2>
                      <h3 className="text-white text-lg font-bold">Ryushi</h3>
                    </div>
                    <div className="bg-gray-800 rounded-lg w-10 h-10"></div>
                  </div>
                  
                  <div className="mt-2 space-y-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Productivity</p>
                      <div className="flex items-center justify-between">
                        <p className="text-blue-400 font-bold text-xl">68%</p>
                        <p className="text-gray-500 text-xs">Current month</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Retention rate</p>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-400 font-bold text-xl">43%</p>
                        <p className="text-gray-500 text-xs">Last quarter</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center">
                    <div className="relative w-24 h-24 rounded-full border-8 border-gray-800 flex flex-col items-center justify-center">
                      <p className="text-white font-bold text-xl">$210</p>
                      <p className="text-gray-500 text-[8px]">out of $340 projected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated elements */}
            <div className="absolute z-40 top-[10%] right-[5%] animate-float">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="absolute z-40 bottom-[30%] left-[10%] animate-float-slow">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                <Scissors className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="absolute z-40 top-[40%] left-[5%] animate-pulse">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
