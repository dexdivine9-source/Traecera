'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProjectLogoProps = {
  src?: string | null;
  name: string;
  category?: string | null;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
};

const categoryColors: Record<string, string> = {
  "Gateway": "#7C3AED",
  "Payments": "#2563EB",
  "Off-ramp": "#0D9488",
  "DeFi": "#16A34A",
  "Gaming": "#EA580C",
  "Infrastructure": "#6B7280",
  "Security": "#DC2626",
  "Social Commerce": "#DB2777",
  "Creator Economy": "#9333EA",
  "AI+Crypto": "#0EA5E9",
  "Analytics": "#F59E0B",
  "default": "#7C3AED",
};

export default function ProjectLogo({ src, name, category, className = "", fill = false, width, height }: ProjectLogoProps) {
  const [error, setError] = useState(false);

  const initials = name ? name.substring(0, 2).toUpperCase() : "?";
  const bgColor = categoryColors[category || ""] || categoryColors["default"];

  if (!src || error) {
    return (
      <div 
        className={`flex items-center justify-center font-bold text-white tracking-widest ${className}`}
        style={{ 
          backgroundColor: bgColor, 
          width: fill ? '100%' : width, 
          height: fill ? '100%' : height 
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={name} 
      className={`object-cover ${className}`}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      {...(fill ? { fill: true } : { width, height })}
    />
  );
}
