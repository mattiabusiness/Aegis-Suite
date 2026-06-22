'use client';

// ============================================================================
// AEGIS BEAUTY - CTA SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/CTASection.tsx
// Climax: banda ametista profonda (unica zona "colorata" del sito light).
// ============================================================================

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

export function CTASection() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '128px 24px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #5A2A7A 0%, #7e22ce 55%, #9333ea 100%)',
      }}
    >
      {/* Glow orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          <h2
            style={{
              fontFamily: mk.serif,
              fontSize: 'clamp(2.1rem, 5vw, 3.4rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#fff',
              margin: '0 0 20px',
              lineHeight: 1.15,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 40%, #E9D5FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Il posto è tuo.
            </span>
            <br />
            <span style={{ color: '#E9D5FF' }}>Finché c&apos;è.</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', margin: '0 0 44px', lineHeight: 1.7 }}>
            40 saloni. 9 mesi gratuiti. Un&apos;opportunità che non si ripete.
          </p>

          <Link
            href="/demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '18px 40px',
              borderRadius: 14,
              background: '#FFFFFF',
              color: mk.purpleDeep,
              fontWeight: 700,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: '0 12px 40px rgba(45,20,60,0.35)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 18px 52px rgba(45,20,60,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(45,20,60,0.35)';
            }}
          >
            Prenota la tua demo gratuita
            <ArrowRight size={20} />
          </Link>

          {/* Reassurance microcopy */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px 22px',
              marginTop: 28,
            }}
          >
            {['Nessuna carta di credito', 'Setup in 30 minuti', 'Cancelli quando vuoi'].map((t) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                <Check size={14} color="#E9D5FF" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
