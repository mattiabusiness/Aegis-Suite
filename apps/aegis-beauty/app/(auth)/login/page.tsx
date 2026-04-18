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
      background: 'linear-gradient(135deg, #3b0764, #6d28d9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 30px rgba(168,85,247,0.35)',
    }}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        {/* Bottom layer */}
        <polygon points="17,22 28,17 17,12 6,17" fill="white" opacity="0.4" />
        {/* Middle layer */}
        <polygon points="17,27 28,22 17,17 6,22" fill="white" opacity="0.7" />
        {/* Top layer */}
        <polygon points="17,17 28,12 17,7  6,12" fill="white" opacity="1" />
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

  const [loginError, setLoginError] = useState(() =>
    searchParams.get('error') === 'auth_failed' ? 'Autenticazione fallita. Riprova.' : ''
  );
  const [loginSuccess, setLoginSuccess] = useState(() =>
    searchParams.get('success') === 'email_confirmed' ? 'Email confermata! Ora puoi accedere.' : ''
  );
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [processingInvite, setProcessingInvite] = useState(false);

  // Initialise synchronously so AuthFlipCard mounts in the correct mode
  const [inviteData, setInviteData] = useState(() => {
    if (searchParams.get('staff_invite') === 'true') {
      return {
        isInvite: true, isStaffInvite: true,
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        businessName: searchParams.get('business_name') || '',
        businessSlug: searchParams.get('business_slug') || '',
        staffId: searchParams.get('staff_id') || '',
      };
    }
    if (searchParams.get('invite') === 'true') {
      return {
        isInvite: true, isStaffInvite: false,
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        businessName: searchParams.get('business') || '',
        businessSlug: searchParams.get('business_slug') || '',
        staffId: '',
      };
    }
    return { isInvite: false, isStaffInvite: false, name: '', email: '', phone: '', businessName: '', businessSlug: '', staffId: '' };
  });

  const [initialMode, setInitialMode] = useState<'login' | 'register'>(() => {
    if (searchParams.get('staff_invite') === 'true') return 'register';
    if (searchParams.get('invite') === 'true') return 'register';
    if (searchParams.get('mode') === 'register') return 'register';
    return 'login';
  });

  // Process invite token from URL hash (Supabase implicit flow for email invites)
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
          isInvite: true, isStaffInvite: false, staffId: '',
          name: m.full_name || '', email: sd.user.email || '',
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

    const redirectParam = searchParams.get('redirect');

    // IMPORTANT: use window.location.href (full page reload) instead of router.push
    // so the server receives the new session cookies in the next request.
    // router.push (soft nav) reuses the previous request context and the server
    // won't see the updated Supabase cookies, causing auth failures and redirect loops.
    const user = result.user;
    if (user) {
      const { data: members } = await supabase
        .from('business_members')
        .select('role, businesses(slug)')
        .eq('user_id', user.id)
        .eq('is_active', true) as { data: Array<{ role: string; businesses: { slug: string } | null }> | null };

      const isStaff = members?.some((m) => ['owner', 'admin', 'staff'].includes(m.role));
      if (isStaff) { window.location.href = '/dashboard'; return; }

      if (redirectParam) { window.location.href = redirectParam; return; }

      // Customers are in the `customers` table (not business_members) — look up their business slug
      const { data: customerRecord } = await supabase
        .from('customers')
        .select('businesses(slug)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle() as { data: { businesses: { slug: string } | null } | null };

      const slug = (customerRecord?.businesses as { slug: string } | null)?.slug;
      window.location.href = slug ? `/${slug}` : '/';
      return;
    }

    window.location.href = redirectParam || '/dashboard';
  };

  const handleRegister = async (data: { fullName: string; email: string; phone: string; password: string; termsAcceptedAt: string }) => {
    setRegisterError(''); setRegisterSuccess('');

    if (inviteData.isInvite) {
      // QR code staff invite — user is NOT yet authenticated, needs signUp
      if (inviteData.isStaffInvite) {
        let specificErrorSet = false;
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: inviteData.email,
            password: data.password,
            options: {
              emailRedirectTo: `${appUrl}/auth/callback`,
              data: { full_name: data.fullName, phone: data.phone, staff_id: inviteData.staffId, invite_type: 'staff', terms_accepted_at: data.termsAcceptedAt },
            },
          });
          console.log('[SignUp] result:', { userId: signUpData?.user?.id, hasSession: !!signUpData?.session, emailConfirmed: signUpData?.user?.email_confirmed_at });
          if (signUpError) { setRegisterError(signUpError.message); specificErrorSet = true; throw signUpError; }

          // Email confirmation DISABILITATA: sessione già disponibile → setup diretto
          if (signUpData?.session) {
            console.log('[SignUp] sessione immediata, chiamo setup API...');
            try {
              const res = await fetch('/api/staff/setup', { method: 'POST' });
              const json = await res.json();
              console.log('[SignUp] setup API response:', res.status, json);
            } catch (setupErr) {
              console.error('[SignUp] setup API error:', setupErr);
            }
            setRegisterSuccess('Registrazione completata! Reindirizzamento...');
            setTimeout(() => { window.location.href = '/dashboard'; }, 800);
            return;
          }

          // Email confirmation ABILITATA: attendi click sulla mail
          setRegisterSuccess('Controlla la tua email per confermare l\'account e accedere.');
          return;
        } catch (err) { if (!specificErrorSet) setRegisterError('Errore durante la registrazione.'); throw err; }
      }

      // Email invite — user already authenticated via magic link
      try {
        const { error: ue } = await supabase.auth.updateUser({
          password: data.password, data: { full_name: data.fullName, phone: data.phone, terms_accepted_at: data.termsAcceptedAt },
        });
        if (ue) { setRegisterError(ue.message); throw new Error(ue.message); }
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id, email: data.email, full_name: data.fullName, phone: data.phone,
          } as never);
        }
        setRegisterSuccess('Registrazione completata! Reindirizzamento...');
        setTimeout(() => { window.location.href = inviteData.businessSlug ? `/${inviteData.businessSlug}` : '/'; }, 1500);
        return;
      } catch (err) { setRegisterError('Errore durante la registrazione.'); throw err; }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const redirectPath = searchParams.get('redirect') || '/';
    const result = await signUp(supabase, {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      termsAcceptedAt: data.termsAcceptedAt,
    });
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
        inviteData.isStaffInvite && inviteData.businessName
          ? `${inviteData.businessName} ti ha invitato a registrarti per gestire le tue prenotazioni!`
          : inviteData.isInvite && inviteData.businessName
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