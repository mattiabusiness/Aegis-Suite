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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-verticale.png"
      alt="Aegis Beauty"
      style={{ width: 172, height: 'auto', display: 'block' }}
    />
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
      brandName=""
      brandSubtitle=""
    />
  );
}
