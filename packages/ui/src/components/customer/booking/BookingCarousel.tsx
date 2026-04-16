// ============================================================================
// AEGIS SUITE - BOOKING CAROUSEL (3D scene wrapper)
// File: packages/ui/src/components/customer/booking/BookingCarousel.tsx
// 3 step cards in 3D space + premium progress bar + emerald step transition
// ============================================================================

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  business:        BookingBusiness;
  services:        BookingService[];
  staff:           BookingStaff[];
  hours:           BookingHours[];
  categories:      BookingCategory[];
  fetchSlots:      FetchSlotsFn;
  onConfirm:       (state: BookingState) => Promise<void>;
  onError?:        (message: string) => void;
  initialStep?:    number;
  initialService?: BookingService | null;
  isReschedule?:   boolean;
}

interface CardTransform {
  rotateY:    number;
  scale:      number;
  opacity:    number;
  zIndex:     number;
  translateZ: number;
  translateX: number;
}

type TransitionPhase = 'in' | 'show' | 'out';

// ============================================================================
// HELPERS
// ============================================================================

function getCardTransform(position: number, isMobile: boolean): CardTransform {
  const abs = Math.abs(position);

  if (abs === 0) {
    return { rotateY: 0, scale: 1, opacity: 1, zIndex: 10, translateZ: 20, translateX: 0 };
  }

  if (abs === 1) {
    return {
      rotateY:    position * 45,
      scale:      isMobile ? 0.82 : 0.88,
      opacity:    0.65,
      zIndex:     5,
      translateZ: -10,
      translateX: position * (isMobile ? 255 : 375),
    };
  }

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
// EMERALD STEP TRANSITION OVERLAY
// ============================================================================

const STEP_DONE_LABELS = ['Servizio scelto', 'Data & ora confermate'];

function StepCheckmarkOverlay({ label, phase }: { label: string; phase: TransitionPhase }) {
  return (
    <motion.div
      key="step-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'out' ? 0 : 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(6,4,18,0.84)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: phase === 'out' ? 0.88 : 1, opacity: phase === 'out' ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 24 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}
      >
        {/* Emerald glass circle */}
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          {/* Outer halo */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.30) 0%, transparent 70%)',
            animation: phase === 'show' ? 'emeraldPulse 1.4s ease-in-out infinite' : undefined,
          }} />
          {/* Glass ring */}
          <div style={{
            position: 'absolute', inset: -5, borderRadius: '50%',
            border: '1px solid rgba(16,185,129,0.28)',
            background: 'rgba(16,185,129,0.04)',
          }} />
          {/* Main circle — emerald glass */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'linear-gradient(145deg, rgba(16,185,129,0.88), rgba(5,150,105,0.80))',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 48px rgba(16,185,129,0.55), 0 0 0 1px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Inner shimmer */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, transparent 55%)',
              pointerEvents: 'none',
            }} />
            {/* Checkmark SVG with draw-in animation */}
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none" style={{ position: 'relative', zIndex: 1 }}>
              <path
                d="M10 23L19 32L36 14"
                stroke="white"
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 46,
                  strokeDashoffset: phase === 'show' || phase === 'out' ? 0 : 46,
                  transition: phase === 'show'
                    ? 'stroke-dashoffset 0.6s cubic-bezier(0.65, 0, 0.35, 1) 0.12s'
                    : 'none',
                }}
              />
            </svg>
          </div>
        </div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase === 'out' ? 0 : 1, y: 0 }}
          transition={{ delay: phase === 'in' ? 0.28 : 0, duration: 0.32 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{
            fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0,
            letterSpacing: '-0.02em', textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}>
            {label}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', margin: '5px 0 0', letterSpacing: '0.02em' }}>
            Passo successivo...
          </p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes emeraldPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.12); }
        }
      `}</style>
    </motion.div>
  );
}

// ============================================================================
// PREMIUM PROGRESS BAR
// ============================================================================

const STEP_LABELS = ['Servizio', 'Data & Ora', 'Conferma'];

function ProgressDots({ activeStep }: { activeStep: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 310, padding: '0 4px' }}>
      {STEP_LABELS.map((label, i) => {
        const isDone   = i < activeStep;
        const isActive = i === activeStep;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <motion.div
                animate={{
                  background: isDone || isActive
                    ? 'linear-gradient(135deg, #9333ea, #7c3aed)'
                    : 'rgba(255,255,255,0.05)',
                  boxShadow: isActive
                    ? '0 0 22px rgba(168,85,247,0.65), 0 0 0 4px rgba(168,85,247,0.14)'
                    : isDone
                      ? '0 0 10px rgba(124,58,237,0.3)'
                      : 'none',
                  scale: isActive ? 1.12 : 1,
                }}
                transition={{ duration: 0.35 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: isDone || isActive
                    ? '1.5px solid rgba(168,85,247,0.5)'
                    : '1.5px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11 4" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 800,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.25)',
                  }}>
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span style={{
                fontSize: '0.64rem', fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? 'rgba(255,255,255,0.92)'
                  : isDone
                    ? 'rgba(255,255,255,0.48)'
                    : 'rgba(255,255,255,0.22)',
                letterSpacing: '0.02em',
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <motion.div
                animate={{
                  background: i < activeStep
                    ? 'linear-gradient(90deg, #9333ea, #7c3aed)'
                    : 'rgba(255,255,255,0.08)',
                }}
                transition={{ duration: 0.45 }}
                style={{
                  flex: 1, height: 2, marginBottom: 24,
                  marginInline: 8, borderRadius: 2,
                }}
              />
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

export function BookingCarousel({ business, services, staff, hours, categories, fetchSlots, onConfirm, onError, initialStep = 0, initialService = null, isReschedule = false }: BookingCarouselProps) {
  const [activeStep,   setActiveStep]   = useState(initialStep);
  const [flipped,      setFlipped]      = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transition,   setTransition]   = useState<{ label: string; phase: TransitionPhase } | null>(null);

  const [state, setState] = useState<BookingState>({
    selectedService:   initialService,
    selectedStaff:     null,
    selectedDate:      null,
    selectedTime:      null,
    customerNotes:     '',
    autoAssignedStaff: null,
    includeShampoo:    false,
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
    if (activeStep >= 2 || transition) return;
    const label = STEP_DONE_LABELS[activeStep] ?? 'Completato';
    // Phase 'in': overlay enters
    setTransition({ label, phase: 'in' });
    // Phase 'show': checkmark draws
    setTimeout(() => setTransition(t => t ? { ...t, phase: 'show' } : null), 40);
    // Navigate while overlay is still visible
    setTimeout(() => { setFlipped(null); setActiveStep(s => s + 1); }, 880);
    // Phase 'out': overlay fades
    setTimeout(() => setTransition(t => t ? { ...t, phase: 'out' } : null), 1020);
    // Cleanup
    setTimeout(() => setTransition(null), 1360);
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

  const CARD_W = isMobile ? 275 : 310;
  const CARD_H = isMobile ? 430 : 470;

  return (
    <>
      {/* Emerald step transition overlay */}
      <AnimatePresence>
        {transition && (
          <StepCheckmarkOverlay label={transition.label} phase={transition.phase} />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isReschedule ? 4 : 10, width: '100%' }}>

        {/* Reschedule label — sopra al badge, stessa larghezza, non sposta nulla */}
        {isReschedule && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 100, padding: '4px 14px',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', flexShrink: 0, boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: '#6ee7b7', letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
              Scegli nuova data e ora
            </span>
          </div>
        )}

        {/* Booking badge — marketing style */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.2)',
          borderRadius: 100, padding: '4px 14px', marginBottom: 2,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#a855f7', display: 'inline-block', flexShrink: 0,
            boxShadow: '0 0 6px rgba(168,85,247,0.8)',
          }} />
          <span style={{
            fontSize: '0.66rem', fontWeight: 600, color: '#c084fc',
            letterSpacing: '0.07em', textTransform: 'uppercase' as const,
          }}>
            Prenotazione online
          </span>
        </div>

        {/* Progress bar */}
        <ProgressDots activeStep={activeStep} />

        {/* 3D Scene */}
        <div style={{
          perspective: isMobile ? '1000px' : '1800px',
          width: '100%',
          height: CARD_H,
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
        </div>
      </div>
    </>
  );
}

// Re-export types so consumers can import from a single entry point
export type { BookingState, BookingCategory, FetchSlotsFn } from './types';
