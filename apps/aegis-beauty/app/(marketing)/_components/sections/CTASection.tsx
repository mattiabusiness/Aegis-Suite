'use client';

// ============================================================================
// AEGIS BEAUTY - CTA SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/CTASection.tsx
// ============================================================================

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

export function CTASection() {
  return (
    <section
      style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #080010 0%, #1a0040 50%, #0A0A0F 100%)',
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
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <ScrollReveal>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#F8FAFC',
              margin: '0 0 20px',
              lineHeight: 1.15,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 40%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Il posto è tuo.
            </span>
            <br />
            <span style={{ color: '#a855f7' }}>Finché c&apos;è.</span>
          </h2>
          <p style={{ fontSize: 17, color: '#94A3B8', margin: '0 0 44px', lineHeight: 1.7 }}>
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
              background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: '0 0 50px rgba(124,58,237,0.5), 0 8px 30px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 70px rgba(124,58,237,0.7), 0 12px 40px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 50px rgba(124,58,237,0.5), 0 8px 30px rgba(0,0,0,0.4)';
            }}
          >
            Prenota la tua demo gratuita
            <ArrowRight size={20} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
