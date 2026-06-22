'use client';

// ============================================================================
// AEGIS BEAUTY - PIONEERS SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/PioneersSection.tsx
// Tema: light premium (crema + ametista), card focale con border glow viola.
// ============================================================================

import { CheckCircle, Zap, Shield, TrendingUp, Gift, Star } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

const spotsRaw = process.env.NEXT_PUBLIC_BETA_SPOTS_AVAILABLE;
const spotsAvailable = spotsRaw ? parseInt(spotsRaw, 10) : 40;
const totalSpots = 40;
const isFull = spotsAvailable <= 0;

const benefits = [
  { icon: Zap, text: 'Accesso completo a tutte le funzionalità — gratis fino a gennaio 2027.' },
  { icon: Shield, text: 'Onboarding personale con il fondatore — configuriamo tutto insieme.' },
  { icon: TrendingUp, text: 'Priorità assoluta al lancio commerciale — accedi prima di tutti agli abbonamenti ufficiali.' },
  { icon: Gift, text: 'Influenza diretta sul prodotto — le tue richieste diventano funzionalità reali.' },
  { icon: Star, text: 'Badge Aegis Pioneer — il tuo salone nella storia di Aegis Beauty.' },
];

export function PioneersSection() {
  return (
    <section id="pioneers" style={{ background: mk.gradBgAlt, padding: '128px 24px', position: 'relative', overflow: 'hidden', scrollMarginTop: 80 }}>
      {/* Subtle background pattern */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            `radial-gradient(circle at 50% 50%, ${mk.purpleA(0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
        <ScrollReveal>
          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 14px',
                borderRadius: 100,
                background: mk.purpleA(0.08),
                border: `1px solid ${mk.purpleA(0.18)}`,
                color: mk.purpleDeep,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              <Star size={11} />
              Programma Esclusivo
            </span>
          </div>

          {/* Card */}
          <div
            className="pioneers-card"
            style={{
              padding: '48px 40px',
              borderRadius: 24,
              background: mk.card,
              backdropFilter: mk.blur,
              WebkitBackdropFilter: mk.blur,
              border: `1px solid ${mk.purpleA(0.18)}`,
              boxShadow:
                `0 0 0 1px ${mk.purpleA(0.1)}, ${mk.shadowLg}`,
              animation: 'borderGlow 3s ease-in-out infinite',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontFamily: mk.serif,
                fontSize: 'clamp(1.7rem, 3.5vw, 2.3rem)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                ...mk.gradHeadingText,
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              Diventa un Aegis Pioneer
            </h2>
            <p style={{ color: mk.inkSoft, fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
              Selezioniamo {totalSpots} saloni torinesi per testare Aegis Beauty prima del lancio ufficiale.
              Accesso gratuito per 9 mesi. In cambio, il tuo feedback. Niente di più.
            </p>

            {/* Spots counter */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 24px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.6)',
                border: `1px solid ${isFull ? 'rgba(180,83,9,0.3)' : 'rgba(5,150,105,0.3)'}`,
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isFull ? '#d97706' : mk.green,
                  animation: 'dotP 1.8s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: isFull ? '#b45309' : mk.green }}>
                {isFull
                  ? 'Tutti i posti esauriti — Lista d\'attesa aperta'
                  : `${spotsAvailable} / ${totalSpots} posti disponibili`}
              </span>
            </div>

            {/* Benefits */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <CheckCircle size={18} color={mk.purple} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 15, color: mk.inkSoft, lineHeight: 1.5 }}>{b.text}</span>
                  </li>
                );
              })}
            </ul>

            {/* CTA */}
            <Link
              href="/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '16px 32px',
                borderRadius: 14,
                background: isFull
                  ? 'linear-gradient(135deg, #b45309, #d97706)'
                  : mk.gradBrand,
                color: mk.onPurple,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: isFull
                  ? '0 8px 28px rgba(217,119,6,0.3)'
                  : mk.glow,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                if (!isFull) e.currentTarget.style.boxShadow = mk.glowStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                if (!isFull) e.currentTarget.style.boxShadow = mk.glow;
              }}
            >
              {isFull ? 'Entra in lista d\'attesa' : 'Unisciti ai Pioneers'}
            </Link>

            {/* Reassurance microcopy */}
            <p style={{ fontSize: 13, color: mk.inkFaint, margin: '18px 0 0', lineHeight: 1.5 }}>
              Nessuna carta di credito · Setup in 30 minuti · Cancelli quando vuoi
            </p>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .pioneers-card { padding: 32px 20px !important; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px ${mk.purpleA(0.1)}, ${mk.shadowLg}; }
          50% { box-shadow: 0 0 0 1px ${mk.purpleA(0.3)}, 0 25px 60px ${mk.purpleA(0.14)}; }
        }
        @keyframes dotP {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}
