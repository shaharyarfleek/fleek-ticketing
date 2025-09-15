import React from 'react';

// Logo configuration file
// You can replace the placeholder SVG with your actual logo

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src={LogoImage.full} 
      alt="Fleek Logo" 
      className={className}
    />
  );
};

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <img 
      src={LogoImage.icon} 
      alt="Fleek Logo" 
      className={className}
    />
  );
};

// Alternative: If you want to use image files instead of inline SVG
export const LogoImage = {
  // Update these paths to point to your actual logo files
  full: '/joinfleek_logo.jpeg',
  icon: '/joinfleek_logo.jpeg',
  fullDark: '/joinfleek_logo.jpeg', // For dark mode
  iconDark: '/joinfleek_logo.jpeg', // For dark mode
};

// Logo text for fallback scenarios
export const LogoText = {
  full: 'Fleek',
  short: 'F',
};