// ============================================================================
// AEGIS SUITE - FLOATING PARTICLES BACKGROUND
// File: packages/ui/src/components/FloatingParticles.tsx
// Reusable animated background with orbs + particles + grid
// ============================================================================

'use client';

import type { CSSProperties } from 'react';

// Pre-computed particle positions (avoids Math.random hydration mismatch)
const PARTICLES = [
  { size: 5.2, left: 5, delay: 0, duration: 18, variant: 0 },
  { size: 6.1, left: 12, delay: 2.5, duration: 21, variant: 1 },
  { size: 5.8, left: 20, delay: 5, duration: 16, variant: 2 },
  { size: 7.0, left: 28, delay: 1.2, duration: 19, variant: 3 },
  { size: 5.5, left: 35, delay: 7, duration: 23, variant: 4 },
  { size: 6.5, left: 42, delay: 3.8, duration: 17, variant: 0 },
  { size: 5.0, left: 50, delay: 9, duration: 20, variant: 1 },
  { size: 7.5, left: 57, delay: 0.5, duration: 15, variant: 2 },
  { size: 6.0, left: 63, delay: 6, duration: 22, variant: 3 },
  { size: 5.6, left: 70, delay: 4.2, duration: 18, variant: 4 },
  { size: 6.8, left: 77, delay: 8, duration: 16, variant: 0 },
  { size: 5.3, left: 84, delay: 1.8, duration: 21, variant: 1 },
  { size: 6.2, left: 91, delay: 10, duration: 19, variant: 2 },
  { size: 6.5, left: 8, delay: 3, duration: 23, variant: 3 },
  { size: 5.7, left: 16, delay: 6.5, duration: 15, variant: 4 },
  { size: 6.6, left: 33, delay: 11, duration: 20, variant: 0 },
  { size: 5.4, left: 47, delay: 2, duration: 17, variant: 1 },
  { size: 7.1, left: 55, delay: 7.5, duration: 22, variant: 2 },
  { size: 6.3, left: 68, delay: 4, duration: 14, variant: 3 },
  { size: 5.9, left: 75, delay: 9.5, duration: 19, variant: 4 },
  { size: 6.7, left: 88, delay: 1, duration: 16, variant: 0 },
  { size: 5.1, left: 95, delay: 5.5, duration: 21, variant: 1 },
  { size: 5.6, left: 107, delay: 0.6, duration: 16, variant: 0 },
  { size: 5.3, left: 114, delay: 11, duration: 24, variant: 1 },
  { size: 5.6, left: 121, delay: 5.3, duration: 17, variant: 2 },
  { size: 7.5, left: 128, delay: 3.4, duration: 18, variant: 3 },
  { size: 5.5, left: 135, delay: 6.2, duration: 21, variant: 4 },
  { size: 6.7, left: 142, delay: 3.7, duration: 19, variant: 0 },
  { size: 5.3, left: 149, delay: 9.5, duration: 16, variant: 1 },
  { size: 7.3, left: 156, delay: 9, duration: 19, variant: 2 },
];

interface FloatingParticlesProps {
  /** Colore particelle. Default = viola-500 (tema dark). */
  particleColor?: string;
  /** Glow particelle. */
  particleGlow?: string;
  /** Colore linee griglia. */
  gridColor?: string;
  /** Opacità orbs sfumati. */
  orbOpacity?: number;
}

export function FloatingParticles({
  particleColor = 'rgba(168,85,247,0.25)',
  particleGlow = 'rgba(168,85,247,0.15)',
  gridColor = 'rgba(168,85,247,0.03)',
  orbOpacity = 0.12,
}: FloatingParticlesProps = {}) {
  return (
    // display:contents → nessun box, ma le CSS var sono ereditate dai figli fixed
    <div
      style={{
        display: 'contents',
        '--fp-particle': particleColor,
        '--fp-glow': particleGlow,
        '--fp-grid': gridColor,
        '--fp-orb-opacity': orbOpacity,
      } as CSSProperties}
    >
      {/* Glow orbs */}
      <div className="ob ob1" />
      <div className="ob ob2" />
      <div className="ob ob3" />

      {/* Grid overlay */}
      <div className="fp-grid" />

      {/* Floating particles */}
      <div className="fp-wrap" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`fp fp-v${p.variant}`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        .ob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(80px);
          opacity: var(--fp-orb-opacity, 0.12);
        }
        .ob1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #a855f7, transparent 70%);
          top: -10%; left: -5%;
          animation: obA 12s ease-in-out infinite alternate;
        }
        .ob2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #7c3aed, transparent 70%);
          bottom: -8%; right: -5%;
          animation: obB 16s ease-in-out infinite alternate;
        }
        .ob3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, #c084fc, transparent 70%);
          top: 40%; right: 20%;
          animation: obC 10s ease-in-out infinite alternate;
        }
        @keyframes obA {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(60px,40px) scale(1.15); }
        }
        @keyframes obB {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-50px,-30px) scale(1.1); }
        }
        @keyframes obC {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px,-50px) scale(0.9); }
        }

        .fp-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(var(--fp-grid, rgba(168,85,247,0.03)) 1px, transparent 1px),
            linear-gradient(90deg, var(--fp-grid, rgba(168,85,247,0.03)) 1px, transparent 1px);
          background-size: 60px 60px;
          -webkit-mask: radial-gradient(ellipse 55% 55% at 50% 50%, black 40%, transparent 100%);
          mask: radial-gradient(ellipse 55% 55% at 50% 50%, black 40%, transparent 100%);
          pointer-events: none;
          z-index: 0;
        }

        .fp-wrap {
          position: fixed; inset: 0;
          pointer-events: none; z-index: 0;
          overflow: hidden;
        }
        .fp {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: var(--fp-particle, rgba(168,85,247,0.25));
          box-shadow: 0 0 6px var(--fp-glow, rgba(168,85,247,0.15));
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .fp-v0 { animation-name: d0; }
        .fp-v1 { animation-name: d1; }
        .fp-v2 { animation-name: d2; }
        .fp-v3 { animation-name: d3; }
        .fp-v4 { animation-name: d4; }

        @keyframes d0 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
        @keyframes d1 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.4; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(-25px); opacity: 0; }
        }
        @keyframes d2 {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          12% { opacity: 0.6; }
          50% { transform: translateY(-50vh) translateX(40px) scale(1.3); }
          88% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(-10px) scale(1); opacity: 0; }
        }
        @keyframes d3 {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          8% { opacity: 0.35; }
          92% { opacity: 0.4; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        @keyframes d4 {
          0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translateY(-50vh) translateX(-35px) scale(1.2); }
          90% { opacity: 0.45; }
          100% { transform: translateY(-100vh) translateX(15px) scale(0.8); opacity: 0; }
        }

        @media (max-width: 768px) {
          .ob1 { width: 250px; height: 250px; }
          .ob2 { width: 200px; height: 200px; }
          .ob3 { width: 150px; height: 150px; }
        }
      `}</style>
    </div>
  );
}