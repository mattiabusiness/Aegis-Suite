'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING FOOTER
// File: apps/aegis-beauty/app/(marketing)/_components/Footer.tsx
// Tema: light premium (crema + ametista).
// ============================================================================

import Link from 'next/link';
import { mk } from './theme';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: mk.bgAlt,
        borderTop: `1px solid ${mk.border}`,
        padding: '60px 24px 36px',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-marketing.png?v=4" alt="Aegis Beauty" style={{ height: 48, width: 'auto', display: 'block' }} />
          </div>
          <p style={{ fontSize: 14, color: mk.inkSoft, lineHeight: 1.7, maxWidth: 280, margin: '0 0 20px' }}>
            Il gestionale che mette il tuo brand al centro.
          </p>
          <p style={{ fontSize: 13, color: mk.inkFaint, margin: 0 }}>
            Un prodotto di{' '}
            <span style={{ color: mk.inkSoft, fontWeight: 500 }}>Aegis Group</span>
          </p>
        </div>

        {/* Navigation column */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: mk.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Navigazione
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Prodotto', href: '#solution' },
              { label: 'Pioneers', href: '#pioneers' },
              { label: 'Chi sono', href: '#founder' },
              { label: 'Demo', href: '/demo' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: mk.inkSoft, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = mk.purple)}
                onMouseLeave={(e) => (e.currentTarget.style.color = mk.inkSoft)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Legal column */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: mk.inkFaint, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Legale
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href="/legal"
              style={{ color: mk.inkSoft, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = mk.purple)}
              onMouseLeave={(e) => (e.currentTarget.style.color = mk.inkSoft)}
            >
              Privacy & Legal
            </Link>
            <a
              href="mailto:mattia@aegisbeauty.app"
              style={{ color: mk.inkSoft, textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = mk.purple)}
              onMouseLeave={(e) => (e.currentTarget.style.color = mk.inkSoft)}
            >
              mattia@aegisbeauty.app
            </a>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          paddingTop: 28,
          borderTop: `1px solid ${mk.hairline}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 13, color: mk.inkFaint, margin: 0 }}>
          © 2026 Aegis Group. Tutti i diritti riservati.
        </p>
        <p style={{ fontSize: 12, color: mk.inkFaint, margin: 0 }}>
          Aegis Beauty è il primo prodotto di Aegis Group
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
