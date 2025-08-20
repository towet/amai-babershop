
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Scissors, Calendar, Users, CheckCircle, Clock, Star } from "lucide-react";

export const AppShowcase = () => {
  const [activePhone, setActivePhone] = useState(1);
  const [serviceSelected, setServiceSelected] = useState(0);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Auto-rotate active phone every 5 seconds
    const interval = setInterval(() => {
      setActivePhone((prev) => (prev + 1) > 3 ? 1 : prev + 1);
    }, 5000);

    // Animate progress bar
    setAnimateProgress(true);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 68) return prev + 1;
        return prev;
      });
    }, 30);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 rounded-full filter blur-3xl opacity-60 animate-float-slow"></div>
        <div className="absolute bottom-[20%] right-[15%] w-80 h-80 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full filter blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-[40%] right-[30%] w-40 h-40 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-full filter blur-3xl opacity-70 animate-float-horizontal"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-['Bebas_Neue'] text-5xl lg:text-7xl leading-none text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">FILL YOUR</span>
            <br />
            <span className="relative inline-block mt-1">
              CHAIR
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mt-6">
            Get found where clients search - Google, Instagram, and AMAI
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-5 lg:gap-8 relative">
          {/* Floating elements */}
          <div className="hidden lg:block absolute -top-10 left-0 z-20 animate-float">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg transform rotate-12">
              <Scissors className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="hidden lg:block absolute -bottom-5 right-0 z-20 animate-float-slow">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          
          {/* Phone 1 - Service Selection */}
          <div className={`relative ${activePhone === 1 ? 'z-30 scale-100 opacity-100' : 'z-10 scale-95 opacity-80'} transition-all duration-500 hover:z-50 hover:scale-105`} 
            onMouseEnter={() => setActivePhone(1)}
          >
            <div className="w-[300px] h-[580px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
              {/* Phone notch */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center justify-center rounded-b-xl">
                <div className="w-24 h-4 bg-gray-900 rounded-full"></div>
              </div>

              {/* Status bar */}
              <div className="pt-8 px-4 pb-4">
                <div className="text-white text-xs font-medium text-right">9:41</div>
              </div>

              {/* App content */}
              <div className="px-5 h-full">
                <h3 className="text-white text-lg font-semibold mb-4">Choose a service</h3>
                
                <div className="space-y-3 mb-6">
                  {[
                    { id: 0, name: "Clipper & beard special", duration: "1 hr", price: "$95", image: "https://m.media-amazon.com/images/S/aplus-media-library-service-media/2306b2c5-7a8a-4c1b-a05b-8430241c44e6.__CR0,0,1464,625_PT0_SX1464_V1___.jpg" },
                    { id: 1, name: "Clipper, scissor & shave", duration: "1 hr", price: "$85", image: "https://thumbs.dreamstime.com/b/generated-image-beard-barbershop-hairdresser-hair-salon-bearded-man-barber-scissors-shop-vintage-shaving-hairstylist-serving-376313153.jpg" },
                    { id: 2, name: "Scissor cut", duration: "1 hr", price: "$75", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEF4riWhOhGGLPqkI9IyyF9J9beg1yiga4kw&s" }
                  ].map((service, index) => (
                    <div 
                      key={service.id}
                      className={`rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${serviceSelected === index ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'ring-0'}`}
                      onClick={() => setServiceSelected(index)}
                    >
                      <div className={`relative ${serviceSelected === index ? 'bg-blue-500' : 'bg-gray-800'}`}>
                        <div className="absolute inset-0 overflow-hidden opacity-20">
                          <img 
                            src={service.image} 
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className={`font-medium ${serviceSelected === index ? 'text-white' : 'text-white'}`}>
                                {service.name}
                              </div>
                              <div className={`text-sm ${serviceSelected === index ? 'text-blue-100' : 'text-gray-400'}`}>
                                {service.duration}
                              </div>
                            </div>
                            <div className={`font-bold ${serviceSelected === index ? 'text-white' : 'text-white'}`}>
                              {service.price}
                            </div>
                          </div>
                          {serviceSelected === index && (
                            <div className="absolute top-3 right-3">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-8 left-5 right-5">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 py-6 rounded-xl font-medium shadow-inner">
                    View order - $95
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phone 2 - Barber Profile */}
          <div className={`relative ${activePhone === 2 ? 'z-30 scale-100 opacity-100 md:translate-y-[-20px]' : 'z-10 scale-95 opacity-80'} transition-all duration-500 hover:z-50 hover:scale-105`}
            onMouseEnter={() => setActivePhone(2)}
          >
            <div className="w-[300px] h-[620px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
              {/* Phone notch */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center justify-center rounded-b-xl">
                <div className="w-24 h-4 bg-gray-900 rounded-full"></div>
              </div>

              {/* Status bar */}
              <div className="pt-8 px-4 pb-4">
                <div className="text-white text-xs font-medium text-right">9:41</div>
              </div>

              {/* App content */}
              <div className="px-5 h-full">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full mx-auto mb-3 overflow-hidden border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <img 
                      src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Barber Hawk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-white text-xl font-bold">I'm Hawk</h3>
                  <p className="text-gray-400 text-sm">- your barber.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 0, image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", label: "Portfolio" },
                    { id: 1, image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", label: "Shop" },
                    { id: 2, image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", label: "Reviews" },
                    { id: 3, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", label: "Hours" }
                  ].map((item) => (
                    <div 
                      key={item.id}
                      className="aspect-square rounded-xl overflow-hidden group relative hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <img 
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">{item.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute bottom-8 left-5 right-5">
                  <Button className="w-full bg-white hover:bg-blue-50 text-gray-900 py-6 rounded-xl font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Book new appointment
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Phone 3 - Analytics Dashboard */}
          <div className={`relative ${activePhone === 3 ? 'z-30 scale-100 opacity-100' : 'z-10 scale-95 opacity-80'} transition-all duration-500 hover:z-50 hover:scale-105`}
            onMouseEnter={() => setActivePhone(3)}
          >
            <div className="w-[300px] h-[580px] bg-gray-900 rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden relative">
              {/* Phone notch */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800 flex items-center justify-center rounded-b-xl">
                <div className="w-24 h-4 bg-gray-900 rounded-full"></div>
              </div>

              {/* Status bar */}
              <div className="pt-8 px-4 pb-4">
                <div className="text-white text-xs font-medium text-right">9:41</div>
              </div>

              {/* App content */}
              <div className="px-5 pt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white text-xl font-bold">Tamaki</h3>
                    <h3 className="text-white text-xl font-bold">Ryushi</h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                      alt="Tamaki profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm font-medium">Productivity</div>
                    <div className="text-blue-400 text-2xl font-bold">{progress}%</div>
                    <div className="mt-2 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-gray-500 text-xs mt-2">Current month</div>
                  </div>
                  
                  <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="text-gray-400 text-sm font-medium">Retention rate</div>
                    <div className="text-purple-400 text-2xl font-bold">43%</div>
                    <div className="mt-2 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '43%' }}></div>
                    </div>
                    <div className="text-gray-500 text-xs mt-2">Last quarter</div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-[180px] h-[180px] rounded-full border-8 border-gray-800 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">$210</div>
                        <div className="text-gray-400 text-xs">out of $340 projected</div>
                      </div>
                    </div>
                    <div 
                      className="absolute top-0 left-0 w-full h-full rounded-full border-[16px] border-transparent animate-spin-slow" 
                      style={{ 
                        borderTopColor: '#3b82f6',
                        borderRightColor: '#8b5cf6',
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 62% 62%, 62% 38%, 38% 38%, 38% 62%, 0 62%)',
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-around">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto border border-gray-700">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-white text-sm mt-1">17</div>
                    <div className="text-gray-500 text-xs">Clients</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto border border-gray-700">
                      <Star className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-white text-sm mt-1">4.9</div>
                    <div className="text-gray-500 text-xs">Rating</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto border border-gray-700">
                      <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-white text-sm mt-1">92%</div>
                    <div className="text-gray-500 text-xs">On time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
