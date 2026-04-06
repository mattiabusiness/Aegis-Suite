// ============================================================================
// AEGIS SUITE - DASHBOARD LAYOUT COMPONENT (Perfected v2)
// File: packages/ui/src/components/dashboard/DashboardLayout.tsx
// Subtle gradient bg, dot pattern, page transition fade, ambient orb glow.
// All static — zero continuous animations for daily professional use.
// ============================================================================

'use client';

import * as React from 'react';
import { Sidebar, type SidebarMenuSection, type SidebarMenuItem } from './Sidebar';
import { Header, type HeaderNotification, type HeaderUserMenuAction } from './Header';
import { DashboardMobileHeader, DashboardMobileBottomNav, DASH_MOBILE_NAV_H } from './DashboardMobileNav';
import type { DashboardTheme } from './Themes';

// ============================================================================
// TYPES (unchanged)
// ============================================================================

export interface DashboardLayoutProps {
  theme: DashboardTheme;
  platformLogo: React.ReactNode | string;
  menuSections: SidebarMenuSection[];
  activeItemId?: string;
  businessName: string;
  businessLogo?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  notifications?: HeaderNotification[];
  unreadCount?: number;
  onMenuItemClick?: (item: SidebarMenuItem) => void;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onViewAllNotifications?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  onHelp?: () => void;
  additionalMenuActions?: HeaderUserMenuAction[];
  showHelp?: boolean;
  showLogout?: boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: React.ReactNode;
  contentClassName?: string;
  /** Current pathname — used for page transition animation */
  currentPath?: string;
}


// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardLayout({
  theme,
  platformLogo,
  menuSections,
  activeItemId,
  businessName,
  businessLogo,
  userName,
  userEmail,
  userAvatar,
  notifications = [],
  unreadCount,
  onMenuItemClick,
  onNotificationClick,
  onViewAllNotifications,
  onProfileClick,
  onSettingsClick,
  onLogout,
  onHelp,
  additionalMenuActions,
  showHelp = true,
  showLogout = true,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  children,
  contentClassName = '',
  currentPath,
}: DashboardLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const handleCollapsedChange = (newCollapsed: boolean) => {
    if (!isControlled) setInternalCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #f8f7fc 0%, #f3f2f8 40%, #f0eef6 100%)',
      }}
    >
      {/* ═══ Dot pattern (very subtle texture) ═══ */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(147,51,234,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ═══ Ambient orb glow (static, bottom-right) ═══ */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 600,
          height: 600,
          bottom: -150,
          right: -150,
          background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(147,51,234,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ═══ Second ambient orb (static, top-left, even subtler) ═══ */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 400,
          height: 400,
          top: -100,
          left: 200,
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />

      {/* ── Desktop Sidebar (hidden on mobile) ───────────────────────────── */}
      <div className="hidden lg:block">
        <Sidebar
          logo={platformLogo}
          brandName={theme.displayName}
          menuSections={menuSections}
          activeItemId={activeItemId}
          collapsed={collapsed}
          onCollapsedChange={handleCollapsedChange}
          onMenuItemClick={onMenuItemClick}
          onLogout={onLogout}
          onHelp={onHelp}
          showHelp={showHelp}
          showLogout={showLogout}
          theme={theme.sidebar}
        />
      </div>

      {/* ── Desktop Header (hidden on mobile) ────────────────────────────── */}
      <div className="hidden lg:block">
        <Header
          businessName={businessName}
          businessLogo={businessLogo}
          userName={userName}
          userEmail={userEmail}
          userAvatar={userAvatar}
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={onNotificationClick}
          onViewAllNotifications={onViewAllNotifications}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
          onLogout={onLogout}
          additionalMenuActions={additionalMenuActions}
          sidebarCollapsed={collapsed}
        />
      </div>

      {/* ── Mobile Header (lg:hidden, sticky) ────────────────────────────── */}
      <DashboardMobileHeader
        businessName={businessName}
        businessLogo={businessLogo}
        theme={theme}
        brandLabel={theme.displayName}
        userName={userName}
        userAvatar={userAvatar}
        unreadCount={unreadCount}
        onNotificationClick={onViewAllNotifications}
        onProfileClick={onProfileClick}
      />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main
        className="relative z-10 min-h-screen dash-main"
        style={{
          paddingTop: 72,
          marginLeft: collapsed ? 96 : 272,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className={`p-4 lg:p-6 ${contentClassName}`.trim()}>
          <div
            key={currentPath || activeItemId}
            style={{
              animation: 'dl-page-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {/* ── Mobile Bottom Nav (lg:hidden) ────────────────────────────────── */}
      <DashboardMobileBottomNav
        menuSections={menuSections}
        activeItemId={activeItemId}
        onMenuItemClick={onMenuItemClick}
        theme={theme}
      />

    <style>{`
        @keyframes dl-page-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Mobile overrides: reset desktop sidebar/header spacing */
        @media (max-width: 1023px) {
          .dash-main {
            margin-left: 0 !important;
            padding-top: 0 !important;
            padding-bottom: calc(${DASH_MOBILE_NAV_H}px + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
      `}</style>
    </div>
  );
}