// ============================================================================
// AEGIS BEAUTY - WHY SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/WhySection.tsx
// Asymmetric layout: text 60% left, living geometric system 40% right
// Tema: light premium (crema + ametista).
// ============================================================================

import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

export function WhySection() {
  return (
    <section style={{ background: mk.gradBg, padding: '128px 24px', overflow: 'hidden', position: 'relative' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          right: '8%',
          transform: 'translateY(-50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${mk.purpleA(0.07)} 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="why-grid"
      >
        {/* Text side */}
        <ScrollReveal direction="left">
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                borderRadius: 100,
                background: mk.purpleA(0.08),
                border: `1px solid ${mk.purpleA(0.18)}`,
                color: mk.purpleDeep,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              Perché Aegis
            </span>
            <h2
              style={{
                fontFamily: mk.serif,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                margin: '0 0 24px',
                lineHeight: 1.2,
                ...mk.gradHeadingText,
              }}
            >
              Non mi piaceva come andavano le cose.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                'Il settore beauty in Italia muove miliardi ogni anno. Eppure la maggior parte dei saloni lavora ancora con un\'agenda di carta, un gruppo WhatsApp e un gestionale degli anni \'90. Non per scelta — perché nessuno aveva mai costruito qualcosa di davvero migliore.',
                'Ho 16 anni. Vado a scuola a Torino. E ho deciso che il software per i professionisti della bellezza doveva essere moderno, elegante e costruito per loro — non adattato da qualcos\'altro. Aegis Beauty è nato da questa convinzione.',
                'Nessun investitore. Nessun team di 50 persone. Solo codice scritto riga per riga, con l\'ossessione di fare una cosa sola — ma farla meglio di chiunque altro.',
              ].map(
                (point, i) => (
                  <p key={i} style={{ fontSize: 16, color: mk.inkSoft, margin: 0, lineHeight: 1.7 }}>
                    {point}
                  </p>
                )
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Living geometric system */}
        <ScrollReveal direction="right">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <GeometricPattern />
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
        @keyframes geoSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes geoSpinRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes geoFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes geoCorePulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.18); }
        }
        @keyframes dotP {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}

function GeometricPattern() {
  const center = { transformOrigin: '170px 170px' };

  return (
    <div style={{ position: 'relative', width: 340, height: 340 }}>
      {/* Soft radial glow behind */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${mk.purpleA(0.18)} 0%, transparent 65%)`,
          filter: 'blur(30px)',
        }}
      />

      <svg
        width="340"
        height="340"
        viewBox="0 0 340 340"
        fill="none"
        style={{ position: 'absolute', inset: 0, animation: 'geoFloat 6s ease-in-out infinite' }}
      >
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#5A2A7A" />
          </linearGradient>
          <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer dashed ring — slow counter-rotation */}
        <g style={{ ...center, animation: 'geoSpinRev 50s linear infinite' }}>
          <circle cx="170" cy="170" r="150" stroke={mk.purpleA(0.22)} strokeWidth="1" strokeDasharray="8 7" />
          {/* Ring accent dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 170 + 150 * Math.cos(rad);
            const y = 170 + 150 * Math.sin(rad);
            return (
              <circle key={i} cx={x} cy={y} r="3.5" fill={mk.brightA(0.55)}
                style={{ animation: `dotP ${1.6 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.22}s` }} />
            );
          })}
        </g>

        {/* Mid ring — rotation */}
        <g style={{ ...center, animation: 'geoSpin 30s linear infinite' }}>
          <circle cx="170" cy="170" r="108" stroke="url(#ringGrad)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 9" />
        </g>

        {/* Orbiting node on mid ring */}
        <g style={{ ...center, animation: 'geoSpin 8s linear infinite' }}>
          <circle cx="170" cy="62" r="5" fill="#9333ea" filter="url(#glow)" />
        </g>
        {/* Orbiting node on outer ring (opposite) */}
        <g style={{ ...center, animation: 'geoSpinRev 12s linear infinite' }}>
          <circle cx="320" cy="170" r="4" fill="#a855f7" filter="url(#glow)" />
        </g>

        {/* Inner ring (static) */}
        <circle cx="170" cy="170" r="66" stroke={mk.purpleA(0.25)} strokeWidth="1" />

        {/* Connection lines from core to inner ring */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 170 + 66 * Math.cos(rad);
          const y = 170 + 66 * Math.sin(rad);
          return <line key={i} x1="170" y1="170" x2={x} y2={y} stroke={mk.purpleA(0.14)} strokeWidth="1" />;
        })}

        {/* Center hexagon */}
        <polygon
          points="170,128 207,149 207,191 170,212 133,191 133,149"
          fill={mk.purpleA(0.08)}
          stroke="url(#ringGrad)"
          strokeOpacity="0.6"
          strokeWidth="1.5"
        />

        {/* Pulsing core */}
        <circle cx="170" cy="170" r="14" fill="url(#coreGrad)" filter="url(#glow)"
          style={{ transformOrigin: '170px 170px', animation: 'geoCorePulse 3s ease-in-out infinite' }} />
        <circle cx="170" cy="170" r="5" fill={mk.bg} />
      </svg>
    </div>
  );
}
