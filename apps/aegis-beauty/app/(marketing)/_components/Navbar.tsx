'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING NAVBAR
// File: apps/aegis-beauty/app/(marketing)/_components/Navbar.tsx
// Fixed top nav with scroll-hide/show + mobile hamburger
// Tema: light premium — glass panna (effetto Apple).
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { mk } from './theme';

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setVisible(current < lastScrollY.current || current < 80);
      lastScrollY.current = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Prodotto', href: '/#solution' },
    { label: 'Pioneers', href: '/#pioneers' },
    { label: 'Chi Sono', href: '/#founder' },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transform: visible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: mk.glass,
          borderBottom: `1px solid ${mk.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-marketing.png?v=4" alt="Aegis Beauty" className="mk-nav-logo" style={{ height: 52, width: 'auto', display: 'block', objectFit: 'contain', flexShrink: 0 }} />
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="marketing-nav-desktop">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: mk.inkSoft,
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = mk.purple)}
                onMouseLeave={(e) => (e.currentTarget.style.color = mk.inkSoft)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/demo"
              className="mk-nav-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 12,
                background: mk.gradBrand,
                color: mk.onPurple,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: mk.glow,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = mk.glowStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = mk.glow;
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                animation: 'navShimmer 2.8s ease-in-out infinite',
              }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Prenota demo</span>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="marketing-hamburger"
              style={{
                background: 'none',
                border: 'none',
                color: mk.inkSoft,
                cursor: 'pointer',
                padding: 4,
                display: 'none',
              }}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            style={{
              padding: '16px 24px 24px',
              borderTop: `1px solid ${mk.border}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            className="marketing-mobile-menu"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: mk.inkSoft,
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .marketing-nav-desktop { display: none !important; }
          .marketing-hamburger { display: flex !important; }
          .mk-nav-logo { height: 40px !important; }
          .mk-nav-cta { padding: 7px 13px !important; font-size: 13px !important; }
        }
        @keyframes navShimmer {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(168,85,247,0.35)); }
        }
      `}</style>
    </>
  );
}
