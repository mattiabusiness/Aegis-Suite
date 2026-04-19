// ============================================================================
// AEGIS BEAUTY - REGISTER PAGE (FALLBACK REDIRECT)
// File: apps/aegis-beauty/app/(auth)/register/page.tsx
// Fallback for old QR codes / bookmarks that point to /register.
// Uses window.location directly to avoid useSearchParams() hydration issues
// in Next.js 15 App Router (params can be empty on first render in Suspense).
// ============================================================================

'use client';

import { useEffect } from 'react';

export default function RegisterPage() {
  useEffect(() => {
    // Read params from window.location — always accurate, no hydration timing issues
    const params = new URLSearchParams(window.location.search);
    params.set('mode', 'register');
    window.location.replace(`/login?${params.toString()}`);
  }, []);

  return null;
}
