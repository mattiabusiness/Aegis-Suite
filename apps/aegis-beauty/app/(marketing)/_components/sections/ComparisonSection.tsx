'use client';

// ============================================================================
// AEGIS BEAUTY - COMPARISON SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/ComparisonSection.tsx
// "Aegis vs i Marketplace" — premium dark comparison table
// ============================================================================

import { Check, X } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

type Row = { label: string; aegis: string; market: string };

const rows: Row[] = [
  { label: 'Commissioni per prenotazione', aegis: 'Zero, per sempre', market: 'Fino al 30%' },
  { label: 'Il brand sulla pagina', aegis: 'Solo il tuo', market: 'Diversi brand' },
  { label: 'I clienti restano tuoi', aegis: 'Sempre', market: 'Sono loro' },
  { label: 'Concorrenti accanto a te', aegis: 'Mai', market: 'Sì, sempre' },
  { label: 'CRM e storico clienti', aegis: 'Completo e tuo', market: 'Limitato' },
  { label: 'Onboarding personale', aegis: 'Col fondatore', market: 'Self-service' },
  { label: 'Dati su server europei', aegis: 'Svizzera · SOC 2', market: 'Variabile' },
];

const ROW_H = 60;
const HEAD_H = 88;

function YesCell({ text }: { text: string }) {
  return (
    <div style={{ height: ROW_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '0 8px' }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(168,85,247,0.5)',
          flexShrink: 0,
        }}
      >
        <Check size={13} color="#fff" strokeWidth={3} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', textAlign: 'center', lineHeight: 1.2 }}>{text}</span>
    </div>
  );
}

function NoCell({ text }: { text: string }) {
  return (
    <div style={{ height: ROW_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '0 8px' }}>
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(148,163,184,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={13} color="#64748B" strokeWidth={3} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B', textAlign: 'center', lineHeight: 1.2 }}>{text}</span>
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section style={{ backgroundColor: '#0A0A0F', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
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
                marginBottom: 20,
              }}
            >
              Il Confronto
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '0 0 16px',
                lineHeight: 1.2,
                background: 'linear-gradient(120deg, #F8FAFC 25%, #c084fc 75%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Non è un marketplace. È il tuo.
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              La differenza tra possedere i tuoi clienti e affittarli da qualcun altro.
            </p>
          </div>
        </ScrollReveal>

        {/* Table */}
        <ScrollReveal delay={120}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>

            {/* Label column */}
            <div style={{ flex: '1.3 1 0', minWidth: 0 }}>
              <div style={{ height: HEAD_H }} />
              {rows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    height: ROW_H,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#CBD5E1',
                    borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    paddingRight: 12,
                  }}
                  className="cmp-label"
                >
                  {r.label}
                </div>
              ))}
            </div>

            {/* Aegis column — highlighted */}
            <div
              style={{
                flex: '1 1 0',
                minWidth: 0,
                borderRadius: 20,
                background: 'linear-gradient(180deg, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.05) 100%)',
                border: '1px solid rgba(168,85,247,0.4)',
                boxShadow: '0 0 0 1px rgba(168,85,247,0.1), 0 0 50px rgba(124,58,237,0.18), 0 24px 50px rgba(0,0,0,0.5)',
                transform: 'translateY(-14px)',
                position: 'relative',
              }}
            >
              {/* Recommended badge */}
              <div
                style={{
                  position: 'absolute',
                  top: -11,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '3px 12px',
                  borderRadius: 100,
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.5)',
                }}
              >
                Aegis Beauty
              </div>

              {/* Header */}
              <div style={{ height: HEAD_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC', textAlign: 'center', lineHeight: 1.2 }}>
                  Il tuo brand
                </span>
                <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 600 }}>White-label</span>
              </div>

              {rows.map((r, i) => (
                <div key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(168,85,247,0.12)' : 'none' }}>
                  <YesCell text={r.aegis} />
                </div>
              ))}
            </div>

            {/* Market column */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              {/* Header */}
              <div style={{ height: HEAD_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#94A3B8', textAlign: 'center', lineHeight: 1.2 }}>
                  I Marketplace
                </span>
                <span style={{ fontSize: 11, color: '#475569', fontWeight: 500, textAlign: 'center' }}>Treatwell, Fresha…</span>
              </div>

              {rows.map((r, i) => (
                <div
                  key={i}
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  <NoCell text={r.market} />
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .cmp-label { font-size: 12px !important; padding-right: 8px !important; }
        }
      `}</style>
    </section>
  );
}
