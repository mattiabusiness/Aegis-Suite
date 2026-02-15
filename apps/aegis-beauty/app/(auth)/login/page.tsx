// ============================================================================
// AEGIS BEAUTY - LOGIN PAGE (UNIFIED AUTH)
// File: apps/aegis-beauty/app/(auth)/login/page.tsx
// Single page with crossfade: Login ↔ Register
// ============================================================================

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFlipCard } from '@aegis/ui';
import { createClient, signIn, signUp } from '@aegis/core';

// ============================================================================
// AEGIS BEAUTY LOGO (white for violet panel)
// ============================================================================

function AegisLogo() {
  return (
    <div style={{
      width: 60,
      height: 60,
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 0 30px rgba(168,85,247,0.25)',
    }}>
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

// ============================================================================
// CONTENT
// ============================================================================

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [processingInvite, setProcessingInvite] = useState(false);
  const [initialMode, setInitialMode] = useState<'login' | 'register'>('login');

  const [inviteData, setInviteData] = useState({
    isInvite: false, name: '', email: '', phone: '',
    businessName: '', businessSlug: '',
  });

  // Check URL params
  useEffect(() => {
    if (searchParams.get('mode') === 'register') setInitialMode('register');

    if (searchParams.get('invite') === 'true') {
      setInviteData({
        isInvite: true,
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        businessName: searchParams.get('business') || '',
        businessSlug: searchParams.get('business_slug') || '',
      });
      setInitialMode('register');
    }

    if (searchParams.get('error') === 'auth_failed') setLoginError('Autenticazione fallita. Riprova.');
    if (searchParams.get('success') === 'email_confirmed') setLoginSuccess('Email confermata! Ora puoi accedere.');
  }, [searchParams]);

  // Process invite token from hash
  useEffect(() => {
    const process = async () => {
      if (typeof window === 'undefined' || !window.location.hash) return;
      const hash = window.location.hash.substring(1);
      const p = new URLSearchParams(hash);
      if (p.get('type') !== 'invite' || !p.get('access_token')) return;

      setProcessingInvite(true);
      try {
        const { data: sd, error: se } = await supabase.auth.setSession({
          access_token: p.get('access_token')!,
          refresh_token: p.get('refresh_token') || '',
        });
        if (se || !sd.user) { setLoginError('Link invito non valido o scaduto'); setProcessingInvite(false); return; }
        const m = sd.user.user_metadata || {};
        setInviteData({
          isInvite: true, name: m.full_name || '', email: sd.user.email || '',
          phone: m.phone || '', businessName: m.business_name || '', businessSlug: m.business_slug || '',
        });
        setInitialMode('register');
        window.history.replaceState(null, '', window.location.pathname);
      } catch { setLoginError("Errore durante l'elaborazione dell'invito"); }
      finally { setProcessingInvite(false); }
    };
    process();
  }, [supabase.auth]);

  const handleLogin = async (data: { email: string; password: string }) => {
    setLoginError(''); setLoginSuccess('');
    const result = await signIn(supabase, data);
    if (!result.success) { setLoginError(result.error || 'Errore durante il login'); throw new Error(result.error); }
    router.push(searchParams.get('redirect') || '/dashboard');
  };

  const handleRegister = async (data: { fullName: string; email: string; phone: string; password: string }) => {
    setRegisterError(''); setRegisterSuccess('');

    if (inviteData.isInvite) {
      try {
        const { error: ue } = await supabase.auth.updateUser({
          password: data.password, data: { full_name: data.fullName, phone: data.phone },
        });
        if (ue) { setRegisterError(ue.message); throw new Error(ue.message); }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id, email: data.email, full_name: data.fullName, phone: data.phone,
          } as never);
        }
        setRegisterSuccess('Registrazione completata! Reindirizzamento...');
        setTimeout(() => { router.push(inviteData.businessSlug ? `/${inviteData.businessSlug}/book` : '/bookings'); }, 1500);
        return;
      } catch (err) { if (!registerError) setRegisterError('Errore durante la registrazione.'); throw err; }
    }

    const result = await signUp(supabase, { email: data.email, password: data.password, fullName: data.fullName, phone: data.phone });
    if (!result.success) { setRegisterError(result.error || 'Errore'); throw new Error(result.error); }
    setRegisterSuccess("Registrazione completata! Controlla la tua email per confermare l'account.");
  };

  if (processingInvite) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div className="al-spin" />
        <p style={{ color: '#8b85a8', fontSize: 14 }}>Elaborazione invito...</p>
        <style>{`.al-spin{width:40px;height:40px;border:3px solid rgba(168,85,247,0.15);border-top-color:#a855f7;border-radius:50%;animation:lsp .7s linear infinite}@keyframes lsp{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <AuthFlipCard
      initialMode={initialMode}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onForgotPassword={() => router.push('/forgot-password')}
      loginError={loginError}
      loginSuccess={loginSuccess}
      registerError={registerError}
      registerSuccess={registerSuccess}
      showPhone={true}
      initialName={inviteData.name}
      initialEmail={inviteData.email}
      initialPhone={inviteData.phone}
      inviteMode={inviteData.isInvite}
      accentColor="#a855f7"
      brandName="Aegis"
      brandSubtitle="Beauty"
      logo={<AegisLogo />}
      loginWelcomeTitle="Bentornato!"
      loginWelcomeSubtitle="Accedi per gestire i tuoi appuntamenti"
      registerWelcomeTitle="Benvenuto!"
      registerWelcomeSubtitle={
        inviteData.isInvite && inviteData.businessName
          ? `Sei stato invitato da ${inviteData.businessName}`
          : 'Crea il tuo account per iniziare a gestire le tue prenotazioni'
      }
    />
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div className="al-spin" />
        <style>{`.al-spin{width:40px;height:40px;border:3px solid rgba(168,85,247,0.15);border-top-color:#a855f7;border-radius:50%;animation:lsp .7s linear infinite}@keyframes lsp{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}