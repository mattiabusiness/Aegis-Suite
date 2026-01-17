// ============================================================================
// AEGIS BEAUTY - ONBOARDING STEP 2: BASIC INFO
// File: apps/aegis-beauty/app/(dashboard)/onboarding/[step]/steps/Step2BasicInfo.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@aegis/ui';
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
// HELPER
// ============================================================================

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

// ============================================================================
// HINT COMPONENT WITH ICON
// ============================================================================

function HintWithIcon({ icon, text }: { icon: 'location' | 'phone' | 'email'; text: string }) {
  const icons = {
    location: (
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    phone: (
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    email: (
      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  };

  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
      {icons[icon]}
      {text}
    </span>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Step2BasicInfo({ businessId, businessType, initialData, currentSlug }: Step2Props) {
  const router = useRouter();
  const supabase = createClient();
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
      newErrors.addressPostalCode = 'Il CAP deve essere di 5 cifre';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Inserisci il numero di telefono';
    } else if (!isValidItalianPhone(phone)) {
      newErrors.phone = 'Inserisci un numero di telefono valido';
    }

    if (!email.trim()) {
      newErrors.email = 'Inserisci l\'indirizzo email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Inserisci un indirizzo email valido';
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

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Genera slug se il nome è cambiato
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

      if (updateError) {
        throw updateError;
      }

      router.push('/onboarding/3');
    } catch (err) {
      console.error('Error saving business data:', err);
      setErrors({ general: 'Errore durante il salvataggio. Riprova.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full" padding="lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl">Informazioni del tuo {label}</CardTitle>
        <CardDescription className="text-base mt-2">
          Inserisci i dati principali della tua attività
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.general}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="space-y-5"
        >
          <Input
            type="text"
            label={`Nome del ${label}`}
            placeholder={businessType === 'hair_salon' ? 'Es. Salone da Mario' : businessType === 'beauty_center' ? 'Es. Centro Estetico Aurora' : 'Es. Beauty & Style'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            maxLength={100}
          />

          <div>
            <Input
              type="text"
              label="Indirizzo"
              placeholder="Es. Via Roma 123"
              value={addressStreet}
              onChange={(e) => setAddressStreet(e.target.value)}
              error={errors.addressStreet}
            />
            <HintWithIcon icon="location" text="Verrà mostrato ai clienti nell'app per raggiungerti" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label="Città"
              placeholder="Es. Milano"
              value={addressCity}
              onChange={(e) => setAddressCity(e.target.value)}
              error={errors.addressCity}
            />
            <Input
              type="text"
              label="CAP"
              placeholder="Es. 20100"
              value={addressPostalCode}
              onChange={(e) => setAddressPostalCode(e.target.value)}
              error={errors.addressPostalCode}
              maxLength={5}
            />
          </div>

          <div>
            <Input
              type="tel"
              label="Telefono"
              placeholder="Es. 02 1234567 o 333 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
            <HintWithIcon icon="phone" text="Numero di riferimento per i clienti - visibile solo se lo desideri" />
          </div>

          <div>
            <Input
              type="email"
              label="Email"
              placeholder={`Es. info@${label === 'salone' ? 'salonedamario' : label === 'centro' ? 'centroaurora' : 'beautystyle'}.it`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <HintWithIcon icon="email" text="Riceverai comunicazioni e aggiornamenti importanti sul tuo account" />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Indietro
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Continua
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Potrai modificare questi dati dalle impostazioni
        </p>
      </CardContent>
    </Card>
  );
}
