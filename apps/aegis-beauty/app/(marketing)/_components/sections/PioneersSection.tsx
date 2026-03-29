'use client';

// ============================================================================
// AEGIS BEAUTY - PIONEERS SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/PioneersSection.tsx
// ============================================================================

import { CheckCircle, Zap, Shield, TrendingUp, Gift, Star } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '../ui/ScrollReveal';

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
    <section id="pioneers" style={{ backgroundColor: '#0A0A0F', padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background pattern */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)',
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
                background: 'rgba(124,58,237,0.1)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#a855f7',
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
            style={{
              padding: '48px 40px',
              borderRadius: 24,
              background: 'rgba(124,58,237,0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(124,58,237,0.15)',
              boxShadow:
                '0 0 0 1px rgba(124,58,237,0.1), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: 'borderGlow 3s ease-in-out infinite',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              Diventa un Aegis Pioneer
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, margin: '0 0 28px' }}>
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
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${isFull ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                marginBottom: 36,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isFull ? '#f59e0b' : '#10b981',
                  animation: 'dotP 1.8s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: isFull ? '#f59e0b' : '#10b981' }}>
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
                    <CheckCircle size={18} color="#a855f7" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.5 }}>{b.text}</span>
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
                  ? 'linear-gradient(135deg, #78350f, #92400e)'
                  : 'linear-gradient(135deg, #6b21a8, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: isFull
                  ? '0 0 24px rgba(245,158,11,0.25)'
                  : '0 0 30px rgba(124,58,237,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isFull ? 'Entra in lista d\'attesa' : 'Unisciti ai Pioneers'}
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(124,58,237,0.1), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); }
          50% { box-shadow: 0 0 0 1px rgba(124,58,237,0.3), 0 25px 60px rgba(124,58,237,0.1), inset 0 1px 0 rgba(255,255,255,0.05); }
        }
        @keyframes dotP {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </section>
  );
}
