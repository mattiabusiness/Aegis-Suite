// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 8: ROI CALCULATOR
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step8ROI.tsx
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step8Props {
  businessId: string;
  businessType: BusinessType | null;
  businessSlug: string;
  businessName: string;
  openDaysPerWeek: number;
}

// ============================================================================
// PARAMETRI DI CALCOLO
// ============================================================================

const HOURLY_RATE = {
  hair_salon: 25,
  beauty_center: 35,
  mixed: 30,
};

const NOSHOW_VALUE = {
  hair_salon: 30,
  beauty_center: 50,
  mixed: 40,
};

function calculateDashboardHours(manualHoursPerMonth: number): number {
  const calculated = 5 + (manualHoursPerMonth * 0.15);
  return Math.min(25, calculated);
}

export function Step8ROI({ businessId, businessType, businessSlug, businessName, openDaysPerWeek }: Step8Props) {
  const router = useRouter();
  const supabase = createClient();

  const [phoneMinutesPerDay, setPhoneMinutesPerDay] = useState(30);
  const [noShowsPerMonth, setNoShowsPerMonth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = businessType || 'mixed';
  const hourlyRate = HOURLY_RATE[type];
  const noShowValue = NOSHOW_VALUE[type];

  // Giorni di apertura al mese (settimane al mese * giorni apertura a settimana)
  const openDaysPerMonth = openDaysPerWeek * 4.33; // ~4.33 settimane al mese

  // Calcoli in tempo reale con giorni di apertura
  const manualHoursPerMonth = (phoneMinutesPerDay * openDaysPerMonth) / 60;
  const dashboardHoursPerMonth = calculateDashboardHours(manualHoursPerMonth);
  const hoursSaved = Math.max(0, manualHoursPerMonth - dashboardHoursPerMonth);
  const timeSavings = hoursSaved * hourlyRate;
  const noShowsAvoided = Math.round(noShowsPerMonth * 0.7);
  const noShowRecovery = noShowsAvoided * noShowValue;
  const monthlyTotal = timeSavings + noShowRecovery;
  const annualTotal = monthlyTotal * 12;

  const handleBack = () => {
    router.push('/onboarding/7');
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const roiData = {
        type: 'user_provided' as const,
        provided_at: new Date().toISOString(),
        daily_phone_time: phoneMinutesPerDay,
        monthly_no_shows: noShowsPerMonth,
        calculated: {
          hours_saved_monthly: Math.round(hoursSaved),
          no_shows_avoided: noShowsAvoided,
          monthly_savings: Math.round(monthlyTotal),
          annual_savings: Math.round(annualTotal),
        }
      };

      const { error } = await (supabase as any)
        .from('businesses')
        .update({
          onboarding_step: 8,
          onboarding_completed: true,
          roi_data: roiData,
        } as any)
        .eq('id', businessId);

      if (error) {
  console.error('Supabase error:', JSON.stringify(error, null, 2));
  console.error('Error message:', error.message);
  console.error('Error details:', error.details);
  console.error('Error hint:', error.hint);
  throw error;
}

      setCompleted(true);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${businessSlug}`;

  // ============================================================================
  // PAGINA COMPLETAMENTO
  // ============================================================================

  if (completed) {
    return (
      <Card className="w-full" padding="lg">
        <CardContent className="pt-8">
          <div className="text-center">
            {/* Success icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Configurazione completata!
            </h2>
            <p className="text-gray-600 mb-8">
              {businessName} è pronto per ricevere prenotazioni
            </p>

            {/* Link prenotazioni */}
            <div className="bg-purple-50 rounded-xl p-6 mb-8">
              <p className="text-base text-purple-600 font-medium mb-3">
                Il tuo link per le prenotazioni
              </p>
              <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-purple-200">
                <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <code className="flex-1 text-sm text-purple-700 font-mono truncate">
                  {bookingUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Copia link"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-sm text-purple-600 mt-4">
                Condividi questo link con i tuoi clienti per ricevere prenotazioni
              </p>
            </div>

            {/* Risparmio annuale */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-gray-500 mb-1">Risparmio annuale stimato</p>
              <p className="text-3xl font-bold text-purple-600">
                €{Math.round(annualTotal).toLocaleString('it-IT')}
              </p>
            </div>

            <Button onClick={() => router.push('/dashboard')} fullWidth size="lg">
              Vai alla Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // PAGINA CALCOLO ROI
  // ============================================================================

  // Calcola posizione percentuale per i label sotto la barra
  const phonePercentage = ((phoneMinutesPerDay - 5) / (120 - 5)) * 100;
  const noShowPercentage = (noShowsPerMonth / 20) * 100;

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Scopri il tuo potenziale risparmio</CardTitle>
        <CardDescription className="text-base mt-2">
          Calcola quanto tempo e denaro puoi recuperare con Aegis Beauty
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {/* Domanda 1: Tempo telefono */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              Quanto tempo dedichi ogni giorno alla gestione telefonica delle prenotazioni?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Tra chiamate in entrata, richieste di informazioni e riconferme...
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={phoneMinutesPerDay}
                  onChange={(e) => setPhoneMinutesPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                {/* Label centrato sotto il valore */}
                <div className="relative h-6 mt-2">
                  <span 
                    className="absolute text-xs text-gray-500 transform -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${phonePercentage}%` }}
                  >
                    {phoneMinutesPerDay >= 60 
                      ? `${Math.floor(phoneMinutesPerDay / 60)}h ${phoneMinutesPerDay % 60 > 0 ? `${phoneMinutesPerDay % 60}min` : ''}`
                      : `${phoneMinutesPerDay} min`
                    }
                  </span>
                </div>
              </div>
              <div className="w-28 text-center">
                <span className="text-2xl font-bold text-purple-600">{phoneMinutesPerDay}</span>
                <span className="text-sm text-gray-500 ml-1">min/giorno</span>
              </div>
            </div>
          </div>

          {/* Domanda 2: No-show */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1">
              Quanti clienti mensilmente non si presentano senza preavviso?
            </label>
            <p className="text-sm text-gray-500 mb-4">
              I "no-show" sono tempo e ricavi persi
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={noShowsPerMonth}
                  onChange={(e) => setNoShowsPerMonth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                {/* Label centrato sotto il valore */}
                <div className="relative h-6 mt-2">
                  <span 
                    className="absolute text-xs text-gray-500 transform -translate-x-1/2 whitespace-nowrap"
                    style={{ left: `${noShowPercentage}%` }}
                  >
                    {noShowsPerMonth} no-show
                  </span>
                </div>
              </div>
              <div className="w-28 text-center">
                <span className="text-2xl font-bold text-purple-600">{noShowsPerMonth}</span>
                <span className="text-sm text-gray-500 ml-1">/mese</span>
              </div>
            </div>
          </div>

          {/* Risultati in tempo reale */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
            <div className="text-center mb-4">
              <p className="text-sm text-purple-600 font-medium mb-1">Risparmio annuale stimato</p>
              <p className="text-4xl font-bold text-purple-700">
                €{Math.round(annualTotal).toLocaleString('it-IT')}
              </p>
              <p className="text-sm text-purple-500 mt-1">
                ~€{Math.round(monthlyTotal).toLocaleString('it-IT')}/mese
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-600">Tempo risparmiato</span>
                </div>
                <p className="text-lg font-bold text-gray-900">~{Math.round(hoursSaved)}h/mese</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-600">No-show evitati</span>
                </div>
                <p className="text-lg font-bold text-gray-900">€{Math.round(noShowRecovery)}/mese</p>
              </div>
            </div>
          </div>

          {/* Disclaimer con icona info */}
          <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Stime basate sui dati forniti. I risultati reali possono variare.
          </p>
        </div>

        {/* Bottoni */}
        <div className="flex gap-3 mt-8">
          <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="flex-1">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Indietro
          </Button>
          <Button type="button" onClick={handleComplete} loading={loading} className="flex-1">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completa configurazione
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}