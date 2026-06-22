'use client';

// ============================================================================
// AEGIS BEAUTY - CURSOR FOLLOWER
// File: apps/aegis-beauty/app/(marketing)/_components/ui/CursorFollower.tsx
// Smooth lag cursor dot — desktop only, RAF lerp
// ============================================================================

import { useEffect, useRef } from 'react';
import { mk } from '../theme';

export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const curr = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const isDesktop = useRef(false);

  useEffect(() => {
    isDesktop.current = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop.current) return;

    const dot = dotRef.current;
    if (!dot) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);

    const loop = () => {
      curr.current.x += (pos.current.x - curr.current.x) * 0.12;
      curr.current.y += (pos.current.y - curr.current.y) * 0.12;
      dot.style.transform = `translate(${curr.current.x - 5}px, ${curr.current.y - 5}px)`;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="aegis-cursor-dot"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: mk.purpleA(0.55),
          boxShadow: `0 0 12px ${mk.purpleA(0.4)}`,
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
          mixBlendMode: 'multiply',
          transform: 'translate(-200px, -200px)',
        }}
      />
      <style>{`
        @media (pointer: coarse) { .aegis-cursor-dot { display: none !important; } }
      `}</style>
    </>
  );
}
