'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING HERO
// File: apps/aegis-beauty/app/(marketing)/_components/Hero.tsx
// Fullscreen hero — FloatingParticles + Framer Motion + typewriter
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { FloatingParticles } from '@aegis/ui';

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
        backgroundColor: '#0A0A0F',
      }}
    >
      {/* Background */}
      <FloatingParticles />

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)',
              fontSize: 13,
              fontWeight: 500,
              color: '#c084fc',
              animation: 'badgePulse 2.5s ease-in-out infinite',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#a855f7',
                animation: 'dotP 1.8s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <Sparkles size={13} style={{ opacity: 0.8 }} />
            Aegis Pioneers — Programma Beta 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 30%, #a855f7 100%)',
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
              background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
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
            color: '#94A3B8',
            margin: 0,
            minHeight: '2em',
            fontWeight: 400,
          }}
        >
          Con Aegis Beauty{' '}
          <span style={{ color: '#a855f7', fontWeight: 600 }}>
            {displayText}
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.1em',
                background: '#a855f7',
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
            color: '#64748B',
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
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6b21a8, #7c3aed, #a855f7)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              textDecoration: 'none',
              boxShadow: '0 0 30px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03) translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 45px rgba(124,58,237,0.6), 0 8px 30px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.3)';
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
              borderRadius: 12,
              background: 'transparent',
              color: '#a855f7',
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: '1px solid rgba(168,85,247,0.4)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
            }}
          >
            Diventa Pioneer
          </a>
        </motion.div>

        {/* Reassurance microcopy */}
        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px 22px',
            marginTop: 4,
          }}
        >
          {['Nessuna carta di credito', 'Setup in 30 minuti', 'Cancelli quando vuoi'].map((t) => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748B' }}>
              <Check size={14} color="#a855f7" strokeWidth={2.5} />
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
          opacity: 0.4,
          animation: 'scrollBounce 2s ease-in-out infinite',
          cursor: 'default',
        }}
      >
        <ChevronDown size={24} color="#94A3B8" />
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
          50% { box-shadow: 0 0 0 6px rgba(124,58,237,0.08); }
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
      `}</style>
    </section>
  );
}
