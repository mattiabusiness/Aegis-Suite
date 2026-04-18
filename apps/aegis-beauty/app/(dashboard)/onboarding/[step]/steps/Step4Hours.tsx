// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 4: HOURS
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step4Hours.tsx
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition, AnimatedSelect } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, DayOfWeek, BusinessType } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

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
  date: string;
  icon: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
});

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    default: return 'salone';
  }
}

function getDefaultHours(type: BusinessType | null): DayHours[] {
  const isMixed = type === 'mixed';
  const isBC = type === 'beauty_center';
  // Hair Salon: 9:00-13:00 | 14:30-19:00
  // Beauty Center: 9:00-13:00 | 15:00-19:30
  // Mixed: 9:00-19:00 continuato (no pausa)
  const breakStart = '12:30';
  const breakEnd = '14:30';
  const closeTime = isBC ? '19:30' : '19:00';
  const satClose = isBC ? '19:00' : '18:00';

  const daysConfig: { day: DayOfWeek; label: string; isOpen: boolean }[] = [
    { day: 'monday', label: 'Lun', isOpen: false },
    { day: 'tuesday', label: 'Mar', isOpen: true },
    { day: 'wednesday', label: 'Mer', isOpen: true },
    { day: 'thursday', label: 'Gio', isOpen: true },
    { day: 'friday', label: 'Ven', isOpen: true },
    { day: 'saturday', label: 'Sab', isOpen: true },
    { day: 'sunday', label: 'Dom', isOpen: false },
  ];

  return daysConfig.map(d => {
    const isSat = d.day === 'saturday';
    const endTime = isSat ? satClose : closeTime;
    if (isMixed) {
      // Continuato: no break, closeTime2 = orario chiusura
      return { ...d, openTime1: '09:00', closeTime1: breakStart, openTime2: breakEnd, closeTime2: isSat ? '18:00' : '19:00', hasBreak: false };
    }
    return { ...d, openTime1: '09:00', closeTime1: breakStart, openTime2: breakEnd, closeTime2: endTime, hasBreak: false };
  });
}

function getEasterDate(year: number): Date {
  const a = year % 19; const b = Math.floor(year / 100); const c = year % 100;
  const d = Math.floor(b / 4); const e = b % 4; const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3); const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4); const k = c % 4; const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const dayNum = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, dayNum);
}

// Professional SVG icons for holidays
const HolidayIcons = {
  christmas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.4 4.8H19l-3.6 3.6L16.8 15 12 12l-4.8 3 1.4-4.6L5 6.8h4.6L12 2z" />
    </svg>
  ),
  new_year: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
  easter: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  ferragosto: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
};

const DEFAULT_HOLIDAYS: Holiday[] = [
  { id: 'christmas', name: 'Natale (25 Dic)', enabled: true, date: '12-25', icon: HolidayIcons.christmas },
  { id: 'new_year', name: 'Capodanno (1 Gen)', enabled: true, date: '01-01', icon: HolidayIcons.new_year },
  { id: 'easter', name: 'Pasqua', enabled: true, date: 'easter', icon: HolidayIcons.easter },
  { id: 'ferragosto', name: 'Ferragosto (15 Ago)', enabled: true, date: '08-15', icon: HolidayIcons.ferragosto },
];

// ============================================================================
// ANIMATED TOGGLE
// ============================================================================

function AnimatedToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative rounded-full transition-all duration-300 flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
      style={{
        width: 38, height: 21,
        backgroundColor: enabled ? '#a855f7' : '#d1d5db',
        boxShadow: enabled ? '0 2px 8px rgba(168,85,247,0.3)' : 'none',
      }}
    >
      <span
        className="absolute bg-white rounded-full shadow-sm flex items-center justify-center"
        style={{
          width: 17, height: 17, top: 2, left: 2,
          transform: enabled ? 'translateX(17px)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {enabled ? (
          <svg className="text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
              style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's4Check 0.25s ease-out' }} />
          </svg>
        ) : (
          <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 9, height: 9 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
    </button>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step4Hours({ businessId, businessType }: Step4Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();
  const label = getBusinessLabel(businessType);

  const [hours, setHours] = useState<DayHours[]>(() => getDefaultHours(businessType));
  const [holidays, setHolidays] = useState<Holiday[]>(DEFAULT_HOLIDAYS);
  const [globalBreak, setGlobalBreak] = useState(() => {
    const isBC = businessType === 'beauty_center';
    return { enabled: false, start: '12:30', end: '14:30' };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);
  const triggerShake = useCallback(() => { setShaking(true); setTimeout(() => setShaking(false), 500); }, []);

  // =========================================================================
  // SINGLE CONSOLIDATED EFFECT: Load from DB or apply smart defaults
  // No race conditions — everything happens in sequence inside one effect
  // =========================================================================
  useEffect(() => {
    let cancelled = false;
    const defaults = getDefaultHours(businessType);
    const isBC = businessType === 'beauty_center';
    const breakEnabled = false;
    const breakStart = '12:30';
    const breakEnd = '14:30';

    async function loadAndApply() {
      const { data: savedHours } = await supabase
        .from('business_hours')
        .select('day_of_week, is_open, open_time_1, close_time_1, open_time_2, close_time_2')
        .eq('business_id', businessId);

      if (cancelled) return;

      let resolvedHours: DayHours[];

      if (savedHours && savedHours.length > 0) {
        // DB has data → merge with defaults (defaults act as fallback)
        const dayMap = new Map(
          (savedHours as { day_of_week: string; is_open: boolean; open_time_1: string | null; close_time_1: string | null; open_time_2: string | null; close_time_2: string | null }[])
            .map(h => [h.day_of_week, h])
        );
        resolvedHours = defaults.map(d => {
          const saved = dayMap.get(d.day) as { is_open: boolean; open_time_1: string | null; close_time_1: string | null; open_time_2: string | null; close_time_2: string | null } | undefined;
          if (!saved) return d;
          // Supabase TIME columns return 'HH:MM:SS' — truncate to 'HH:MM'
          const t = (v: string | null) => v ? v.substring(0, 5) : null;
          const hasBreak = !!(saved.open_time_2 && saved.close_time_1);
          return {
            ...d,
            isOpen: saved.is_open,
            openTime1: t(saved.open_time_1) || d.openTime1,
            closeTime1: hasBreak ? (t(saved.close_time_1) || d.closeTime1) : d.closeTime1,
            openTime2: t(saved.open_time_2) || d.openTime2,
            closeTime2: hasBreak ? (t(saved.close_time_2) || d.closeTime2) : (t(saved.close_time_1) || d.closeTime2),
            hasBreak,
          };
        });
      } else {
        // No DB data → use smart defaults directly (already have correct values)
        resolvedHours = defaults;
      }

      // Apply globalBreak settings on top (same logic as the old Effect 2,
      // but done HERE so there's no timing gap where values are missing)
      if (breakEnabled) {
        resolvedHours = resolvedHours.map(day => {
          if (!day.isOpen) return day;
          return { ...day, hasBreak: true, closeTime1: breakStart, openTime2: breakEnd };
        });
      }

      if (!cancelled) {
        setHours(resolvedHours);
        setInitialLoaded(true);
      }
    }

    loadAndApply();
    return () => { cancelled = true; };
  }, [businessId, businessType, supabase]);

  // =========================================================================
  // GLOBAL BREAK TOGGLE — only reacts to USER toggling (after initial load)
  // =========================================================================
  useEffect(() => {
    if (!initialLoaded) return;
    setHours(prev => prev.map(day => {
      if (!day.isOpen) return day;
      if (globalBreak.enabled) {
        return { ...day, hasBreak: true, closeTime1: globalBreak.start, openTime2: globalBreak.end };
      }
      return { ...day, hasBreak: false };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalBreak.enabled, globalBreak.start, globalBreak.end]);

  const updateDay = (index: number, updates: Partial<DayHours>) => {
    setHours(prev => prev.map((d, i) => i === index ? { ...d, ...updates } : d));
  };

  const toggleHoliday = (id: string) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, enabled: !h.enabled } : h));
  };

  const applyGlobalBreak = () => {
    setHours(prev => prev.map(day => ({
      ...day,
      hasBreak: day.isOpen ? globalBreak.enabled : false,
      closeTime1: day.isOpen && globalBreak.enabled ? globalBreak.start : day.closeTime1,
      openTime2: day.isOpen && globalBreak.enabled ? globalBreak.end : day.openTime2,
    })));
  };

  const handleBack = () => router.push('/onboarding/3');

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!hours.some(d => d.isOpen)) { setError('Seleziona almeno un giorno di apertura'); triggerShake(); return; }
    if (e) triggerRipple(e);
    setLoading(true); setError('');

    try {
      await supabase.from('business_hours').delete().eq('business_id', businessId);

      const hoursData = hours.map(day => ({
        business_id: businessId, day_of_week: day.day, is_open: day.isOpen,
        open_time_1: day.isOpen ? day.openTime1 : null,
        close_time_1: day.isOpen ? (globalBreak.enabled ? day.closeTime1 : day.closeTime2) : null,
        open_time_2: day.isOpen && globalBreak.enabled ? day.openTime2 : null,
        close_time_2: day.isOpen && globalBreak.enabled ? day.closeTime2 : null,
      }));
      const { error: ie } = await supabase.from('business_hours').insert(hoursData as never);
      if (ie) throw ie;

      const yr = new Date().getFullYear();
      const dates: string[] = [];
      for (const h of holidays) {
        if (!h.enabled) continue;
        if (h.date === 'easter') {
          const e = getEasterDate(yr);
          dates.push(e.toISOString().split('T')[0]);
          const em = new Date(e); em.setDate(e.getDate() + 1);
          dates.push(em.toISOString().split('T')[0]);
        } else dates.push(`${yr}-${h.date}`);
      }
      if (dates.length > 0) {
        await supabase.from('business_closures').delete().eq('business_id', businessId);
        const cd = dates.map(d => ({ business_id: businessId, date: d, reason: 'Festività' }));
        await supabase.from('business_closures').insert(cd as never);
      }

      await supabase.from('businesses').update({ onboarding_step: 5 } as never).eq('id', businessId);
      showTransition('Orari configurati ✓', () => router.push('/onboarding/5'));
    } catch (err) {
      console.error('Error saving hours:', err);
      setError('Errore durante il salvataggio. Riprova.'); triggerShake();
    } finally { setLoading(false); }
  };

  const openCount = hours.filter(d => d.isOpen).length;

  return (
    <div className="w-full max-w-2xl mx-auto" style={{ animation: shaking ? 's4Shake 0.5s ease-in-out' : undefined }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden">

        {/* Header */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Orari di apertura</h2>
              <p className="text-gray-500 text-sm mt-0.5">Configura gli orari del tuo {label}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-7 pt-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Global break */}
          <div className="p-3.5 rounded-xl mb-4 transition-all duration-300" style={{
            background: globalBreak.enabled ? 'rgba(168,85,247,0.04)' : 'rgba(0,0,0,0.02)',
            border: globalBreak.enabled ? '1.5px solid rgba(168,85,247,0.15)' : '1.5px solid rgba(0,0,0,0.06)',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                  background: globalBreak.enabled ? 'rgba(168,85,247,0.1)' : 'rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease',
                }}>
                  <svg className="w-3.5 h-3.5" style={{ color: globalBreak.enabled ? '#7c3aed' : '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800">Pausa pranzo</span>
                {globalBreak.enabled && (
                  <span className="text-[11px] text-purple-500 font-medium px-2 py-0.5 rounded-full bg-purple-50" style={{ animation: 's4FadeUp 0.2s ease-out' }}>
                    Attiva
                  </span>
                )}
              </div>
              <AnimatedToggle enabled={globalBreak.enabled} onToggle={() => setGlobalBreak(p => ({ ...p, enabled: !p.enabled }))} />
            </div>
            {globalBreak.enabled && (
              <div className="flex items-center gap-2 mt-3" style={{ animation: 's4FadeUp 0.25s ease-out both' }}>
                <AnimatedSelect value={globalBreak.start} onChange={(v) => setGlobalBreak(p => ({ ...p, start: v }))} options={TIME_OPTIONS} compact />
                <span className="text-gray-300 text-sm">→</span>
                <AnimatedSelect value={globalBreak.end} onChange={(v) => setGlobalBreak(p => ({ ...p, end: v }))} options={TIME_OPTIONS} compact />
                <button type="button" onClick={applyGlobalBreak} className="ml-auto text-xs text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  Applica a tutti
                </button>
              </div>
            )}
          </div>

          {/* Day rows — FIX 2: hover effect on open days */}
          <div className="space-y-1.5 mb-4">
            {hours.map((day, index) => (
              <div key={day.day} className="rounded-xl overflow-hidden" style={{ animation: `s4FadeUp 0.3s ease-out ${index * 0.04}s both` }}>
                <div className="s4-day-row flex items-center gap-2.5 px-3 py-2.5 transition-all duration-200" style={{
                  background: day.isOpen ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.015)',
                  borderLeft: day.isOpen ? '3px solid #a855f7' : '3px solid #e5e7eb',
                  backdropFilter: 'blur(4px)',
                }}
                  onMouseEnter={(e) => { if (day.isOpen) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.06)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <AnimatedToggle enabled={day.isOpen} onToggle={() => updateDay(index, { isOpen: !day.isOpen })} />

                  <span className={`w-10 text-sm font-semibold transition-colors duration-200 ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                    {day.label}
                  </span>

                  {day.isOpen ? (
                    <div className="s4-day-selects flex items-center gap-1.5 flex-1 flex-wrap">
                      <AnimatedSelect value={day.openTime1} onChange={(v) => updateDay(index, { openTime1: v })} options={TIME_OPTIONS} compact />
                      <span className="text-purple-300 text-xs">→</span>
                      <AnimatedSelect
                        value={globalBreak.enabled ? day.closeTime1 : day.closeTime2}
                        onChange={(v) => updateDay(index, globalBreak.enabled ? { closeTime1: v } : { closeTime2: v })}
                        options={TIME_OPTIONS} compact
                      />
                      {globalBreak.enabled && (
                        <>
                          <span className="text-purple-200 mx-0.5 text-xs">|</span>
                          <AnimatedSelect value={day.openTime2} onChange={(v) => updateDay(index, { openTime2: v })} options={TIME_OPTIONS} compact />
                          <span className="text-purple-300 text-xs">→</span>
                          <AnimatedSelect value={day.closeTime2} onChange={(v) => updateDay(index, { closeTime2: v })} options={TIME_OPTIONS} compact />
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Chiuso</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Open days indicator */}
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <span className="text-xs text-gray-400">{openCount}/7 giorni</span>
            <div className="flex gap-1">
              {hours.map((d, i) => (
                <div key={i} className="w-2 h-2 rounded-full transition-all duration-300" style={{
                  backgroundColor: d.isOpen ? '#a855f7' : '#e5e7eb',
                  boxShadow: d.isOpen ? '0 1px 4px rgba(168,85,247,0.3)' : 'none',
                }} />
              ))}
            </div>
          </div>

          {/* Holidays */}
          <div className="p-3.5 rounded-xl mb-5" style={{ background: 'rgba(0,0,0,0.02)', border: '1.5px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-800">Chiusura festività</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {holidays.map(holiday => (
                <button key={holiday.id} type="button" onClick={() => toggleHoliday(holiday.id)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                  style={{
                    background: holiday.enabled ? 'rgba(168,85,247,0.05)' : 'rgba(255,255,255,0.5)',
                    border: holiday.enabled ? '1.5px solid rgba(168,85,247,0.2)' : '1.5px solid rgba(0,0,0,0.06)',
                    transform: holiday.enabled ? 'scale(1.01)' : 'scale(1)',
                  }}>
                  {/* Animated checkbox */}
                  <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300" style={{
                    background: holiday.enabled ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                    border: holiday.enabled ? 'none' : '2px solid #d1d5db',
                    boxShadow: holiday.enabled ? '0 2px 6px rgba(168,85,247,0.3)' : 'none',
                  }}>
                    {holiday.enabled && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
                          style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's4Check 0.25s ease-out' }} />
                      </svg>
                    )}
                  </div>
                  {/* Icon */}
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors duration-200" style={{
                    color: holiday.enabled ? '#7c3aed' : '#9ca3af',
                  }}>
                    {holiday.icon}
                  </div>
                  <span className={`text-xs font-medium transition-colors ${holiday.enabled ? 'text-gray-800' : 'text-gray-500'}`}>
                    {holiday.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" onClick={handleBack} disabled={loading}
              className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 transition-all duration-300 outline-none hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Indietro
            </button>
            <button type="button" onClick={handleContinue} disabled={loading}
              className="relative flex-1 h-12 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              {!loading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's4Shimmer 2.5s ease-in-out infinite' }} />}
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's4Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Continua<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>)}
              </span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai modificare gli orari dalle impostazioni
          </p>
        </div>
      </div>

      <style>{`
        @keyframes s4FadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s4Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s4Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s4Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes s4Check { from{stroke-dashoffset:24} to{stroke-dashoffset:0} }
        @media (max-width: 639px) {
          .s4-day-row { align-items: flex-start; padding-top: 0.625rem; padding-bottom: 0.625rem; }
          .s4-day-selects { width: 100%; margin-top: 0.25rem; }
        }
      `}</style>
    </div>
  );
}