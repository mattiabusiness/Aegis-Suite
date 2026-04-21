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
    <div style={{
      width: 52,
      height: 52,
      borderRadius: '0.875rem',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
      border: '1px solid rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 20px rgba(168,85,247,0.25)',
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
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

  const handleSubmit = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    // After success the card shows the success state,
    // then the user clicks "Vai al login" → onBackToLogin
  };

  return (
    <ResetPasswordCard
      onSetSession={handleSetSession}
      onSubmit={handleSubmit}
      onBackToLogin={() => router.push('/login')}
      accentColor="#a855f7"
      logo={<AegisLogo />}
      brandName="Aegis"
      brandSubtitle="Beauty"
    />
  );
}
