'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING HERO
// File: apps/aegis-beauty/app/(marketing)/_components/Hero.tsx
// Fullscreen hero — FloatingParticles + Framer Motion + typewriter
// Tema: light premium (panna + ametista), titolo serif.
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { FloatingParticles } from '@aegis/ui';
import { mk } from './theme';

const TYPEWRITER_PHRASES = [
  'prenoti in 30 secondi.',
  'dimentichi l\'agenda di carta.',
  'i tuoi clienti tornano sempre.',
  'il tuo brand è protagonista.',
  'gestisci tutto da un posto solo.',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export function Hero() {
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIndex];

    if (!isDeleting && displayText === phrase) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
      return;
    }

    if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPEWRITER_PHRASES.length);
      return;
    }

    const speed = isDeleting ? 50 : 80;
    timeoutRef.current = setTimeout(() => {
      setDisplayText(isDeleting ? phrase.slice(0, displayText.length - 1) : phrase.slice(0, displayText.length + 1));
    }, speed);

    return () => clearTimeout(timeoutRef.current);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: mk.gradBg,
        // containing block: confina le particelle "fixed" all'hero
        // (altrimenti orbs/particelle sfondano sulle sezioni sotto = "banda viola")
        transform: 'translateZ(0)',
      }}
    >
      {/* Background — particelle calibrate per sfondo chiaro */}
      <FloatingParticles
        particleColor={mk.fp.particle}
        particleGlow={mk.fp.glow}
        gridColor={mk.fp.grid}
        orbOpacity={mk.fp.orbOpacity}
      />

      {/* Gradient overlay — alone viola soffuso dall'alto */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${mk.purpleA(0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mk-hero-inner"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 860,
          margin: '0 auto',
          padding: '88px 24px 60px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              borderRadius: 100,
              background: mk.purpleA(0.1),
              border: `1px solid ${mk.purpleA(0.25)}`,
              fontSize: 13,
              fontWeight: 600,
              color: mk.purpleDeep,
              animation: 'badgePulse 2.5s ease-in-out infinite',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: mk.purpleBright,
                animation: 'dotP 1.8s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <Sparkles size={13} style={{ opacity: 0.8 }} />
            Aegis Pioneers — Programma Beta 2026
          </span>
        </motion.div>

        {/* Headline — serif editoriale */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontFamily: mk.serif,
            fontSize: 'clamp(2.15rem, 6.5vw, 5.2rem)',
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          <span
            style={{
              background: mk.gradHeadingSoft,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Il tuo salone,{' '}
          </span>
          <br />
          <span
            style={{
              background: mk.gradHeading,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            finalmente libero.
          </span>
        </motion.h1>

        {/* Typewriter */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            color: mk.inkSoft,
            margin: 0,
            minHeight: '2em',
            fontWeight: 400,
          }}
        >
          Con Aegis Beauty{' '}
          <span style={{ color: mk.purple, fontWeight: 600 }}>
            {displayText}
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.1em',
                background: mk.purple,
                marginLeft: 2,
                verticalAlign: 'text-bottom',
                animation: 'cursorBlink 1s step-end infinite',
              }}
            />
          </span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: mk.inkSoft,
            maxWidth: 560,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Il gestionale white-label per saloni e centri estetici italiani.{' '}
          <br />
          Zero commissioni. Zero marketplace. Solo il tuo brand, al livello che merita.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link
            href="/demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 32px',
              borderRadius: 14,
              background: mk.gradBrand,
              color: mk.onPurple,
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: mk.glow,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)';
              e.currentTarget.style.boxShadow = mk.glowStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = mk.glow;
            }}
          >
            Prenota una demo gratuita
          </Link>

          <a
            href="#pioneers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 32px',
              borderRadius: 14,
              background: 'transparent',
              color: mk.purpleDeep,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: `1px solid ${mk.purpleA(0.35)}`,
              transition: 'background 0.3s ease, border-color 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mk.purpleA(0.06);
              e.currentTarget.style.borderColor = mk.purpleA(0.6);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = mk.purpleA(0.35);
            }}
          >
            Diventa Pioneer
          </a>
        </motion.div>

        {/* Reassurance microcopy */}
        <motion.div
          variants={itemVariants}
          className="mk-hero-reassure"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 22px',
            marginTop: 4,
          }}
        >
          {['Nessuna carta di credito', 'Setup in 30 minuti', 'Cancelli quando vuoi'].map((t) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: mk.inkFaint }}>
              <Check size={14} color={mk.purple} strokeWidth={2.5} />
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: 0.5,
          animation: 'scrollBounce 2s ease-in-out infinite',
          cursor: 'default',
        }}
      >
        <ChevronDown size={24} color={mk.inkFaint} />
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 ${mk.purpleA(0)}; }
          50% { box-shadow: 0 0 0 6px ${mk.purpleA(0.08)}; }
        }
        @keyframes dotP {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        @media (max-width: 640px) {
          .mk-hero-inner { padding: 70px 20px 40px !important; gap: 16px !important; }
          .mk-hero-reassure { gap: 6px 14px !important; }
        }
      `}</style>
    </section>
  );
}
