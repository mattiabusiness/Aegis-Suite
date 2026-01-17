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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {showStepNumber && (
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} di {totalSteps}
            </span>
          )}
          {currentLabel && (
            <>
              {showStepNumber && <span className="text-gray-300">•</span>}
              <span className="text-sm text-gray-500">{currentLabel}</span>
            </>
          )}
        </div>
        {showPercentage && (
          <span className="text-sm font-medium text-purple-600">{percentage}%</span>
        )}
      </div>

      {/* Barra di progresso */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Indicatori step (opzionale, per wizard con pochi step) */}
      {totalSteps <= 8 && (
        <div className="flex justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={stepNum} className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-purple-600 text-white'
                        : isCurrent
                          ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-600'
                          : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}