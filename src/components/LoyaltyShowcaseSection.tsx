import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LoyaltySection = () => {
  return (
    <section className="py-24 px-6 bg-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content - Text and button */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-7xl font-bold leading-none tracking-tight text-white font-['Bebas_Neue']">
                LOCK IN
                <br />
                LOYALTY
              </h2>
              
              <p className="text-xl text-gray-300 max-w-md leading-relaxed">
                Launch your own booking app so clients tap your icon on their phone
              </p>
              
              <Button className="group bg-pink-500 hover:bg-pink-600 text-white px-8 py-6 rounded-full flex items-center space-x-3 text-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]">
                <span>Be an icon</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          
          {/* Right content - Interactive phone mockup */}
          <div className="relative h-[550px]">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            
            {/* Pink background container */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl"></div>
            
            {/* Barber image */}
            <div className="absolute right-4 top-4 w-[60%] h-[80%] z-10 overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Professional barber" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Phone mockup */}
            <div className="absolute bottom-6 left-6 z-20 bg-black/20 backdrop-blur-sm rounded-2xl p-6 w-[65%]">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Calendar day */}
                <div className="bg-black/60 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="text-white text-xs font-medium">SUN</div>
                  <div className="text-white text-2xl font-bold">6</div>
                </div>
                {/* Camera icon */}
                <div className="bg-black/60 rounded-xl p-3 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* Clock icon */}
                <div className="bg-black/60 rounded-xl p-3 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {/* App icon with barber */}
                <div className="bg-white rounded-xl p-2 flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1518207859013-783975d4bec5?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                    alt="Barber app icon" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </div>
              </div>
              
              {/* Choose icon section */}
              <div className="bg-white rounded-xl p-3 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-black font-medium text-sm">Choose your</div>
                  <div className="text-black font-bold text-sm">app icon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
