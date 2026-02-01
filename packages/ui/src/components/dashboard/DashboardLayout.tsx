// ============================================================================
// AEGIS SUITE - DASHBOARD LAYOUT COMPONENT
// File: packages/ui/src/components/dashboard/DashboardLayout.tsx
// ============================================================================

'use client';

import * as React from 'react';
import { Sidebar, type SidebarMenuSection, type SidebarMenuItem } from './Sidebar';
import { Header, type HeaderNotification, type HeaderUserMenuAction } from './Header';
import type { DashboardTheme } from './Themes';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardLayoutProps {
  /** Dashboard theme configuration */
  theme: DashboardTheme;
  /** Platform logo (component or URL) */
  platformLogo: React.ReactNode | string;
  /** Menu sections configuration */
  menuSections: SidebarMenuSection[];
  /** Currently active menu item id */
  activeItemId?: string;
  /** Business name to display in header */
  businessName: string;
  /** Business logo URL (optional) */
  businessLogo?: string;
  /** User name */
  userName: string;
  /** User email */
  userEmail?: string;
  /** User avatar URL (optional) */
  userAvatar?: string;
  /** Notifications list */
  notifications?: HeaderNotification[];
  /** Unread notifications count (if not provided, calculated from notifications) */
  unreadCount?: number;
  /** Callback when menu item is clicked */
  onMenuItemClick?: (item: SidebarMenuItem) => void;
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: HeaderNotification) => void;
  /** Callback when "View all notifications" is clicked */
  onViewAllNotifications?: () => void;
  /** Callback when profile is clicked */
  onProfileClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Callback when help is clicked */
  onHelp?: () => void;
  /** Additional user menu actions */
  additionalMenuActions?: HeaderUserMenuAction[];
  /** Show help button in sidebar */
  showHelp?: boolean;
  /** Show logout button in sidebar */
  showLogout?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Page content */
  children: React.ReactNode;
  /** Custom className for content area */
  contentClassName?: string;
}

// ============================================================================
// STYLES
// ============================================================================

const layoutStyles = {
  wrapper: 'min-h-screen bg-gray-50',
  content: `
    transition-all duration-300 ease-in-out
    pt-16
    min-h-screen
  `,
  contentExpanded: 'ml-64',
  contentCollapsed: 'ml-24',
  contentInner: `
    p-6
  `,
};

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
}: DashboardLayoutProps) {
  // Handle collapsed state (controlled or uncontrolled)
  const [internalCollapsed, setInternalCollapsed] = React.useState(defaultCollapsed);
  
  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;
  
  const handleCollapsedChange = (newCollapsed: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(newCollapsed);
    }
    onCollapsedChange?.(newCollapsed);
  };

  return (
    <div className={layoutStyles.wrapper}>
      {/* Sidebar */}
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

      {/* Header */}
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

      {/* Main Content */}
      <main
        className={`
          ${layoutStyles.content}
          ${collapsed ? layoutStyles.contentCollapsed : layoutStyles.contentExpanded}
        `.trim()}
      >
        <div className={`${layoutStyles.contentInner} ${contentClassName}`.trim()}>
          {children}
        </div>
      </main>
    </div>
  );
}