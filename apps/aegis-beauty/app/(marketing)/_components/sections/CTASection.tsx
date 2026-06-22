'use client';

// ============================================================================
// AEGIS BEAUTY - CTA SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/CTASection.tsx
// Chiusura: crema che sfuma in lavanda soffuso (coerente col tema light),
// bottone ametista come fuoco. Niente più banda viola piena.
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
        background: 'linear-gradient(170deg, #F4ECDA 0%, #EFE7F0 55%, #E9DEEE 100%)',
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
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${mk.purpleA(0.12)} 0%, transparent 70%)`,
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
              margin: '0 0 20px',
              lineHeight: 1.15,
            }}
          >
            <span style={{ ...mk.gradHeadingText }}>
              Il posto è tuo.
            </span>
            <br />
            <span style={{ color: mk.purpleDeep }}>Finché c&apos;è.</span>
          </h2>
          <p style={{ fontSize: 17, color: mk.inkSoft, margin: '0 0 44px', lineHeight: 1.7 }}>
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
              background: mk.gradBrand,
              color: mk.onPurple,
              fontWeight: 700,
              fontSize: 18,
              textDecoration: 'none',
              boxShadow: mk.glow,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
              e.currentTarget.style.boxShadow = mk.glowStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = mk.glow;
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
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: mk.inkFaint }}>
                <Check size={14} color={mk.purple} strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
