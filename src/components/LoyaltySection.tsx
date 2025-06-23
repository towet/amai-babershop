
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LoyaltySection = () => {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight text-white">
                LOCK IN
                <br />
                <span className="text-white">LOYALTY</span>
              </h2>
              
              <p className="text-xl text-gray-400 max-w-md">
                Launch your own booking app so clients tap your icon on their phone
              </p>
              
              <Button className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full flex items-center space-x-2">
                <span>Be an icon</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-pink-400 to-purple-500 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 w-full">
                  <div className="mb-6">
                    <img 
                      src="/lovable-uploads/c8dc6bd0-1829-4b6d-b706-84edbbb83f83.png" 
                      alt="Barber professional" 
                      className="w-32 h-32 rounded-2xl object-cover float-right"
                    />
                  </div>
                  
                  <div className="bg-black/40 rounded-2xl p-4 max-w-xs">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 rounded-xl p-3 flex flex-col items-center justify-center">
                        <div className="text-white text-sm font-semibold">SUN</div>
                        <div className="text-white text-2xl font-bold">6</div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-3 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                      <div>
                        <div className="text-black font-semibold text-sm">Choose your</div>
                        <div className="text-black font-semibold text-sm">app icon</div>
                      </div>
                    </div>
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
