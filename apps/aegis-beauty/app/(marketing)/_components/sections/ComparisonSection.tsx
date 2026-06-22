'use client';

// ============================================================================
// AEGIS BEAUTY - COMPARISON SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/ComparisonSection.tsx
// "Aegis vs i Marketplace" — tema light premium, colonna Aegis evidenziata.
// ============================================================================

import { Check, X } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

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
          background: mk.gradBrand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 0 12px ${mk.purpleA(0.45)}`,
          flexShrink: 0,
        }}
      >
        <Check size={13} color="#fff" strokeWidth={3} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: mk.ink, textAlign: 'center', lineHeight: 1.2 }}>{text}</span>
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
          background: 'rgba(45,45,45,0.05)',
          border: `1px solid ${mk.inkA(0.15)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={13} color={mk.inkFaint} strokeWidth={3} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: mk.inkSoft, textAlign: 'center', lineHeight: 1.2 }}>{text}</span>
    </div>
  );
}

export function ComparisonSection() {
  return (
    <section style={{ background: mk.gradBg, padding: '128px 24px', position: 'relative', overflow: 'hidden' }}>
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
          background: `radial-gradient(ellipse, ${mk.purpleA(0.06)} 0%, transparent 70%)`,
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
                background: mk.purpleA(0.08),
                border: `1px solid ${mk.purpleA(0.18)}`,
                color: mk.purpleDeep,
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
                fontFamily: mk.serif,
                fontSize: 'clamp(1.9rem, 4vw, 2.8rem)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                margin: '0 0 16px',
                lineHeight: 1.2,
                ...mk.gradHeadingText,
              }}
            >
              Non è un marketplace. È il tuo.
            </h2>
            <p style={{ color: mk.inkSoft, fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
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
                    color: mk.ink,
                    borderBottom: i < rows.length - 1 ? `1px solid ${mk.hairline}` : 'none',
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
                background: `linear-gradient(180deg, ${mk.purpleA(0.1)} 0%, rgba(255,255,255,0.65) 100%)`,
                backdropFilter: mk.blur,
                WebkitBackdropFilter: mk.blur,
                border: `1px solid ${mk.purpleA(0.35)}`,
                boxShadow: `0 0 0 1px ${mk.purpleA(0.1)}, 0 0 50px ${mk.purpleA(0.14)}, ${mk.shadowLg}`,
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
                  background: mk.gradBrand,
                  color: mk.onPurple,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  boxShadow: `0 4px 14px ${mk.purpleA(0.4)}`,
                }}
              >
                Aegis Beauty
              </div>

              {/* Header */}
              <div style={{ height: HEAD_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: mk.heading, textAlign: 'center', lineHeight: 1.2 }}>
                  Il tuo brand
                </span>
                <span style={{ fontSize: 11, color: mk.purpleDeep, fontWeight: 600 }}>White-label</span>
              </div>

              {rows.map((r, i) => (
                <div key={i} style={{ borderBottom: i < rows.length - 1 ? `1px solid ${mk.purpleA(0.12)}` : 'none' }}>
                  <YesCell text={r.aegis} />
                </div>
              ))}
            </div>

            {/* Market column */}
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              {/* Header */}
              <div style={{ height: HEAD_H, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: mk.inkSoft, textAlign: 'center', lineHeight: 1.2 }}>
                  I Marketplace
                </span>
                <span style={{ fontSize: 11, color: mk.inkFaint, fontWeight: 500, textAlign: 'center' }}>Treatwell, Fresha…</span>
              </div>

              {rows.map((r, i) => (
                <div
                  key={i}
                  style={{ borderBottom: i < rows.length - 1 ? `1px solid ${mk.hairline}` : 'none' }}
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
