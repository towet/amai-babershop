import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Scissors } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const AboutUsSection = () => {
  const [aboutImage, setAboutImage] = useState("");
  useEffect(() => {
    const fetchImage = async () => {
      const { data } = await supabase.storage.from("heroimage").getPublicUrl("about.jpg");
      setAboutImage(data?.publicUrl ? `${data.publicUrl}?t=${Date.now()}` : "");
    };
    fetchImage();
  }, []);
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  
  // Interactive image tilt
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateX((y - centerY) / 15);
    setRotateY((centerX - x) / 15);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  
  return (
    <section 
      ref={sectionRef}
      id="about-us"
      className="py-20 md:py-28 px-4 sm:px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-amber-400/10 rounded-full blur-[120px] animate-float"></div>
      </div>
      

      
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Text Content */}
          <motion.div 
            ref={textRef}
            className="space-y-6 relative z-10"
            style={{ y, opacity }}
          >
            <div>
              <h2 className="text-6xl md:text-7xl font-['Bebas_Neue'] leading-none tracking-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">ABOUT</span>
                <span className="block mt-1 font-['Lato'] font-light tracking-[0.2em] text-white uppercase">
                  <span className="text-orange-400">Amai</span> Men's Care
                </span>
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-300 text-lg">
              <p>
                Amai Men's Care is more than just a grooming establishment — it's a space where tradition meets modern masculinity. 
                We offer a premium grooming experience tailored to the style and comfort of today's man.
              </p>
              
              <p>
                Founded with a passion for excellence, Amai blends timeless barbering techniques with contemporary trends, 
                ensuring each client leaves not only looking sharp but feeling confident. Whether it's a clean cut, a precise 
                beard trim, or a full grooming package, our skilled barbers are dedicated to detail, style, and satisfaction.
              </p>
              
              <p>
                At Amai, we believe grooming is a form of self-care. That's why we've created a relaxed, stylish atmosphere 
                where every visit feels like a break from the busy city — a moment to recharge and refresh.
              </p>
              
              <p className="font-semibold text-amber-400">
                Welcome to your new grooming ritual. Welcome to Amai Men's Care.
              </p>
            </div>
            
            <div className="mt-6"></div>
          </motion.div>
          
          {/* Image with 3D effect */}
          <div 
            ref={imageContainerRef}
            className="relative h-[500px] w-full max-w-md mx-auto md:mx-0 z-10 perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div 
              className="w-full h-full rounded-2xl shadow-2xl overflow-hidden"
              style={{
                rotateX: rotateX,
                rotateY: rotateY,
                transition: "transform 0.1s ease-out"
              }}
            >
              <div className="relative w-full h-full">
                {/* Main image */}
                <img 
                  src={aboutImage || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"}
                  alt="Amai Men's Care Interior" 
                  className="object-cover w-full h-full"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 space-y-2">
                  <div className="text-amber-400 font-semibold text-lg">EXPERIENCE</div>
                  <div className="text-white text-2xl font-bold">Premium Men's Care</div>
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                </div>
                
                {/* Floating elements */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-0.5 shadow-lg"
                  animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Scissors className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
