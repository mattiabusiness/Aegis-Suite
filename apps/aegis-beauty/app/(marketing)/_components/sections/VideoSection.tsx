// ============================================================================
// AEGIS BEAUTY - VIDEO SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/VideoSection.tsx
// Tema: light premium (crema + ametista).
// ============================================================================

import { Play } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';
import { mk } from '../theme';

const videoId = process.env.NEXT_PUBLIC_VIDEO_ID;

export function VideoSection() {
  return (
    <section style={{ background: mk.gradBgAlt, padding: '88px 24px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${mk.purpleA(0.06)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 100,
              background: mk.purpleA(0.08), border: `1px solid ${mk.purpleA(0.18)}`,
              color: mk.purpleDeep, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              Vedi come funziona
            </span>
            <h2 style={{
              fontFamily: mk.serif,
              fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)', fontWeight: 600,
              letterSpacing: '-0.01em', ...mk.gradHeadingText,
              margin: '0 0 12px', lineHeight: 1.2,
            }}>
              Aegis Beauty in azione
            </h2>
            <p style={{ color: mk.inkSoft, fontSize: 15, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
              L&apos;intero ecosistema del tuo salone, semplificato in un unico tocco.
            </p>
          </div>
        </ScrollReveal>

        {/* Video */}
        <ScrollReveal delay={100}>
          <div
            style={{
              position: 'relative',
              aspectRatio: '16/9',
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${mk.purpleA(0.22)}`,
              boxShadow: `0 0 60px ${mk.purpleA(0.12)}, 0 24px 50px ${mk.amethystA(0.16)}`,
            }}
          >
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                title="Aegis Beauty — Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 20,
                  background: `linear-gradient(135deg, ${mk.bgAlt} 0%, ${mk.bgTint} 100%)`,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: mk.purpleA(0.12),
                    border: `2px solid ${mk.purpleA(0.35)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 40px ${mk.purpleA(0.2)}`,
                    animation: 'vidPulse 2.5s ease-in-out infinite',
                  }}
                >
                  <Play size={30} color={mk.purple} fill={mk.purpleA(0.3)} style={{ marginLeft: 4 }} />
                </div>
                <p style={{ color: mk.inkFaint, fontSize: 15, margin: 0, textAlign: 'center' }}>
                  Video in arrivo — Scopri Aegis Beauty in azione
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes vidPulse {
          0%, 100% { box-shadow: 0 0 20px ${mk.purpleA(0.18)}; }
          50% { box-shadow: 0 0 50px ${mk.purpleA(0.32)}; }
        }
        @media (max-width: 640px) {
          section { padding: 64px 16px !important; }
        }
      `}</style>
    </section>
  );
}
