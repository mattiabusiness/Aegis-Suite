// ============================================================================
// AEGIS SUITE - PROGRESS BAR COMPONENT
// File: packages/ui/src/components/ui/progress-bar.tsx
// ============================================================================

'use client';

import * as React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressBarProps {
  /** Step corrente (1-based) */
  currentStep: number;
  /** Numero totale di step */
  totalSteps: number;
  /** Labels per ogni step (opzionale) */
  stepLabels?: string[];
  /** Mostra il numero dello step */
  showStepNumber?: boolean;
  /** Mostra la percentuale */
  showPercentage?: boolean;
  /** Classe CSS aggiuntiva */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
  showStepNumber = true,
  showPercentage = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const currentLabel = stepLabels?.[currentStep - 1];

  return (
    <div className={`w-full ${className}`}>
      {/* Header con info step */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {showStepNumber && (
            <span className="text-sm font-semibold text-gray-800">
              Step {currentStep} <span className="text-gray-400 font-normal">di {totalSteps}</span>
            </span>
          )}
          {currentLabel && (
            <>
              {showStepNumber && <span className="text-gray-300">·</span>}
              <span className="text-sm text-purple-600 font-medium">{currentLabel}</span>
            </>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-semibold text-purple-600">{percentage}%</span>
        )}
      </div>

      {/* Barra di progresso — gradient + glow */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
          }}
        >
          {/* Glow pulse on the bar */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent 60%, rgba(192,132,252,0.6))',
              animation: 'pbGlow 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Step indicators con connettori */}
      {totalSteps <= 8 && (
        <div className="flex items-center justify-between mt-4 relative">
          {/* Connecting line behind circles */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-4 left-4 h-0.5 z-0 transition-all duration-700 ease-out"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7)',
              maxWidth: 'calc(100% - 2rem)',
            }}
          />

          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            // Only animate the checkmark on the step just completed (previous step)
            const isJustCompleted = stepNum === currentStep - 1;

            return (
              <div key={stepNum} className="flex flex-col items-center z-10 relative">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-500
                    ${
                      isCompleted
                        ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-md shadow-purple-200'
                        : isCurrent
                          ? 'bg-white text-purple-700 ring-2 ring-purple-500 shadow-lg shadow-purple-100'
                          : 'bg-white text-gray-400 border border-gray-200'
                    }
                  `}
                  style={isCurrent ? { animation: 'pbPulseRing 2.5s ease-in-out infinite' } : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={isJustCompleted ? {
                        animation: 'pbCheckFade 0.35s ease-out forwards',
                      } : undefined}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                        style={isJustCompleted ? {
                          strokeDasharray: 24,
                          strokeDashoffset: 24,
                          animation: 'pbCheckDraw 0.5s cubic-bezier(0.65,0,0.35,1) 0.15s forwards',
                        } : undefined}
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                {/* Step label sotto (solo su schermi larghi) */}
                {stepLabels?.[i] && (
                  <span className={`
                    hidden sm:block text-[10px] mt-1.5 text-center max-w-[60px] leading-tight
                    transition-colors duration-300
                    ${isCompleted || isCurrent ? 'text-purple-600 font-medium' : 'text-gray-400'}
                  `}>
                    {stepLabels[i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Keyframe definitions */}
      <style>{`
        @keyframes pbGlow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes pbPulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.3), 0 4px 12px rgba(168,85,247,0.1); }
          50% { box-shadow: 0 0 0 6px rgba(168,85,247,0), 0 4px 12px rgba(168,85,247,0.2); }
        }
        @keyframes pbCheckDraw {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes pbCheckFade {
          0% { opacity: 0; transform: scale(0.5); }
          50% { transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}