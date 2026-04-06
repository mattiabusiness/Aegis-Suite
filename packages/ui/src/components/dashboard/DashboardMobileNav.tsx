// ============================================================================
// AEGIS SUITE - DASHBOARD MOBILE NAVIGATION
// File: packages/ui/src/components/dashboard/DashboardMobileNav.tsx
//
//   <DashboardMobileHeader>   — mobile only (lg:hidden), sticky top
//   <DashboardMobileBottomNav> — mobile only (lg:hidden), fixed bottom
//                               first 4 items of main menu as primary tabs
//                               remaining items in slide-up "Altro" drawer
// ============================================================================

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Bell, User } from 'lucide-react';
import type { DashboardTheme } from './Themes';
import type { SidebarMenuSection, SidebarMenuItem } from './Sidebar';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DASH_MOBILE_HEADER_H = 56; // px
export const DASH_MOBILE_NAV_H    = 60; // px

const THEME_GRADIENT: Record<string, [string, string]> = {
  beauty: ['#9333ea', '#4c1d95'],
  sport:  ['#059669', '#064e3b'],
  health: ['#0284c7', '#0c4a6e'],
  home:   ['#d97706', '#78350f'],
  law:    ['#374151', '#111827'],
  book:   ['#4f46e5', '#1e1b4b'],
};

// ============================================================================
// AEGIS LOGO
// ============================================================================

function AegisLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14, color: '#fff' }}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

// ============================================================================
// DASHBOARD MOBILE HEADER
// ============================================================================

export interface DashboardMobileHeaderProps {
  businessName: string;
  businessLogo?: string;
  theme:         DashboardTheme;
  brandLabel?:   string;
  userName?:     string;
  userAvatar?:   string;
  unreadCount?:  number;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export function DashboardMobileHeader({
  businessName,
  businessLogo,
  theme,
  brandLabel = 'Aegis Beauty',
  userName,
  userAvatar,
  unreadCount = 0,
  onNotificationClick,
  onProfileClick,
}: DashboardMobileHeaderProps) {
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  return (
    <header
      className="lg:hidden flex items-center justify-between px-4 sticky top-0 z-30"
      style={{
        height: DASH_MOBILE_HEADER_H,
        background: `linear-gradient(135deg, ${gTo} 0%, ${gFrom} 100%)`,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    >
      {/* Left: business logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {businessLogo ? (
          <img
            src={businessLogo}
            alt={businessName}
            width={26}
            height={26}
            style={{
              width: 26, height: 26, borderRadius: 8,
              objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 800, color: '#fff',
          }}>
            {businessName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>
          {businessName}
        </span>
      </div>

      {/* Right: notifications + avatar + Aegis icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Notification bell */}
        <button
          onClick={onNotificationClick}
          style={{
            position: 'relative', width: 34, height: 34, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.22)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
          aria-label="Notifiche"
        >
          <Bell style={{ width: 16, height: 16, color: '#fff' }} />
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute', top: 3, right: 3,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444',
              border: '1.5px solid rgba(0,0,0,0.2)',
            }} />
          )}
        </button>

        {/* Profile avatar */}
        <button
          onClick={onProfileClick}
          style={{
            width: 34, height: 34, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.18)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            overflow: 'hidden',
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
          aria-label="Profilo"
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName || 'Profilo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : userName ? (
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          ) : (
            <User style={{ width: 16, height: 16, color: '#fff' }} />
          )}
        </button>

        {/* Aegis brand icon only */}
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.28)',
        }}>
          <AegisLogo />
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// DASHBOARD MOBILE BOTTOM NAV
// ============================================================================

export interface DashboardMobileBottomNavProps {
  menuSections:    SidebarMenuSection[];
  activeItemId?:   string;
  onMenuItemClick?: (item: SidebarMenuItem) => void;
  theme:           DashboardTheme;
}

