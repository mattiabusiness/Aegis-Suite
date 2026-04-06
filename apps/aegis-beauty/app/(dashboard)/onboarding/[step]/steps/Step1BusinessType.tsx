// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 1: BUSINESS TYPE
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step1BusinessType.tsx
// ============================================================================

'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

// ============================================================================
// TYPES & DATA
// ============================================================================

interface Step1Props {
  businessId: string;
  initialValue: BusinessType | null;
}

const BUSINESS_TYPES: {
  value: BusinessType;
  label: string;
  description: string;
  gradient: string;
  glowColor: string;
}[] = [
  {
    value: 'hair_salon',
    label: 'Salone di parrucchiere',
    description: 'Taglio, piega, colore e trattamenti capelli',
    gradient: 'from-purple-500 to-violet-600',
    glowColor: 'rgba(139,92,246,0.25)',
  },
  {
    value: 'beauty_center',
    label: 'Centro estetico',
    description: 'Trattamenti viso, corpo, manicure e pedicure',
    gradient: 'from-fuchsia-500 to-purple-600',
    glowColor: 'rgba(192,38,211,0.25)',
  },
  {
    value: 'mixed',
    label: 'Salone misto',
    description: 'Parrucchiere + estetica in un unico salone',
    gradient: 'from-violet-500 to-indigo-600',
    glowColor: 'rgba(124,58,237,0.25)',
  },
];

// ============================================================================
// BUSINESS ICON
// ============================================================================

