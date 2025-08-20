import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  startOffset?: number;
  endOffset?: number;
  dragEnabled?: boolean;
  glareEffect?: boolean;
  rotateOnScroll?: boolean;
  rotateAmount?: number;
  opacityEffect?: boolean;
}

export const ParallaxElement: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  style = {},
  startOffset = 0,
  endOffset = 0,
  dragEnabled = false,
  glareEffect = false,
  rotateOnScroll = false,
  rotateAmount = 5,
  opacityEffect = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: '50%', y: '50%' });
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}`, `end ${endOffset}`]
  });
  
  // Apply spring physics for smoother animation
  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const springScrollY = useSpring(scrollYProgress, springConfig);
  
  // Create appropriate transform based on direction
  const getTransform = () => {
    const effectiveSpeed = prefersReducedMotion ? 0 : speed;
    const range = 100 * effectiveSpeed;
    
    switch (direction) {
      case 'up':
        return useTransform(springScrollY, [0, 1], [range, -range]);
      case 'down':
        return useTransform(springScrollY, [0, 1], [-range, range]);
      case 'left':
        return useTransform(springScrollY, [0, 1], [range, -range]);
      case 'right':
        return useTransform(springScrollY, [0, 1], [-range, range]);
      default:
        return useTransform(springScrollY, [0, 1], [0, 0]);
    }
  };
  
  const transform = getTransform();
  const rotate = useTransform(
    springScrollY, 
    [0, 1], 
    rotateOnScroll ? [-rotateAmount, rotateAmount] : [0, 0]
  );
  
  const opacity = useTransform(
    springScrollY,
    [0, 0.2, 0.8, 1],
    opacityEffect ? [0, 1, 1, 0] : [1, 1, 1, 1]
  );
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !glareEffect) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
    
    setGlarePosition({ x: `${x}%`, y: `${y}%` });
  };
  
  // Adjust style based on direction and motion properties
  const getMotionStyle = () => {
    const baseStyle = { ...style };
    
    if (direction === 'up' || direction === 'down') {
      return { ...baseStyle, y: transform };
    } else {
      return { ...baseStyle, x: transform };
    }
  };
  
  const motionStyle = getMotionStyle();
  
  return (
    <motion.div
      ref={ref}
      className={`${className} ${glareEffect ? 'relative overflow-hidden' : ''}`}
      style={{
        ...motionStyle,
        rotate: rotate,
        opacity: opacity,
        ...(dragEnabled ? {
          cursor: 'grab',
          perspective: 1000,
          transformStyle: 'preserve-3d'
        } : {}),
        ...(glareEffect && mousePosition.x !== 0 ? {
          transform: `perspective(1000px) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * -10}deg)`,
          transition: 'transform 0.2s ease-out'
        } : {})
      }}
      drag={dragEnabled}
      dragConstraints={ref}
      dragElastic={0.2}
      onMouseMove={handleMouseMove}
      whileTap={dragEnabled ? { cursor: 'grabbing' } : undefined}
    >
      {children}
      
      {glareEffect && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x} ${glarePosition.y}, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)`,
            opacity: Math.abs(mousePosition.x) + Math.abs(mousePosition.y)
          }}
        />
      )}
    </motion.div>
  );
};

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  backgroundUrl?: string;
  speed?: number;
  overlayColor?: string;
  overlayOpacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  backgroundUrl,
  speed = 0.2,
  overlayColor = '#000',
  overlayOpacity = 0.5,
  className = '',
  style = {}
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['0%', `${speed * 100}%`]
  );
  
  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {backgroundUrl && (
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            y
          }}
        />
      )}
      
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity
          }}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const FloatingElement: React.FC<{
  children: React.ReactNode;
  amplitude?: number;
  duration?: number;
  direction?: 'vertical' | 'horizontal' | 'circular' | 'random';
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}> = ({
  children,
  amplitude = 10,
  duration = 6,
  direction = 'vertical',
  className = '',
  style = {},
  delay = 0
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Create appropriate animation based on direction
  const getAnimationVariants = () => {
    if (prefersReducedMotion) {
      return {
        animate: {
          y: 0,
          x: 0,
          transition: { duration: 0 }
        }
      };
    }
    
    switch (direction) {
      case 'vertical':
        return {
          animate: {
            y: [amplitude * -1, amplitude, amplitude * -1],
            transition: {
              repeat: Infinity,
              duration,
              ease: "easeInOut",
              delay
            }
          }
        };
      case 'horizontal':
        return {
          animate: {
            x: [amplitude * -1, amplitude, amplitude * -1],
            transition: {
              repeat: Infinity,
              duration,
              ease: "easeInOut",
              delay
            }
          }
        };
      case 'circular':
        return {
          animate: {
            x: [amplitude * -1, 0, amplitude, 0, amplitude * -1],
            y: [0, amplitude * -1, 0, amplitude, 0],
            transition: {
              repeat: Infinity,
              duration,
              ease: "easeInOut",
              delay
            }
          }
        };
      case 'random':
        return {
          animate: {
            x: [
              amplitude * -0.5, 
              amplitude * 0.2, 
              amplitude * -0.3, 
              amplitude * 0.7, 
              amplitude * -0.5
            ],
            y: [
              amplitude * 0.3, 
              amplitude * -0.7, 
              amplitude * 0.2, 
              amplitude * -0.4, 
              amplitude * 0.3
            ],
            transition: {
              repeat: Infinity,
              duration: duration * 1.5,
              ease: "easeInOut",
              delay
            }
          }
        };
      default:
        return {
          animate: {
            y: [amplitude * -1, amplitude, amplitude * -1],
            transition: {
              repeat: Infinity,
              duration,
              ease: "easeInOut",
              delay
            }
          }
        };
    }
  };
  
  const variants = getAnimationVariants();
  
  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      animate="animate"
    >
      {children}
    </motion.div>
  );
};
