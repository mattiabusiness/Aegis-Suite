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
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, Bell, User, Settings, LogOut, ScrollText, type LucideIcon } from 'lucide-react';
import type { DashboardTheme } from './Themes';
import type { SidebarMenuSection, SidebarMenuItem } from './Sidebar';
import type { HeaderNotification, HeaderUserMenuAction } from './Header';

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
// DASHBOARD MOBILE HEADER
// ============================================================================

export interface DashboardMobileHeaderProps {
  businessName: string;
  businessLogo?: string;
  theme:         DashboardTheme;
  brandLabel?:   string;
  userName?:     string;
  userEmail?:    string;
  userAvatar?:   string;
  unreadCount?:  number;
  notifications?: HeaderNotification[];
  onNotificationItemClick?: (n: HeaderNotification) => void;
  onViewAllNotifications?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  additionalMenuActions?: HeaderUserMenuAction[];
}

export function DashboardMobileHeader({
  businessName,
  businessLogo,
  theme,
  brandLabel = 'Aegis Beauty',
  userName,
  userEmail,
  userAvatar,
  unreadCount = 0,
  notifications = [],
  onNotificationItemClick,
  onViewAllNotifications,
  onProfileClick,
  onSettingsClick,
  onLogout,
  additionalMenuActions = [],
}: DashboardMobileHeaderProps) {
  const [gFrom, gTo] = THEME_GRADIENT[theme.name] ?? THEME_GRADIENT.beauty;
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [domReady, setDomReady] = React.useState(false);
  const [bellAnim, setBellAnim] = React.useState(false);

  React.useEffect(() => { setDomReady(true); }, []);

  // Close on Escape
  React.useEffect(() => {
    if (!notifOpen && !userMenuOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setNotifOpen(false); setUserMenuOpen(false); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [notifOpen, userMenuOpen]);

  const closeAll = () => { setNotifOpen(false); setUserMenuOpen(false); };
  const actualUnread = unreadCount || notifications.filter(n => !n.read).length;
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  const menuItems: { icon: LucideIcon; label: string; onClick?: () => void; href?: string; danger?: boolean }[] = [
    { icon: User, label: 'Il mio profilo', onClick: onProfileClick },
    { icon: Settings, label: 'Impostazioni', onClick: onSettingsClick },
    ...additionalMenuActions.map(a => ({ icon: a.icon, label: a.label, onClick: a.onClick, danger: a.danger })),
    { icon: ScrollText, label: 'ToS & Privacy Policy', href: 'https://aegisbeauty.app/legal' },
  ];

  // ── Portal: backdrop ──
  const backdrop = domReady && (notifOpen || userMenuOpen) ? createPortal(
    <div
      onClick={closeAll}
      style={{
        position: 'fixed', top: DASH_MOBILE_HEADER_H, left: 0, right: 0, bottom: 0,
        zIndex: 9997,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
    />,
    document.body
  ) : null;

  // ── Portal: notification panel ──
  const notifPanel = domReady && notifOpen ? createPortal(
    <div
      style={{
        position: 'fixed', top: DASH_MOBILE_HEADER_H + 8, left: 8, right: 8, zIndex: 9999,
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(168,85,247,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(168,85,247,0.08)',
        overflow: 'hidden',
        maxHeight: '65vh',
        display: 'flex', flexDirection: 'column',
        animation: 'mhdr-drop 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>Notifiche</span>
        {actualUnread > 0 && (
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(168,85,247,0.1)', color: '#7c3aed' }}>
            {actualUnread} nuove
          </span>
        )}
      </div>
      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'none' as const }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Bell style={{ width: 28, height: 28, color: '#c084fc', display: 'block', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Nessuna notifica al momento</p>
          </div>
        ) : (
          notifications.slice(0, 6).map(n => (
            <div
              key={n.id}
              onClick={() => { onNotificationItemClick?.(n); closeAll(); }}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.03)',
                cursor: 'pointer',
                background: !n.read ? 'rgba(168,85,247,0.025)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{n.message}</p>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 3 }}>{n.time}</p>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', flexShrink: 0 }}>
          <button
            onClick={() => { onViewAllNotifications?.(); closeAll(); }}
            style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9333ea', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Vedi tutte le notifiche
          </button>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  // ── Portal: user menu panel ──
  const userPanel = domReady && userMenuOpen ? createPortal(
    <div
      style={{
        position: 'fixed', top: DASH_MOBILE_HEADER_H + 8, right: 8, width: 248, zIndex: 9999,
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(168,85,247,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(168,85,247,0.08)',
        overflow: 'hidden',
        animation: 'mhdr-drop 0.2s ease-out',
      }}
    >
      {/* User info */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {userAvatar ? (
            <img src={userAvatar} alt={userName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
          {userEmail && <p style={{ fontSize: '0.72rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</p>}
        </div>
      </div>
      {/* Menu items */}
      {menuItems.map((item, i) => item.href ? (
        <button
          key={i}
          type="button"
          onClick={() => { window.open(item.href, '_blank', 'noopener,noreferrer'); closeAll(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
            color: '#4b5563', fontSize: '0.875rem', fontWeight: 500,
            borderBottom: '1px solid rgba(0,0,0,0.03)',
          }}
        >
          <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {item.label}
        </button>
      ) : (
        <button
          key={i}
          onClick={() => { item.onClick?.(); closeAll(); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
            color: item.danger ? '#dc2626' : '#4b5563',
            fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
            borderBottom: '1px solid rgba(0,0,0,0.03)',
          }}
        >
          <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
          {item.label}
        </button>
      ))}
      {/* Logout */}
      {onLogout && (
        <>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />
          <button
            onClick={() => { onLogout?.(); closeAll(); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer',
              color: '#dc2626', fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
            }}
          >
            <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
            Esci
          </button>
        </>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
          {businessLogo ? (
            <img
              src={businessLogo}
              alt={businessName}
              width={26}
              height={26}
              style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
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
          <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {businessName}
          </span>
        </div>

        {/* Right: notifications + avatar + Aegis brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Notification bell */}
          <button
            onClick={() => {
              if (!notifOpen && notifications.length === 0) {
                setBellAnim(true);
                setTimeout(() => setBellAnim(false), 500);
              }
              setNotifOpen(!notifOpen);
              setUserMenuOpen(false);
            }}
            style={{
              position: 'relative', width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: notifOpen ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)',
              border: `1px solid ${notifOpen ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)'}`,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.15s ease',
            }}
            aria-label="Notifiche"
          >
            <Bell style={{
              width: 16, height: 16, color: '#fff',
              animation: bellAnim ? 'mhdr-bell-wiggle 0.5s ease' : 'none',
            }} />
            {actualUnread > 0 && (
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
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            style={{
              width: 34, height: 34, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: userMenuOpen ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.18)',
              border: `1.5px solid ${userMenuOpen ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)'}`,
              cursor: 'pointer',
              overflow: 'hidden',
              WebkitTapHighlightColor: 'transparent',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            aria-label="Profilo"
          >
            {userAvatar ? (
              <img src={userAvatar} alt={userName || 'Profilo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : userName ? (
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
                {initials}
              </span>
            ) : (
              <User style={{ width: 16, height: 16, color: '#fff' }} />
            )}
          </button>

          {/* Aegis brand: icon + label */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-orizzontale.png"
              alt={brandLabel}
              style={{ height: 44, width: 'auto', objectFit: 'contain', opacity: 0.95 }}
            />
          </div>
        </div>
      </header>

      {backdrop}
      {notifPanel}
      {userPanel}

      <style>{`
        @keyframes mhdr-drop {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes mhdr-bell-wiggle {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(6deg); }
          40% { transform: rotate(-6deg); }
          60% { transform: rotate(4deg); }
          80% { transform: rotate(-2deg); }
        }
      `}</style>
    </>
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
