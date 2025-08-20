import React, { useEffect } from 'react';

// This utility component helps ensure proper mobile viewport setup
export const MobileViewportMeta: React.FC = () => {
  useEffect(() => {
    // Set proper viewport meta tag
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Check if it already exists
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.remove();
    }
    
    document.head.appendChild(viewportMeta);

    // Add touch-action and smoother scrolling for mobile
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent;
      }
      html, body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        touch-action: manipulation;
      }
      .prevent-scroll {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
      }
      @media (max-width: 640px) {
        :root {
          --section-padding: 2rem 1rem;
        }
        .md\\:text-5xl {
          font-size: 2.5rem;
          line-height: 1.1;
        }
        .md\\:text-2xl {
          font-size: 1.25rem;
          line-height: 1.4;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Fix iOS safari height issues
    const resizeHandler = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    resizeHandler();
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', resizeHandler);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('orientationchange', resizeHandler);
    };
  }, []);
  
  return null;
};

// Helper to detect if device is mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      const mobileWidth = 768; // Typical mobile breakpoint
      setIsMobile(window.innerWidth < mobileWidth);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  return isMobile;
};

// MobileOptimizedContainer to enhance performance on mobile
export const MobileOptimizedContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`${className} ${isMobile ? 'mobile-optimized' : ''}`}
      style={{
        contain: isMobile ? 'content' : 'none',
        contentVisibility: isMobile ? 'auto' : 'visible',
        containIntrinsicSize: isMobile ? '0 500px' : 'none'
      }}
    >
      {children}
    </div>
  );
};
