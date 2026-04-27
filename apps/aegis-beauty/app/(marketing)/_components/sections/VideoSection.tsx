// ============================================================================
// AEGIS BEAUTY - VIDEO SECTION
// File: apps/aegis-beauty/app/(marketing)/_components/sections/VideoSection.tsx
// ============================================================================

import { Play } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal';

const videoId = process.env.NEXT_PUBLIC_VIDEO_ID;

export function VideoSection() {
  return (
    <section style={{ backgroundColor: '#0A0A0F', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 100,
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              color: '#a855f7', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              Vedi come funziona
            </span>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 800,
              letterSpacing: '-0.02em', color: '#F8FAFC',
              margin: '0 0 12px', lineHeight: 1.2,
            }}>
              Aegis Beauty in azione
            </h2>
            <p style={{ color: '#64748B', fontSize: 15, maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
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
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: '0 0 80px rgba(124,58,237,0.12), 0 32px 64px rgba(0,0,0,0.5)',
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
                  background: 'linear-gradient(135deg, #0D0D18 0%, #13101F 100%)',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'rgba(124,58,237,0.15)',
                    border: '2px solid rgba(168,85,247,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(124,58,237,0.25)',
                    animation: 'vidPulse 2.5s ease-in-out infinite',
                  }}
                >
                  <Play size={30} color="#a855f7" fill="rgba(168,85,247,0.3)" style={{ marginLeft: 4 }} />
                </div>
                <p style={{ color: '#475569', fontSize: 15, margin: 0, textAlign: 'center' }}>
                  Video in arrivo — Scopri Aegis Beauty in azione
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      <style>{`
        @keyframes vidPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(124,58,237,0.2); }
          50% { box-shadow: 0 0 50px rgba(124,58,237,0.4); }
        }
        @media (max-width: 640px) {
          section { padding: 60px 16px !important; }
        }
      `}</style>
    </section>
  );
}
