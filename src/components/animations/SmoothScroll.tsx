import React, { useEffect, ReactNode } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface SmoothScrollProps {
  children: ReactNode;
  className?: string;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children, className = '' }) => {
  // Create a spring-based smooth scrolling effect
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />
      <div className={className}>
        {children}
      </div>
    </>
  );
};

// Smooth scroll link component
interface SmoothScrollLinkProps {
  children: ReactNode;
  to: string;
  className?: string;
  duration?: number;
  offset?: number;
}

export const SmoothScrollLink: React.FC<SmoothScrollLinkProps> = ({ 
  children, 
  to, 
  className = '',
  duration = 0.8,
  offset = 0
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Find the target element
    const targetId = to.replace(/^#/, '');
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Get the target position
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
      
      // Scroll smoothly to the target position
      window.scrollTo({
        top: targetPosition + offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

// Add IDs to sections for smooth scrolling
export const withSectionId = <P extends object>(
  Component: React.ComponentType<P>,
  sectionId: string
): React.FC<P> => {
  return (props: P) => {
    return (
      <section id={sectionId}>
        <Component {...props} />
      </section>
    );
  };
};

// Hook to create a tilt effect on mouse move
export const useTiltEffect = (ref: React.RefObject<HTMLElement>, intensity: number = 25) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      element.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${y * -intensity}deg)`;
    };
    
    const handleMouseLeave = () => {
      element.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
      element.style.transition = 'transform 0.5s ease-out';
    };
    
    const handleMouseEnter = () => {
      element.style.transition = 'transform 0.1s ease-out';
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseenter', handleMouseEnter);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [ref, intensity]);
};

// Create a scroll-based progress indicator for horizontal progress
export const ScrollProgress: React.FC<{
  className?: string;
  barClassName?: string;
}> = ({ className = '', barClassName = '' }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div 
      className={`fixed top-0 left-0 right-0 h-1 origin-left z-50 ${className}`}
      style={{ scaleX }}
    >
      <div className={`h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 ${barClassName}`} />
    </motion.div>
  );
};