const BusinessIcon = ({ type, className }: { type: BusinessType; className: string }) => {
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

// ============================================================================
// COMPONENT
// ============================================================================

export function Step1BusinessType({ businessId, initialValue }: Step1Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();

  const [selected, setSelected] = useState<BusinessType | null>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [articlesAccepted, setArticlesAccepted] = useState(false);
  const [articlesExpanded, setArticlesExpanded] = useState(false);

  // Ripple state
  const btnRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id: Date.now(),
    });
    setTimeout(() => setRipple(null), 600);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const handleContinue = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selected) {
      setError('Seleziona il tipo di attività');
      triggerShake();
      return;
    }
    if (!termsAccepted || !articlesAccepted) {
      setError('Accetta tutti i termini per continuare');
      triggerShake();
      return;
    }

    triggerRipple(e);
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

      showTransition('Tipo attività completato ✓', () => {
        router.push('/onboarding/2');
      });
    } catch (err) {
      console.error('Error saving business type:', err);
      setError('Errore durante il salvataggio. Riprova.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-xl mx-auto"
      style={{
        animation: shaking ? 's1Shake 0.5s ease-in-out' : undefined,
      }}
    >
      {/* Card glassmorphism */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden">

        {/* Header — icon inline with title */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.25)',
              }}
            >
              <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Che tipo di attività hai?
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Seleziona la categoria più adatta
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-4">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Business type cards — stagger entrance */}
          <div className="space-y-3">
            {BUSINESS_TYPES.map((type, idx) => {
              const isSelected = selected === type.value;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setSelected(type.value);
                    setError('');
                  }}
                  className="w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 rounded-xl"
                  style={{
                    animation: `s1FadeUp 0.4s ease-out ${idx * 0.08}s both`,
                  }}
                >
                  <div
                    className="relative p-4 rounded-xl border-2 flex items-center gap-4 overflow-hidden"
                    style={{
                      borderColor: isSelected ? '#a855f7' : '#e5e7eb',
                      backgroundColor: isSelected ? 'rgba(168,85,247,0.04)' : 'white',
                      boxShadow: isSelected
                        ? `0 0 0 3px rgba(168,85,247,0.1), 0 8px 24px ${type.glowColor}`
                        : '0 1px 3px rgba(0,0,0,0.04)',
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#c4b5fd';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.1)';
                        e.currentTarget.style.transform = 'scale(1.005)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {/* Icon container with gradient */}
                    <div
                      className={`
                        w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0
                        transition-all duration-300
                        ${isSelected
                          ? `bg-gradient-to-br ${type.gradient} shadow-lg`
                          : 'bg-gray-50 border border-gray-100'
                        }
                      `}
                      style={isSelected ? { boxShadow: `0 6px 20px ${type.glowColor}` } : undefined}
                    >
                      <BusinessIcon
                        type={type.value}
                        className={`w-7 h-7 transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-base transition-colors duration-300 ${
                          isSelected ? 'text-purple-700' : 'text-gray-800'
                        }`}
                      >
                        {type.label}
                      </h3>
                      <p className={`text-sm mt-0.5 transition-colors duration-300 ${
                        isSelected ? 'text-purple-500/70' : 'text-gray-400'
                      }`}>
                        {type.description}
                      </p>
                    </div>

                    {/* Radio indicator */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{
                        border: isSelected ? 'none' : '2px solid #d1d5db',
                        background: isSelected ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                        boxShadow: isSelected ? '0 2px 8px rgba(168,85,247,0.3)' : 'none',
                      }}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                            d="M5 13l4 4L19 7"
                            style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's1Check 0.3s ease-out' }}
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legal acceptance */}
          <div className="mt-6 space-y-3 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.03)', border: '1.5px solid rgba(124,58,237,0.1)' }}>
            {/* Checkbox 1: Terms + Privacy + DPA */}
            <label className="flex items-start gap-3 cursor-pointer" onClick={() => { setTermsAccepted(v => !v); setError(''); }}>
              <div
                className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200"
                style={{
                  background: termsAccepted ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                  border: termsAccepted ? 'none' : '2px solid #d1d5db',
                  boxShadow: termsAccepted ? '0 2px 6px rgba(168,85,247,0.3)' : 'none',
                }}
              >
                {termsAccepted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
                      style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's1Check 0.3s ease-out' }} />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 leading-relaxed select-none">
                Accetto i{' '}
                <a href="https://aegisbeauty.app/legal#terms-manager" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-purple-600 underline underline-offset-2 hover:text-purple-700">
                  Termini di Servizio
                </a>
                , la{' '}
                <a href="https://aegisbeauty.app/legal#privacy-manager" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-purple-600 underline underline-offset-2 hover:text-purple-700">
                  Privacy Policy
                </a>
                {' '}e il{' '}
                <a href="https://aegisbeauty.app/legal#dpa" target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-purple-600 underline underline-offset-2 hover:text-purple-700">
                  DPA
                </a>
              </span>
            </label>

            {/* Checkbox 2: Artt. 1341-1342 */}
            <div>
              <div className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-all duration-200 cursor-pointer"
                  onClick={() => { setArticlesAccepted(v => !v); setError(''); }}
                  style={{
                    background: articlesAccepted ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
                    border: articlesAccepted ? 'none' : '2px solid #d1d5db',
                    boxShadow: articlesAccepted ? '0 2px 6px rgba(168,85,247,0.3)' : 'none',
                  }}
                >
                  {articlesAccepted && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"
                        style={{ strokeDasharray: 24, strokeDashoffset: 0, animation: 's1Check 0.3s ease-out' }} />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-sm text-gray-600 cursor-pointer select-none"
                      onClick={() => { setArticlesAccepted(v => !v); setError(''); }}
                    >
                      Accetto gli articoli 5; 8; 9; 15; 18; 21; 25
                    </span>
                    <button
                      type="button"
                      onClick={() => setArticlesExpanded(v => !v)}
                      className="flex items-center gap-0.5 transition-colors text-purple-500 hover:text-purple-700"
                      style={{ fontSize: 11, fontWeight: 500, lineHeight: 1 }}
                    >
                      {articlesExpanded ? 'Riduci' : 'Espandi'}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        style={{ transition: 'transform 0.2s', transform: articlesExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {articlesExpanded && (
                    <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                      Ai sensi e per gli effetti degli Artt. 1341 e 1342 del Codice Civile italiano, dichiaro di aver letto, compreso e di approvare specificamente le seguenti clausole dei Termini di Servizio, che riconosco come potenzialmente onerose: Art. 5 (Durata e gratuità della fase Beta — transizione al servizio a pagamento) — Art. 8 (Sospensione e risoluzione anticipata del contratto) — Art. 9 (Obblighi e livelli di servizio: fornitura "As Is", assenza di SLA garantiti, diritto di modifica delle funzionalità) — Art. 15 (Limitazione di responsabilità per danni diretti, indiretti e consequenziali) — Art. 18 (Diritto di Aegis Beauty di modificare unilateralmente i Termini con preavviso di 30 giorni) — Art. 21 (Cessione del contratto da parte di Aegis Beauty in caso di fusione o acquisizione) — Art. 25 (Foro esclusivamente competente: Tribunale di Torino).
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Continua button — ripple + shimmer */}
          <div className="mt-6">
            <button
              ref={btnRef}
              onClick={handleContinue}
              disabled={loading || !selected || !termsAccepted || !articlesAccepted}
              className="relative w-full h-12 rounded-xl font-semibold text-white text-base
                transition-all duration-300 outline-none overflow-hidden
                focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              style={{
                background: (selected && termsAccepted && articlesAccepted)
                  ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                  : '#d1d5db',
                boxShadow: (selected && termsAccepted && articlesAccepted)
                  ? '0 6px 20px rgba(124,58,237,0.3)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (selected && termsAccepted && articlesAccepted && !loading) {
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selected && termsAccepted && articlesAccepted && !loading) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Shimmer sweep */}
              {selected && termsAccepted && articlesAccepted && !loading && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                    animation: 's1Shimmer 2.5s ease-in-out infinite',
                  }}
                />
              )}

              {/* Ripple */}
              {ripple && (
                <span
                  key={ripple.id}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: ripple.x - 50,
                    top: ripple.y - 50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.35)',
                    animation: 's1Ripple 0.6s ease-out forwards',
                  }}
                />
              )}

              {/* Content */}
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Continua
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-gray-400 mt-5 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai modificare questa scelta dalle impostazioni
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes s1Check {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes s1FadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes s1Shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes s1Ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }
        @keyframes s1Shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}