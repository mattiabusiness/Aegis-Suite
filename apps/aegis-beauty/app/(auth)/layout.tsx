// ============================================================================
// AEGIS BEAUTY - AUTH LAYOUT
// File: apps/aegis-beauty/app/(auth)/layout.tsx
// Light theme: 3 glow orbs, 30 particles, geometric grid, violet accents
// ============================================================================

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aegis Beauty - Accedi',
  description: 'Accedi o registrati per gestire il tuo salone',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="authlayout">
      {/* 3 Glow orbs */}
      <div className="al-orb al-orb1" />
      <div className="al-orb al-orb2" />
      <div className="al-orb al-orb3" />

      {/* Geometric grid with radial mask */}
      <div className="al-grid" />

      {/* 30 Floating particles */}
      <div className="al-particles" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} className={`al-dot al-v${i % 5}`} />
        ))}
      </div>

      {/* Content */}
      <main className="al-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="al-footer">
        <p>© 2025 Aegis Group · Tutti i diritti riservati</p>
      </footer>

      <style>{`
        .authlayout {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f9f8fd;
        }
        .al-main {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
        }

        /* ═══════════════════════════════
           3 GLOW ORBS
        ═══════════════════════════════ */
        .al-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          will-change: transform;
        }
        .al-orb1 {
          width: 500px;
          height: 500px;
          top: -15%;
          right: -10%;
          background: radial-gradient(circle, rgba(168,85,247,0.15), transparent 65%);
          animation: orbA 12s ease-in-out infinite;
        }
        .al-orb2 {
          width: 420px;
          height: 420px;
          bottom: -12%;
          left: -8%;
          background: radial-gradient(circle, rgba(126,34,206,0.12), transparent 65%);
          animation: orbB 16s ease-in-out infinite;
        }
        .al-orb3 {
          width: 320px;
          height: 320px;
          top: 45%;
          left: 45%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(147,51,234,0.1), transparent 65%);
          animation: orbC 10s ease-in-out infinite;
        }
        @keyframes orbA {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(-35px,25px) scale(1.1); }
          66% { transform: translate(20px,-15px) scale(0.95); }
        }
        @keyframes orbB {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.06); }
          66% { transform: translate(-20px,18px) scale(0.92); }
        }
        @keyframes orbC {
          0%,100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; }
          50% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }

        /* ═══════════════════════════════
           GEOMETRIC GRID + RADIAL MASK
        ═══════════════════════════════ */
        .al-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(168,85,247,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.045) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          -webkit-mask-image: radial-gradient(ellipse 55% 55% at 50% 50%, black 15%, transparent 70%);
          mask-image: radial-gradient(ellipse 55% 55% at 50% 50%, black 15%, transparent 70%);
        }

        /* ═══════════════════════════════
           30 FLOATING PARTICLES
        ═══════════════════════════════ */
        .al-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .al-dot {
          position: absolute;
          border-radius: 50%;
          will-change: transform, opacity;
        }

        /* 5 variants — varied sizes and opacities */
        .al-v0 {
          width: 5px; height: 5px;
          background: rgba(168,85,247,0.35);
          box-shadow: 0 0 8px rgba(168,85,247,0.2);
          animation: drift0 18s linear infinite;
        }
        .al-v1 {
          width: 4px; height: 4px;
          background: rgba(147,51,234,0.3);
          box-shadow: 0 0 6px rgba(147,51,234,0.15);
          animation: drift1 22s linear infinite;
        }
        .al-v2 {
          width: 6px; height: 6px;
          background: rgba(192,132,252,0.25);
          box-shadow: 0 0 12px rgba(168,85,247,0.15);
          animation: drift2 16s linear infinite;
        }
        .al-v3 {
          width: 3px; height: 3px;
          background: rgba(126,34,206,0.3);
          box-shadow: 0 0 6px rgba(126,34,206,0.12);
          animation: drift3 24s linear infinite;
        }
        .al-v4 {
          width: 5px; height: 5px;
          background: rgba(168,85,247,0.28);
          box-shadow: 0 0 10px rgba(168,85,247,0.18);
          animation: drift4 20s linear infinite;
        }

        /* Positions for 30 dots */
        .al-dot:nth-child(1)  { top: 6%;  left: 12%; animation-delay: 0s; }
        .al-dot:nth-child(2)  { top: 14%; left: 76%; animation-delay: -2s; }
        .al-dot:nth-child(3)  { top: 22%; left: 32%; animation-delay: -5s; }
        .al-dot:nth-child(4)  { top: 38%; left: 88%; animation-delay: -1s; }
        .al-dot:nth-child(5)  { top: 52%; left: 6%;  animation-delay: -7s; }
        .al-dot:nth-child(6)  { top: 62%; left: 58%; animation-delay: -3s; }
        .al-dot:nth-child(7)  { top: 76%; left: 20%; animation-delay: -9s; }
        .al-dot:nth-child(8)  { top: 84%; left: 80%; animation-delay: -4s; }
        .al-dot:nth-child(9)  { top: 90%; left: 42%; animation-delay: -6s; }
        .al-dot:nth-child(10) { top: 4%;  left: 52%; animation-delay: -10s; }
        .al-dot:nth-child(11) { top: 18%; left: 4%;  animation-delay: -12s; }
        .al-dot:nth-child(12) { top: 28%; left: 66%; animation-delay: -2s; }
        .al-dot:nth-child(13) { top: 46%; left: 40%; animation-delay: -14s; }
        .al-dot:nth-child(14) { top: 58%; left: 86%; animation-delay: -3s; }
        .al-dot:nth-child(15) { top: 70%; left: 14%; animation-delay: -8s; }
        .al-dot:nth-child(16) { top: 80%; left: 48%; animation-delay: -11s; }
        .al-dot:nth-child(17) { top: 10%; left: 90%; animation-delay: -6s; }
        .al-dot:nth-child(18) { top: 34%; left: 8%;  animation-delay: -15s; }
        .al-dot:nth-child(19) { top: 56%; left: 70%; animation-delay: -4s; }
        .al-dot:nth-child(20) { top: 88%; left: 26%; animation-delay: -13s; }
        .al-dot:nth-child(21) { top: 3%;  left: 38%; animation-delay: -5s; }
        .al-dot:nth-child(22) { top: 20%; left: 50%; animation-delay: -8s; }
        .al-dot:nth-child(23) { top: 40%; left: 16%; animation-delay: -16s; }
        .al-dot:nth-child(24) { top: 66%; left: 94%; animation-delay: -1s; }
        .al-dot:nth-child(25) { top: 74%; left: 36%; animation-delay: -10s; }
        .al-dot:nth-child(26) { top: 86%; left: 62%; animation-delay: -7s; }
        .al-dot:nth-child(27) { top: 48%; left: 24%; animation-delay: -9s; }
        .al-dot:nth-child(28) { top: 12%; left: 44%; animation-delay: -14s; }
        .al-dot:nth-child(29) { top: 94%; left: 10%; animation-delay: -3s; }
        .al-dot:nth-child(30) { top: 32%; left: 82%; animation-delay: -11s; }

        @keyframes drift0 {
          0% { transform: translate(0,0); opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { transform: translate(35px,-75px); opacity: 0; }
        }
        @keyframes drift1 {
          0% { transform: translate(0,0); opacity: 0; }
          8% { opacity: 0.85; }
          92% { opacity: 0.85; }
          100% { transform: translate(-50px,-55px); opacity: 0; }
        }
        @keyframes drift2 {
          0% { transform: translate(0,0) scale(1); opacity: 0; }
          8% { opacity: 0.7; }
          50% { transform: translate(22px,-38px) scale(1.25); }
          92% { opacity: 0.7; }
          100% { transform: translate(45px,-85px) scale(1); opacity: 0; }
        }
        @keyframes drift3 {
          0% { transform: translate(0,0); opacity: 0; }
          8% { opacity: 0.9; }
          92% { opacity: 0.9; }
          100% { transform: translate(-28px,-65px); opacity: 0; }
        }
        @keyframes drift4 {
          0% { transform: translate(0,0); opacity: 0; }
          8% { opacity: 0.8; }
          92% { opacity: 0.8; }
          100% { transform: translate(40px,-70px); opacity: 0; }
        }

        /* ═══ FOOTER ═══ */
        .al-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 1rem;
        }
        .al-footer p {
          color: #b5b0c8;
          font-size: 0.72rem;
          letter-spacing: 0.02em;
          margin: 0;
        }

        @media (max-width: 1023px) {
          /* Lock to viewport height — no page scroll */
          .authlayout { height: 100dvh; overflow: hidden; }
          .al-main { padding: 0.5rem 0.75rem; }
          .al-footer { padding: 0.25rem 1rem; }
          .al-orb1 { width: 300px; height: 300px; }
          .al-orb2 { width: 260px; height: 260px; }
          .al-orb3 { width: 200px; height: 200px; }
        }
      `}</style>
    </div>
  );
}