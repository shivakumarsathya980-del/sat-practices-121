import React from 'react';
import { motion } from 'motion/react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'glass';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* Education Crest Emblem matching user's exact logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.25 }}
        className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Blue Gradient for Left Wreath & Pen */}
            <linearGradient id="blueWreath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Orange Gradient for Right Wreath & Open Book */}
            <linearGradient id="orangeWreath" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Flame Glow */}
            <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
          </defs>

          {/* LEFT BLUE LAUREL WREATH */}
          <g fill="#2563eb">
            {/* Main curved arc */}
            <path
              d="M100 168 C58 168 28 136 28 98 C28 62 56 32 96 30"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Leaf Clusters */}
            <path d="M30 96 C20 90 22 78 32 82 C38 84 40 92 30 96 Z" />
            <path d="M34 116 C24 112 26 100 36 104 C42 106 43 114 34 116 Z" />
            <path d="M44 136 C35 133 36 120 46 123 C52 125 52 133 44 136 Z" />
            <path d="M60 152 C52 151 51 138 61 140 C67 141 66 149 60 152 Z" />
            <path d="M80 162 C73 162 70 150 80 150 C86 150 84 158 80 162 Z" />
            <path d="M30 76 C20 73 24 60 34 65 C40 68 40 75 30 76 Z" />
            <path d="M38 58 C30 54 35 42 44 48 C49 51 47 58 38 58 Z" />
            <path d="M52 42 C44 40 50 28 58 34 C63 37 60 44 52 42 Z" />
            <path d="M72 32 C65 30 70 18 78 24 C83 27 79 33 72 32 Z" />
            <path d="M92 28 C86 28 89 16 97 20 C101 22 97 29 92 28 Z" />
          </g>

          {/* RIGHT ORANGE LAUREL WREATH */}
          <g fill="#ea580c">
            {/* Main curved arc */}
            <path
              d="M100 168 C142 168 172 136 172 98 C172 62 144 32 104 30"
              stroke="#ea580c"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Leaf Clusters */}
            <path d="M170 96 C180 90 178 78 168 82 C162 84 160 92 170 96 Z" />
            <path d="M166 116 C176 112 174 100 164 104 C158 106 157 114 166 116 Z" />
            <path d="M156 136 C165 133 164 120 154 123 C148 125 148 133 156 136 Z" />
            <path d="M140 152 C148 151 149 138 139 140 C133 141 134 149 140 152 Z" />
            <path d="M120 162 C127 162 130 150 120 150 C114 150 116 158 120 162 Z" />
            <path d="M170 76 C180 73 176 60 166 65 C160 68 160 75 170 76 Z" />
            <path d="M162 58 C170 54 165 42 156 48 C151 51 153 58 162 58 Z" />
            <path d="M148 42 C156 40 150 28 142 34 C137 37 140 44 148 42 Z" />
            <path d="M128 32 C135 30 130 18 122 24 C117 27 121 33 128 32 Z" />
            <path d="M108 28 C114 28 111 16 103 20 C99 22 103 29 108 28 Z" />
          </g>

          {/* RADIATING SUN RAYS AT TOP */}
          <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
            <line x1="100" y1="52" x2="100" y2="44" />
            <line x1="88" y1="56" x2="82" y2="50" />
            <line x1="78" y1="64" x2="70" y2="60" />
            <line x1="112" y1="56" x2="118" y2="50" />
            <line x1="122" y1="64" x2="130" y2="60" />
          </g>

          {/* CANDLE / TORCH FLAME */}
          <path
            d="M100 52 C95 62 93 72 100 82 C107 72 105 62 100 52 Z"
            fill="url(#flameGrad)"
          />

          {/* OPEN BOOK (ORANGE / AMBER PAGES) */}
          {/* Left Page */}
          <path
            d="M96 82 L70 80 C67 80 65 82 65 85 L65 125 C65 128 68 130 71 130 L96 134 Z"
            fill="#f59e0b"
          />
          {/* Right Page */}
          <path
            d="M104 82 L130 80 C133 80 135 82 135 85 L135 125 C135 128 132 130 129 130 L104 134 Z"
            fill="#ea580c"
          />
          {/* Center Spine */}
          <rect x="96" y="80" width="8" height="54" fill="#d97706" rx="2" />

          {/* BLUE RIBBON WINGS AT BASE */}
          <path
            d="M62 122 C48 122 42 128 44 134 C52 138 72 136 94 130 C76 132 66 128 62 122 Z"
            fill="#1d4ed8"
          />
          <path
            d="M138 122 C152 122 158 128 156 134 C148 138 128 136 106 130 C124 132 134 128 138 122 Z"
            fill="#1d4ed8"
          />

          {/* BLUE FOUNTAIN PEN NIB AT CENTER BASE */}
          <g fill="#1d4ed8">
            <path d="M94 132 H106 L104 142 L100 156 L96 142 Z" />
            <circle cx="100" cy="142" r="1.5" fill="#ffffff" />
            <line x1="100" y1="144" x2="100" y2="154" stroke="#ffffff" strokeWidth="1" />
          </g>
        </svg>
      </motion.div>

      {/* Typography with EDUCATION Header & Tagline */}
      <div>
        <div className="flex flex-col">
          <span
            className={`font-black tracking-wider ${titleSizes[size]} text-amber-500 font-sans leading-none flex items-center space-x-1.5`}
          >
            <span>EDUCATION</span>
          </span>

          {showSubtitle && (
            <span
              className={`text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase mt-1 leading-tight flex items-center space-x-1 ${
                variant === 'dark' ? 'text-indigo-200/90' : 'text-blue-900'
              }`}
            >
              <span>DIGITAL . ONLINE</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
