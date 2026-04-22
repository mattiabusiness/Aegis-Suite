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
      <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
        customerId: searchParams.get('customer_id') || '',
      };
    }
    return { isInvite: false, isStaffInvite: false, name: '', email: '', phone: '', businessName: '', businessSlug: '', staffId: '', customerId: '' };
  });

  const [initialMode, setInitialMode] = useState<'login' | 'register'>(() => {
    if (searchParams.get('staff_invite') === 'true') return 'register';
    if (searchParams.get('invite') === 'true') return 'register';
    if (searchParams.get('mode') === 'register') return 'register';
    return 'login';
  });

  // Detect invite session — runs on every mount regardless of URL params.
  // Covers: PKCE flow, implicit flow, and any redirect chain that loses params.
  useEffect(() => {
    const process = async () => {
      if (typeof window === 'undefined') return;

      // ── 1. Implicit flow: access_token in URL hash ──
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const p = new URLSearchParams(hash);
        if (p.get('type') === 'invite' && p.get('access_token')) {
          setProcessingInvite(true);
          try {
            const { data: sd, error: se } = await supabase.auth.setSession({
              access_token: p.get('access_token')!,
              refresh_token: p.get('refresh_token') || '',
            });
            if (se || !sd.user) { setLoginError('Link invito non valido o scaduto'); return; }
            const m = sd.user.user_metadata || {};
            setInviteData({
              isInvite: true, isStaffInvite: false, staffId: '',
              name: m.full_name || '', email: sd.user.email || '',
              phone: m.phone || '', businessName: m.business_name || '', businessSlug: m.business_slug || '',
              customerId: m.customer_id || '',
            });
            setInitialMode('register');
            window.history.replaceState(null, '', window.location.pathname);
          } catch { setLoginError("Errore durante l'elaborazione dell'invito"); }
          finally { setProcessingInvite(false); }
          return;
        }
      }

      // ── 2. PKCE flow: params in URL, already loaded into inviteData via useState init ──
      if (searchParams.get('invite') === 'true' && searchParams.get('email')) return;

      // ── 3. Universal fallback: check active session metadata regardless of URL params.
      //    This fires even if the redirect chain lost all params.
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.invited_by_business) {
          const m = user.user_metadata;
          setInviteData({
            isInvite: true, isStaffInvite: false, staffId: '',
            name: m.full_name || '', email: user.email || '',
            phone: m.phone || '', businessName: m.business_name || '', businessSlug: m.business_slug || '',
            customerId: m.customer_id || '',
          });
          setInitialMode('register');
        }
      } catch { /* silently ignore */ }
    };
    process();
  }, [supabase, searchParams]);

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

      // Customers are in the `customers` table (not business_members).
      // Two-step query: get business_id first (avoids FK join which can fail silently
      // if businesses RLS blocks the embedded select), then fetch the slug separately.
      const { data: customerRecord } = await supabase
        .from('customers')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle() as { data: { business_id: string } | null };

      let targetUrl = '/';
      if (customerRecord?.business_id) {
        const { data: biz } = await supabase
          .from('businesses')
          .select('slug')
          .eq('id', customerRecord.business_id)
          .maybeSingle() as { data: { slug: string } | null };
        if (biz?.slug) targetUrl = `/${biz.slug}/account`;
      }
      window.location.href = targetUrl;
      return;
    }

    window.location.href = redirectParam || '/dashboard';
  };

  const handleRegister = async (data: { fullName: string; email: string; phone: string; password: string; termsAcceptedAt: string }) => {
    setRegisterError(''); setRegisterSuccess('');

    if (inviteData.isInvite) {
      // QR code staff invite — register via server-side admin API (no confirmation email)
      if (inviteData.isStaffInvite) {
        let specificErrorSet = false;
        try {
          const res = await fetch('/api/staff/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: inviteData.email,
              password: data.password,
              fullName: data.fullName,
              phone: data.phone,
              staffId: inviteData.staffId,
              termsAcceptedAt: data.termsAcceptedAt,
            }),
          });
          const json = await res.json();
          if (!res.ok) {
            setRegisterError(json.error || 'Errore durante la registrazione.');
            specificErrorSet = true;
            throw new Error(json.error);
          }

          // Account creato con email già confermata → sign in diretto, nessuna mail
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: inviteData.email,
            password: data.password,
          });
          if (signInError) {
            setRegisterError(signInError.message);
            specificErrorSet = true;
            throw signInError;
          }

          // Setup (staff.user_id + business_members + profile) is now done inline
          // in /api/staff/register via the admin client — no second API call needed.
          setRegisterSuccess('Registrazione completata! Reindirizzamento...');
          setTimeout(() => { window.location.href = '/dashboard'; }, 800);
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
          // Profile must be upserted BEFORE customer link — customers.user_id has
          // a FK to profiles(id), running them in parallel risks a FK violation.
          await supabase.from('profiles').upsert({
            id: user.id, email: data.email, full_name: data.fullName, phone: data.phone,
          } as never);
          // Link customer record → clears the "Invitato" badge in the business CRM
          if (inviteData.customerId) {
            await fetch('/api/customer/link', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customerId: inviteData.customerId }),
            });
          }
        }
        setRegisterSuccess('Registrazione completata! Reindirizzamento...');
        setTimeout(() => { window.location.href = inviteData.businessSlug ? `/${inviteData.businessSlug}` : '/'; }, 1500);
        return;
      } catch (err) { setRegisterError('Errore durante la registrazione.'); throw err; }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const redirectPath = searchParams.get('redirect') || '/';

    // Detect if registering from a business public page (e.g. /slug or /slug/prenota)
    // Known system roots that are NOT business slugs:
    const SYSTEM_ROOTS = ['dashboard', 'login', 'register', 'onboarding', 'api', 'auth',
      'legal', 'demo', 'start', 'forgot-password', 'reset-password'];
    const slugMatch = redirectPath.match(/^\/([a-z0-9][a-z0-9-]*)(?:\/.*)?$/);
    const businessSlug = slugMatch && !SYSTEM_ROOTS.includes(slugMatch[1])
      ? slugMatch[1] : undefined;

    // If registering from a business page, send them to /{slug}/account after confirmation
    const nextPath = businessSlug ? `/${businessSlug}/account` : redirectPath;

    const result = await signUp(supabase, {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      redirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      termsAcceptedAt: data.termsAcceptedAt,
      businessSlug,
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
      termsHref={inviteData.isStaffInvite ? 'https://aegisbeauty.app/legal#terms-staff' : 'https://aegisbeauty.app/legal#terms-customer'}
      privacyHref={inviteData.isStaffInvite ? 'https://aegisbeauty.app/legal#privacy-staff' : 'https://aegisbeauty.app/legal#privacy-customer'}
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