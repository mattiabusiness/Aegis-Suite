'use client';

// ============================================================================
// AEGIS BEAUTY - SOLUTION SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/SolutionSection.tsx
// Alternating premium SaaS layout — 3D tilt, ambient glow, scroll connector
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Users,
  BarChart3,
  Settings,
  Smartphone,
  Bell,
} from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

type Feature = {
  icon: typeof Calendar;
  title: string;
  description: string;
  image: string;
  imageSecondary?: string;
};

const features: Feature[] = [
  {
    icon: Calendar,
    title: 'Prenotazioni senza caos.',
    description:
      'Calendario intelligente, disponibilità in tempo reale, nessun doppio appuntamento. I tuoi clienti prenotano quando vogliono. Tu trovi tutto già organizzato.',
    image: '/product-calendario.png',
  },
  {
    icon: Users,
    title: 'CRM che conosce i tuoi clienti.',
    description:
      'Nome, storico, preferenze, note del professionista. Ogni cliente ha la sua scheda completa. Non dimentichi più nulla — e loro lo sentono.',
    image: '/product-clienti.png',
  },
  {
    icon: BarChart3,
    title: 'Dati che guidano le decisioni.',
    description:
      'Quali servizi rendono di più. Quali ore sono sempre piene. Quanto vale ogni cliente nel tempo. Smetti di andare a sensazione — inizia a crescere con certezza.',
    image: '/product-statistiche.png',
  },
  {
    icon: Settings,
    title: 'Staff gestito senza attriti.',
    description:
      'Permessi granulari per ogni collaboratrice, inviti via QR code, orari personalizzati. La tua squadra lavora in autonomia — senza toccare quello che non deve toccare.',
    image: '/product-staff.png',
  },
  {
    icon: Smartphone,
    title: 'Il tuo brand. Non il nostro.',
    description:
      'Pagina prenotazione personalizzata con il nome e il brand del tuo salone. I tuoi clienti vedono te — non una piattaforma generica. White-label puro, zero commissioni.',
    image: '/product-prenota.png',
    imageSecondary: '/product-brand.png',
  },
  {
    icon: Bell,
    title: 'Promemoria automatici.',
    description:
      'Email e notifiche push prima di ogni appuntamento. I no-show calano. I clienti arrivano puntuali. Tu pensi al lavoro — non ai messaggi di reminder su WhatsApp.',
    image: '/product-overview.png',
  },
];

const IMG_BASE: React.CSSProperties = {
  width: '100%',
  display: 'block',
  borderRadius: 16,
  border: '1px solid rgba(168,85,247,0.28)',
  boxShadow:
    '0 0 0 1px rgba(124,58,237,0.08), 0 0 60px rgba(124,58,237,0.16), 0 28px 60px rgba(0,0,0,0.55)',
};

// ─── 3D Tilt wrapper (desktop pointer only) ─────────────────────────────────

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rotY = (px - 0.5) * 9;
    const rotX = (0.5 - py) * 9;
    el.style.transform = `perspective(1100px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        position: 'relative',
        zIndex: 1,
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

function FeatureMedia({ feat }: { feat: Feature }) {
  if (feat.imageSecondary) {
    return (
      <div style={{ position: 'relative', width: '100%', paddingBottom: 52 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={feat.image} alt={feat.title} style={IMG_BASE} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={feat.imageSecondary}
          alt=""
          aria-hidden="true"
          className="sol-float"
          style={{
            ...IMG_BASE,
            position: 'absolute',
            width: '38%',
            right: -14,
            bottom: -18,
            boxShadow:
              '0 0 0 1px rgba(124,58,237,0.12), 0 0 50px rgba(124,58,237,0.22), 0 24px 50px rgba(0,0,0,0.6)',
          }}
        />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={feat.image} alt={feat.title} style={IMG_BASE} />
  );
}

export function SolutionSection() {
  const rowsRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = rowsRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = window.innerHeight / 2;
      const p = (center - rect.top) / rect.height;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="solution" style={{ backgroundColor: '#0D0D16', padding: '100px 24px', scrollMarginTop: 80, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
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
              Il Prodotto
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              Un solo sistema. Tutto quello che serve.
            </h2>
            <p style={{ color: '#64748B', fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Progettato per i professionisti italiani della bellezza. Costruito per durare decenni.
            </p>
          </div>
        </ScrollReveal>

        {/* Alternating feature rows + scroll connector */}
        <div ref={rowsRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 100 }}>

          {/* Connector spine (desktop) */}
          <div className="sol-spine" aria-hidden="true" style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 0 }}>
            {/* Track */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.12) 8%, rgba(124,58,237,0.12) 92%, transparent)' }} />
            {/* Progress fill */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${progress * 100}%`, background: 'linear-gradient(to bottom, rgba(168,85,247,0.7), rgba(124,58,237,0.5))', boxShadow: '0 0 12px rgba(168,85,247,0.5)', transition: 'height 0.1s linear' }} />
            {/* Leading dot */}
            <div style={{ position: 'absolute', top: `calc(${progress * 100}% - 5px)`, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 16px rgba(168,85,247,0.9), 0 0 4px #fff', opacity: progress > 0.01 && progress < 0.99 ? 1 : 0, transition: 'opacity 0.3s' }} />
          </div>

          {features.map((feat, i) => {
            const Icon = feat.icon;
            const reverse = i % 2 === 1;
            return (
              <ScrollReveal key={i}>
                <div
                  className="solution-row"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: reverse ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: 64,
                  }}
                >
                  {/* Text */}
                  <div className="solution-text" style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(168,85,247,0.1))',
                        border: '1px solid rgba(168,85,247,0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 22,
                        boxShadow: '0 0 24px rgba(124,58,237,0.18)',
                      }}
                    >
                      <Icon size={22} color="#a855f7" />
                    </div>
                    <h3
                      style={{
                        fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        margin: '0 0 14px',
                        lineHeight: 1.2,
                        background: 'linear-gradient(120deg, #F8FAFC 25%, #c084fc 75%, #a855f7 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p style={{ fontSize: 16, color: '#94A3B8', margin: 0, lineHeight: 1.75 }}>
                      {feat.description}
                    </p>
                  </div>

                  {/* Media */}
                  <div className="solution-media" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                    {/* Ambient glow */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: '-12% -10%',
                        background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0.08) 45%, transparent 72%)',
                        filter: 'blur(44px)',
                        zIndex: 0,
                        pointerEvents: 'none',
                      }}
                    />
                    <TiltCard>
                      <FeatureMedia feat={feat} />
                    </TiltCard>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .solution-row {
            flex-direction: column !important;
            gap: 32px !important;
          }
          .solution-text, .solution-media {
            width: 100% !important;
          }
          .sol-spine { display: none !important; }
        }
      `}</style>
    </section>
  );
}
