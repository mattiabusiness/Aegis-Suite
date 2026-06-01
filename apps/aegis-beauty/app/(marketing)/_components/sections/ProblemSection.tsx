'use client';

// ============================================================================
// AEGIS BEAUTY - PROBLEM SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/ProblemSection.tsx
// ============================================================================

import { CalendarX, Users, BarChart3 } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

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
    <section style={{ backgroundColor: '#0A0A0F', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
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
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
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
              Il Problema
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
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
                    background: 'rgba(124,58,237,0.04)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(124,58,237,0.12)',
                    boxShadow: '0 0 0 1px rgba(124,58,237,0.08), 0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
                    cursor: 'default',
                    height: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 1px rgba(124,58,237,0.25), 0 20px 48px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 1px rgba(124,58,237,0.08), 0 8px 32px rgba(0,0,0,0.3)';
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
                      WebkitTextStroke: '1px rgba(168,85,247,0.12)',
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
                      borderRadius: 12,
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(168,85,247,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      boxShadow: '0 0 20px rgba(124,58,237,0.15)',
                    }}
                  >
                    <Icon size={22} color="#a855f7" />
                  </div>
                  <h3
                    style={{
                      position: 'relative',
                      fontSize: 18,
                      fontWeight: 700,
                      margin: '0 0 12px',
                      lineHeight: 1.3,
                      background: 'linear-gradient(120deg, #F8FAFC 30%, #c084fc 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {problem.title}
                  </h3>
                  <p style={{ position: 'relative', fontSize: 15, color: '#64748B', margin: 0, lineHeight: 1.7 }}>
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
