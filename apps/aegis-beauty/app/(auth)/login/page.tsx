// ============================================================================
// AEGIS BEAUTY - LOGIN PAGE
// File: apps/aegis-beauty/app/(auth)/login/page.tsx
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@aegis/ui';
import { createClient } from '@aegis/core';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');
    
    const supabase = createClient();
    
    // Login diretto con il client
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      setError(authError?.message || 'Errore durante il login');
      return;
    }

    // Ora il client ha la sessione, possiamo fare query
    const { data: businessMember, error: bmError } = await supabase
  .from('business_members')
  .select('business_id, role')
  .eq('user_id', authData.user.id)
  .eq('is_active', true)
  .single();

    if (businessMember && ['owner', 'admin', 'staff'].includes((businessMember as any).role)) {
      // È un membro del business - controlla onboarding
      const { data: business } = await supabase
        .from('businesses')
        .select('onboarding_completed')
        .eq('id', (businessMember as any).business_id)
        .single();

      if (!(business as any)?.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/onboarding'); // Una volta perfezionato e finito l'onboarding rinserire dashboard
      }
    } else {
      // È un cliente
      router.push('/bookings');
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onForgotPassword={handleForgotPassword}
      onRegister={handleRegister}
      title="Bentornato"
      description="Accedi per gestire i tuoi appuntamenti"
      error={error}
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