// ============================================================================
// AEGIS BEAUTY - REGISTER PAGE (CUSTOMERS)
// File: apps/aegis-beauty/app/(auth)/register/page.tsx
// Supports pre-filled data from invites via query params or hash fragment
// ============================================================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RegisterForm } from '@aegis/ui';
import { createClient, signUp } from '@aegis/core';
import type { RegisterFormData } from '@aegis/ui';

// ============================================================================
// REGISTER CONTENT (uses useSearchParams)
// ============================================================================

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // State for invite data (from query params or hash fragment)
  const [inviteData, setInviteData] = useState<{
    isInvite: boolean;
    name: string;
    email: string;
    phone: string;
    businessName: string;
    businessSlug: string;
    customerId: string;
    userId: string;
  }>({
    isInvite: false,
    name: '',
    email: '',
    phone: '',
    businessName: '',
    businessSlug: '',
    customerId: '',
    userId: '',
  });

  // ================================================================
  // EFFECT: Check for invite token in hash fragment (implicit flow)
  // or read from query params (PKCE flow)
  // ================================================================
  useEffect(() => {
    const processAuth = async () => {
      // Check if coming from implicit flow (hash fragment)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const type = params.get('type');

        if (accessToken && type === 'invite') {
          // Get refresh token from hash params
          const refreshToken = params.get('refresh_token');
          
          console.log('Setting session with tokens...', { accessToken: accessToken.substring(0, 20) + '...', refreshToken: refreshToken?.substring(0, 20) + '...' });
          
          // Set the session using access token and refresh token
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          console.log('Session set result:', { user: sessionData?.user?.id, error: sessionError });
          
          if (sessionError || !sessionData.user) {
            console.error('Error setting session from token:', sessionError);
            setError('Link invito non valido o scaduto');
            setLoading(false);
            return;
          }

          const user = sessionData.user;
          const metadata = user.user_metadata || {};
          
          setInviteData({
            isInvite: true,
            name: metadata.full_name || '',
            email: user.email || '',
            phone: metadata.phone || '',
            businessName: metadata.business_name || '',
            businessSlug: metadata.business_slug || '',
            customerId: metadata.customer_id || '',
            userId: user.id,
          });

          // Clear the hash from URL for cleaner look
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          setLoading(false);
          return;
        }
      }

      // Check query params (PKCE flow or redirect from callback)
      const isInviteParam = searchParams.get('invite') === 'true';
      
      if (isInviteParam) {
        setInviteData({
          isInvite: true,
          name: searchParams.get('name') || '',
          email: searchParams.get('email') || '',
          phone: searchParams.get('phone') || '',
          businessName: searchParams.get('business') || '',
          businessSlug: searchParams.get('business_slug') || '',
          customerId: searchParams.get('customer_id') || '',
          userId: searchParams.get('user_id') || '',
        });
      }

      setLoading(false);
    };

    processAuth();
  }, [searchParams, supabase.auth]);

  const handleRegister = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    
    // ================================================================
    // Se è un invito, l'utente esiste già - imposta solo password
    // ================================================================
    if (inviteData.isInvite && inviteData.userId) {
      try {
        // Verifica che ci sia una sessione attiva
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No active session found');
          setError('Sessione scaduta. Richiedi un nuovo invito.');
          return;
        }

        // Imposta la password per l'utente invitato
        const { error: updateError } = await supabase.auth.updateUser({
          password: data.password,
        });

        if (updateError) {
          console.error('Update user error:', updateError);
          setError(updateError.message || 'Errore durante l\'impostazione della password');
          return;
        }

        // Crea/aggiorna il profilo (as never per bypassare strict typing RPC)
        const { error: profileError } = await supabase.rpc('create_profile', {
          user_id: inviteData.userId,
          user_email: data.email,
          user_full_name: data.fullName,
          user_phone: data.phone || null,
        } as never);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Collega l'utente al customer record se presente
        if (inviteData.customerId) {
          await supabase
            .from('customers')
            .update({ user_id: inviteData.userId } as never)
            .eq('id', inviteData.customerId);
        }

        setSuccess('Registrazione completata! Reindirizzamento...');
        
        // Redirect alla pagina di prenotazione del business o bookings generica
        setTimeout(() => {
          if (inviteData.businessSlug) {
            router.push(`/${inviteData.businessSlug}/book`);
          } else {
            router.push('/bookings');
          }
        }, 1500);
        
        return;
      } catch (err) {
        console.error('Invite registration error:', err);
        setError('Errore durante la registrazione. Riprova.');
        return;
      }
    }
    
    // Registrazione normale (non invito)
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

  // Show loading while processing auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Dynamic description based on invite
  const description = inviteData.isInvite && inviteData.businessName
    ? `Sei stato invitato da ${inviteData.businessName}. Completa la registrazione per prenotare i tuoi appuntamenti.`
    : 'Registrati per prenotare i tuoi appuntamenti di bellezza con Aegis Beauty';

  return (
    <RegisterForm
      onSubmit={handleRegister}
      onLogin={handleLogin}
      title={inviteData.isInvite ? 'Completa la registrazione' : 'Crea il tuo account'}
      description={description}
      error={error}
      success={success}
      showPhone={true}
      initialName={inviteData.name}
      initialEmail={inviteData.email}
      initialPhone={inviteData.phone}
      inviteMode={inviteData.isInvite}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
