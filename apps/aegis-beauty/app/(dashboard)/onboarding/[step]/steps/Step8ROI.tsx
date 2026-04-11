// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 8: ROI CALCULATOR
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step8ROI.tsx
// ============================================================================

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessType } from '@aegis/types';

interface Step8Props {
  businessId: string;
  businessType: BusinessType | null;
  businessSlug: string;
  businessName: string;
  openDaysPerWeek: number;
}

const HOURLY_RATE = { hair_salon: 25, beauty_center: 35, mixed: 30 };
const NOSHOW_VALUE = { hair_salon: 30, beauty_center: 50, mixed: 40 };

function calcDashHours(m: number): number { return Math.min(25, 5 + (m * 0.15)); }

type Phase = 'calculator' | 'summary';

// ============================================================================
// MINI CHART — glass + hover
// ============================================================================

function MiniSavingsChart({ timeSavings, noShowRecovery, small }: { timeSavings: number; noShowRecovery: number; small?: boolean }) {
  const total = timeSavings + noShowRecovery;
  if (total === 0) return null;
  // Normalize all bars relative to the largest value (total)
  const maxVal = total;
  const timePctNorm = (timeSavings / maxVal) * 100;
  const noShowPctNorm = (noShowRecovery / maxVal) * 100;
  const totalPctNorm = 100; // total is always the tallest
  const maxH = small ? 40 : 56;
  const barW = small ? 'w-8' : 'w-10';

  const bars = [
    { label: 'Tempo', pct: timePctNorm, grad: 'linear-gradient(to top, #7c3aed, #a855f7)', val: `€${Math.round(timeSavings)}`, color: 'text-purple-600', delay: 0.3 },
    { label: 'No-show', pct: noShowPctNorm, grad: 'linear-gradient(to top, #059669, #10b981)', val: `€${Math.round(noShowRecovery)}`, color: 'text-green-600', delay: 0.45 },
    { label: 'Totale', pct: totalPctNorm, grad: 'linear-gradient(to top, #4338ca, #6366f1)', val: `€${Math.round(total)}`, color: 'text-indigo-600', delay: 0.6 },
  ];

  return (
    <div className={`flex items-end gap-3 justify-center`} style={{ height: small ? 64 : 80, animation: 's8FadeUp 0.5s ease-out 0.2s both' }}>
      {bars.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-1 group">
          <span className="text-[9px] text-gray-500 font-medium">{bar.label}</span>
          <div className={`${barW} rounded-t-lg relative overflow-hidden transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-lg`}
            style={{
              height: Math.max(8, (bar.pct / 100) * maxH),
              background: bar.grad,
              animation: `s8BarGrow 0.6s ease-out ${bar.delay}s both`,
              backdropFilter: 'blur(4px)',
            }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.2) 3px, rgba(255,255,255,0.2) 6px)' }} />
          </div>
          <span className={`text-[9px] font-bold ${bar.color}`}>{bar.val}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ANIMATED SLIDER
// ============================================================================

function AnimatedSlider({ value, onChange, min, max, step, label }: {
  value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex-1">
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer s8-slider"
          style={{
            background: `linear-gradient(to right, #a855f7 ${pct}%, #e5e7eb ${pct}%)`,
          }}
        />
        {/* Floating thumb indicator */}
        <div className="absolute pointer-events-none" style={{
          left: `${pct}%`, top: -28, transform: 'translateX(-50%)',
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 0.15s ease',
        }}>
          <div className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white" style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          }}>
            {value} {label}
          </div>
          <div className="w-2 h-2 mx-auto -mt-0.5 rotate-45" style={{ background: '#7c3aed' }} />
        </div>
      </div>
      <div className="relative h-5 mt-1">
        <span className="absolute text-[10px] text-gray-400 transform -translate-x-1/2" style={{ left: `${pct}%` }}>
          {value} {label}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step8ROI({ businessId, businessType, businessSlug, businessName, openDaysPerWeek }: Step8Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();

  const [phase, setPhase] = useState<Phase>('calculator');
  const [phoneMinutesPerDay, setPhoneMinutesPerDay] = useState(30);
  const [noShowsPerMonth, setNoShowsPerMonth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  // Store final calculated values for summary (so they don't change)
  const savedCalc = useRef<{
    hoursSaved: number; timeSavings: number; noShowsAvoided: number;
    noShowRecovery: number; monthlyTotal: number; annualTotal: number;
  } | null>(null);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);

  const type = businessType || 'mixed';
  const hourlyRate = HOURLY_RATE[type];
  const noShowValue = NOSHOW_VALUE[type];
  const openDaysPerMonth = openDaysPerWeek * 4.33;
  const manualHoursPerMonth = (phoneMinutesPerDay * openDaysPerMonth) / 60;
  const dashboardHoursPerMonth = calcDashHours(manualHoursPerMonth);
  const hoursSaved = Math.max(0, manualHoursPerMonth - dashboardHoursPerMonth);
  const timeSavings = hoursSaved * hourlyRate;
  const noShowsAvoided = Math.round(noShowsPerMonth * 0.7);
  const noShowRecovery = noShowsAvoided * noShowValue;
  const monthlyTotal = timeSavings + noShowRecovery;
  const annualTotal = monthlyTotal * 12;

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${businessSlug}`;

  const handleBack = () => router.push('/onboarding/7');

  const handleComplete = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRipple(e);
    setLoading(true);

    // Save current calculations before transitioning
    savedCalc.current = { hoursSaved, timeSavings, noShowsAvoided, noShowRecovery, monthlyTotal, annualTotal };

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
        },
      };

      const { error } = await (supabase as unknown as { from: (t: string) => { update: (d: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<{ error: unknown }> } } })
        .from('businesses')
        .update({ onboarding_step: 8, onboarding_completed: false, roi_data: roiData })
        .eq('id', businessId);
      if (error) throw error;

      showTransition('Dati salvati ✓', () => setPhase('summary'));
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setShaking(true); setTimeout(() => setShaking(false), 500);
    } finally { setLoading(false); }
  };

  const handleGoToDashboard = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRipple(e);
    // Mark onboarding as completed only when going to dashboard
    await (supabase as unknown as { from: (t: string) => { update: (d: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<{ error: unknown }> } } })
      .from('businesses')
      .update({ onboarding_completed: true })
      .eq('id', businessId);
    showTransition('Benvenuto in Aegis Beauty ✓', () => router.push('/dashboard'), true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // Use saved values in summary to avoid stale data
  const sc = savedCalc.current || { hoursSaved, timeSavings, noShowsAvoided, noShowRecovery, monthlyTotal, annualTotal };

  // ============================================================================
  // SUMMARY PHASE
  // ============================================================================

  if (phase === 'summary') {
    return (
      <div className="w-full max-w-xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20">
          <div className="px-6 py-8">

            {/* Success icon */}
            <div className="flex justify-center mb-6" style={{ animation: 's8ScaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 12px 40px rgba(16,185,129,0.3)',
              }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"
                    style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: 's8CheckDraw 0.5s ease-out 0.3s both' }} />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1" style={{ animation: 's8FadeUp 0.4s ease-out 0.2s both' }}>
              Configurazione completata!
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6" style={{ animation: 's8FadeUp 0.4s ease-out 0.3s both' }}>
              <span className="font-medium text-gray-700">{businessName}</span> è pronto
            </p>

            {/* Booking URL */}
            <div className="p-4 rounded-xl mb-4 transition-all duration-200 hover:shadow-md" style={{
              background: 'rgba(168,85,247,0.04)', border: '1.5px solid rgba(168,85,247,0.12)',
              backdropFilter: 'blur(4px)', animation: 's8FadeUp 0.4s ease-out 0.4s both',
            }}>
              <p className="text-xs text-gray-500 mb-2 text-center">Il tuo link prenotazioni</p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="flex-1 text-sm text-purple-700 font-medium truncate">{bookingUrl}</span>
                <button onClick={handleCopyLink} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200" style={{
                  background: copied ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.2)',
                }}>
                  {copied ? '✓ Copiato' : 'Copia'}
                </button>
              </div>
            </div>

            {/* Savings + Chart card */}
            <div className="p-4 rounded-xl mb-4 transition-all duration-200 hover:shadow-md" style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(168,85,247,0.08))',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(168,85,247,0.15)', animation: 's8FadeUp 0.4s ease-out 0.5s both',
            }}>
              <p className="text-xs text-purple-600 font-medium mb-1 text-center">Risparmio annuale stimato</p>
              <p className="text-3xl font-bold text-center bg-clip-text text-transparent mb-3" style={{
                backgroundImage: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'inline-block', width: '100%',
                animation: 's8Breathe 3s ease-in-out infinite',
              }}>
                €{Math.round(sc.annualTotal).toLocaleString('it-IT')}
              </p>
              <p className="text-xs text-gray-500 text-center mb-3">~€{Math.round(sc.monthlyTotal).toLocaleString('it-IT')}/mese</p>
              <MiniSavingsChart timeSavings={sc.timeSavings} noShowRecovery={sc.noShowRecovery} small />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-3 mb-6" style={{ animation: 's8FadeUp 0.4s ease-out 0.6s both' }}>
              <div className="p-3 rounded-xl text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(0,0,0,0.05)',
              }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] text-gray-500">Tempo risparmiato</span>
                </div>
                <p className="text-sm font-bold text-gray-900">~{Math.round(sc.hoursSaved)}h/mese</p>
              </div>
              <div className="p-3 rounded-xl text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" style={{
                background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(0,0,0,0.05)',
              }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] text-gray-500">No-show evitati</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{sc.noShowsAvoided}/mese</p>
              </div>
            </div>

            {/* Dashboard button */}
            <button type="button" onClick={handleGoToDashboard}
              className="relative w-full h-14 rounded-xl font-semibold text-white text-base transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 30px rgba(124,58,237,0.35)',
                animation: 's8FadeUp 0.4s ease-out 0.7s both',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's8Shimmer 2.5s ease-in-out infinite' }} />
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's8Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                Vai alla Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes s8FadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
          @keyframes s8ScaleIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
          @keyframes s8CheckDraw { from { stroke-dashoffset:30; } to { stroke-dashoffset:0; } }
          @keyframes s8Breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
          @keyframes s8BarGrow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
          @keyframes s8Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
          @keyframes s8Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        `}</style>
      </div>
    );
  }

  // ============================================================================
  // CALCULATOR PHASE
  // ============================================================================

  return (
    <div className="w-full max-w-xl mx-auto" style={{ animation: shaking ? 's8Shake 0.5s ease-in-out' : undefined }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20">

        {/* Header */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Il tuo risparmio</h2>
              <p className="text-gray-500 text-sm mt-0.5">Scopri quanto puoi recuperare con Aegis Beauty</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-7 pt-4">
          <div className="space-y-6">
            {/* Phone time */}
            <div style={{ animation: 's8FadeUp 0.3s ease-out both' }}>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Tempo per prenotazioni telefoniche</label>
              <p className="text-xs text-gray-500 mb-3">Tra chiamate in entrata e richiesta di informazioni...</p>
              <div className="flex items-center gap-4">
                <AnimatedSlider value={phoneMinutesPerDay} onChange={setPhoneMinutesPerDay} min={5} max={120} step={5} label="min" />
                <div className="w-20 text-center px-3 py-2 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1.5px solid rgba(168,85,247,0.12)' }}>
                  <span className="text-lg font-bold text-purple-600">{phoneMinutesPerDay}</span>
                  <span className="text-[10px] text-gray-500 ml-0.5">min</span>
                </div>
              </div>
            </div>

            {/* No-shows */}
            <div style={{ animation: 's8FadeUp 0.3s ease-out 0.1s both' }}>
              <label className="block text-sm font-semibold text-gray-900 mb-1">No-show mensili</label>
              <p className="text-xs text-gray-500 mb-3">Clienti che non si presentano - soldi persi ogni mese</p>
              <div className="flex items-center gap-4">
                <AnimatedSlider value={noShowsPerMonth} onChange={setNoShowsPerMonth} min={0} max={20} step={1} label="no-show" />
                <div className="w-20 text-center px-3 py-2 rounded-xl" style={{ background: 'rgba(168,85,247,0.06)', border: '1.5px solid rgba(168,85,247,0.12)' }}>
                  <span className="text-lg font-bold text-purple-600">{noShowsPerMonth}</span>
                  <span className="text-[10px] text-gray-500 ml-0.5">/mese</span>
                </div>
              </div>
            </div>

            {/* Results — glass + hover */}
            <div className="p-5 rounded-xl transition-all duration-200 hover:shadow-lg" style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(168,85,247,0.08))',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(168,85,247,0.15)', animation: 's8FadeUp 0.3s ease-out 0.2s both',
            }}>
              <div className="text-center mb-3">
                <p className="text-xs text-purple-600 font-medium mb-1">Risparmio annuale stimato</p>
                <p className="text-4xl font-bold bg-clip-text text-transparent" style={{
                  backgroundImage: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  animation: 's8Breathe 3s ease-in-out infinite', display: 'inline-block',
                }}>
                  €{Math.round(annualTotal).toLocaleString('it-IT')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">~€{Math.round(monthlyTotal).toLocaleString('it-IT')}/mese</p>
              </div>

              <MiniSavingsChart timeSavings={timeSavings} noShowRecovery={noShowRecovery} />

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="p-2.5 rounded-lg text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] text-gray-500">Tempo risparmiato</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">~{Math.round(hoursSaved)}h/mese</p>
                </div>
                <div className="p-2.5 rounded-lg text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm" style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)' }}>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[10px] text-gray-500">No-show evitati</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">€{Math.round(noShowRecovery)}/mese</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Stime basate sui dati forniti. I risultati reali possono variare.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button type="button" onClick={handleBack} disabled={loading}
              className="w-full sm:flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 transition-all duration-300 outline-none hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Indietro
            </button>
            <button type="button" onClick={handleComplete} disabled={loading}
              className="relative w-full sm:flex-1 h-12 rounded-xl font-semibold text-white text-sm transition-all duration-300 outline-none overflow-hidden focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.3)' }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              {!loading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's8Shimmer 2.5s ease-in-out infinite' }} />}
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's8Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Completa configurazione</>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .s8-slider::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg, #6d28d9, #7c3aed); border:none; box-shadow:0 2px 8px rgba(109,40,217,0.35); cursor:pointer; transition:transform 0.15s ease, box-shadow 0.15s ease; }
        .s8-slider::-webkit-slider-thumb:hover { transform:scale(1.15); box-shadow:0 3px 12px rgba(109,40,217,0.45); }
        .s8-slider::-webkit-slider-thumb:active { transform:scale(1.25); box-shadow:0 4px 16px rgba(109,40,217,0.5); }
        .s8-slider::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:linear-gradient(135deg, #6d28d9, #7c3aed); border:none; box-shadow:0 2px 8px rgba(109,40,217,0.35); cursor:pointer; }
        @keyframes s8FadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s8Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s8Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s8Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes s8Breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes s8BarGrow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
        @keyframes s8ScaleIn { from { opacity:0; transform:scale(0.5); } to { opacity:1; transform:scale(1); } }
        @keyframes s8CheckDraw { from { stroke-dashoffset:30; } to { stroke-dashoffset:0; } }
      `}</style>
    </div>
  );
}