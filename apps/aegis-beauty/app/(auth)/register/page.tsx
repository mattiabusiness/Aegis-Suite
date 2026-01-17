// ============================================================================
// AEGIS BEAUTY - REGISTER PAGE (CUSTOMERS)
// File: apps/aegis-beauty/app/(auth)/register/page.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@aegis/ui';
import { createClient, signUp } from '@aegis/core';
import type { RegisterFormData } from '@aegis/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const supabase = createClient();

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

  return (
    <RegisterForm
      onSubmit={handleRegister}
      onLogin={handleLogin}
      title="Crea il tuo account"
      description="Registrati per prenotare i tuoi appuntamenti di bellezza con Aegis Beauty"
      error={error}
      success={success}
      showPhone={true}
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

