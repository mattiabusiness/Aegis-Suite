// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 1: BUSINESS TYPE
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step1BusinessType.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step1Props {
  businessId: string;
  initialValue: BusinessType | null;
}

const BUSINESS_TYPES: { value: BusinessType; label: string; description: string }[] = [
  {
    value: 'hair_salon',
    label: 'Parrucchiere',
    description: 'Salone di acconciature, barbiere',
  },
  {
    value: 'beauty_center',
    label: 'Centro Estetico',
    description: 'Trattamenti estetici, spa, nail art',
  },
  {
    value: 'mixed',
    label: 'Misto',
    description: 'Entrambi i servizi',
  },
];

const BusinessIcon = ({ type, className }: { type: BusinessType; className?: string }) => {
  switch (type) {
    case 'hair_salon':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      );
    case 'beauty_center':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'mixed':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
  }
};

export function Step1BusinessType({ businessId, initialValue }: Step1Props) {
  const router = useRouter();
  const supabase = createClient();

  const [selected, setSelected] = useState<BusinessType | null>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selected) {
      setError('Seleziona il tipo di attività');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updateData: BusinessUpdate = {
        business_type: selected,
        onboarding_step: 2,
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      if (updateError) {
        throw updateError;
      }

      router.push('/onboarding/2');
    } catch (err) {
      console.error('Error saving business type:', err);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Che tipo di attività hai?</CardTitle>
        <CardDescription className="text-base mt-2">
          Seleziona la categoria che meglio descrive la tua attività
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-3">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setSelected(type.value)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                flex items-center gap-4
                ${
                  selected === type.value
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }
              `}
            >
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                  ${selected === type.value ? 'bg-purple-100' : 'bg-gray-100'}
                `}
              >
                <BusinessIcon
                  type={type.value}
                  className={`w-8 h-8 ${selected === type.value ? 'text-purple-600' : 'text-gray-500'}`}
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg ${
                    selected === type.value ? 'text-purple-700' : 'text-gray-900'
                  }`}
                >
                  {type.label}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
              </div>
              <div
                className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${
                    selected === type.value
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }
                `}
              >
                {selected === type.value && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Button onClick={handleContinue} loading={loading} fullWidth>
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
          Potrai modificare questa scelta dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}
