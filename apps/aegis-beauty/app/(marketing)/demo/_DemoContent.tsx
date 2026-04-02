'use client';

// ============================================================================
// AEGIS BEAUTY - DEMO PAGE CONTENT (Client Component)
// File: apps/aegis-beauty/app/(marketing)/demo/_DemoContent.tsx
// ============================================================================

import { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Video } from 'lucide-react';
import { Navbar } from '../_components/Navbar';
import { Footer } from '../_components/Footer';

export function DemoContent() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);


  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0A0F',
          paddingTop: 100,
          paddingBottom: 80,
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          {/* Back link */}
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: '#64748B',
              textDecoration: 'none',
              fontSize: 14,
              marginBottom: 48,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
          >
            <ArrowLeft size={16} />
            Torna alla home
          </a>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
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
              Demo Gratuita
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#F8FAFC',
                margin: '0 0 16px',
                lineHeight: 1.15,
              }}
            >
              Parliamoci.{' '}
              <br />
              <span style={{ color: '#a855f7' }}>Senza impegno.</span>
            </h1>
            <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
              20 minuti in videocall per capire se Aegis Beauty fa per il tuo salone. Nessuna pressione, nessun venditore. Solo io e te.
            </p>
          </div>

          {/* What to expect */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 48,
            }}
            className="demo-info-grid"
          >
            {[
              { icon: Clock, label: '20 minuti', sublabel: 'Durata chiamata' },
              { icon: Video, label: 'Video call', sublabel: 'Google Meet' },
              { icon: Calendar, label: 'Gratuita', sublabel: 'Zero impegni' },
            ].map(({ icon: Icon, label, sublabel }, i) => (
              <div
                key={i}
                style={{
                  padding: '20px 16px',
                  borderRadius: 14,
                  background: 'rgba(124,58,237,0.04)',
                  border: '1px solid rgba(124,58,237,0.1)',
                  textAlign: 'center',
                }}
              >
                <Icon size={22} color="#a855f7" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px' }}>
                  {label}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{sublabel}</p>
              </div>
            ))}
          </div>

          {/* Calendly inline widget */}
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(124,58,237,0.2)',
              boxShadow: '0 0 40px rgba(124,58,237,0.08)',
            }}
          >
            <div
              className="calendly-inline-widget w-full rounded-xl overflow-hidden"
              data-url="https://calendly.com/mattia-businessgrowth/30min?hide_gdpr_banner=1&hide_landing_page_details=1&primary_color=7C3AED&background_color=0a0a0f&text_color=f8fafc"
              style={{ minWidth: '320px', height: '1000px', scrollbarWidth: 'none', msOverflowStyle: 'none', backgroundColor: '#0a0a0f' }}
            />
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 540px) { .demo-info-grid { grid-template-columns: 1fr !important; } }
        .calendly-inline-widget::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
