'use client';

// ============================================================================
// AEGIS BEAUTY - MARKETING NAVBAR
// File: apps/aegis-beauty/app/(marketing)/_components/Navbar.tsx
// Fixed top nav with scroll-hide/show + mobile hamburger
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

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
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(124,58,237,0.15)',
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
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoIcon />
            <span style={{ fontSize: 18, letterSpacing: '-0.02em', fontFamily: "var(--font-inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)" }}>
              <span style={{ color: '#F8FAFC', fontWeight: 700 }}>Aegis</span>
              <span style={{ color: '#a855f7', fontWeight: 600 }}> Beauty</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="marketing-nav-desktop">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: '#94A3B8',
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#a855f7')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/demo"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 0 20px rgba(124,58,237,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 0 28px rgba(124,58,237,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.35)';
              }}
            >
              Prenota demo
            </Link>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="marketing-hamburger"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
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
              borderTop: '1px solid rgba(124,58,237,0.1)',
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
                  color: '#94A3B8',
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
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 16px rgba(168,85,247,0.35)); }
        }
      `}</style>
    </>
  );
}

function LogoIcon() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(126,34,206,0.4))',
        border: '1px solid rgba(168,85,247,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'breathe 3s ease-in-out infinite',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
