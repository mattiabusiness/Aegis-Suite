'use client';

// ============================================================================
// AEGIS BEAUTY - STATS SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/StatsSection.tsx
// Animated counter on viewport entry — Intersection Observer + RAF
// Tema: light premium (crema + ametista).
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { mk } from '../theme';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 40, suffix: '+', label: 'Saloni Pioneer selezionati' },
  { value: 9, suffix: '', label: 'Mesi di accesso gratuito al programma Beta' },
  { value: 1, suffix: '', label: 'Città. Torino. Dove tutto inizia...' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();

          const duration = 2000;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOut cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section style={{ backgroundColor: mk.bgAlt, padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 360,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${mk.purpleA(0.07)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          position: 'relative',
          zIndex: 1,
        }}
        className="stats-grid"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: 'center',
              padding: '40px 24px',
              borderRadius: 20,
              background: mk.card,
              backdropFilter: mk.blur,
              WebkitBackdropFilter: mk.blur,
              border: `1px solid ${mk.border}`,
              boxShadow: `${mk.shadowMd}, 0 0 0 1px ${mk.purpleA(0.08)}`,
            }}
          >
            <div
              style={{
                fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                ...mk.gradHeadingText,
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <p style={{ fontSize: 14, color: mk.inkSoft, margin: 0, lineHeight: 1.5 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
