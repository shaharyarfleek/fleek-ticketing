import React from 'react';

// Logo configuration file
// You can replace the placeholder SVG with your actual logo

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Replace this placeholder with your actual logo SVG content */}
      <rect width="200" height="200" rx="20" fill="#3B82F6" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="72"
        fontWeight="bold"
      >
        LOGO
      </text>
    </svg>
  );
};

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Replace this placeholder with your actual icon SVG content */}
      <rect width="40" height="40" rx="8" fill="#3B82F6" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        L
      </text>
    </svg>
  );
};

// Alternative: If you want to use image files instead of inline SVG
export const LogoImage = {
  // Update these paths to point to your actual logo files
  full: '/logo-full.png',
  icon: '/logo-icon.png',
  fullDark: '/logo-full-dark.png', // For dark mode
  iconDark: '/logo-icon-dark.png', // For dark mode
};

// Logo text for fallback scenarios
export const LogoText = {
  full: 'Your Company Name',
  short: 'YCN',
};