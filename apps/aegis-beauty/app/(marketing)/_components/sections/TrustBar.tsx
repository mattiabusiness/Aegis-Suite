'use client';

// ============================================================================
// AEGIS BEAUTY - TRUST BAR
// File: apps/aegis-beauty/app/(marketing)/_components/sections/TrustBar.tsx
// Slim security / credibility band
// ============================================================================

import { ShieldCheck, Lock, BadgeCheck, Scale } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

const badges = [
  { icon: ShieldCheck, label: 'Server in Svizzera', sub: 'Data center a Zurigo' },
  { icon: Lock, label: 'Cifratura end-to-end', sub: 'Standard bancario' },
  { icon: BadgeCheck, label: 'SOC 2 Type II', sub: 'Sicurezza certificata' },
  { icon: Scale, label: 'GDPR Compliant', sub: 'Suite legale completa' },
];

export function TrustBar() {
  return (
    <section style={{ backgroundColor: '#0A0A0F', padding: '56px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#475569',
              margin: '0 0 28px',
            }}
          >
            I tuoi dati. Protetti come in banca.
          </p>

          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: 'rgba(124,58,237,0.04)',
                    border: '1px solid rgba(124,58,237,0.12)',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(168,85,247,0.1))',
                      border: '1px solid rgba(168,85,247,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 18px rgba(124,58,237,0.15)',
                    }}
                  >
                    <Icon size={19} color="#a855f7" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', margin: '0 0 2px', lineHeight: 1.2 }}>
                      {b.label}
                    </p>
                    <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.3 }}>{b.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 440px) {
          .trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
