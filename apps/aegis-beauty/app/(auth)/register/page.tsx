// ============================================================================
// AEGIS BEAUTY - REGISTER PAGE (REDIRECT)
// File: apps/aegis-beauty/app/(auth)/register/page.tsx
// ============================================================================

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', 'register');
    router.replace(`/login?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterRedirect />
    </Suspense>
  );
}