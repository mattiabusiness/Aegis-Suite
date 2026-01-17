// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 5: WORKSTATIONS
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step5Workstations.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step5Props {
  businessId: string;
  businessType: BusinessType | null;
  initialValue: number;
}

function getWorkstationLabel(type: BusinessType | null): { singular: string; plural: string } {
  switch (type) {
    case 'hair_salon':
      return { singular: 'Poltrona', plural: 'Poltrone' };
    case 'beauty_center':
      return { singular: 'Cabina', plural: 'Cabine' };
    case 'mixed':
    default:
      return { singular: 'Postazione', plural: 'Postazioni' };
  }
}

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon':
      return 'salone';
    case 'beauty_center':
      return 'centro';
    case 'mixed':
    default:
      return 'salone';
  }
}

export function Step5Workstations({ businessId, businessType, initialValue }: Step5Props) {
  const router = useRouter();
  const supabase = createClient();
  
  const [workstations, setWorkstations] = useState(initialValue || 3);
  const [loading, setLoading] = useState(false);

  const workstationLabel = getWorkstationLabel(businessType);
  const businessLabel = getBusinessLabel(businessType);

  const handleDecrement = () => {
    if (workstations > 1) setWorkstations(w => w - 1);
  };

  const handleIncrement = () => {
    if (workstations < 20) setWorkstations(w => w + 1);
  };

  const handleBack = () => {
    router.push('/onboarding/4');
  };

  const handleContinue = async () => {
    setLoading(true);

    try {
      const updateData: BusinessUpdate = {
        workstations,
        onboarding_step: 6,
      };

      await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      router.push('/onboarding/6');
    } catch (err) {
      console.error('Error saving workstations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">{workstationLabel.plural} di lavoro</CardTitle>
        <CardDescription className="text-base mt-2">
          Quante {workstationLabel.plural.toLowerCase()} hai nel tuo {businessLabel}?
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center py-8">
          {/* Counter */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={workstations <= 1}
              className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 hover:border-purple-500 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <div className="text-center">
              <span className="text-6xl font-bold text-purple-600">{workstations}</span>
              <p className="text-gray-500 mt-2">
                {workstations === 1 ? workstationLabel.singular : workstationLabel.plural}
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleIncrement}
              disabled={workstations >= 20}
              className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600 hover:border-purple-500 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Help text */}
          <div className="mt-8 p-4 bg-purple-50 rounded-lg mx-auto w-fit">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-purple-700 whitespace-nowrap">
                Questo numero serve per gestire le prenotazioni simultanee. 
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="flex-1">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </Button>
          <Button type="button" onClick={handleContinue} loading={loading} className="flex-1">
            Continua
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Potrai modificare questo valore dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}