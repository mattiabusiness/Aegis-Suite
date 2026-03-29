'use client';

// ============================================================================
// AEGIS BEAUTY - LEGAL PAGE CONTENT (Client Component)
// File: apps/aegis-beauty/app/(marketing)/legal/_LegalContent.tsx
// ============================================================================

import { ArrowLeft } from 'lucide-react';
import { Navbar } from '../_components/Navbar';
import { Footer } from '../_components/Footer';

const documents = [
  { id: 'terms-manager', title: 'Termini di Servizio Gestore' },
  { id: 'privacy-manager', title: 'Privacy Policy Gestore' },
  { id: 'dpa', title: 'Data Processing Agreement (DPA)' },
  { id: 'terms-customer', title: 'Termini di Servizio Cliente Finale' },
  { id: 'privacy-customer', title: 'Privacy Policy Cliente Finale' },
  { id: 'cookies', title: 'Cookie Policy' },
];

export function LegalContent() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0A0F',
          paddingTop: 88,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '48px 24px 80px',
            display: 'grid',
            gridTemplateColumns: '240px 1fr',
            gap: 64,
            alignItems: 'start',
          }}
          className="legal-layout"
        >
          {/* Sticky sidebar */}
          <aside style={{ position: 'sticky', top: 100 }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#64748B',
                textDecoration: 'none',
                fontSize: 13,
                marginBottom: 28,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              <ArrowLeft size={14} />
              Home
            </a>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {documents.map((doc) => (
                <a
                  key={doc.id}
                  href={`#${doc.id}`}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: 8,
                    color: '#475569',
                    textDecoration: 'none',
                    fontSize: 13,
                    lineHeight: 1.4,
                    transition: 'background 0.2s, color 0.2s',
                    borderLeft: '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
                    e.currentTarget.style.color = '#a855f7';
                    e.currentTarget.style.borderLeftColor = '#a855f7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  {doc.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div style={{ maxWidth: 740 }}>
            <div style={{ marginBottom: 56 }}>
              <h1
                style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#F8FAFC',
                  margin: '0 0 12px',
                  lineHeight: 1.2,
                }}
              >
                Privacy &amp; Legal
              </h1>
              <p style={{ fontSize: 15, color: '#64748B', margin: 0 }}>
                Ultimo aggiornamento: Marzo 2026
              </p>
            </div>

            {documents.map((doc) => (
              <section
                key={doc.id}
                id={doc.id}
                style={{ marginBottom: 72, scrollMarginTop: 100 }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#F8FAFC',
                    margin: '0 0 20px',
                    paddingBottom: 16,
                    borderBottom: '1px solid rgba(124,58,237,0.12)',
                    lineHeight: 1.3,
                  }}
                >
                  {doc.title}
                </h2>
                <PlaceholderContent />
              </section>
            ))}

            {/* Contact */}
            <div
              style={{
                padding: '28px 32px',
                borderRadius: 16,
                background: 'rgba(124,58,237,0.04)',
                border: '1px solid rgba(124,58,237,0.1)',
                marginTop: 40,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 10px' }}>
                Contatti
              </h3>
              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 8px', lineHeight: 1.7 }}>
                Per qualsiasi domanda relativa ai documenti legali:
              </p>
              <a
                href="mailto:mattia@aegisbeauty.app"
                style={{ color: '#a855f7', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}
              >
                mattia@aegisbeauty.app
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .legal-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .legal-layout > aside { position: static !important; }
        }
      `}</style>
    </>
  );
}

function PlaceholderContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        '1. [ARTICOLO 1 — TESTO DA INSERIRE]',
        '2. [ARTICOLO 2 — TESTO DA INSERIRE]',
        '3. [ARTICOLO 3 — TESTO DA INSERIRE]',
      ].map((text, i) => (
        <div key={i}>
          <p
            style={{
              fontSize: 15,
              color: '#94A3B8',
              lineHeight: 1.8,
              margin: '0 0 12px',
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {text}
          </p>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>
            [CORPO TESTO — DA INSERIRE] Questo è un testo placeholder che verrà sostituito
            con il contenuto legale definitivo redatto da un professionista.
          </p>
        </div>
      ))}
    </div>
  );
}
