'use client';

// ============================================================================
// AEGIS BEAUTY - STICKY MOBILE CTA
// File: apps/aegis-beauty/app/(marketing)/_components/ui/StickyMobileCTA.tsx
// Persistent bottom CTA — mobile only, appears after hero
// ============================================================================

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StickyMobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="sticky-mobile-cta"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 55,
        padding: '12px 16px calc(14px + env(safe-area-inset-bottom))',
        background:
          'linear-gradient(to top, rgba(10,10,15,0.98) 0%, rgba(10,10,15,0.9) 60%, transparent 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transform: show ? 'translateY(0)' : 'translateY(130%)',
        transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <Link
        href="/demo"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '15px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #a855f7)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
          textDecoration: 'none',
          boxShadow: '0 8px 32px rgba(124,58,237,0.45), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        Prenota la tua demo gratuita
        <ArrowRight size={18} />
      </Link>

      <style>{`
        @media (min-width: 769px) {
          .sticky-mobile-cta { display: none !important; }
        }
      `}</style>
    </div>
  );
}
