'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Mood } from '@/lib/moods';

interface SingleLanternProps {
  mood: Mood;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  isFloating: boolean;
}

export function SingleLantern({
  mood,
  index,
  isActive,
  onActivate,
  isFloating,
}: SingleLanternProps) {
  const [isHovered, setIsHovered] = useState(false);

  const swayDelay = index * 0.3;
  const hangHeight = 80 + (index % 2) * 30;

  const getPulseAnimation = () => {
    switch (mood.pulseType) {
      case 'soft':
        return { opacity: [0.6, 0.9, 0.6] };
      case 'flicker':
        return { opacity: [1, 0.8, 0.9, 1, 0.8] };
      case 'steady':
        return { opacity: [0.85, 0.95, 0.85] };
      case 'slow':
        return { opacity: [0.5, 0.7, 0.5] };
      case 'bouncy':
        return { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] };
      default:
        return { opacity: [0.6, 0.9, 0.6] };
    }
  };

  return (
    <div className="relative flex flex-col items-center" style={{ top: `${hangHeight}px` }}>
      <svg
        className="absolute"
        style={{
          top: `-${hangHeight}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '4px',
          height: `${hangHeight}px`,
          zIndex: 0,
        }}
      >
        <path
          d={`M 2 0 Q 2 ${hangHeight / 2} 2 ${hangHeight}`}
          className="lantern-string"
          strokeWidth="1.5"
        />
      </svg>

      <motion.div
        role="button"
        tabIndex={isFloating ? -1 : 0}
        aria-label={`${mood.label} lantern`}
        className="relative cursor-pointer"
        onClick={!isFloating ? onActivate : undefined}
        onKeyDown={(event) => {
          if (isFloating) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onActivate();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={
          isFloating
            ? {
                y: -1200,
                x: 50,
                scale: 0.6,
                opacity: 0.4,
                transition: {
                  duration: 3,
                  ease: [0.4, 0, 0.2, 1],
                },
              }
            : {
                rotate: isActive ? 0 : [0, 2, -2, 0],
                scale: isActive ? 1.15 : isHovered ? 1.05 : 1,
              }
        }
        transition={
          !isFloating
            ? {
                rotate: {
                  duration: 4,
                  delay: swayDelay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 0.3,
                  ease: 'easeOut',
                },
              }
            : undefined
        }
        style={{ zIndex: isActive ? 50 : 10 }}
      >
        <div className="mx-auto h-2.5 w-14 rounded-t-md bg-gradient-to-b from-amber-800 to-amber-900" />

        <div
          className={`
            lantern-glass relative h-20 w-16 rounded-lg
            transition-all duration-500
            ${isActive ? mood.glowClass : ''}
          `}
          style={{
            backgroundColor: isActive ? `${mood.color}30` : 'rgba(255,255,255,0.08)',
          }}
        >
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: mood.color,
              }}
              animate={getPulseAnimation()}
              transition={{
                duration: mood.pulseType === 'flicker' ? 3 : 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}

          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span
              className="h-3.5 w-3.5 rounded-full border border-white/70"
              style={{ backgroundColor: mood.color }}
              aria-hidden
            />
          </div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute left-1.5 top-1 h-5 w-5 rounded-full bg-white/30 blur-sm" />
            <div className="absolute bottom-2 right-2 h-3 w-3 rounded-full bg-white/15 blur-sm" />
          </div>
        </div>

        <div className="mx-auto h-2.5 w-14 rounded-b-md bg-gradient-to-t from-amber-800 to-amber-900" />

        <AnimatePresence>
          {isHovered && !isActive && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap"
            >
              <div className="rounded-md bg-black/70 px-2.5 py-1 font-mono text-xs text-white/90">
                {mood.label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
