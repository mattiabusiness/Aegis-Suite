// ============================================================================
// AEGIS BEAUTY - REGISTER PAGE (CUSTOMERS)
// File: apps/aegis-beauty/app/(auth)/register/page.tsx
// Supports pre-filled data from invites via query params
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RegisterForm } from '@aegis/ui';
import { createClient, signUp } from '@aegis/core';
import type { RegisterFormData } from '@aegis/ui';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

  // Read query params for pre-filling (from invite)
  const initialName = searchParams.get('name') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialPhone = searchParams.get('phone') || '';
  const businessName = searchParams.get('business') || '';
  const isInvite = searchParams.get('invite') === 'true';

  const handleRegister = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    
    const result = await signUp(supabase, {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
    });
    
    if (!result.success) {
      setError(result.error || 'Errore durante la registrazione');
      return;
    }

    setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account.');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  // Dynamic description based on invite
  const description = isInvite && businessName
    ? `Sei stato invitato da ${businessName}. Completa la registrazione per prenotare i tuoi appuntamenti.`
    : 'Registrati per prenotare i tuoi appuntamenti di bellezza con Aegis Beauty';

  return (
    <RegisterForm
      onSubmit={handleRegister}
      onLogin={handleLogin}
      title={isInvite ? 'Completa la registrazione' : 'Crea il tuo account'}
      description={description}
      error={error}
      success={success}
      showPhone={true}
      initialName={initialName}
      initialEmail={initialEmail}
      initialPhone={initialPhone}
      emailReadOnly={isInvite && !!initialEmail}
      logo={
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-purple-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      }
    />
  );
}