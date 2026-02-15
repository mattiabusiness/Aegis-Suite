// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 2: BASIC INFO
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step2BasicInfo.tsx
// ============================================================================

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStepTransition } from '@aegis/ui';
import { createClient, generateUniqueSlug, isValidItalianPhone, formatPhone } from '@aegis/core';
import type { BusinessUpdate, BusinessType } from '@aegis/types';

// ============================================================================
// TYPES
// ============================================================================

interface Step2Props {
  businessId: string;
  businessType: BusinessType | null;
  initialData: {
    name: string;
    address_street: string;
    address_city: string;
    address_postal_code: string;
    phone: string;
    email: string;
  };
  currentSlug: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getBusinessLabel(type: BusinessType | null): string {
  switch (type) {
    case 'hair_salon': return 'salone';
    case 'beauty_center': return 'centro';
    case 'mixed':
    default: return 'salone';
  }
}

// ============================================================================
// GLASS INPUT COMPONENT
// ============================================================================

interface GlassInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  error?: string;
  maxLength?: number;
  hint?: { icon: 'location' | 'phone' | 'email' | 'link'; text: string };
}

function GlassInput({ label, type = 'text', placeholder, value, onChange, onFocus, error, maxLength, hint }: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const id = React.useId();

  const hintIcons: Record<string, React.ReactNode> = {
    location: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
    phone: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
    email: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
            outline-none transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: error
              ? '1.5px solid #ef4444'
              : focused
                ? '1.5px solid #a855f7'
                : '1.5px solid rgba(0,0,0,0.08)',
            boxShadow: error
              ? '0 0 0 3px rgba(239,68,68,0.1)'
              : focused
                ? '0 0 0 3px rgba(168,85,247,0.12), 0 2px 8px rgba(124,58,237,0.08)'
                : '0 1px 2px rgba(0,0,0,0.04)',
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {hint && !error && (
        <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {hintIcons[hint.icon]}
          </svg>
          {hint.text}
        </span>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step2BasicInfo({ businessId, businessType, initialData, currentSlug }: Step2Props) {
  const router = useRouter();
  const supabase = createClient();
  const { showTransition } = useStepTransition();
  const label = getBusinessLabel(businessType);

  // Form state
  const [name, setName] = useState(initialData.name);
  const [addressStreet, setAddressStreet] = useState(initialData.address_street);
  const [addressCity, setAddressCity] = useState(initialData.address_city);
  const [addressPostalCode, setAddressPostalCode] = useState(initialData.address_postal_code);
  const [phone, setPhone] = useState(initialData.phone);
  const [email, setEmail] = useState(initialData.email);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);

  const triggerRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, []);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = `Inserisci il nome del ${label}`;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Il nome deve avere almeno 2 caratteri';
    }

    if (!addressStreet.trim()) {
      newErrors.addressStreet = 'Inserisci l\'indirizzo';
    }

    if (!addressCity.trim()) {
      newErrors.addressCity = 'Inserisci la città';
    }

    if (!addressPostalCode.trim()) {
      newErrors.addressPostalCode = 'Inserisci il CAP';
    } else if (!/^\d{5}$/.test(addressPostalCode.trim())) {
      newErrors.addressPostalCode = 'CAP di 5 cifre';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Inserisci il telefono';
    } else if (!isValidItalianPhone(phone)) {
      newErrors.phone = 'Numero non valido';
    }

    if (!email.trim()) {
      newErrors.email = 'Inserisci l\'email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email non valida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = () => {
    router.push('/onboarding/1');
  };

  const handleContinue = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!validateForm()) {
      triggerShake();
      return;
    }

    if (e) triggerRipple(e);
    setLoading(true);

    try {
      let newSlug = currentSlug;
      if (name.trim() !== initialData.name || !currentSlug || currentSlug.startsWith('business-')) {
        newSlug = await generateUniqueSlug(supabase, name.trim());
      }

      const formattedPhone = formatPhone(phone);

      const updateData: BusinessUpdate = {
        name: name.trim(),
        slug: newSlug,
        address_street: addressStreet.trim(),
        address_city: addressCity.trim(),
        address_postal_code: addressPostalCode.trim(),
        phone: formattedPhone,
        email: email.trim(),
        onboarding_step: 3,
      };

      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData as never)
        .eq('id', businessId);

      if (updateError) throw updateError;

      showTransition('Informazioni completate ✓', () => {
        router.push('/onboarding/3');
      });
    } catch (err) {
      console.error('Error saving business data:', err);
      setErrors({ general: 'Errore durante il salvataggio. Riprova.' });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // Slug preview
  const slugPreview = name.trim()
    ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    : 'il-tuo-salone';

  return (
    <div
      className="w-full max-w-2xl mx-auto"
      style={{ animation: shaking ? 's2Shake 0.5s ease-in-out' : undefined }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-purple-100/20 overflow-hidden">

        {/* Header — icon inline */}
        <div className="pt-6 pb-2 px-6">
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                boxShadow: '0 6px 20px rgba(124,58,237,0.25)',
              }}
            >
              <svg className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Informazioni del tuo {label}
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Inserisci i dati principali della tua attività
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-7 pt-4">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.general}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleContinue(); }}
            className="space-y-4"
          >
            {/* Row 1: Nome + Indirizzo */}
            <div className="grid grid-cols-2 gap-4" style={{ animation: 's2FadeUp 0.35s ease-out both' }}>
              <div>
                <GlassInput
                  label={`Nome del ${label}`}
                  placeholder={businessType === 'hair_salon' ? 'Es. Salone da Mario' : businessType === 'beauty_center' ? 'Es. Centro Aurora' : 'Es. Beauty & Style'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setErrors(prev => { const { name: _, ...rest } = prev; return rest; })}
                  error={errors.name}
                />
                {name.trim() && !errors.name && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-purple-500">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    aegisbeauty.com/<span className="font-medium">{slugPreview}</span>
                  </div>
                )}
              </div>
              <GlassInput
                label="Indirizzo"
                placeholder="Es. Via Roma 123"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                onFocus={() => setErrors(prev => { const { addressStreet: _, ...rest } = prev; return rest; })}
                error={errors.addressStreet}
                hint={{ icon: 'location', text: 'Visibile ai clienti nell\'app' }}
              />
            </div>

            {/* Row 2: Città + CAP */}
            <div className="grid grid-cols-5 gap-4" style={{ animation: 's2FadeUp 0.35s ease-out 0.06s both' }}>
              <div className="col-span-3">
                <GlassInput
                  label="Città"
                  placeholder="Es. Milano"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  onFocus={() => setErrors(prev => { const { addressCity: _, ...rest } = prev; return rest; })}
                  error={errors.addressCity}
                />
              </div>
              <div className="col-span-2">
                <GlassInput
                  label="CAP"
                  placeholder="Es. 20100"
                  value={addressPostalCode}
                  onChange={(e) => setAddressPostalCode(e.target.value)}
                  onFocus={() => setErrors(prev => { const { addressPostalCode: _, ...rest } = prev; return rest; })}
                  error={errors.addressPostalCode}
                  maxLength={5}
                />
              </div>
            </div>

            {/* Row 3: Telefono + Email (asymmetric 2:3) */}
            <div className="grid grid-cols-5 gap-4" style={{ animation: 's2FadeUp 0.35s ease-out 0.12s both' }}>
              <div className="col-span-2">
                <GlassInput
                  label="Telefono"
                  type="tel"
                  placeholder="Es. 333 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setErrors(prev => { const { phone: _, ...rest } = prev; return rest; })}
                  error={errors.phone}
                  hint={{ icon: 'phone', text: 'Per i clienti - visibile solo se vuoi' }}
                />
              </div>
              <div className="col-span-3">
                <GlassInput
                  label="Email"
                  type="email"
                  placeholder={`Es. info@${slugPreview}.it`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setErrors(prev => { const { email: _, ...rest } = prev; return rest; })}
                  error={errors.email}
                  hint={{ icon: 'email', text: 'Per comunicazioni e aggiornamenti' }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3" style={{ animation: 's2FadeUp 0.35s ease-out 0.18s both' }}>
              {/* Back */}
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 h-12 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600
                  transition-all duration-300 outline-none
                  hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/50
                  focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Indietro
              </button>

              {/* Continue — ripple + shimmer */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={loading}
                className="relative flex-1 h-12 rounded-xl font-semibold text-white text-sm
                  transition-all duration-300 outline-none overflow-hidden
                  focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {!loading && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                      animation: 's2Shimmer 2.5s ease-in-out infinite',
                    }}
                  />
                )}
                {ripple && (
                  <span
                    key={ripple.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: ripple.x - 50, top: ripple.y - 50, width: 100, height: 100,
                      background: 'rgba(255,255,255,0.35)',
                      animation: 's2Ripple 0.6s ease-out forwards',
                    }}
                  />
                )}
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
          </form>

          {/* Hint */}
          <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Potrai modificare questi dati dalle impostazioni
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes s2FadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes s2Shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
        @keyframes s2Ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(6); opacity: 0; }
        }
        @keyframes s2Shimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}