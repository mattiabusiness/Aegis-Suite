// ============================================================================
// AEGIS SUITE - BOOKING CAROUSEL (3D scene wrapper)
// File: packages/ui/src/components/customer/booking/BookingCarousel.tsx
// 3 step cards in 3D space + progress dots + swipe navigation
// ============================================================================

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type {
  BookingBusiness, BookingService, BookingStaff, BookingHours,
  BookingState, BookingCategory, FetchSlotsFn,
} from './types';
import { CarouselCard } from './CarouselCard';
import {
  Step1Front, Step1Back,
  Step2Front, Step2Back,
  Step3Front, Step3Back,
} from './Steps';

// ============================================================================
// TYPES
// ============================================================================

interface BookingCarouselProps {
  business:   BookingBusiness;
  services:   BookingService[];
  staff:      BookingStaff[];
  hours:      BookingHours[];
  categories: BookingCategory[];
  fetchSlots: FetchSlotsFn;
  onConfirm:  (state: BookingState) => Promise<void>;
  onError?:   (message: string) => void;
}

interface CardTransform {
  rotateY:    number;
  scale:      number;
  opacity:    number;
  zIndex:     number;
  translateZ: number;
  translateX: number;
}

// ============================================================================
// HELPERS
// ============================================================================

function getCardTransform(position: number, isMobile: boolean): CardTransform {
  const abs = Math.abs(position);

  // Active card — centered, full size, slight forward push
  if (abs === 0) {
    return { rotateY: 0, scale: 1, opacity: 1, zIndex: 10, translateZ: 20, translateX: 0 };
  }

  // Side cards — positioned laterally, slight outward tilt away from center
  if (abs === 1) {
    return {
      rotateY:    position * 45,                // tilts outward
      scale:      isMobile ? 0.82 : 0.88,
      opacity:    0.65,
      zIndex:     5,
      translateZ: -10,
      translateX: position * (isMobile ? 255 : 375),
    };
  }

  // Far cards — mostly off-screen
  return {
    rotateY:    position * 60,
    scale:      0.72,
    opacity:    0.10,
    zIndex:     1,
    translateZ: -30,
    translateX: position * (isMobile ? 490 : 730),
  };
}

// ============================================================================
// PROGRESS DOTS
// ============================================================================

const STEP_LABELS = ['Servizio', 'Data', 'Conferma'];

function ProgressDots({ activeStep }: { activeStep: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {STEP_LABELS.map((label, i) => {
        const isDone   = i < activeStep;
        const isActive = i === activeStep;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <motion.div
                animate={{
                  background: isDone || isActive
                    ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
                    : 'transparent',
                  boxShadow: isActive ? '0 0 14px rgba(168,85,247,0.5)' : 'none',
                  scale: isActive ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  border: isDone || isActive ? '2px solid transparent' : '2px solid rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5L5 9L10.5 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span style={{
                fontSize: '0.68rem', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                transition: 'color 0.3s',
              }}>
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div style={{
                width: 44, height: 2, marginBottom: 22,
                background: i < activeStep
                  ? 'linear-gradient(90deg, #9333ea, #7c3aed)'
                  : 'rgba(255,255,255,0.1)',
                transition: 'background 0.4s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingCarousel({ business, services, staff, hours, categories, fetchSlots, onConfirm, onError }: BookingCarouselProps) {
  const [activeStep,   setActiveStep]   = useState(0);
  const [flipped,      setFlipped]      = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, setState] = useState<BookingState>({
    selectedService:   null,
    selectedStaff:     null,
    selectedDate:      null,
    selectedTime:      null,
    customerNotes:     '',
    autoAssignedStaff: null,
  });

  const updateState = useCallback((patch: Partial<BookingState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      if (patch.selectedService && patch.selectedService.id !== prev.selectedService?.id) {
        next.selectedDate      = null;
        next.selectedTime      = null;
        next.autoAssignedStaff = null;
      }
      if (patch.selectedDate && patch.selectedDate?.toDateString() !== prev.selectedDate?.toDateString()) {
        next.selectedTime      = null;
        next.autoAssignedStaff = null;
      }
      if ('selectedStaff' in patch) {
        next.autoAssignedStaff = null;
      }
      return next;
    });
  }, []);

  function nextStep() {
    if (activeStep < 2) { setFlipped(null); setActiveStep(s => s + 1); }
  }
  function prevStep() {
    if (activeStep > 0) { setFlipped(null); setActiveStep(s => s - 1); }
  }
  function toggleFlip(step: number) {
    setFlipped(prev => (prev === step ? null : step));
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      await onConfirm(state);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore nella prenotazione';
      onError?.(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const CARD_W = isMobile ? 300 : 340;
  const CARD_H = isMobile ? 480 : 520;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* 3D Scene — overflow visible so side cards peek; progress dots sit at the bottom */}
      <div style={{
        perspective: isMobile ? '1000px' : '1800px',
        width: '100%',
        height: CARD_H + 64,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
      }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width:  CARD_W,
            height: CARD_H,
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) nextStep();
            else if (info.offset.x > 80) prevStep();
          }}
        >
          {([0, 1, 2] as const).map(cardIdx => {
            const position = cardIdx - activeStep;
            const isActive = cardIdx === activeStep;
            const isFlip   = flipped === cardIdx && isActive;

            return (
              <CarouselCard
                key={cardIdx}
                position={position}
                isActive={isActive}
                isFlipped={isFlip}
                cardW={CARD_W}
                cardH={CARD_H}
                transform={getCardTransform(position, isMobile)}
                onFlip={() => toggleFlip(cardIdx)}
                onClickInactive={position > 0 ? nextStep : position < 0 ? prevStep : undefined}

                frontContent={
                  cardIdx === 0 ? (
                    <Step1Front
                      services={services} staff={staff} categories={categories}
                      bookingState={state} onUpdate={updateState}
                      onNext={nextStep} onFlip={() => toggleFlip(0)}
                    />
                  ) : cardIdx === 1 ? (
                    <Step2Front
                      business={business} hours={hours} staff={staff}
                      bookingState={state} onUpdate={updateState}
                      fetchSlots={fetchSlots}
                      onNext={nextStep} onBack={prevStep}
                      onFlip={() => toggleFlip(1)}
                    />
                  ) : (
                    <Step3Front
                      business={business}
                      staff={staff}
                      bookingState={state} onUpdate={updateState}
                      onBack={prevStep} onConfirm={handleConfirm}
                      onFlip={() => toggleFlip(2)}
                      isSubmitting={isSubmitting}
                    />
                  )
                }

                backContent={
                  cardIdx === 0 ? (
                    <Step1Back onFlip={() => toggleFlip(0)} />
                  ) : cardIdx === 1 ? (
                    <Step2Back business={business} hours={hours} onFlip={() => toggleFlip(1)} />
                  ) : (
                    <Step3Back onFlip={() => toggleFlip(2)} />
                  )
                }
              />
            );
          })}
        </motion.div>

        {/* Progress dots — below the cards, pinned to bottom of scene container */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          paddingBottom: 4,
        }}>
          <ProgressDots activeStep={activeStep} />
        </div>
      </div>
    </div>
  );
}

// Re-export types so consumers can import from a single entry point
export type { BookingState, BookingCategory, FetchSlotsFn } from './types';
