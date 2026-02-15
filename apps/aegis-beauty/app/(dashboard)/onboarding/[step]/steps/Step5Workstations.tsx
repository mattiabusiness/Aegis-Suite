// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 5: WORKSTATIONS
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step5Workstations.tsx
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

interface Step5Props {
  businessId: string;
  businessType: BusinessType | null;
  initialValue: number;
}

function getWorkstationLabel(type: BusinessType | null): { singular: string; plural: string; icon: 'chair' | 'cabin' | 'station' } {
  switch (type) {
    case 'hair_salon': return { singular: 'Poltrona', plural: 'Poltrone', icon: 'chair' };
    case 'beauty_center': return { singular: 'Cabina', plural: 'Cabine', icon: 'cabin' };
    default: return { singular: 'Postazione', plural: 'Postazioni', icon: 'station' };
  }
}

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    default: return 'salone';
  }
}

export function Step5Workstations({ businessId, businessType, initialValue }: Step5Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();

  const [workstations, setWorkstations] = useState(initialValue || 3);
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [bounceDir, setBounceDir] = useState<'up' | 'down' | null>(null);
  const [pulseBtn, setPulseBtn] = useState<'plus' | 'minus' | null>(null);

  const wsLabel = getWorkstationLabel(businessType);
  const bizLabel = getBusinessLabel(businessType);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);

  const handleDecrement = () => {
    if (workstations > 1) {
      setWorkstations(w => w - 1);
      setBounceDir('down');
      setPulseBtn('minus');
      setTimeout(() => setBounceDir(null), 300);
      setTimeout(() => setPulseBtn(null), 500);
    }
  };

  const handleIncrement = () => {
    if (workstations < 20) {
      setWorkstations(w => w + 1);
      setBounceDir('up');
      setPulseBtn('plus');
      setTimeout(() => setBounceDir(null), 300);
      setTimeout(() => setPulseBtn(null), 500);
    }
  };

  const handleBack = () => router.push('/onboarding/4');

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) triggerRipple(e);
    setLoading(true);
    try {
      await supabase.from('businesses').update({ workstations, onboarding_step: 6 } as never).eq('id', businessId);
      showTransition('Postazioni configurate ✓', () => router.push('/onboarding/6'));
    } catch (err) {
      console.error('Error saving workstations:', err);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto" style={{ animation: shaking ? 's5Shake 0.5s ease-in-out' : undefined }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20">

        {/* Header */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }}>
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{wsLabel.plural} di lavoro</h2>
              <p className="text-gray-500 text-sm mt-0.5">Quante {wsLabel.plural.toLowerCase()} hai nel tuo {bizLabel}?</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-7 pt-4">
          {/* Counter */}
          <div className="flex flex-col items-center py-6" style={{ animation: 's5FadeUp 0.4s ease-out both' }}>
            <div className="flex items-center gap-8">
              {/* Decrement */}
              <button
                type="button"
                onClick={handleDecrement}
                disabled={workstations <= 1}
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => { if (workstations > 1) e.currentTarget.style.border = '1.5px solid #a855f7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; }}
              >
                {pulseBtn === 'minus' && <span className="absolute inset-0 rounded-2xl pointer-events-none" style={{ animation: 's5Pulse 0.5s ease-out forwards' }} />}
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              {/* Number */}
              <div className="text-center" style={{ minWidth: 80 }}>
                <span
                  className="text-6xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    display: 'inline-block',
                    animation: bounceDir === 'up'
                      ? 's5BounceUp 0.3s ease-out'
                      : bounceDir === 'down'
                        ? 's5BounceDown 0.3s ease-out'
                        : 's5Breathe 3s ease-in-out infinite',
                  }}
                >
                  {workstations}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {workstations === 1 ? wsLabel.singular : wsLabel.plural}
                </p>
              </div>

              {/* Increment */}
              <button
                type="button"
                onClick={handleIncrement}
                disabled={workstations >= 20}
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={(e) => { if (workstations < 20) e.currentTarget.style.border = '1.5px solid #a855f7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.border = '1.5px solid rgba(0,0,0,0.08)'; }}
              >
                {pulseBtn === 'plus' && <span className="absolute inset-0 rounded-2xl pointer-events-none" style={{ animation: 's5Pulse 0.5s ease-out forwards' }} />}
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Visual dots */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xs" style={{ animation: 's5FadeUp 0.4s ease-out 0.1s both' }}>
              {Array.from({ length: Math.min(workstations, 20) }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                    boxShadow: '0 2px 6px rgba(168,85,247,0.3)',
                    animation: `s5DotIn 0.2s ease-out ${i * 0.03}s both`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl mb-5" style={{ background: 'rgba(168,85,247,0.04)', border: '1.5px solid rgba(168,85,247,0.12)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)' }}>
                <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">Serve per gestire le prenotazioni simultanee.</p>
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
              {!loading && <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)', animation: 's5Shimmer 2.5s ease-in-out infinite' }} />}
              {ripple && <span key={ripple.id} className="absolute rounded-full pointer-events-none" style={{ left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100, background: 'rgba(255,255,255,0.35)', animation: 's5Ripple 0.6s ease-out forwards' }} />}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (<>Continua<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></>)}
              </span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai modificare questo valore dalle impostazioni
          </p>
        </div>
      </div>

      <style>{`
        @keyframes s5FadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes s5Shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-6px)} 30%{transform:translateX(5px)} 45%{transform:translateX(-4px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-2px)} }
        @keyframes s5Ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(6);opacity:0} }
        @keyframes s5Shimmer { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(100%)} }
        @keyframes s5BounceUp { 0%{transform:translateY(0)} 40%{transform:translateY(-8px)} 70%{transform:translateY(2px)} 100%{transform:translateY(0)} }
        @keyframes s5BounceDown { 0%{transform:translateY(0)} 40%{transform:translateY(8px)} 70%{transform:translateY(-2px)} 100%{transform:translateY(0)} }
        @keyframes s5DotIn { from { opacity:0; transform:scale(0); } to { opacity:1; transform:scale(1); } }
        @keyframes s5Pulse { 0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.18); } 100% { box-shadow: 0 0 0 14px rgba(168,85,247,0); } }
        @keyframes s5Breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
      `}</style>
    </div>
  );
}