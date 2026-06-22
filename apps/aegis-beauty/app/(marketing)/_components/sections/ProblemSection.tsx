'use client';

// ============================================================================
// AEGIS BEAUTY - PROBLEM SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/ProblemSection.tsx
// Tema: light premium (panna + ametista), card glass chiare, titoli serif.
// ============================================================================

import { CalendarX, Users, BarChart3 } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

const problems = [
  {
    icon: CalendarX,
    title: "L'agenda non scala.",
    description:
      'WhatsApp alle 23, Post-it dimenticati, clienti che chiamano mentre sei con le mani in pasta. Ogni giorno perdi ore preziose a gestire prenotazioni che un sistema intelligente potrebbe gestire al posto tuo.',
  },
  {
    icon: Users,
    title: 'I tuoi clienti sono anonimi.',
    description:
      'Sai il nome, conosci il viso. Ma non sai quando è venuta l\'ultima volta, cosa ha fatto, cosa preferisce. Senza dati, ogni cliente riparte da zero. E la fidelizzazione rimane solo un\'intenzione.',
  },
  {
    icon: BarChart3,
    title: 'Il tuo salone va a sensazione.',
    description:
      'Quale servizio rende di più? Quale fascia oraria è sempre vuota? Chi sono le clienti più fedeli? Se non riesci a rispondere in 10 secondi, stai gestendo il tuo business alla cieca.',
  },
];

export function ProblemSection() {
  return (
    <section style={{ background: mk.gradBg, padding: '128px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${mk.purpleA(0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
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
              Il Problema
            </span>
            <h2
              style={{
                fontFamily: mk.serif,
                fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                ...mk.gradHeadingText,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Il settore beauty merita di meglio.
            </h2>
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <ScrollReveal key={i} delay={i * 150}>
                <div
                  style={{
                    position: 'relative',
                    padding: 32,
                    borderRadius: 20,
                    background: mk.card,
                    backdropFilter: mk.blur,
                    WebkitBackdropFilter: mk.blur,
                    border: `1px solid ${mk.border}`,
                    boxShadow: `${mk.shadowMd}, 0 0 0 1px ${mk.purpleA(0.1)}`,
                    transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s',
                    cursor: 'default',
                    height: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.015)';
                    e.currentTarget.style.boxShadow = `${mk.shadowLg}, 0 0 0 1px ${mk.purpleA(0.32)}, 0 0 44px ${mk.purpleA(0.18)}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `${mk.shadowMd}, 0 0 0 1px ${mk.purpleA(0.1)}`;
                  }}
                >
                  {/* Watermark number */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: 12,
                      fontSize: 88,
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: '-0.04em',
                      color: 'transparent',
                      WebkitTextStroke: `1px ${mk.purpleA(0.14)}`,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div
                    style={{
                      position: 'relative',
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: mk.purpleA(0.1),
                      border: `1px solid ${mk.purpleA(0.2)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      boxShadow: `0 4px 16px ${mk.purpleA(0.12)}`,
                    }}
                  >
                    <Icon size={22} color={mk.purple} />
                  </div>
                  <h3
                    style={{
                      position: 'relative',
                      fontFamily: mk.serif,
                      fontSize: 20,
                      fontWeight: 600,
                      margin: '0 0 12px',
                      lineHeight: 1.3,
                      ...mk.gradHeadingText,
                    }}
                  >
                    {problem.title}
                  </h3>
                  <p style={{ position: 'relative', fontSize: 15, color: mk.inkSoft, margin: 0, lineHeight: 1.7 }}>
                    {problem.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
