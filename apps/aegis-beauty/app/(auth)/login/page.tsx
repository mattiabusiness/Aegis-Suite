// ============================================================================
// AEGIS BEAUTY - LOGIN PAGE
// File: apps/aegis-beauty/app/(auth)/login/page.tsx
// Handles: Normal login + Redirect invites to register
// ============================================================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@aegis/ui';
import { createClient, signIn } from '@aegis/core';

// ============================================================================
// LOGIN CONTENT
// ============================================================================

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingInvite, setProcessingInvite] = useState(false);
  const supabase = createClient();

  // ================================================================
  // EFFECT: Check for invite token in hash fragment
  // Set session and redirect to register with query params
  // ================================================================
  useEffect(() => {
    const processInviteToken = async () => {
      if (typeof window === 'undefined' || !window.location.hash) return;
      
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      // If this is an invite, process it
      if (type === 'invite' && accessToken) {
        setProcessingInvite(true);
        
        try {
          // Set the session using access token and refresh token
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError || !sessionData.user) {
            console.error('Error setting session:', sessionError);
            setError('Link invito non valido o scaduto');
            setProcessingInvite(false);
            return;
          }

          const user = sessionData.user;
          const metadata = user.user_metadata || {};
          
          // Build query params for register page
          const registerParams = new URLSearchParams();
          registerParams.set('invite', 'true');
          registerParams.set('user_id', user.id);
          if (user.email) registerParams.set('email', user.email);
          if (metadata.full_name) registerParams.set('name', metadata.full_name);
          if (metadata.phone) registerParams.set('phone', metadata.phone);
          if (metadata.business_name) registerParams.set('business', metadata.business_name);
          if (metadata.business_slug) registerParams.set('business_slug', metadata.business_slug);
          if (metadata.customer_id) registerParams.set('customer_id', metadata.customer_id);
          
          // Clear the hash and redirect to register with query params
          window.history.replaceState(null, '', window.location.pathname);
          router.replace(`/register?${registerParams.toString()}`);
          
        } catch (err) {
          console.error('Error processing invite:', err);
          setError('Errore durante l\'elaborazione dell\'invito');
          setProcessingInvite(false);
        }
      }
    };

    processInviteToken();
  }, [router, supabase.auth]);

  // Check for error in URL (from failed auth)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'auth_failed') {
      setError('Autenticazione fallita. Riprova.');
    }
  }, [searchParams]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('');
    setSuccess('');

    const result = await signIn(supabase, data);

    if (!result.success) {
      setError(result.error || 'Errore durante il login');
      return;
    }

    // Redirect to dashboard after successful login
    router.push('/dashboard');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  // Show loading while processing invite
  if (processingInvite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="text-gray-600">Elaborazione invito...</p>
      </div>
    );
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      onRegister={handleRegister}
      onForgotPassword={handleForgotPassword}
      error={error}
      success={success}
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

// ============================================================================
// PAGE (con Suspense per useSearchParams - richiesto da Next.js 15)
// ============================================================================

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}