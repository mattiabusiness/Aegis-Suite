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

function AegisLogo({ size, color = '#9333ea' }: { size: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: size, height: size, color }}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

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

        {/* ── Mobile header (< 1024px) ── */}
        <header
          className="lg:hidden flex items-center justify-between px-4 sticky top-0 z-30"
          style={{
            height: 56,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-2">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} width={26} height={26}
                className="rounded-lg object-cover" style={{ width: 26, height: 26 }} />
            ) : (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${theme.sidebar.logoBackground}`}>
                {business.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm text-gray-800">{business.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(126,34,206,0.35))',
              border: '1px solid rgba(168,85,247,0.3)',
              boxShadow: '0 2px 10px rgba(168,85,247,0.15)',
            }}>
              <AegisLogo size={15} />
            </div>
            <span style={{ color: '#7c3aed', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {brandLabel}
            </span>
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
