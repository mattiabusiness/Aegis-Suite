// ============================================================================
// AEGIS SUITE - CAROUSEL CARD (3D flip card)
// File: packages/ui/src/components/customer/booking/CarouselCard.tsx
// Single card in the 3D carousel — frontContent + backContent, flip via isFlipped
// ============================================================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface CardTransform {
  rotateY:    number;
  scale:      number;
  opacity:    number;
  zIndex:     number;
  translateZ: number;
  translateX: number;
}

interface CarouselCardProps {
  position:        number;
  isActive:        boolean;
  isFlipped:       boolean;
  cardW:           number;
  cardH:           number;
  transform:       CardTransform;
  onFlip:          () => void;
  onClickInactive?: () => void;
  frontContent:    React.ReactNode;
  backContent:     React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CarouselCard({
  isActive,
  isFlipped,
  cardW,
  cardH,
  transform,
  onClickInactive,
  frontContent,
  backContent,
}: CarouselCardProps) {
  const { rotateY, scale, opacity, zIndex, translateZ, translateX } = transform;

  const borderColor = isActive ? 'rgba(139,92,246,0.5)'  : 'rgba(139,92,246,0.2)';
  const glow        = isActive ? ', 0 0 60px rgba(124,58,237,0.28)' : '';
  const boxShadow   = `0 25px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)${glow}`;

  return (
    <motion.div
      animate={{ rotateY, scale, opacity, translateZ, translateX }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, mass: 0.9 }}
      onClick={!isActive ? onClickInactive : undefined}
      style={{
        position:   'absolute',
        top:        0,
        left:       0,
        width:      cardW,
        height:     cardH,
        zIndex,
        cursor:     !isActive ? 'pointer' : 'default',
        willChange: 'transform',
      }}
    >
      {/* Card shell */}
      <div style={{
        width:          '100%',
        height:         '100%',
        borderRadius:   24,
        background:     'linear-gradient(135deg, rgba(76,29,149,0.45), rgba(30,10,60,0.38))',
        border:         `1px solid ${borderColor}`,
        backdropFilter: 'blur(20px)',
        boxShadow,
        overflow:       'hidden',
        position:       'relative',
      }}>

        {isActive ? (
          /* Active card — flip inner */
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{
              width:          '100%',
              height:         '100%',
              transformStyle: 'preserve-3d',
              position:       'relative',
            }}
          >
            {/* FRONT */}
            <div style={{
              position:           'absolute',
              inset:              0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius:       24,
              overflow:           'hidden',
            }}>
              {frontContent}
            </div>

            {/* BACK */}
            <div style={{
              position:           'absolute',
              inset:              0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius:       24,
              overflow:           'hidden',
              transform:          'rotateY(180deg)',
            }}>
              {backContent}
            </div>
          </motion.div>
        ) : (
          /* Non-active card — no flip, dim overlay */
          <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', inset: 0, zIndex: 5,
              background: 'rgba(10,10,15,0.35)', borderRadius: 24,
            }} />
            {frontContent}
          </div>
        )}
      </div>
    </motion.div>
  );
}
