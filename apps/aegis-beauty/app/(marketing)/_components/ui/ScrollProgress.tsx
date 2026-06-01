'use client';

// ============================================================================
// AEGIS BEAUTY - SCROLL PROGRESS BAR
// File: apps/aegis-beauty/app/(marketing)/_components/ui/ScrollProgress.tsx
// Thin top progress bar — page reading progress
// ============================================================================

import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 60,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
          boxShadow: '0 0 10px rgba(168,85,247,0.7)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
