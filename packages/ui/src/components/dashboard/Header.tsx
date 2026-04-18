// ============================================================================
// AEGIS SUITE - HEADER COMPONENT (Perfected v2)
// File: packages/ui/src/components/dashboard/Header.tsx
// ============================================================================

'use client';

import * as React from 'react';
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPES (unchanged — backward compatible)
// ============================================================================

export interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface HeaderUserMenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
}

export interface HeaderProps {
  businessName: string;
  businessLogo?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  notifications?: HeaderNotification[];
  unreadCount?: number;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onViewAllNotifications?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  additionalMenuActions?: HeaderUserMenuAction[];
  sidebarCollapsed?: boolean;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const NOTIF_TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  info: { icon: Info, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  success: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  error: { icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

// ============================================================================
// NOTIFICATION DROPDOWN
// ============================================================================

function NotificationDropdown({
  notifications,
  onNotificationClick,
  onViewAll,
  onClose,
}: {
  notifications: HeaderNotification[];
  onNotificationClick?: (n: HeaderNotification) => void;
  onViewAll?: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(168,85,247,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(168,85,247,0.06)',
        animation: 'hdr-dropdown 0.2s ease-out',
      }}
    >
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span className="font-semibold text-gray-900 text-sm">Notifiche</span>
        {notifications.filter(n => !n.read).length > 0 && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(168,85,247,0.1)', color: '#7c3aed' }}
          >
            {notifications.filter(n => !n.read).length} nuove
          </span>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.15) transparent' }}>
        {notifications.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'rgba(168,85,247,0.06)' }}
            >
              <Bell className="w-6 h-6" style={{ color: '#c084fc' }} />
            </div>
            <p className="text-sm font-medium text-gray-500">Tutto tranquillo!</p>
            <p className="text-xs text-gray-400 mt-1">Nessuna notifica al momento</p>
          </div>
        ) : (
          notifications.slice(0, 5).map((n, i) => {
            const typeConf = NOTIF_TYPE_CONFIG[n.type || 'info'];
            const TypeIcon = typeConf.icon;
            return (
              <div
                key={n.id}
                className="px-4 py-3.5 cursor-pointer"
                style={{
                  background: !n.read ? 'rgba(168,85,247,0.025)' : 'transparent',
                  borderBottom: '1px solid rgba(0,0,0,0.03)',
                  transition: 'background 0.15s ease',
                  animation: `hdr-item-in 0.2s ease-out ${i * 0.03}s both`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168,85,247,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? 'rgba(168,85,247,0.025)' : 'transparent'; }}
                onClick={() => { onNotificationClick?.(n); onClose(); }}
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: typeConf.bg }}
                  >
                    <TypeIcon className="w-4 h-4" style={{ color: typeConf.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{n.title}</span>
                      {!n.read && (
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: '#7c3aed', boxShadow: '0 0 4px rgba(124,58,237,0.4)' }}
                        />
                      )}
                    </div>
                    <div className="text-[13px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">{n.time}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <span
            className="text-sm font-semibold cursor-pointer block text-center"
            style={{ color: '#9333ea', transition: 'color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#7e22ce'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9333ea'; }}
            onClick={() => { onViewAll?.(); onClose(); }}
          >
            Vedi tutte le notifiche
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// USER DROPDOWN (with avatar header)
// ============================================================================

function UserDropdown({
  userName,
  userEmail,
  userAvatar,
  onProfileClick,
  onSettingsClick,
  onLogout,
  additionalActions,
  onClose,
}: {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  additionalActions?: HeaderUserMenuAction[];
  onClose: () => void;
}) {
  const handleClick = (cb?: () => void) => { cb?.(); onClose(); };

  const items: { icon: LucideIcon; label: string; onClick?: () => void; href?: string; danger?: boolean }[] = [
    { icon: User, label: 'Il mio profilo', onClick: onProfileClick },
    { icon: Settings, label: 'Impostazioni', onClick: onSettingsClick },
    ...(additionalActions?.map(a => ({ icon: a.icon, label: a.label, onClick: a.onClick, danger: a.danger })) || []),
    { icon: ScrollText, label: 'ToS & Privacy Policy', href: 'https://aegisbeauty.app/legal' },
  ];

  return (
    <div
      className="absolute top-full right-0 mt-2 w-64 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(168,85,247,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(168,85,247,0.06)',
        animation: 'hdr-dropdown 0.2s ease-out',
      }}
    >
      {/* User info header */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{
            background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #a855f7, #7c3aed)',
          }}
        >
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{userName}</div>
          {userEmail && <div className="text-xs text-gray-400 truncate">{userEmail}</div>}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {items.map((item, i) => {
          const sharedStyle: React.CSSProperties = { color: item.danger ? '#dc2626' : '#4b5563', transition: 'all 0.15s ease' };
          const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.06)' : 'rgba(168,85,247,0.06)';
            e.currentTarget.style.paddingLeft = '20px';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.transform = item.danger ? 'rotate(12deg) scale(1.15)' : 'rotate(-12deg) scale(1.15)';
              (icon as unknown as HTMLElement).style.color = item.danger ? '#dc2626' : '#9333ea';
            }
          };
          const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.paddingLeft = '16px';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)';
              (icon as unknown as HTMLElement).style.color = '';
            }
          };
          if (item.href) {
            return (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm"
                style={{ ...sharedStyle, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                onMouseEnter={hoverIn}
                onMouseLeave={hoverOut}
                onClick={() => { window.open(item.href, '_blank', 'noopener,noreferrer'); onClose(); }}
              >
                <item.icon className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm"
              style={sharedStyle}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
              onClick={() => handleClick(item.onClick)}
            >
              <item.icon className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)' }} />

      {/* Logout */}
      <div className="py-1">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm"
          style={{ color: '#dc2626', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
            e.currentTarget.style.paddingLeft = '20px';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.transform = 'rotate(12deg) scale(1.15)';
              (icon as unknown as HTMLElement).style.color = '#dc2626';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.paddingLeft = '16px';
            const icon = e.currentTarget.querySelector('svg');
            if (icon) {
              (icon as unknown as HTMLElement).style.transform = 'rotate(0) scale(1)';
              (icon as unknown as HTMLElement).style.color = '';
            }
          }}
          onClick={() => handleClick(onLogout)}
        >
          <LogOut className="w-4 h-4" style={{ transition: 'all 0.2s ease' }} />
          Esci
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Header({
  businessName,
  businessLogo,
  userName,
  userEmail,
  userAvatar,
  notifications = [],
  unreadCount,
  onNotificationClick,
  onViewAllNotifications,
  onProfileClick,
  onSettingsClick,
  onLogout,
  additionalMenuActions,
  sidebarCollapsed = false,
  className = '',
}: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [bellAnim, setBellAnim] = React.useState<'shake' | 'wiggle' | null>(null);

  const notificationRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const prevUnread = React.useRef(0);

  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setNotificationsOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdowns on Escape
  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const actualUnreadCount = unreadCount ?? notifications.filter(n => !n.read).length;

  // Bell shake when unread count increases
  React.useEffect(() => {
    if (actualUnreadCount > prevUnread.current) {
      setBellAnim('shake');
      setTimeout(() => setBellAnim(null), 600);
    }
    prevUnread.current = actualUnreadCount;
  }, [actualUnreadCount]);

  // Bell click handler
  const handleBellClick = () => {
    if (notificationsOpen) {
      setNotificationsOpen(false);
      return;
    }
    // Wiggle if no notifications
    if (notifications.length === 0) {
      setBellAnim('wiggle');
      setTimeout(() => setBellAnim(null), 500);
    }
    setNotificationsOpen(true);
  };

  return (
    <header
      className={`fixed top-0 right-0 h-[72px] flex items-center justify-between px-6 z-30 ${className}`}
      style={{
        left: sidebarCollapsed ? 96 : 272,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(168,85,247,0.1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 6px 30px rgba(168,85,247,0.07), 0 12px 50px rgba(147,51,234,0.09)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-4px)',
        transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
      }}
    >
      {/* ═══ Business Info (Left) ═══ */}
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background: businessLogo ? 'transparent' : 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(126,34,206,0.05))',
            border: '1.5px solid rgba(168,85,247,0.1)',
            boxShadow: '0 2px 8px rgba(168,85,247,0.06)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(168,85,247,0.12)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(168,85,247,0.1)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(168,85,247,0.06)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {businessLogo ? (
            <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-5 h-5" style={{ color: '#9333ea' }} />
          )}
        </div>
        <div>
          <span className="font-bold text-gray-900" style={{ fontSize: '1.1rem', letterSpacing: '-0.01em' }}>
            {businessName}
          </span>
        </div>
      </div>

      {/* ═══ Actions (Right) ═══ */}
      <div className="flex items-center gap-2">

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            className="relative p-2.5 rounded-xl cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            style={{
              color: notificationsOpen ? '#7c3aed' : '#6b7280',
              background: notificationsOpen ? 'rgba(168,85,247,0.08)' : 'transparent',
              transition: 'all 0.2s ease',
              animation: bellAnim === 'shake'
                ? 'hdr-bell-shake 0.5s ease'
                : bellAnim === 'wiggle'
                  ? 'hdr-bell-wiggle 0.4s ease'
                  : 'none',
            }}
            onMouseEnter={(e) => {
              if (!notificationsOpen) {
                e.currentTarget.style.background = 'rgba(168,85,247,0.06)';
                e.currentTarget.style.color = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (!notificationsOpen) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
            onClick={handleBellClick}
            aria-label="Notifiche"
          >
            <Bell className="w-5 h-5" />
            {actualUnreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
                  animation: 'hdr-badge-pulse 2s ease-in-out infinite',
                }}
              >
                {actualUnreadCount > 99 ? '99+' : actualUnreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <NotificationDropdown
              notifications={notifications}
              onNotificationClick={onNotificationClick}
              onViewAll={onViewAllNotifications}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </div>

        {/* Separator */}
        <div
          className="h-8 mx-2"
          style={{
            width: 1,
            background: 'linear-gradient(180deg, transparent, rgba(168,85,247,0.12), transparent)',
          }}
        />

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <div
            className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl cursor-pointer outline-none"
            style={{
              background: userMenuOpen ? 'rgba(168,85,247,0.06)' : 'transparent',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { if (!userMenuOpen) e.currentTarget.style.background = 'rgba(168,85,247,0.03)'; }}
            onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.background = 'transparent'; }}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            role="button"
            tabIndex={0}
            aria-label="Menu utente"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setUserMenuOpen(!userMenuOpen); }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: userAvatar ? 'transparent' : 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(126,34,206,0.1))',
                border: '2px solid transparent',
                boxShadow: userMenuOpen
                  ? '0 0 0 2px rgba(168,85,247,0.3)'
                  : 'none',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                transform: userMenuOpen ? 'translateY(0)' : 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(168,85,247,0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!userMenuOpen) {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4" style={{ color: '#9333ea' }} />
              )}
            </div>

            {/* Name + Email */}
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-gray-900 leading-tight">{userName}</div>
              {userEmail && (
                <div className="text-xs text-gray-400 leading-tight">{userEmail}</div>
              )}
            </div>

            <ChevronDown
              className="w-4 h-4 text-gray-400 hidden sm:block"
              style={{
                transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>

          {userMenuOpen && (
            <UserDropdown
              userName={userName}
              userEmail={userEmail}
              userAvatar={userAvatar}
              onProfileClick={onProfileClick}
              onSettingsClick={onSettingsClick}
              onLogout={onLogout}
              additionalActions={additionalMenuActions}
              onClose={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* ═══ Keyframes ═══ */}
      <style>{`
        @keyframes hdr-dropdown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hdr-item-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hdr-badge-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes hdr-bell-shake {
          0%, 100% { transform: rotate(0); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-6deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes hdr-bell-wiggle {
          0%, 100% { transform: rotate(0); }
          20% { transform: rotate(6deg); }
          40% { transform: rotate(-6deg); }
          60% { transform: rotate(4deg); }
          80% { transform: rotate(-2deg); }
        }
      `}</style>
    </header>
  );
}