export function DashboardMobileBottomNav({
  menuSections,
  activeItemId,
  onMenuItemClick,
  theme,
}: DashboardMobileBottomNavProps) {
  const [altroOpen, setAltroOpen] = React.useState(false);
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;

  // First 4 items of main section → primary tabs
  // Remaining items from all sections → "Altro" drawer
  const mainItems    = menuSections[0]?.items ?? [];
  const primaryItems = mainItems.slice(0, 4);
  const altroItems   = [
    ...mainItems.slice(4),
    ...menuSections.slice(1).flatMap((s) => s.items),
  ];
  const hasAltro      = altroItems.length > 0;
  const isAltroActive = altroItems.some((i) => i.id === activeItemId);

  function handleItemClick(item: SidebarMenuItem) {
    setAltroOpen(false);
    onMenuItemClick?.(item);
  }

  return (
    <>
      {/* ── Altro slide-up drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {altroOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="altro-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setAltroOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.52)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 48,
              }}
            />

            {/* Sheet */}
            <motion.div
              key="altro-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              style={{
                position: 'fixed',
                bottom: `calc(${DASH_MOBILE_NAV_H}px + env(safe-area-inset-bottom, 0px))`,
                left: 0, right: 0,
                background: 'linear-gradient(160deg, #2d1158 0%, #1a0840 100%)',
                borderRadius: '20px 20px 0 0',
                border: '1px solid rgba(168,85,247,0.25)',
                borderBottom: 'none',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset',
                zIndex: 49,
                padding: '10px 16px 20px',
              }}
            >
              {/* Handle */}
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'rgba(255,255,255,0.2)',
                margin: '0 auto 14px',
              }} />

              {/* Items grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {altroItems.map((item) => {
                  const Icon     = item.icon;
                  const isActive = item.id === activeItemId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px', borderRadius: 12,
                        background: isActive ? 'rgba(168,85,247,0.22)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${isActive ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        textAlign: 'left',
                      }}
                    >
                      <Icon style={{
                        width: 18, height: 18, flexShrink: 0,
                        color: isActive ? '#c084fc' : 'rgba(255,255,255,0.65)',
                      }} />
                      <span style={{
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#e9d5ff' : 'rgba(255,255,255,0.75)',
                      }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom nav bar ────────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: `linear-gradient(135deg, ${gFrom} 0%, ${gTo} 100%)`,
          height: `calc(${DASH_MOBILE_NAV_H}px + env(safe-area-inset-bottom, 0px))`,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.18), 0 -1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', height: DASH_MOBILE_NAV_H, position: 'relative' }}>

          {/* Primary tabs */}
          {primaryItems.map((item) => {
            const isActive = item.id === activeItemId;
            const Icon     = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="dash-bn-pill"
                    style={{
                      position: 'absolute', inset: '6px 8px', borderRadius: 14,
                      background: 'rgba(255,255,255,0.20)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
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
              </button>
            );
          })}

          {/* "Altro" tab */}
          {hasAltro && (
            <button
              onClick={() => setAltroOpen(!altroOpen)}
              aria-label="Altro"
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {(altroOpen || isAltroActive) && (
                <motion.div
                  layoutId="dash-bn-pill"
                  style={{
                    position: 'absolute', inset: '6px 8px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.20)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <MoreHorizontal style={{
                width: 18, height: 18,
                color: (altroOpen || isAltroActive) ? '#fff' : 'rgba(255,255,255,0.52)',
                position: 'relative', zIndex: 1,
                transition: 'color 0.2s',
              }} />
              <span style={{
                fontSize: '0.62rem',
                fontWeight: (altroOpen || isAltroActive) ? 700 : 400,
                color: (altroOpen || isAltroActive) ? '#fff' : 'rgba(255,255,255,0.52)',
                position: 'relative', zIndex: 1,
                transition: 'color 0.2s',
                letterSpacing: '0.01em',
              }}>
                Altro
              </span>
            </button>
          )}

        </div>
      </nav>
    </>
  );
}
