import React from 'react';

interface CocoLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'badge';
}

export const CocoLogo: React.FC<CocoLogoProps> = ({
  className = 'w-8 h-8',
  size = 32,
  variant = 'icon',
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Tropical Caribbean Ocean Gradient */}
          <linearGradient id="cocoOceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#042F2E" />
          </linearGradient>

          {/* Golden Caribbean Sun Gradient */}
          <linearGradient id="cocoSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Tropical Palm Fronds Gradient */}
          <linearGradient id="palmFrondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Coconut Shell Gradient */}
          <linearGradient id="coconutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#713F12" />
          </linearGradient>
        </defs>

        {/* Outer Circular Badge / Caribbean Sun Ring */}
        <circle cx="32" cy="32" r="30" fill="url(#cocoOceanGrad)" />
        <circle cx="32" cy="32" r="28.5" stroke="url(#cocoSunGrad)" strokeWidth="1.5" strokeOpacity="0.75" />

        {/* Tropical Sun behind palm */}
        <circle cx="43" cy="21" r="9" fill="url(#cocoSunGrad)" opacity="0.9" />

        {/* Gentle Caribbean Wave Base */}
        <path
          d="M6 46C14 43 19 47 28 45C37 43 43 47 51 45C55 44 59 45 61 46C59 54 51 60 32 60C14 60 8 53 6 46Z"
          fill="#115E59"
          opacity="0.85"
        />
        <path
          d="M8 51C17 49 22 52 32 50C41 48 48 52 56 50C53 55 45 59 32 59C20 59 13 55 8 51Z"
          fill="#14B8A6"
          opacity="0.4"
        />

        {/* Palm Tree Trunk (curved tropical trunk) */}
        <path
          d="M26 50C25.5 41 28 32 34 26C35.5 24.5 35 24 33.5 24.5C26 29 23 39 23.5 50H26Z"
          fill="#D97706"
        />
        <path
          d="M26 50C25.5 41 28 32 34 26C34.5 25.5 34.2 25.2 33.5 25.5C27 30 24 40 24.5 50H26Z"
          fill="#92400E"
        />

        {/* Palm Frond 1 (Top Left Arch) */}
        <path
          d="M34 24.5C27 21 16 23 11 29C17 31 25 30 34 25.5Z"
          fill="url(#palmFrondGrad)"
        />

        {/* Palm Frond 2 (High Arch Left) */}
        <path
          d="M34 24C28 17 21 15 16 17C21 21 28 22 34 24.5Z"
          fill="#10B981"
        />

        {/* Palm Frond 3 (Top Crest Right) */}
        <path
          d="M34 23.5C36 15 44 14 51 15C47 19 41 22 34 24.5Z"
          fill="url(#palmFrondGrad)"
        />

        {/* Palm Frond 4 (Right Drape) */}
        <path
          d="M34 24.5C42 22 52 25 55 31C49 32 41 29 34 25.5Z"
          fill="#059669"
        />

        {/* Palm Frond 5 (Upper Fan Center) */}
        <path
          d="M34 23C32 14 36 9 39 8C39 14 37 19 34 24Z"
          fill="#34D399"
        />

        {/* Coconuts hanging from the palm crown */}
        <circle cx="31.5" cy="27" r="3" fill="url(#coconutGrad)" stroke="#451A03" strokeWidth="0.5" />
        <circle cx="35.5" cy="27.5" r="3.2" fill="url(#coconutGrad)" stroke="#451A03" strokeWidth="0.5" />
        <circle cx="33" cy="30.5" r="2.8" fill="url(#coconutGrad)" stroke="#451A03" strokeWidth="0.5" />

        {/* Tiny highlights on coconuts */}
        <circle cx="30.8" cy="26" r="0.8" fill="#FDE047" opacity="0.8" />
        <circle cx="34.8" cy="26.5" r="0.8" fill="#FDE047" opacity="0.8" />
      </svg>
    </div>
  );
};
