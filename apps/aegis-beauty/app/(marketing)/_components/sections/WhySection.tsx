// ============================================================================
// AEGIS BEAUTY - WHY SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/WhySection.tsx
// Asymmetric layout: text 60% left, geometric SVG pattern 40% right
// ============================================================================

import { ScrollReveal } from '../ui/ScrollReveal';

export function WhySection() {
  return (
    <section style={{ backgroundColor: '#0D0D16', padding: '100px 24px', overflow: 'hidden' }}>
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
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
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#a855f7',
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
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: '0 0 24px',
                lineHeight: 1.2,
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
                  <p key={i} style={{ fontSize: 16, color: '#94A3B8', margin: 0, lineHeight: 1.7 }}>
                    {point}
                  </p>
                )
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Geometric SVG pattern */}
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
        @keyframes geoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes geoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </section>
  );
}

function GeometricPattern() {
  return (
    <div style={{ position: 'relative', width: 320, height: 320 }}>
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        fill="none"
        style={{ position: 'absolute', inset: 0, animation: 'geoFloat 6s ease-in-out infinite' }}
      >
        {/* Outer ring */}
        <circle
          cx="160"
          cy="160"
          r="140"
          stroke="rgba(124,58,237,0.12)"
          strokeWidth="1"
          strokeDasharray="8 6"
        />
        {/* Mid ring (slow rotate) */}
        <circle
          cx="160"
          cy="160"
          r="100"
          stroke="rgba(168,85,247,0.15)"
          strokeWidth="1"
          strokeDasharray="4 8"
          style={{ transformOrigin: '160px 160px', animation: 'geoRotate 30s linear infinite' }}
        />
        {/* Inner ring */}
        <circle
          cx="160"
          cy="160"
          r="60"
          stroke="rgba(192,132,252,0.2)"
          strokeWidth="1"
        />
        {/* Center hex */}
        <polygon
          points="160,120 194,140 194,180 160,200 126,180 126,140"
          fill="rgba(124,58,237,0.08)"
          stroke="rgba(168,85,247,0.3)"
          strokeWidth="1.5"
        />
        {/* Dot accents on ring */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 160 + 140 * Math.cos(rad);
          const y = 160 + 140 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="rgba(168,85,247,0.5)"
              style={{
                animation: `dotP ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
              }}
            />
          );
        })}
        {/* Lines from center to ring dots */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = 160 + 100 * Math.cos(rad);
          const y = 160 + 100 * Math.sin(rad);
          return (
            <line
              key={i}
              x1="160"
              y1="160"
              x2={x}
              y2={y}
              stroke="rgba(124,58,237,0.1)"
              strokeWidth="1"
            />
          );
        })}
        {/* Center dot */}
        <circle cx="160" cy="160" r="8" fill="rgba(124,58,237,0.6)" />
        <circle cx="160" cy="160" r="4" fill="#a855f7" />
      </svg>
    </div>
  );
}
