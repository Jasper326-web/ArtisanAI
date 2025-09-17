'use client';

import React from 'react';

interface LottieArrowProps {
  className?: string;
  size?: number;
}

export function LottieArrow({ className = '', size = 40 }: LottieArrowProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size * 2, height: size * 2 }}>
      <div 
        className="arrow-animation"
        style={{ 
          width: size, 
          height: size,
          transform: 'rotate(30deg)'
        }}
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M20 50 L80 50 M70 40 L80 50 L70 60" 
            stroke="white" 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
}
