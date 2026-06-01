// ============================================================================
// AEGIS BEAUTY - FOUNDER SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/FounderSection.tsx
// ============================================================================

import { Linkedin } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

export function FounderSection() {
  return (
    <section id="founder" style={{ backgroundColor: '#0A0A0F', padding: '100px 24px', scrollMarginTop: 80, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          {/* Label */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
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
              }}
            >
              Chi sono
            </span>
          </div>

          {/* Card */}
          <div
            style={{
              position: 'relative',
              padding: '44px 36px',
              borderRadius: 24,
              background: 'rgba(124,58,237,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.14)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.08), 0 0 60px rgba(124,58,237,0.1), 0 24px 50px rgba(0,0,0,0.5)',
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Top sheen */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '70%',
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)',
              }}
            />

            {/* Avatar with animated ring */}
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 22px' }}>
              <div
                className="founder-ring"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, #7c3aed, #c084fc, #a855f7, #6b21a8, #7c3aed)',
                  animation: 'founderSpin 5s linear infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 4,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6b21a8, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.25)',
                }}
              >
                M
              </div>
            </div>

            <h3
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: '0 0 6px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(120deg, #F8FAFC 35%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Mattia
            </h3>
            <p style={{ fontSize: 14, color: '#a855f7', fontWeight: 600, margin: '0 0 24px' }}>
              Fondatore, Aegis Group
            </p>

            <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.8, margin: '0 0 24px' }}>
              Sono Mattia, ho 16 anni e vado al liceo scientifico a Torino. Ho costruito Aegis Beauty da solo — ogni riga di codice, ogni decisione di prodotto, ogni documento legale. Non per dimostrare qualcosa, ma perché credevo che il problema dei saloni italiani meritasse una soluzione vera.
            </p>

            {/* Quote block with decorative mark */}
            <div
              style={{
                position: 'relative',
                margin: '0 0 28px',
                padding: '20px 18px 16px',
                borderRadius: 12,
                background: 'rgba(124,58,237,0.05)',
                border: '1px solid rgba(124,58,237,0.1)',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: -18,
                  left: 14,
                  fontSize: 60,
                  lineHeight: 1,
                  fontWeight: 900,
                  color: 'rgba(168,85,247,0.18)',
                  fontFamily: 'Georgia, serif',
                  userSelect: 'none',
                }}
              >
                &ldquo;
              </span>
              <p
                style={{
                  fontSize: 13,
                  color: '#94A3B8',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Aegis Beauty è il primo prodotto di <span style={{ color: '#a855f7', fontWeight: 600 }}>Aegis Group</span> — la holding tecnologica che sto costruendo per trasformare settori tradizionali attraverso software moderno.
                <br />Questo è solo l&apos;inizio...
              </p>
            </div>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/mattia-aegisbeauty/"
              target="_blank"
              rel="noopener noreferrer"
              className="founder-linkedin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 22px',
                borderRadius: 10,
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#94A3B8',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              }}
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes founderSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .founder-linkedin:hover {
          background: rgba(124,58,237,0.15) !important;
          color: #a855f7 !important;
          border-color: rgba(168,85,247,0.4) !important;
        }
      `}</style>
    </section>
  );
}
