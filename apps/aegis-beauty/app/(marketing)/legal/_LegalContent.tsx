'use client';

// ============================================================================
// AEGIS BEAUTY - LEGAL PAGE CONTENT
// File: apps/aegis-beauty/app/(marketing)/legal/_LegalContent.tsx
// ============================================================================

import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Navbar } from '../_components/Navbar';
import { Footer } from '../_components/Footer';
import { TermsManager } from './_docs/TermsManager';
import { PrivacyManager } from './_docs/PrivacyManager';
import { DPA } from './_docs/DPA';
import { TermsCustomer } from './_docs/TermsCustomer';
import { PrivacyCustomer } from './_docs/PrivacyCustomer';
import { CookiePolicy } from './_docs/CookiePolicy';

const documents = [
  { id: 'terms-manager', title: 'Termini di Servizio Gestore', ready: true },
  { id: 'privacy-manager', title: 'Privacy Policy Gestore', ready: true },
  { id: 'dpa', title: 'Data Processing Agreement (DPA)', ready: true },
  { id: 'terms-customer', title: 'Termini di Servizio Cliente Finale', ready: true },
  { id: 'privacy-customer', title: 'Privacy Policy Cliente Finale', ready: true },
  { id: 'cookies', title: 'Cookie Policy', ready: true },
];

export function LegalContent() {
  const [activeId, setActiveId] = useState('terms-manager');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveId(top.target.id);
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    );
    documents.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      {/* Mobile dropdown nav */}
      <div className="legal-mobile-nav" style={{ backgroundColor: '#0A0A0F', borderBottom: '1px solid rgba(124,58,237,0.1)', position: 'sticky', top: 72, zIndex: 40 }}>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          style={{ width: '100%', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', fontSize: 14, fontWeight: 600 }}
        >
          {documents.find((d) => d.id === activeId)?.title ?? 'Documenti legali'}
          <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>
        {mobileOpen && (
          <nav style={{ padding: '8px 16px 16px' }}>
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={`#${doc.id}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
                  color: activeId === doc.id ? '#a855f7' : doc.ready ? '#64748B' : '#334155',
                  fontWeight: activeId === doc.id ? 600 : 400,
                  backgroundColor: activeId === doc.id ? 'rgba(168,85,247,0.08)' : 'transparent',
                }}
              >
                {doc.title}
                {!doc.ready && (
                  <span style={{ fontSize: 11, color: '#374151', marginLeft: 8, fontStyle: 'italic' }}>in arrivo</span>
                )}
              </a>
            ))}
          </nav>
        )}
      </div>

      <main style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', paddingTop: 88 }}>
        <div
          style={{ maxWidth: 1160, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '250px 1fr', gap: 60, alignItems: 'start' }}
          className="legal-layout"
        >
          {/* Sticky sidebar */}
          <aside style={{ position: 'sticky', top: 108 }} className="legal-sidebar">
            <a
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', textDecoration: 'none', fontSize: 13, marginBottom: 32, transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
            >
              <ArrowLeft size={13} />
              Home
            </a>

            <p style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Documenti legali
            </p>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {documents.map((doc) => {
                const isActive = activeId === doc.id;
                return (
                  <a
                    key={doc.id}
                    href={`#${doc.id}`}
                    style={{
                      display: 'block', padding: '8px 12px', borderRadius: 8, textDecoration: 'none',
                      fontSize: 13, lineHeight: 1.4, transition: 'all 0.2s',
                      color: isActive ? '#a855f7' : doc.ready ? '#64748B' : '#2d3748',
                      backgroundColor: isActive ? 'rgba(168,85,247,0.08)' : 'transparent',
                      borderLeft: `2px solid ${isActive ? '#7c3aed' : 'transparent'}`,
                      fontWeight: isActive ? 600 : 400,
                      pointerEvents: doc.ready ? 'auto' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive && doc.ready) {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = doc.ready ? '#64748B' : '#2d3748';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {doc.title}
                    {!doc.ready && (
                      <span style={{ display: 'block', fontSize: 11, color: '#334155', marginTop: 2, fontStyle: 'italic' }}>
                        In arrivo
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <div style={{ minWidth: 0 }}>
            {/* Page title */}
            <div style={{ marginBottom: 56 }}>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#F8FAFC', margin: '0 0 10px', lineHeight: 1.2 }}>
                Privacy &amp; Legal
              </h1>
              <p style={{ fontSize: 14, color: '#475569', margin: 0 }}>
                Tutti i documenti legali di Aegis Beauty — aggiornati a Marzo 2026.
              </p>
            </div>

            {/* Terms Manager */}
            <section id="terms-manager" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <TermsManager />
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(124,58,237,0.12)', marginBottom: 80 }} />

            {/* Privacy Policy Gestore */}
            <section id="privacy-manager" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <PrivacyManager />
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(124,58,237,0.12)', marginBottom: 80 }} />

            {/* DPA */}
            <section id="dpa" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <DPA />
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(124,58,237,0.12)', marginBottom: 80 }} />

            {/* Terms Customer */}
            <section id="terms-customer" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <TermsCustomer />
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(124,58,237,0.12)', marginBottom: 80 }} />

            {/* Privacy Customer */}
            <section id="privacy-customer" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <PrivacyCustomer />
            </section>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(124,58,237,0.12)', marginBottom: 80 }} />

            {/* Cookie Policy */}
            <section id="cookies" style={{ scrollMarginTop: 120, marginBottom: 80 }}>
              <CookiePolicy />
            </section>

            {/* Upcoming documents */}
            {documents.filter((d) => !d.ready).map((doc, i, arr) => (
              <section key={doc.id} id={doc.id} style={{ scrollMarginTop: 120, marginBottom: 80 }}>
                <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(124,58,237,0.02)', border: '1px solid rgba(124,58,237,0.06)', opacity: 0.5 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
                    In arrivo
                  </p>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#475569', margin: 0 }}>
                    {doc.title}
                  </h2>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ borderTop: '1px solid rgba(124,58,237,0.08)', marginTop: 80 }} />
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .legal-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .legal-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .legal-sidebar { display: none !important; }
          .legal-mobile-nav { display: block !important; }
          main { padding-top: 72px !important; }
        }
      `}</style>
    </>
  );
}
