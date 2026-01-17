// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 4: HOURS
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step4Hours.tsx
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, DayOfWeek, BusinessType } from '@aegis/types';

interface Step4Props {
  businessId: string;
  businessType: BusinessType | null;
}

interface DayHours {
  day: DayOfWeek;
  label: string;
  isOpen: boolean;
  openTime1: string;
  closeTime1: string;
  openTime2: string;
  closeTime2: string;
  hasBreak: boolean;
}

interface Holiday {
  id: string;
  name: string;
  enabled: boolean;
  date: string; // formato MM-DD per festività fisse, 'easter' per Pasqua
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon':
      return 'salone';
    case 'beauty_center':
      return 'centro';
    default:
      return 'salone';
  }
}

function getDefaultHours(type: BusinessType | null): DayHours[] {
  const isBeautyCenter = type === 'beauty_center';
  
  return [
    { day: 'monday', label: 'Lunedì', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '20:00' : '19:00', hasBreak: true },
    { day: 'tuesday', label: 'Martedì', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '20:00' : '19:00', hasBreak: true },
    { day: 'wednesday', label: 'Mercoledì', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '20:00' : '19:00', hasBreak: true },
    { day: 'thursday', label: 'Giovedì', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '20:00' : '19:00', hasBreak: true },
    { day: 'friday', label: 'Venerdì', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '20:00' : '19:00', hasBreak: true },
    { day: 'saturday', label: 'Sabato', isOpen: true, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: isBeautyCenter ? '19:00' : '18:00', hasBreak: true },
    { day: 'sunday', label: 'Domenica', isOpen: false, openTime1: '09:00', closeTime1: '13:00', openTime2: '15:00', closeTime2: '18:00', hasBreak: false },
  ];
}

// Calcola la data di Pasqua per un anno (algoritmo di Gauss)
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'christmas', name: 'Natale (25 Dicembre)', enabled: true, date: '12-25' },
  { id: 'new_year', name: 'Capodanno (1 Gennaio)', enabled: true, date: '01-01' },
  { id: 'easter', name: 'Pasqua', enabled: true, date: 'easter' },
  { id: 'ferragosto', name: 'Ferragosto (15 Agosto)', enabled: true, date: '08-15' },
];

