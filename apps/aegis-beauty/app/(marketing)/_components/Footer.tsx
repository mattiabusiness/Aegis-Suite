'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING FOOTER
// File: apps/aegis-beauty/app/(marketing)/_components/Footer.tsx
// ============================================================================

import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0A0A0F',
        borderTop: '1px solid rgba(124,58,237,0.12)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <FooterLogoIcon />
            <span style={{ fontSize: 17, letterSpacing: '-0.02em', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>Aegis</span>
              <span style={{ color: '#a855f7', fontWeight: 600 }}> Beauty</span>
            </span>
          </div>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, maxWidth: 280, margin: '0 0 20px' }}>
            Il gestionale che mette il tuo brand al centro.
          </p>
          <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
            Un prodotto di{' '}
            <span style={{ color: '#64748B', fontWeight: 500 }}>Aegis Group</span>
          </p>
        </div>

        {/* Navigation column */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
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
                style={{ color: '#475569', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Legal column */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Legale
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link
              href="/legal"
              style={{ color: '#475569', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
            >
              Privacy & Legal
            </Link>
            <a
              href="mailto:mattia@aegisbeauty.app"
              style={{ color: '#475569', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#475569')}
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
          borderTop: '1px solid rgba(124,58,237,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
          © 2026 Aegis Group. Tutti i diritti riservati.
        </p>
        <p style={{ fontSize: 12, color: '#1e293b', margin: 0 }}>
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

function FooterLogoIcon() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(126,34,206,0.35))',
        border: '1px solid rgba(168,85,247,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
