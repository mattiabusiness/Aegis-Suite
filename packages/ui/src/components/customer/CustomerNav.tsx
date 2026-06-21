// ============================================================================
// AEGIS SUITE - CUSTOMER NAVIGATION
// File: packages/ui/src/components/customer/CustomerNav.tsx
//
//   <BottomNav>     — mobile only (lg:hidden), fixed bottom, gradient + pill active
//   <DesktopHeader> — desktop only (hidden lg:flex), fixed top, gradient + pill active
// ============================================================================

'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Home, Scissors, User, type LucideIcon } from 'lucide-react';
import type { DashboardTheme } from '../dashboard/Themes';

// ============================================================================
// SHARED — NAV ITEMS
// ============================================================================

interface NavItem { id: string; label: string; icon: LucideIcon; subpath: string | null; }

const NAV_ITEMS: NavItem[] = [
  { id: 'home',    label: 'Home',    icon: Home,    subpath: null },
  { id: 'prenota', label: 'Prenota', icon: Scissors, subpath: 'prenota' },
  { id: 'account', label: 'Account', icon: User,     subpath: 'account' },
];

// ============================================================================
// SHARED — THEME GRADIENT COLORS
// ============================================================================

const THEME_GRADIENT: Record<string, [string, string]> = {
  beauty: ['#9333ea', '#4c1d95'],
  sport:  ['#059669', '#064e3b'],
  health: ['#0284c7', '#0c4a6e'],
  home:   ['#d97706', '#78350f'],
  law:    ['#374151', '#111827'],
  book:   ['#4f46e5', '#1e1b4b'],
};

// ============================================================================
// SHARED — HOOK: active index
// ============================================================================

function useNav(basePath: string, currentPath: string) {
  const activeIndex = React.useMemo(() => {
    if (currentPath.startsWith(`${basePath}/prenota`)) return 1;
    if (currentPath.startsWith(`${basePath}/account`)) return 2;
    return 0;
  }, [currentPath, basePath]);
  return { activeIndex };
}


// ============================================================================
// BOTTOM NAV (mobile — lg:hidden)
// ============================================================================

export interface BottomNavProps {
  businessSlug: string;
  currentPath:  string;
  theme:        DashboardTheme;
  onNavigate?:  (href: string) => void;
}

export function BottomNav({ businessSlug, currentPath, theme, onNavigate }: BottomNavProps) {
  const basePath = `/${businessSlug}`;
  const { activeIndex } = useNav(basePath, currentPath);
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (onNavigate) { e.preventDefault(); onNavigate(href); }
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: `linear-gradient(135deg, ${gFrom} 0%, ${gTo} 100%)`,
        height: `calc(60px + env(safe-area-inset-bottom, 0px))`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.18), 0 -1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ display: 'flex', height: 60, position: 'relative' }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const href     = item.subpath ? `${basePath}/${item.subpath}` : basePath;
          const Icon     = item.icon;
          return (
            <a
              key={item.id}
              href={href}
              onClick={(e) => handleClick(e, href)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                textDecoration: 'none', position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="bn-active-pill"
                  style={{
                    position: 'absolute',
                    inset: '6px 8px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <Icon style={{
                width: 18, height: 18,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
                position: 'relative', zIndex: 1,
                transition: 'color 0.2s',
                filter: isActive ? 'drop-shadow(0 1px 4px rgba(255,255,255,0.3))' : 'none',
              }} />
              <span style={{
                fontSize: '0.62rem', fontWeight: isActive ? 700 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.52)',
                position: 'relative', zIndex: 1,
                transition: 'color 0.2s',
                letterSpacing: '0.01em',
              }}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

// ============================================================================
// DESKTOP HEADER (hidden lg:flex)
// ============================================================================

export interface DesktopHeaderProps {
  business:    { slug: string; name: string; logo_url: string | null };
  currentPath: string;
  theme:       DashboardTheme;
  onNavigate?: (href: string) => void;
  brandLabel?: string;
}

// No bubble overflow — header is a clean 64px bar
export const DH_BUBBLE_OVERFLOW = 0;

export function DesktopHeader({ business, currentPath, theme, onNavigate, brandLabel = 'Aegis Beauty' }: DesktopHeaderProps) {
  const basePath = `/${business.slug}`;
  const { activeIndex } = useNav(basePath, currentPath);
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (onNavigate) { e.preventDefault(); onNavigate(href); }
  }

  return (
    <nav
      className="hidden lg:flex fixed top-0 left-0 right-0 z-30 items-center"
      style={{
        height: 64,
        paddingInline: 40,
        background: `linear-gradient(135deg, ${gFrom} 0%, ${gTo} 100%)`,
        boxShadow: '0 4px 32px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.08) inset',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: business brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            width={44} height={44}
            style={{
              width: 44, height: 44, borderRadius: 11, objectFit: 'cover', flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          />
        ) : (
          <div style={{
            width: 44, height: 44, borderRadius: 11, flexShrink: 0,
            background: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
          }}>
            {business.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span style={{
          fontWeight: 600, fontSize: '0.95rem', color: '#fff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>
          {business.name}
        </span>
      </div>

      {/* Center: nav pills */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 18, padding: '4px',
        border: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          const href     = item.subpath ? `${basePath}/${item.subpath}` : basePath;
          const Icon     = item.icon;
          return (
            <a
              key={item.id}
              href={href}
              onClick={(e) => handleClick(e, href)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 18px',
                borderRadius: 14,
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="dh-active-pill"
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 14,
                    background: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <Icon style={{
                width: 14, height: 14,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                position: 'relative', zIndex: 1,
                flexShrink: 0,
                filter: isActive ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' : 'none',
              }} />
              <span style={{
                fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                position: 'relative', zIndex: 1,
                letterSpacing: '0.01em',
                textShadow: isActive ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
              }}>
                {item.label}
              </span>
            </a>
          );
        })}
      </div>

      {/* Right: Aegis brand */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-orizzontale-rev.png?v=4"
          alt={brandLabel}
          style={{ height: 44, width: 'auto', objectFit: 'contain', opacity: 0.92 }}
        />
      </div>
    </nav>
  );
}
