// ============================================================================
// AEGIS BEAUTY - RESET PASSWORD PAGE
// File: apps/aegis-beauty/app/(auth)/reset-password/page.tsx
// Receives #type=recovery&access_token=... from Supabase email link
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@aegis/core';
import { ResetPasswordCard } from '@aegis/ui';

function AegisLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-verticale.png"
      alt="Aegis Beauty"
      style={{ width: 172, height: 'auto', display: 'block' }}
    />
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSetSession = async ({ code, accessToken, refreshToken }: { code?: string; accessToken?: string; refreshToken?: string }) => {
    if (code) {
      // PKCE flow (default with @supabase/ssr): exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return !error;
    }
    if (accessToken) {
      // Implicit flow fallback
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      return !error;
    }
    return false;
  };

  const handleCheckExistingSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  };

  const handleSubmit = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('different from the old password') || msg.includes('same as the old password')) {
        throw new Error('La nuova password deve essere diversa da quella attuale.');
      }
      throw new Error(error.message);
    }
    // After success the card shows the success state,
    // then the user clicks "Vai al login" → onBackToLogin
  };

  return (
    <ResetPasswordCard
      onSetSession={handleSetSession}
      onCheckExistingSession={handleCheckExistingSession}
      onSubmit={handleSubmit}
      onBackToLogin={async () => { await supabase.auth.signOut(); router.push('/login'); }}
      accentColor="#a855f7"
      logo={<AegisLogo />}
      brandName=""
      brandSubtitle=""
    />
  );
}