export function Step4Hours({ businessId, businessType }: Step4Props) {
  const router = useRouter();
  const supabase = createClient();
  const label = getBusinessLabel(businessType);
  
  const [hours, setHours] = useState<DayHours[]>(() => getDefaultHours(businessType));
  const [holidays, setHolidays] = useState<Holiday[]>(DEFAULT_HOLIDAYS);
  const [globalBreak, setGlobalBreak] = useState({ enabled: true, start: '13:00', end: '15:00' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Aggiorna orari quando cambia il tipo di business
  useEffect(() => {
    setHours(getDefaultHours(businessType));
  }, [businessType]);

  // FIX: Applica automaticamente quando si attiva/disattiva la pausa pranzo globale
  useEffect(() => {
    setHours(prev => prev.map(day => {
      if (!day.isOpen) return day;
      
      if (globalBreak.enabled) {
        return {
          ...day,
          hasBreak: true,
          closeTime1: globalBreak.start,
          openTime2: globalBreak.end,
        };
      } else {
        return {
          ...day,
          hasBreak: false,
        };
      }
    }));
  }, [globalBreak.enabled]);

  const updateDay = (index: number, updates: Partial<DayHours>) => {
    setHours(prev => prev.map((day, i) => i === index ? { ...day, ...updates } : day));
  };

  const toggleHoliday = (holidayId: string) => {
    setHolidays(prev => prev.map(h => 
      h.id === holidayId ? { ...h, enabled: !h.enabled } : h
    ));
  };

  const applyGlobalBreak = () => {
    setHours(prev => prev.map(day => ({
      ...day,
      hasBreak: day.isOpen ? globalBreak.enabled : false,
      closeTime1: day.isOpen && globalBreak.enabled ? globalBreak.start : day.closeTime1,
      openTime2: day.isOpen && globalBreak.enabled ? globalBreak.end : day.openTime2,
    })));
  };

  const handleBack = () => {
    router.push('/onboarding/3');
  };

  const handleContinue = async () => {
    if (!hours.some(d => d.isOpen)) {
      setError('Seleziona almeno un giorno di apertura');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Elimina orari esistenti
      await supabase
        .from('business_hours')
        .delete()
        .eq('business_id', businessId);

      // Inserisci nuovi orari
      const hoursToInsert = hours.map(day => ({
        business_id: businessId,
        day_of_week: day.day,
        is_open: day.isOpen,
        open_time_1: day.isOpen ? day.openTime1 : null,
        close_time_1: day.isOpen ? (day.hasBreak ? day.closeTime1 : day.closeTime2) : null,
        open_time_2: day.isOpen && day.hasBreak ? day.openTime2 : null,
        close_time_2: day.isOpen && day.hasBreak ? day.closeTime2 : null,
      }));

      const { error: insertError } = await (supabase as any)
        .from('business_hours')
        .insert(hoursToInsert);

      if (insertError) throw insertError;

      // Elimina chiusure festività esistenti
      await (supabase as any)
        .from('business_closures')
        .delete()
        .eq('business_id', businessId)
        .eq('is_recurring_yearly', true);

      // Salva festività nelle chiusure straordinarie
      const enabledHolidays = holidays.filter(h => h.enabled);
      if (enabledHolidays.length > 0) {
        const currentYear = new Date().getFullYear();
        
        const closuresToInsert = enabledHolidays.map(holiday => {
          let closureDate: string;
          
          if (holiday.date === 'easter') {
            // Calcola Pasqua per l'anno corrente
            const easter = getEasterDate(currentYear);
            closureDate = easter.toISOString().split('T')[0];
          } else {
            // Festività fissa (MM-DD)
            closureDate = `${currentYear}-${holiday.date}`;
          }

          return {
            business_id: businessId,
            title: holiday.name,
            start_date: closureDate,
            end_date: closureDate,
            is_full_day: true,
            is_recurring_yearly: true,
          };
        });

        console.log('Inserting closures:', closuresToInsert);

        const { error: closureError } = await (supabase as any)
          .from('business_closures')
          .insert(closuresToInsert);

        if (closureError) {
          console.error('Error saving closures:', JSON.stringify(closureError));
          console.error('Error message:', closureError.message);
          console.error('Error code:', closureError.code);
          // Non blocchiamo l'onboarding se fallisce il salvataggio delle festività
        }
      }

      // Aggiorna step
      const { error: updateError } = await (supabase as any)
        .from('businesses')
        .update({
          onboarding_step: 5,
        })
        .eq('id', businessId);

      if (updateError) throw updateError;

      router.push('/onboarding/5');
    } catch (err) {
      console.error('Error saving hours:', err);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Pianifica la tua disponibilità</CardTitle>
        <CardDescription className="text-base mt-2">
         Imposta gli orari di apertura e le pause per gestire al meglio le prenotazioni 
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

        {/* Pausa pranzo globale */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900">Pausa pranzo</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={globalBreak.enabled}
                onChange={(e) => setGlobalBreak(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          {globalBreak.enabled && (
            <div className="flex items-center gap-3">
              <select
                value={globalBreak.start}
                onChange={(e) => setGlobalBreak(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                {TIME_OPTIONS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <span className="text-gray-500">-</span>
              <select
                value={globalBreak.end}
                onChange={(e) => setGlobalBreak(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                {TIME_OPTIONS.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyGlobalBreak}
                className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Applica a tutti
              </button>
            </div>
          )}
        </div>

        {/* Orari giornalieri */}
        <div className="space-y-3 mb-6">
          {hours.map((day, index) => (
            <div
              key={day.day}
              className={`p-3 rounded-lg border ${
                day.isOpen ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={(e) => updateDay(index, { isOpen: e.target.checked })}
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />

                {/* Day label */}
                <span className={`w-24 font-medium ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.label}
                </span>

                {/* Time selects */}
                {day.isOpen ? (
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    {/* Primo turno */}
                    <select
                      value={day.openTime1}
                      onChange={(e) => updateDay(index, { openTime1: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-gray-400">-</span>
                    <select
                      value={day.hasBreak ? day.closeTime1 : day.closeTime2}
                      onChange={(e) => updateDay(index, day.hasBreak ? { closeTime1: e.target.value } : { closeTime2: e.target.value })}
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>

                    {/* Secondo turno (se pausa) */}
                    {day.hasBreak && (
                      <>
                        <span className="text-gray-300 mx-1">|</span>
                        <select
                          value={day.openTime2}
                          onChange={(e) => updateDay(index, { openTime2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                          {TIME_OPTIONS.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                        <span className="text-gray-400">-</span>
                        <select
                          value={day.closeTime2}
                          onChange={(e) => updateDay(index, { closeTime2: e.target.value })}
                          className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                        >
                          {TIME_OPTIONS.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </>
                    )}

                    {/* Toggle pausa per questo giorno */}
                    <button
                      type="button"
                      onClick={() => updateDay(index, { hasBreak: !day.hasBreak })}
                      className={`ml-auto text-xs px-2 py-1 rounded ${
                        day.hasBreak 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {day.hasBreak ? 'Con pausa' : 'Senza pausa'}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Chiuso</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Festività */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium text-gray-900">Chiusura festività</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {holidays.map(holiday => (
              <label
                key={holiday.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  holiday.enabled ? 'bg-white border border-purple-200' : 'bg-gray-100 border border-transparent'
                }`}
              >
                <input
                  type="checkbox"
                  checked={holiday.enabled}
                  onChange={() => toggleHoliday(holiday.id)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className={`text-sm ${holiday.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {holiday.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-8">
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
          Potrai modificare gli orari dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}