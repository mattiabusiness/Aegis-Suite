// ============================================================================
// AEGIS SUITE - STEP TRANSITION OVERLAY
// File: packages/ui/src/components/StepTransition.tsx
// Fullscreen animated checkmark shown between onboarding steps
// ============================================================================

'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

// ============================================================================
// CONTEXT
// ============================================================================

interface StepTransitionContextType {
  /** Show the checkmark overlay, call onComplete when ready to navigate */
  showTransition: (label: string, onComplete: () => void, hideSubtitle?: boolean) => void;
}

const StepTransitionContext = createContext<StepTransitionContextType>({
  showTransition: () => {},
});

export function useStepTransition() {
  return useContext(StepTransitionContext);
}

// ============================================================================
// PROVIDER + OVERLAY
// ============================================================================

interface StepTransitionProviderProps {
  children: React.ReactNode;
}

export function StepTransitionProvider({ children }: StepTransitionProviderProps) {
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [noSubtitle, setNoSubtitle] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'enter' | 'show' | 'reverse' | 'exit'>('idle');
  const busyRef = useRef(false);

  const showTransition = useCallback(
    (completedStepLabel: string, onComplete: () => void, hideSubtitle?: boolean) => {
      if (busyRef.current) return;
      busyRef.current = true;

      setLabel(completedStepLabel);
      setNoSubtitle(!!hideSubtitle);
      setVisible(true);
      setPhase('enter');

      // Phase 1: fade in overlay
      setTimeout(() => setPhase('show'), 50);

      // Phase 2 (1800ms): start reverse draw + navigate
      setTimeout(() => {
        setPhase('reverse');
        setTimeout(() => onComplete(), 100);
      }, 1800);

      // Phase 3 (3000ms): start fade out
      setTimeout(() => {
        setPhase('exit');
      }, 3000);

      // Phase 4 (3500ms): cleanup
      setTimeout(() => {
        setVisible(false);
        setPhase('idle');
        busyRef.current = false;
      }, 3500);
    },
    []
  );

  return (
    <StepTransitionContext.Provider value={{ showTransition }}>
      {children}

      {/* Overlay */}
      {visible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(8px)',
            opacity: phase === 'exit' ? 0 : 1,
            transition: phase === 'exit' ? 'opacity 0.5s ease-out' : 'opacity 0.3s ease-out',
          }}
        >
          <div
            style={{
              transform:
                phase === 'show' || phase === 'reverse'
                  ? 'scale(1)'
                  : phase === 'exit'
                    ? 'scale(0.85)'
                    : 'scale(0.5)',
              opacity: phase === 'exit' ? 0 : phase === 'show' || phase === 'reverse' ? 1 : 0,
              transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div className="flex flex-col items-center gap-5">
              {/* Checkmark circle */}
              <div
                className="relative"
                style={{
                  width: 100,
                  height: 100,
                  transform: phase === 'reverse' ? 'scale(0.92)' : phase === 'exit' ? 'scale(0.8)' : 'scale(1)',
                  transition: phase === 'reverse' ? 'transform 1.2s ease-in-out' : 'transform 0.4s ease-in',
                }}
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #10b981)',
                    opacity: 0.18,
                    filter: 'blur(18px)',
                    transform: 'scale(1.5)',
                    animation: phase === 'show' ? 'stGlowPulse 1.8s ease-in-out infinite' : undefined,
                  }}
                />

                {/* Circle background */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 10px 40px rgba(16,185,129,0.35)',
                  }}
                />

                {/* Checkmark SVG */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <path
                    d="M30 52 L44 66 L70 36"
                    stroke="white"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 62,
                      strokeDashoffset:
                        phase === 'show' ? 0
                        : phase === 'reverse' || phase === 'exit' ? 62
                        : 62,
                      transition:
                        phase === 'show'
                          ? 'stroke-dashoffset 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.25s'
                          : 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </svg>
              </div>

              {/* Label */}
              <div className="text-center">
                <p
                  className="text-lg font-semibold text-gray-800"
                  style={{
                    opacity: phase === 'show' ? 1 : phase === 'reverse' ? 0.4 : 0,
                    transform: phase === 'show' ? 'translateY(0)' : 'translateY(10px)',
                    filter: phase === 'reverse' ? 'blur(3px)' : phase === 'exit' ? 'blur(8px)' : 'blur(0px)',
                    transition: phase === 'reverse'
                      ? 'all 1s ease-in'
                      : phase === 'exit'
                        ? 'all 0.4s ease-in'
                        : 'all 0.45s ease-out 0.5s',
                  }}
                >
                  {label}
                </p>
                {!noSubtitle && (
                  <p
                    className="text-sm text-gray-400 mt-1.5"
                    style={{
                      opacity: phase === 'show' ? 1 : phase === 'reverse' ? 0.3 : 0,
                      transform: phase === 'show' ? 'translateY(0)' : 'translateY(10px)',
                      filter: phase === 'reverse' ? 'blur(4px)' : phase === 'exit' ? 'blur(8px)' : 'blur(0px)',
                      transition: phase === 'reverse'
                        ? 'all 1s ease-in 0.15s'
                        : phase === 'exit'
                          ? 'all 0.3s ease-in'
                          : 'all 0.45s ease-out 0.65s',
                    }}
                  >
                    Passaggio al prossimo step...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
      {visible && (
        <style>{`
          @keyframes stGlowPulse {
            0%, 100% { transform: scale(1.5); opacity: 0.18; }
            50% { transform: scale(1.7); opacity: 0.3; }
          }
        `}</style>
      )}
    </StepTransitionContext.Provider>
  );
}