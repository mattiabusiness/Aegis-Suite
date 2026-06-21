// ============================================================================
// AEGIS SUITE - CUSTOMER LAYOUT (Multi-vertical)
// File: packages/ui/src/components/customer/CustomerLayout.tsx
// Desktop: DesktopHeader (fixed top, notch bubble down) + lg:pt-[68px]
// Mobile:  sticky top header + BottomNav (fixed bottom, notch bubble up)
// No Next.js dependency — accepts currentPath prop from app-layer wrapper
// ============================================================================

import * as React from 'react';
import { FloatingParticles } from '../FloatingParticles';
import { BottomNav, DesktopHeader } from './CustomerNav';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// AEGIS LOGO (mobile header only)
// ============================================================================

const HEADER_GRADIENT: Record<string, [string, string]> = {
  beauty: ['#9333ea', '#4c1d95'],
  sport:  ['#059669', '#064e3b'],
  health: ['#0284c7', '#0c4a6e'],
  home:   ['#d97706', '#78350f'],
  law:    ['#374151', '#111827'],
  book:   ['#4f46e5', '#1e1b4b'],
};

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerLayoutBusiness {
  slug:     string;
  name:     string;
  logo_url: string | null;
}

export interface CustomerLayoutProps {
  business:    CustomerLayoutBusiness;
  customer:    unknown;
  children:    React.ReactNode;
  theme:       DashboardTheme;
  currentPath: string;
  onNavigate?: (href: string) => void;
  brandLabel?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CustomerLayout({
  business,
  children,
  theme,
  currentPath,
  onNavigate,
  brandLabel = 'Aegis Beauty',
}: CustomerLayoutProps) {
  const [gFrom, gTo] = HEADER_GRADIENT[theme.name] ?? HEADER_GRADIENT.beauty;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#f9f8fd' }}>
      <FloatingParticles />

      {/* ── Desktop header — fixed top, full-width with notch bubble ──────── */}
      <DesktopHeader
        business={business}
        currentPath={currentPath}
        theme={theme}
        onNavigate={onNavigate}
        brandLabel={brandLabel}
      />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Mobile header (< 1024px) — hidden on prenota (fullscreen carousel) ── */}
        <header
          className={`lg:hidden flex items-center justify-between px-4 sticky top-0 z-30 ${currentPath.includes('/prenota') ? 'hidden' : ''}`}
          style={{
            height: 56,
            background: `linear-gradient(135deg, ${gTo} 0%, ${gFrom} 100%)`,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
          }}
        >
          <div className="flex items-center gap-2">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} width={38} height={38}
                className="rounded-lg object-cover" style={{ width: 38, height: 38, border: '1.5px solid rgba(255,255,255,0.3)' }} />
            ) : (
              <div style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.82rem', fontWeight: 800, color: '#fff',
              }}>
                {business.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{business.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-orizzontale-rev.png?v=3"
              alt={brandLabel}
              style={{ height: 38, width: 'auto', objectFit: 'contain', opacity: 0.92 }}
            />
          </div>
        </header>

        {/* Page content — pt-[64px] = desktop header height, pb-[60px] = mobile bottom nav */}
        <main className="flex-1 pb-[80px] lg:pb-0 lg:pt-[64px]">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (lg:hidden) */}
      <BottomNav
        businessSlug={business.slug}
        currentPath={currentPath}
        theme={theme}
        onNavigate={onNavigate}
      />
    </div>
  );
}
