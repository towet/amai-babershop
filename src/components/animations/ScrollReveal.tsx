import React, { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation, Variant, UseInViewOptions } from 'framer-motion';

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%" | string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  staggerChildren?: number;
  staggerDelay?: number;
  scale?: number;
  rotate?: number;
  blur?: boolean;
  className?: string;
  style?: React.CSSProperties;
  viewport?: { once?: boolean; margin?: string };
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  width = "100%",
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 50,
  once = true,
  threshold = 0.1,
  staggerChildren = 0,
  staggerDelay = 0.1,
  scale = 1,
  rotate = 0,
  blur = false,
  className = "",
  style = {},
  viewport,
}) => {
  const ref = useRef(null);
  // Create view options with proper typings
  const viewOptions: UseInViewOptions = {
    once,
    amount: threshold
  };
  
  // Add margin if provided (handled by framer-motion appropriately)
  if (viewport?.margin) {
    viewOptions.margin = viewport.margin as any; // Use type assertion for compatibility
  }
  
  // Add once override if provided in viewport
  if (viewport?.once !== undefined) {
    viewOptions.once = viewport.once;
  }
  
  const isInView = useInView(ref, viewOptions);
  const controls = useAnimation();
  
  // Calculate variants based on direction
  const getVariants = () => {
    let initial: Variant = { opacity: 0 };
    const animate: Variant = { 
      opacity: 1, 
      transition: { 
        duration, 
        delay, 
        staggerChildren,
        staggerDelay,
      }
    };
    
    if (direction === 'up') {
      initial = { ...initial, y: distance };
      animate.y = 0;
    } else if (direction === 'down') {
      initial = { ...initial, y: -distance };
      animate.y = 0;
    } else if (direction === 'left') {
      initial = { ...initial, x: distance };
      animate.x = 0;
    } else if (direction === 'right') {
      initial = { ...initial, x: -distance };
      animate.x = 0;
    }
    
    if (scale !== 1) {
      initial.scale = scale;
      animate.scale = 1;
    }
    
    if (rotate !== 0) {
      initial.rotate = rotate;
      animate.rotate = 0;
    }
    
    if (blur) {
      initial.filter = "blur(10px)";
      animate.filter = "blur(0px)";
    }
    
    return { initial, animate, exit: { opacity: 0 } };
  };
  
  const variants = getVariants();
  
  useEffect(() => {
    if (isInView) {
      controls.start("animate");
    } else if (!once) {
      controls.start("initial");
    }
  }, [isInView, controls, once]);
  
  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={controls}
      variants={variants}
      style={{ width, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  delay?: number;
}> = ({ 
  children, 
  staggerDelay = 0.1, 
  className = "",
  delay = 0 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  className?: string;
}> = ({ 
  children, 
  direction = "up", 
  distance = 30,
  duration = 0.5, 
  className = "" 
}) => {
  // Calculate variants based on direction
  const getVariants = () => {
    let hidden: Variant = { opacity: 0 };
    const show: Variant = { 
      opacity: 1, 
      transition: { duration } 
    };
    
    if (direction === 'up') {
      hidden = { ...hidden, y: distance };
      show.y = 0;
    } else if (direction === 'down') {
      hidden = { ...hidden, y: -distance };
      show.y = 0;
    } else if (direction === 'left') {
      hidden = { ...hidden, x: distance };
      show.x = 0;
    } else if (direction === 'right') {
      hidden = { ...hidden, x: -distance };
      show.x = 0;
    }
    
    return { hidden, show };
  };
  
  const variants = getVariants();
  
  return (
    <motion.div
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const useScrollPosition = () => {
  const [scrollY, setScrollY] = React.useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return scrollY;
};
