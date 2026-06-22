'use client';

// ============================================================================
// AEGIS BEAUTY - DEMO PAGE CONTENT (Client Component)
// File: apps/aegis-beauty/app/(marketing)/demo/_DemoContent.tsx
// Tema: light premium (crema + ametista).
// ============================================================================

import { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Video } from 'lucide-react';
import { Navbar } from '../_components/Navbar';
import { Footer } from '../_components/Footer';
import { mk } from '../_components/theme';

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & {
      ns: Record<string, unknown>;
      q: unknown[];
      loaded: boolean;
    };
  }
}

const CAL_LINK = 'mattia-aegisgroup/call-conoscitiva-aegis-beauty';
const CAL_ORIGIN = 'https://cal.eu';

export function DemoContent() {
  useEffect(() => {
    if (document.querySelector('script[src*="cal.eu/embed"]')) return;

    (function () {
      const C = window;
      const A = `${CAL_ORIGIN}/embed.js`;
      const L = 'init';
      type CalFn = ((...args: unknown[]) => void) & {
        ns: Record<string, unknown>;
        q: unknown[];
        loaded: boolean;
      };
      const p = (a: CalFn, ar: unknown[]) => { a.q.push(ar); };
      const d = document;
      C.Cal = C.Cal || (function () {
        const cal = function (...args: unknown[]) {
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = [];
            const s = d.createElement('script');
            s.src = A;
            s.async = true;
            d.head.appendChild(s);
            cal.loaded = true;
          }
          if (args[0] === L) {
            const api = function (...a: unknown[]) { p(api as CalFn, a); } as CalFn;
            const ns = args[1] as string | undefined;
            api.q = [];
            api.ns = {};
            api.loaded = false;
            if (typeof ns === 'string') {
              (cal as CalFn).ns[ns] = api;
              p(api, args);
            } else {
              p(cal as CalFn, args);
            }
            return;
          }
          p(cal as CalFn, args);
        } as CalFn;
        cal.loaded = false;
        cal.q = [];
        cal.ns = {};
        return cal;
      })();

      C.Cal('init', { origin: CAL_ORIGIN });
      C.Cal('inline', {
        elementOrSelector: '#cal-embed',
        calLink: CAL_LINK,
        config: { theme: 'light', layout: 'month_view' },
      });
      C.Cal('ui', {
        theme: 'light',
        styles: { branding: { brandColor: '#9333ea' } },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: mk.bg,
          paddingTop: 100,
          paddingBottom: 80,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -100,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 900,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${mk.purpleA(0.08)} 0%, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          {/* Back link */}
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: mk.inkSoft,
              textDecoration: 'none',
              fontSize: 14,
              marginBottom: 48,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = mk.purple)}
            onMouseLeave={(e) => (e.currentTarget.style.color = mk.inkSoft)}
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
                background: mk.purpleA(0.08),
                border: `1px solid ${mk.purpleA(0.18)}`,
                color: mk.purpleDeep,
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
                fontFamily: mk.serif,
                fontSize: 'clamp(2.1rem, 5vw, 3rem)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                margin: '0 0 16px',
                lineHeight: 1.15,
              }}
            >
              <span
                style={{
                  ...mk.gradHeadingText,
                }}
              >
                Parliamoci.
              </span>{' '}
              <br />
              <span style={{ color: mk.purpleDeep }}>Senza impegno.</span>
            </h1>
            <p style={{ fontSize: 16, color: mk.inkSoft, lineHeight: 1.7, margin: 0 }}>
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
                  padding: '24px 16px',
                  borderRadius: 16,
                  background: mk.card,
                  backdropFilter: mk.blur,
                  WebkitBackdropFilter: mk.blur,
                  border: `1px solid ${mk.border}`,
                  boxShadow: `${mk.shadowSm}, 0 0 0 1px ${mk.purpleA(0.08)}`,
                  textAlign: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `${mk.shadowMd}, 0 0 0 1px ${mk.purpleA(0.28)}, 0 0 32px ${mk.purpleA(0.14)}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `${mk.shadowSm}, 0 0 0 1px ${mk.purpleA(0.08)}`;
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    margin: '0 auto 12px',
                    background: `linear-gradient(135deg, ${mk.purpleA(0.16)}, ${mk.purpleA(0.06)})`,
                    border: `1px solid ${mk.purpleA(0.25)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${mk.purpleA(0.12)}`,
                  }}
                >
                  <Icon size={20} color={mk.purple} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: mk.heading, margin: '0 0 4px' }}>
                  {label}
                </p>
                <p style={{ fontSize: 12, color: mk.inkFaint, margin: 0 }}>{sublabel}</p>
              </div>
            ))}
          </div>

          {/* Cal.com inline widget */}
          <div id="cal-embed" className="cal-embed-wrap" />
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 540px) {
          .demo-info-grid { grid-template-columns: 1fr !important; }
        }
        .cal-embed-wrap { min-height: 600px; }
        .cal-embed-wrap iframe { border: none !important; border-radius: 16px !important; }
        .cal-embed-wrap::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
