/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'full' | 'footer' | 'horizontal';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSizeClass?: string;
}

export default function Logo({
  variant = 'full',
  className = '',
  size = 'md',
  customSizeClass = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-10 w-auto',
    md: 'h-16 w-auto',
    lg: 'h-24 w-auto',
    xl: 'h-32 w-auto',
    custom: customSizeClass,
  };

  const selectedSize = sizeClasses[size];
  const isHorizontal = variant === 'horizontal';

  const logoElement = (
    <img
      src="/images/logo.png"   // ← served from public/images/
      alt="Body & Beauty Salon Logo"
      className={`${selectedSize} object-contain transition-all duration-300 hover:scale-[1.02] drop-shadow-[0_2px_8px_rgba(212,175,55,0.15)]`}
    />
  );

  if (variant === 'icon') {
    return <div className={`flex items-center justify-center select-none ${className}`}>{logoElement}</div>;
  }

  if (isHorizontal) {
    return (
      <div className={`flex flex-row items-center gap-3.5 select-none ${className}`}>
        <div className="shrink-0">{logoElement}</div>
      </div>
    );
  }

  return <div className={`flex flex-col items-center select-none ${className}`}>{logoElement}</div>;
}