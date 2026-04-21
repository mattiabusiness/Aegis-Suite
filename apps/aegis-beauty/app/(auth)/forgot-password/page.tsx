// ============================================================================
// AEGIS BEAUTY - FORGOT PASSWORD PAGE
// File: apps/aegis-beauty/app/(auth)/forgot-password/page.tsx
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@aegis/core';
import { ForgotPasswordCard } from '@aegis/ui';

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (email: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });
    if (error) throw new Error(error.message);
    // Success — the card handles the UI state transition
  };

  return (
    <ForgotPasswordCard
      onSubmit={handleSubmit}
      onBackToLogin={() => router.push('/login')}
      accentColor="#a855f7"
      logo={<AegisLogo />}
      brandName="Aegis"
      brandSubtitle="Beauty"
    />
  );
}
