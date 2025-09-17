'use client';

import React from 'react';
import Lottie from 'lottie-react';
import arrowAnimation from '../public/arrow-complete.json';

interface LottieArrowProps {
  className?: string;
  size?: number;
}

export function LottieArrow({ className = '', size = 40 }: LottieArrowProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size * 2, height: size * 2 }}>
      <Lottie
        animationData={arrowAnimation}
        loop={true}
        autoplay={true}
        speed={0.3}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
