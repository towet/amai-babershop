import React from 'react';

interface AmaiLogoProps {
  subtitle?: string; // e.g. "MEN'S CARE", "MANAGER", "ADMIN"
  className?: string;
}

const AmaiLogo: React.FC<AmaiLogoProps> = ({ subtitle, className = "" }) => (
  <div className={`flex items-center space-x-1 font-semibold tracking-widest ${className}`}>
    {/* Apply Lato font to the A M A I text for brand consistency */}
    <span
      className="text-white text-2xl"
      style={{
        letterSpacing: '0.25em',
        fontFamily: 'Lato, sans-serif',
        fontWeight: 400
      }}
    >
      A M A I
    </span>
    <span className="text-amber-500 mx-1 text-xl">|</span>
    {/* The 'Lato' font is loaded via /public/lato.css and should be available globally. */}
    {subtitle && (
      <span
        className="text-xs text-white tracking-normal font-light uppercase"
        style={{
          letterSpacing: '0.15em',
          fontFamily: 'Lato, sans-serif',
          fontWeight: 400
        }}
      >
        {subtitle}
      </span>
    )}
  </div>
);

export default AmaiLogo;
